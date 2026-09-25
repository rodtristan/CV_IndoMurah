import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma-service';
import { Prisma } from '@prisma/client';
import {
  CreateChequePaymentDto,
  UpdateChequePaymentDto,
  ClearChequeDto,
  BounceChequeDto,
  ChequePaymentFilterDto,
} from './dto/cheque-payment.dto';
import { AutoJournalService, REF, Tx } from '../../common/accounting/auto-journal.service';
import { SalePaymentService } from '../sale-payment/sale-payment.service';
import { PurchasePaymentService } from '../purchase-payment/purchase-payment.service';

/**
 * Cek/Giro register.
 *  - Rows linked to a payment (ReferenceType SALE_PAYMENT / PURCHASE_PAYMENT) are mirrors maintained by the payment
 *    modules. Clear / bounce / cancel here delegate to the payment so the journal is posted exactly once
 *    (by the SALE_PAYMENT / PURCHASE_PAYMENT journal, when the cheque clears).
 *  - Stand-alone cheques post their own CHEQUE_PAYMENT journal when cleared:
 *    SALE: Dr Bank / Cr Piutang, PURCHASE: Dr Hutang / Cr Bank. Pending cheques never post.
 */
@Injectable()
export class ChequePaymentService {
  constructor(
    private prisma: PrismaService,
    private autoJournal: AutoJournalService,
    private salePayments: SalePaymentService,
    private purchasePayments: PurchasePaymentService,
  ) {}

  private linkedKind(cheque: { ReferenceType: string | null; ReferenceID: number | null }): 'SALE' | 'PURCHASE' | null {
    if (!cheque.ReferenceID) return null;
    if (cheque.ReferenceType === 'SALE_PAYMENT') return 'SALE';
    if (cheque.ReferenceType === 'PURCHASE_PAYMENT') return 'PURCHASE';
    return null;
  }

  /** Remove the linked payment (bounced / cancelled / deleted cheque); keeps this cheque row when not PENDING/CLEARED. */
  private async removeLinkedPayment(tx: Tx, cheque: any) {
    const kind = this.linkedKind(cheque);
    if (!kind) return null;
    const svc = kind === 'SALE' ? this.salePayments : this.purchasePayments;
    const model: any = kind === 'SALE' ? tx.salePayment : tx.purchasePayment;
    const exists = await model.findUnique({ where: { ID: cheque.ReferenceID } });
    if (!exists) return null;
    const pay: any = await svc.deleteTx(tx, cheque.ReferenceID);
    return { kind, parentId: kind === 'SALE' ? pay.SaleID : pay.PurchaseID };
  }

  private async invalidateLinked(r: { kind: 'SALE' | 'PURCHASE'; parentId: number } | null) {
    if (!r) return;
    if (r.kind === 'SALE') await this.salePayments.invalidateFor(r.parentId);
    else await this.purchasePayments.invalidateFor(r.parentId);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CREATE
  // ─────────────────────────────────────────────────────────────────────────────

  async create(dto: CreateChequePaymentDto, userId: string) {
    if (dto.ReferenceType === 'SALE_PAYMENT' || dto.ReferenceType === 'PURCHASE_PAYMENT') {
      throw new BadRequestException('Cek/BG untuk pembayaran penjualan/pembelian dibuat otomatis dari menu Pembayaran (Jenis: Cek / BG)');
    }
    if (dto.Type !== 'SALE' && dto.Type !== 'PURCHASE') throw new BadRequestException('Type harus SALE atau PURCHASE');
    // Generate code
    const code = await this.generateCode(dto.Type);

    // Validate bank if provided
    if (dto.BankId) {
      const bank = await this.prisma.bank.findUnique({ where: { ID: dto.BankId } });
      if (!bank) throw new NotFoundException('Bank not found');
    }

    const cheque = await this.prisma.chequePayment.create({
      data: {
        Code: code,
        Type: dto.Type,
        ReferenceType: dto.ReferenceType,
        ReferenceID: dto.ReferenceId,
        BankID: dto.BankId,
        ChequeNumber: dto.ChequeNumber,
        ChequeDate: new Date(dto.ChequeDate),
        DueDate: dto.DueDate ? new Date(dto.DueDate) : null,
        Amount: new Prisma.Decimal(dto.Amount),
        Status: 'PENDING',
        Notes: dto.Notes,
      },
      include: { Bank: true },
    });

    return {
      success: true,
      cheque: this.formatCheque(cheque),
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // READ
  // ─────────────────────────────────────────────────────────────────────────────

  async findAll(dto: ChequePaymentFilterDto) {
    const where: any = {};

    if (dto.Type) where.Type = dto.Type;
    if (dto.Status) where.Status = dto.Status;
    if (dto.BankId) where.BankID = dto.BankId;

    if (dto.StartDate || dto.EndDate) {
      where.ChequeDate = {};
      if (dto.StartDate) where.ChequeDate.gte = new Date(dto.StartDate);
      if (dto.EndDate) where.ChequeDate.lte = new Date(dto.EndDate);
    }

    if (dto.Search) {
      where.OR = [
        { ChequeNumber: { contains: dto.Search, mode: 'insensitive' } },
        { Code: { contains: dto.Search, mode: 'insensitive' } },
      ];
    }

    const cheques = await this.prisma.chequePayment.findMany({
      where,
      include: { Bank: true },
      orderBy: { ChequeDate: 'desc' },
    });

    return {
      count: cheques.length,
      cheques: cheques.map((c) => this.formatCheque(c)),
    };
  }

  async findById(id: number) {
    const cheque = await this.prisma.chequePayment.findUnique({
      where: { ID: id },
      include: { Bank: true },
    });

    if (!cheque) throw new NotFoundException('Cheque payment not found');

    return this.formatCheque(cheque);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // UPDATE
  // ─────────────────────────────────────────────────────────────────────────────

  async update(id: number, dto: UpdateChequePaymentDto) {
    const cheque = await this.prisma.chequePayment.findUnique({ where: { ID: id } });
    if (!cheque) throw new NotFoundException('Cheque payment not found');

    if (cheque.Status !== 'PENDING') {
      throw new BadRequestException('Only PENDING cheques can be updated');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const kind = this.linkedKind(cheque);
      if (kind) {
        // keep the payment (source of truth) in sync
        const data: any = {};
        if (dto.ChequeNumber !== undefined) data.ReferenceNumber = dto.ChequeNumber;
        if (dto.DueDate) data.DueDate = new Date(dto.DueDate);
        if (Object.keys(data).length) {
          const model: any = kind === 'SALE' ? tx.salePayment : tx.purchasePayment;
          await model.updateMany({ where: { ID: cheque.ReferenceID }, data });
        }
      }
      return tx.chequePayment.update({
        where: { ID: id },
        data: {
          BankID: dto.BankId,
          ChequeNumber: dto.ChequeNumber,
          DueDate: dto.DueDate ? new Date(dto.DueDate) : undefined,
          Notes: dto.Notes,
        },
        include: { Bank: true },
      });
    });

    return {
      success: true,
      cheque: this.formatCheque(updated),
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // STATUS CHANGES
  // ─────────────────────────────────────────────────────────────────────────────

  async clearCheque(id: number, dto: ClearChequeDto, userId: string) {
    const cheque = await this.prisma.chequePayment.findUnique({ where: { ID: id } });
    if (!cheque) throw new NotFoundException('Cheque payment not found');

    if (cheque.Status !== 'PENDING') {
      throw new BadRequestException(`Cannot clear cheque with status ${cheque.Status}`);
    }

    const clearedDate = dto.ClearedDate ? new Date(dto.ClearedDate) : new Date();
    const kind = this.linkedKind(cheque);

    const updated = await this.prisma.$transaction(async (tx) => {
      if (kind) {
        // Delegate: marks the payment cleared, posts its SALE_/PURCHASE_PAYMENT journal and sets this mirror CLEARED.
        const svc = kind === 'SALE' ? this.salePayments : this.purchasePayments;
        await svc.clearTx(tx, cheque.ReferenceID!, userId, clearedDate);
      } else {
        await tx.chequePayment.update({ where: { ID: id }, data: { Status: 'CLEARED', ClearedDate: clearedDate } });
        await this.postStandalone(tx, id, userId);
      }
      return tx.chequePayment.update({
        where: { ID: id },
        data: { Notes: dto.Notes ? `${cheque.Notes || ''}\n${dto.Notes}` : cheque.Notes },
        include: { Bank: true },
      });
    });

    if (kind) {
      const pay: any = kind === 'SALE'
        ? await this.prisma.salePayment.findUnique({ where: { ID: cheque.ReferenceID! } })
        : await this.prisma.purchasePayment.findUnique({ where: { ID: cheque.ReferenceID! } });
      if (pay) await this.invalidateLinked({ kind, parentId: kind === 'SALE' ? pay.SaleID : pay.PurchaseID });
    }

    return {
      success: true,
      message: 'Cheque cleared successfully',
      cheque: this.formatCheque(updated),
    };
  }

  async bounceCheque(id: number, dto: BounceChequeDto, userId: string) {
    return this.closeWithoutClearing(id, 'BOUNCED', dto.Reason, dto.BouncedDate ? new Date(dto.BouncedDate) : new Date());
  }

  async cancelCheque(id: number, reason: string, userId: string) {
    return this.closeWithoutClearing(id, 'CANCELLED', reason, null);
  }

  /**
   * Bounce / cancel a PENDING cheque. A pending cheque never posted a journal, so nothing is reversed;
   * a linked payment is removed (the invoice becomes unpaid again) while this cheque row stays as history.
   */
  private async closeWithoutClearing(id: number, status: 'BOUNCED' | 'CANCELLED', reason: string | undefined, bouncedDate: Date | null) {
    const cheque = await this.prisma.chequePayment.findUnique({ where: { ID: id } });
    if (!cheque) throw new NotFoundException('Cheque payment not found');
    if (cheque.Status !== 'PENDING') {
      throw new BadRequestException(`Cannot ${status === 'BOUNCED' ? 'bounce' : 'cancel'} cheque with status ${cheque.Status}`);
    }
    const tag = status === 'BOUNCED' ? '[Bounced]' : '[Cancelled]';
    let linked: { kind: 'SALE' | 'PURCHASE'; parentId: number } | null = null;
    const updated = await this.prisma.$transaction(async (tx) => {
      const u = await tx.chequePayment.update({
        where: { ID: id },
        data: { Status: status, ...(bouncedDate ? { BouncedDate: bouncedDate } : {}), Notes: `${cheque.Notes || ''}\n${tag} ${reason ?? ''}`.trim() },
        include: { Bank: true },
      });
      linked = await this.removeLinkedPayment(tx, cheque);
      return u;
    });
    await this.invalidateLinked(linked);
    return {
      success: true,
      message: status === 'BOUNCED' ? 'Cheque bounced successfully' : 'Cheque cancelled successfully',
      cheque: this.formatCheque(updated),
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // DELETE
  // ─────────────────────────────────────────────────────────────────────────────

  async delete(id: number) {
    const cheque = await this.prisma.chequePayment.findUnique({ where: { ID: id } });
    if (!cheque) throw new NotFoundException('Cheque payment not found');

    if (cheque.Status !== 'PENDING') {
      throw new BadRequestException('Only PENDING cheques can be deleted');
    }

    let linked: { kind: 'SALE' | 'PURCHASE'; parentId: number } | null = null;
    await this.prisma.$transaction(async (tx) => {
      linked = await this.removeLinkedPayment(tx, cheque); // also deletes this mirror row
      await tx.chequePayment.deleteMany({ where: { ID: id } });
    });
    await this.invalidateLinked(linked);

    return {
      success: true,
      message: 'Cheque payment deleted successfully',
    };
  }

  /** Stand-alone cleared cheque: SALE Dr Bank / Cr Piutang, PURCHASE Dr Hutang / Cr Bank. */
  private async postStandalone(tx: Tx, id: number, userId: string) {
    const c = await tx.chequePayment.findUniqueOrThrow({ where: { ID: id } });
    const amount = Number(c.Amount);
    const bank = await this.autoJournal.paymentAccount(tx, null, 'CEK');
    const isSale = c.Type === 'SALE';
    const a = await this.autoJournal.accounts(tx, [isSale ? 'receivable' : 'payable']);
    const desc = `Pencairan ${isSale ? 'cek/BG masuk' : 'cek/BG keluar'} ${c.ChequeNumber} (${c.Code})`;
    await this.autoJournal.post(tx, {
      referenceType: REF.CHEQUE_PAYMENT, referenceId: c.ID, date: c.ClearedDate ?? new Date(), description: desc, userId, referenceNumber: c.Code,
      lines: isSale
        ? [{ accountId: bank, debit: amount }, { accountId: a.receivable, credit: amount }]
        : [{ accountId: a.payable, debit: amount }, { accountId: bank, credit: amount }],
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────────────────────────────────────

  private async generateCode(type: string): Promise<string> {
    const prefix = type === 'SALE' ? 'CHQ-S' : 'CHQ-P';
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const codePrefix = `${prefix}-${year}${month}`;

    const lastCheque = await this.prisma.chequePayment.findFirst({
      where: { Code: { startsWith: codePrefix } },
      orderBy: { Code: 'desc' },
      select: { Code: true },
    });

    let nextNumber = 1;
    if (lastCheque) {
      const lastSeq = parseInt(lastCheque.Code.split('-').pop() || '0', 10);
      nextNumber = lastSeq + 1;
    }

    return `${codePrefix}-${String(nextNumber).padStart(4, '0')}`;
  }

  private formatCheque(cheque: any) {
    return {
      id: cheque.ID,
      code: cheque.Code,
      type: cheque.Type,
      referenceType: cheque.ReferenceType,
      referenceId: cheque.ReferenceID,
      bankId: cheque.BankID,
      bank: cheque.Bank ? {
        id: cheque.Bank.ID,
        code: cheque.Bank.Code,
        name: cheque.Bank.Name,
      } : null,
      chequeNumber: cheque.ChequeNumber,
      chequeDate: cheque.ChequeDate,
      dueDate: cheque.DueDate,
      amount: Number(cheque.Amount),
      status: cheque.Status,
      clearedDate: cheque.ClearedDate,
      bouncedDate: cheque.BouncedDate,
      notes: cheque.Notes,
      createdAt: cheque.CreatedAt,
      updatedAt: cheque.UpdatedAt,
    };
  }
}
