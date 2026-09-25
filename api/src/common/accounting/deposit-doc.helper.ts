import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma-service';
import { AutoJournalService, REF, Tx } from './auto-journal.service';
import { DepositLedgerService, depositKind, DepositKind } from './deposit-ledger.service';

export interface DepositDocInput {
  code?: string;
  customerId?: number;
  supplierId?: number;
  amount?: number;
  date?: string;
  description?: string;
  /** IN = setor/kirim dana, OUT = tarik dana. Default: derived from the code prefix (DPOUT/DBOUT = OUT). */
  type?: 'IN' | 'OUT';
  /** Akun kas/bank lawan (default Setting Perkiraan "Kas Default"). */
  cashAccountId?: number;
  /** Akun deposit (default Setting Perkiraan Deposit Pelanggan / Deposit Supplier). */
  depositAccountId?: number;
  paymentMethodId?: number;
  referenceNumber?: string;
}

const r2 = (n: number) => Math.round((Number(n) || 0) * 100) / 100;
const dec = (n: number) => new Prisma.Decimal(r2(n).toFixed(2));
const stamp = () => new Date().toISOString().replace(/\D/g, '').slice(0, 14);

/**
 * Deposit Pelanggan / Deposit Supplier with balance maintenance + automatic journal.
 *  Pelanggan IN  (DPIN) : Dr Kas / Cr Deposit Pelanggan     OUT (DPOUT): Dr Deposit Pelanggan / Cr Kas
 *  Supplier  IN  (DBIN) : Dr Deposit Supplier / Cr Kas      OUT (DBOUT): Dr Kas / Cr Deposit Supplier
 * USE rows (DPUSE/DBUSE) are created by sale/purchase payments paid with deposit and cannot be edited here.
 */
export class DepositDocHelper {
  constructor(
    private readonly prisma: PrismaService,
    private readonly journal: AutoJournalService,
    private readonly ledger: DepositLedgerService,
    private readonly party: 'customer' | 'supplier',
  ) {}

  private get isCustomer() { return this.party === 'customer'; }
  private get ref() { return this.isCustomer ? REF.CUSTOMER_DEPOSIT : REF.SUPPLIER_DEPOSIT; }
  private get depKey() { return this.isCustomer ? 'custDeposit' : 'suppDeposit'; }
  private get label() { return this.isCustomer ? 'Deposit Pelanggan' : 'Deposit Supplier'; }
  private model(tx: Tx | PrismaService): any { return this.isCustomer ? tx.customerDeposit : tx.supplierDeposit; }
  private partyId(row: any): number { return this.isCustomer ? row.CustomerID : row.SupplierID; }
  private prefix(kind: DepositKind) {
    if (this.isCustomer) return kind === 'OUT' ? 'DPOUT' : 'DPIN';
    return kind === 'OUT' ? 'DBOUT' : 'DBIN';
  }
  /** true when the cash account is on the debit side */
  private cashIsDebit(kind: DepositKind) { return this.isCustomer ? kind === 'IN' : kind === 'OUT'; }

  private kindOf(row: any): DepositKind { return depositKind(row.Code, row.Type); }

  private async recompute(tx: Tx, partyId: number) {
    return this.isCustomer ? this.ledger.recomputeCustomer(tx, partyId) : this.ledger.recomputeSupplier(tx, partyId);
  }

  private async accountsFor(tx: Tx, kind: DepositKind, dto: DepositDocInput, prev?: { cash?: number; dep?: number }) {
    const needs: string[] = [];
    if (!dto.cashAccountId && !prev?.cash) needs.push('cash');
    if (!dto.depositAccountId && !prev?.dep) needs.push(this.depKey);
    const a = needs.length ? await this.journal.accounts(tx, needs) : {};
    const cash = dto.cashAccountId ?? prev?.cash ?? a.cash;
    const dep = dto.depositAccountId ?? prev?.dep ?? a[this.depKey];
    const ids = [...new Set([cash, dep])];
    if ((await tx.account.count({ where: { ID: { in: ids } } })) !== ids.length) throw new BadRequestException('Ada perkiraan yang tidak ditemukan');
    if (cash === dep) throw new BadRequestException('Akun kas dan akun deposit tidak boleh sama');
    return { cash, dep, kind };
  }

  /** Accounts used by the current journal of the row (so an edit keeps the user's choice). */
  private async prevAccounts(tx: Tx, row: any): Promise<{ cash?: number; dep?: number }> {
    const ls = await this.journal.linesOf(tx, this.ref, row.ID);
    if (!ls.length) return {};
    const debit = ls.find((l) => Number(l.Debit) > 0)?.AccountID;
    const credit = ls.find((l) => Number(l.Credit) > 0)?.AccountID;
    return this.cashIsDebit(this.kindOf(row)) ? { cash: debit, dep: credit } : { cash: credit, dep: debit };
  }

  private async post(tx: Tx, row: any, acc: { cash: number; dep: number }, userId: string) {
    const kind = this.kindOf(row);
    const amount = Number(row.Amount);
    const desc = `${this.label} ${row.Code}${row.Description ? ` - ${row.Description}` : ''}`;
    const cashDebit = this.cashIsDebit(kind);
    await this.journal.post(tx, {
      referenceType: this.ref, referenceId: row.ID, date: row.Date, description: desc, userId, referenceNumber: row.Code,
      lines: [
        { accountId: cashDebit ? acc.cash : acc.dep, debit: amount },
        { accountId: cashDebit ? acc.dep : acc.cash, credit: amount },
      ],
    });
  }

  private async assertParty(id?: number) {
    if (!id) throw new BadRequestException(`${this.isCustomer ? 'Pelanggan' : 'Supplier'} wajib dipilih`);
    const found = this.isCustomer
      ? await this.prisma.customer.count({ where: { ID: id } })
      : await this.prisma.supplier.count({ where: { ID: id } });
    if (!found) throw new BadRequestException(`${this.isCustomer ? 'Pelanggan' : 'Supplier'} tidak ditemukan`);
  }

  async create(dto: DepositDocInput, userId: string) {
    const partyId = this.isCustomer ? dto.customerId : dto.supplierId;
    await this.assertParty(partyId);
    const amount = r2(Number(dto.amount));
    if (!(amount > 0)) throw new BadRequestException('Jumlah harus lebih dari 0');
    const kind: DepositKind = dto.type ?? depositKind(dto.code ?? '');
    if (kind === 'USE') throw new BadRequestException('Pemakaian deposit dicatat dari menu pembayaran (metode Deposit)');
    const code = dto.code && depositKind(dto.code) === kind ? dto.code : `${this.prefix(kind)}-${stamp()}`;
    const date = dto.date ? new Date(dto.date) : new Date();
    if (isNaN(date.getTime())) throw new BadRequestException('Tanggal tidak valid');
    return this.prisma.$transaction(async (tx) => {
      const acc = await this.accountsFor(tx, kind, dto);
      const data: any = {
        Code: code, Date: date, Amount: dec(amount), RemainingAmount: dec(kind === 'IN' ? amount : 0),
        Description: dto.description ?? null, CreatedByID: userId,
      };
      if (this.isCustomer) {
        Object.assign(data, {
          CustomerID: partyId, Type: kind === 'OUT' ? 'WITHDRAW' : 'DEPOSIT',
          PaymentMethodID: dto.paymentMethodId ?? null, ReferenceNumber: dto.referenceNumber ?? null,
        });
      } else data.SupplierID = partyId;
      const row = await this.model(tx).create({ data });
      await this.recompute(tx, partyId!);
      await this.post(tx, row, acc, userId);
      return this.model(tx).findUnique({ where: { ID: row.ID } });
    });
  }

  async update(id: number, dto: DepositDocInput, userId: string) {
    const ex = await this.model(this.prisma).findUnique({ where: { ID: id } });
    if (!ex) throw new NotFoundException(`${this.label} tidak ditemukan`);
    if (this.kindOf(ex) === 'USE') throw new BadRequestException('Pemakaian deposit hanya dapat diubah/dihapus dari pembayaran terkait');
    const newParty = (this.isCustomer ? dto.customerId : dto.supplierId) ?? this.partyId(ex);
    if (newParty !== this.partyId(ex)) await this.assertParty(newParty);
    const kind: DepositKind = dto.type ?? (dto.code ? depositKind(dto.code) : this.kindOf(ex));
    if (kind === 'USE') throw new BadRequestException('Jenis deposit tidak valid');
    const amount = dto.amount !== undefined ? r2(Number(dto.amount)) : Number(ex.Amount);
    if (!(amount > 0)) throw new BadRequestException('Jumlah harus lebih dari 0');
    let code = dto.code ?? ex.Code;
    if (depositKind(code) !== kind) code = code.replace(/^[A-Z]+-/, `${this.prefix(kind)}-`);
    if (depositKind(code) !== kind) code = `${this.prefix(kind)}-${stamp()}`;
    return this.prisma.$transaction(async (tx) => {
      const prev = await this.prevAccounts(tx, ex);
      const acc = await this.accountsFor(tx, kind, dto, prev);
      const data: any = {
        Code: code, Amount: dec(amount), ...(dto.date ? { Date: new Date(dto.date) } : {}),
        ...(dto.description !== undefined ? { Description: dto.description } : {}),
      };
      if (this.isCustomer) {
        Object.assign(data, { CustomerID: newParty, Type: kind === 'OUT' ? 'WITHDRAW' : 'DEPOSIT' });
        if (dto.paymentMethodId !== undefined) data.PaymentMethodID = dto.paymentMethodId;
        if (dto.referenceNumber !== undefined) data.ReferenceNumber = dto.referenceNumber;
      } else data.SupplierID = newParty;
      const row = await this.model(tx).update({ where: { ID: id }, data });
      await this.recompute(tx, newParty);
      if (newParty !== this.partyId(ex)) await this.recompute(tx, this.partyId(ex));
      await this.post(tx, row, acc, userId);
      return this.model(tx).findUnique({ where: { ID: id } });
    });
  }

  async remove(id: number) {
    const ex = await this.model(this.prisma).findUnique({ where: { ID: id } });
    if (!ex) throw new NotFoundException(`${this.label} tidak ditemukan`);
    if (this.kindOf(ex) === 'USE') throw new BadRequestException('Pemakaian deposit hanya dapat dihapus dengan menghapus pembayaran terkait');
    return this.prisma.$transaction(async (tx) => {
      await this.journal.reverse(tx, this.ref, id);
      await this.model(tx).delete({ where: { ID: id } });
      try {
        await this.recompute(tx, this.partyId(ex));
      } catch {
        throw new BadRequestException('Deposit tidak dapat dihapus karena saldonya sudah terpakai / ditarik');
      }
      return ex;
    });
  }

  async balance(partyId: number) {
    return this.isCustomer ? this.ledger.customerBalance(this.prisma, partyId) : this.ledger.supplierBalance(this.prisma, partyId);
  }
}
