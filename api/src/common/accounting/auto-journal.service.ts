import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma-service';
import { RedisService } from '../redis/redis-service';
import { ACCOUNT_KEY_LABELS } from './account-keys';

export type Tx = Prisma.TransactionClient;

/** ReferenceType values written on automatic journals (Journal.ReferenceType + JournalEntry.ReferenceType). */
export const REF = {
  SALE: 'SALE',
  SALE_PAYMENT: 'SALE_PAYMENT',
  SALE_RETURN: 'SALE_RETURN',
  PURCHASE: 'PURCHASE',
  PURCHASE_PAYMENT: 'PURCHASE_PAYMENT',
  PURCHASE_RETURN: 'PURCHASE_RETURN',
  CASH_IN: 'CASH_IN',
  CASH_OUT: 'CASH_OUT',
  CASH_TRANSFER: 'CASH_TRANSFER',
  CUSTOMER_DEPOSIT: 'CUSTOMER_DEPOSIT',
  SUPPLIER_DEPOSIT: 'SUPPLIER_DEPOSIT',
  CHEQUE_PAYMENT: 'CHEQUE_PAYMENT',
  SALES_COMMISSION: 'SALES_COMMISSION',
  STOCK_IN: 'STOCK_IN',
  STOCK_OUT: 'STOCK_OUT',
  STOCK_OPNAME: 'STOCK_OPNAME',
} as const;

export interface JournalLineInput {
  accountId: number;
  debit?: number;
  credit?: number;
  memo?: string | null;
}

export interface PostJournalInput {
  referenceType: string;
  referenceId: number;
  date: Date;
  description: string;
  lines: JournalLineInput[];
  userId: string;
  /** Parent document (e.g. the Sale of a SalePayment) so the whole document can be reversed at once. */
  source?: { type: string; id: number };
  referenceNumber?: string | null;
}

const r2 = (n: number) => Math.round((Number(n) || 0) * 100) / 100;
const dec = (n: number) => new Prisma.Decimal(r2(n).toFixed(2));
const CASH_CODES = ['CASH', 'TUNAI'];

/**
 * Automatic journal posting. Every method takes the caller's Prisma transaction client so the journal
 * is committed/rolled back together with the business document.
 *
 * Rules:
 *  - One posted Journal (+ one JournalEntry header + JournalEntryLine rows) per (ReferenceType, ReferenceID).
 *  - post*() methods are idempotent: they first remove the existing auto journal of the same reference,
 *    so "edit" = call post*() again, "delete" = call reverse*().
 *  - Missing Setting Perkiraan keys throw 400 (never skipped silently).
 *  - Posting into / removing from a closed fiscal year (FiscalYearClose) throws 400.
 */
@Injectable()
export class AutoJournalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  private invalidateTimer: NodeJS.Timeout | null = null;
  /**
   * Journal/account list caches (BaseService, Redis prefix 'journal:' / 'account:') are dropped shortly after a
   * posting, i.e. after the caller's transaction has normally committed (callers may also invalidate themselves).
   */
  private scheduleInvalidate() {
    if (this.invalidateTimer) return;
    this.invalidateTimer = setTimeout(() => {
      this.invalidateTimer = null;
      void this.redis.invalidatePattern('journal:*').catch(() => undefined);
      void this.redis.invalidatePattern('account:*').catch(() => undefined);
    }, 750);
  }

  // ───────────────────────────── core ─────────────────────────────

  /** Resolve Setting Perkiraan keys to account IDs; throws 400 naming the first missing key. */
  async accounts(tx: Tx, keys: string[]): Promise<Record<string, number>> {
    const rows = await tx.accountSetting.findMany({ where: { Key: { in: keys } } });
    const map: Record<string, number> = {};
    for (const r of rows) if (r.AccountID) map[r.Key] = r.AccountID;
    const missing = keys.filter((k) => !map[k]);
    if (missing.length) {
      const names = missing.map((k) => `"${ACCOUNT_KEY_LABELS[k] ?? k}"`).join(', ');
      throw new BadRequestException(
        `Setting Perkiraan ${names} belum diisi. Minta admin melengkapi menu Akuntansi > Setting Perkiraan sebelum menyimpan transaksi ini.`,
      );
    }
    return map;
  }

  /** Optional key: returns null when not configured. */
  async optionalAccount(tx: Tx, key: string): Promise<number | null> {
    const r = await tx.accountSetting.findUnique({ where: { Key: key } });
    return r?.AccountID ?? null;
  }

  /** Cash/bank account for a payment method: CASH/TUNAI -> `cash`; anything else (or cek/BG) -> `bank` if set, else `cash`. */
  async paymentAccount(tx: Tx, methodId: number | null | undefined, instrument?: string | null): Promise<number> {
    const { cash } = await this.accounts(tx, ['cash']);
    let isCash = !instrument || instrument === 'CASH';
    if (isCash && methodId) {
      const m = await tx.paymentMethod.findUnique({ where: { ID: methodId } });
      if (m) {
        const t = (m.Type ?? '').toUpperCase();
        const c = m.Code.toUpperCase();
        isCash = t ? t === 'CASH' : CASH_CODES.some((x) => c.includes(x));
      }
    }
    if (isCash) return cash;
    return (await this.optionalAccount(tx, 'bank')) ?? cash;
  }

  async assertOpenPeriod(tx: Tx, date: Date) {
    const year = date.getUTCFullYear();
    const closed = await tx.fiscalYearClose.findUnique({ where: { Year: year } });
    if (closed) throw new BadRequestException(`Tahun buku ${year} sudah ditutup; transaksi pada tahun tersebut tidak dapat dibuat, diubah atau dihapus`);
  }

  /** Next JR-YYYYMM-NNNN code (same format as manual journals). Serialized with a transaction-scoped advisory lock. */
  async nextCode(tx: Tx, date: Date = new Date()): Promise<string> {
    await tx.$queryRawUnsafe('SELECT 1 AS ok FROM (SELECT pg_advisory_xact_lock(730100)) x');
    const prefix = `JR-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
    const rows = await tx.$queryRawUnsafe<{ mx: number | null }[]>(
      `SELECT MAX(CAST(substring("Code" from '[0-9]+$') AS INTEGER)) AS mx FROM "Journals" WHERE "Code" ~ $1`,
      `^${prefix}-[0-9]+$`,
    );
    const rows2 = await tx.$queryRawUnsafe<{ mx: number | null }[]>(
      `SELECT MAX(CAST(substring("JournalNumber" from '[0-9]+$') AS INTEGER)) AS mx FROM "JournalEntries" WHERE "JournalNumber" ~ $1`,
      `^${prefix}-[0-9]+$`,
    );
    const next = Math.max(Number(rows[0]?.mx ?? 0), Number(rows2[0]?.mx ?? 0)) + 1;
    return `${prefix}-${String(next).padStart(4, '0')}`;
  }

  /**
   * Post a balanced journal for a reference, replacing any existing auto journal of that reference.
   * Zero lines are dropped; if nothing remains, no journal is created (returns null).
   */
  async post(tx: Tx, input: PostJournalInput) {
    await this.reverse(tx, input.referenceType, input.referenceId);
    const lines = input.lines
      .map((l) => ({ ...l, debit: r2(l.debit ?? 0), credit: r2(l.credit ?? 0) }))
      .filter((l) => l.debit !== 0 || l.credit !== 0)
      .map((l) => {
        // normalise negatives to the opposite side
        const net = r2(l.debit - l.credit);
        return { ...l, debit: net > 0 ? net : 0, credit: net < 0 ? -net : 0 };
      })
      .filter((l) => l.debit !== 0 || l.credit !== 0);
    if (!lines.length) return null;
    if (lines.some((l) => !l.accountId)) throw new BadRequestException('Baris jurnal otomatis tanpa perkiraan');
    const totalDebit = r2(lines.reduce((s, l) => s + l.debit, 0));
    const totalCredit = r2(lines.reduce((s, l) => s + l.credit, 0));
    if (Math.round(totalDebit * 100) !== Math.round(totalCredit * 100)) {
      throw new BadRequestException(`Jurnal otomatis ${input.referenceType} #${input.referenceId} tidak balance (D ${totalDebit} / K ${totalCredit})`);
    }
    await this.assertOpenPeriod(tx, input.date);
    const code = await this.nextCode(tx, input.date);
    this.scheduleInvalidate();
    return tx.journal.create({
      data: {
        Code: code,
        Date: input.date,
        Description: input.description,
        ReferenceType: input.referenceType,
        ReferenceID: input.referenceId,
        IsPosted: true,
        PostedAt: new Date(),
        CreatedByID: input.userId,
        JournalEntries: {
          create: {
            JournalNumber: code,
            Date: input.date,
            Type: 'AUTO',
            Description: input.description,
            ReferenceType: input.referenceType,
            ReferenceID: input.referenceId,
            ReferenceNumber: input.referenceNumber ?? null,
            SourceDocumentType: input.source?.type ?? input.referenceType,
            SourceDocumentID: input.source?.id ?? input.referenceId,
            TotalDebit: dec(totalDebit),
            TotalCredit: dec(totalCredit),
            Status: 'POSTED',
            CreatedByID: input.userId,
            Lines: {
              create: lines.map((l, i) => ({
                AccountID: l.accountId,
                Debit: dec(l.debit),
                Credit: dec(l.credit),
                DebitCredit: l.debit > 0 ? 'DEBIT' : 'KREDIT',
                Amount: dec(l.debit || l.credit),
                Description: l.memo ?? input.description,
                LineNumber: i + 1,
                CreatedByID: input.userId,
              })),
            },
          },
        },
      },
      include: { JournalEntries: { include: { Lines: true } } },
    });
  }

  /** Delete the automatic journal(s) of a reference. Returns number of journals removed. */
  async reverse(tx: Tx, referenceType: string, referenceId: number): Promise<number> {
    const js = await tx.journal.findMany({ where: { ReferenceType: referenceType, ReferenceID: referenceId }, select: { ID: true, Date: true } });
    return this.deleteJournals(tx, js);
  }

  /** Delete every automatic journal whose source document is (type, id) — e.g. all payment journals of a Sale. */
  async reverseBySource(tx: Tx, sourceType: string, sourceId: number): Promise<number> {
    const js = await tx.journal.findMany({
      where: {
        OR: [
          { ReferenceType: sourceType, ReferenceID: sourceId },
          { JournalEntries: { some: { SourceDocumentType: sourceType, SourceDocumentID: sourceId } } },
        ],
      },
      select: { ID: true, Date: true },
    });
    return this.deleteJournals(tx, js);
  }

  private async deleteJournals(tx: Tx, js: { ID: number; Date: Date }[]) {
    if (!js.length) return 0;
    for (const j of js) await this.assertOpenPeriod(tx, j.Date);
    const ids = js.map((j) => j.ID);
    this.scheduleInvalidate();
    await tx.journalEntry.deleteMany({ where: { JournalID: { in: ids } } }); // lines cascade
    await tx.journal.deleteMany({ where: { ID: { in: ids } } });
    return ids.length;
  }

  /** Lines of the current auto journal of a reference (used to keep user-chosen accounts on edit). */
  async linesOf(tx: Tx | PrismaService, referenceType: string, referenceId: number) {
    return tx.journalEntryLine.findMany({
      where: { JournalEntry: { Journal: { ReferenceType: referenceType, ReferenceID: referenceId } } },
      include: { Account: { select: { ID: true, Code: true, Name: true } } },
      orderBy: { LineNumber: 'asc' },
    });
  }

  // ─────────────────────── documents (Stock agent / lead) ───────────────────────

  /**
   * Penjualan. Call inside the sale's transaction AFTER SaleItems (with CostPrice/BaseQuantity) and any
   * SalePayment rows created with the sale exist. Idempotent (call again after edit).
   *   Dr Piutang (Total) | Dr Potongan (Subtotal + Pajak - Total, if > 0) | Cr Penjualan (Subtotal) | Cr PPN Keluaran (TaxAmount)
   *   Dr HPP / Cr Persediaan = Σ SaleItem.CostPrice × BaseQuantity
   * Then every SalePayment of the sale is posted via postSalePayment (Dr Kas/Bank|Deposit, Cr Piutang).
   */
  async postSale(tx: Tx, saleId: number, userId?: string) {
    const sale = await tx.sale.findUnique({ where: { ID: saleId }, include: { SaleItems: true, SalePayments: true } });
    if (!sale) throw new NotFoundException(`Penjualan #${saleId} tidak ditemukan`);
    const uid = userId ?? sale.CreatedByID;
    const total = Number(sale.Total);
    const tax = Number(sale.TaxAmount);
    const subtotal = Number(sale.Subtotal);
    const discount = r2(subtotal + tax - total);
    const cost = r2(sale.SaleItems.reduce((s, i) => s + Number(i.CostPrice) * Number(Number(i.BaseQuantity) > 0 ? i.BaseQuantity : i.Quantity), 0));
    const keys = ['receivable', 'sales'];
    if (tax) keys.push('vatOut');
    if (discount > 0) keys.push('salesDiscount');
    if (discount < 0) keys.push('otherIncome');
    if (cost) keys.push('cogs', 'inventory');
    const a = await this.accounts(tx, keys);
    const desc = `Penjualan ${sale.Code}`;
    const lines: JournalLineInput[] = [
      { accountId: a.receivable, debit: total, memo: desc },
      { accountId: a.sales, credit: subtotal, memo: desc },
    ];
    if (tax) lines.push({ accountId: a.vatOut, credit: tax, memo: `PPN ${sale.Code}` });
    if (discount > 0) lines.push({ accountId: a.salesDiscount, debit: discount, memo: `Potongan ${sale.Code}` });
    if (discount < 0) lines.push({ accountId: a.otherIncome, credit: -discount, memo: `Biaya lain ${sale.Code}` });
    if (cost) {
      lines.push({ accountId: a.cogs, debit: cost, memo: `HPP ${sale.Code}` });
      lines.push({ accountId: a.inventory, credit: cost, memo: `HPP ${sale.Code}` });
    }
    await this.reverseBySource(tx, REF.SALE, sale.ID); // drops stale payment journals too
    const j = await this.post(tx, { referenceType: REF.SALE, referenceId: sale.ID, date: sale.Date, description: desc, lines, userId: uid, referenceNumber: sale.Code });
    for (const p of sale.SalePayments) await this.postSalePayment(tx, p.ID, uid);
    return j;
  }

  /** Remove the sale journal and all its payment journals (call before deleting / cancelling a sale). */
  async reverseSale(tx: Tx, saleId: number) {
    return this.reverseBySource(tx, REF.SALE, saleId);
  }

  /**
   * Pembayaran penjualan: Dr Kas/Bank (per metode) atau Dr Deposit Pelanggan (InstrumentType DEPOSIT), Cr Piutang.
   * Cek/BG yang belum cair (IsCleared=false) tidak diposting (journal lama dihapus).
   */
  async postSalePayment(tx: Tx, paymentId: number, userId?: string) {
    const p = await tx.salePayment.findUnique({ where: { ID: paymentId }, include: { Sale: { select: { ID: true, Code: true } } } });
    if (!p) throw new NotFoundException(`Pembayaran penjualan #${paymentId} tidak ditemukan`);
    if (!p.IsCleared) {
      await this.reverse(tx, REF.SALE_PAYMENT, p.ID);
      return null;
    }
    const isDeposit = p.InstrumentType === 'DEPOSIT';
    const isDiscount = p.InstrumentType === 'DISCOUNT';
    const a = await this.accounts(tx, isDeposit ? ['receivable', 'custDeposit'] : isDiscount ? ['receivable', 'salesDiscount'] : ['receivable']);
    // Potongan pelunasan: Dr Potongan Penjualan; Kode Akun pilihan user menimpa akun metode bayar.
    const debitAcc = isDeposit ? a.custDeposit : isDiscount ? a.salesDiscount : p.AccountID ?? (await this.paymentAccount(tx, p.MethodID, p.InstrumentType));
    const desc = `${isDeposit ? 'Pemakaian deposit' : isDiscount ? 'Potongan pelunasan' : 'Pembayaran'} penjualan ${p.Sale.Code}${p.ReferenceNumber ? ` (${p.ReferenceNumber})` : ''}`;
    const amount = Number(p.Amount);
    return this.post(tx, {
      referenceType: REF.SALE_PAYMENT, referenceId: p.ID, date: p.InstrumentType === 'CEK' || p.InstrumentType === 'BG' ? p.ClearedAt ?? p.Date : p.Date,
      description: desc, userId: userId ?? p.CreatedByID, source: { type: REF.SALE, id: p.SaleID }, referenceNumber: p.Sale.Code,
      lines: [
        { accountId: debitAcc, debit: amount },
        { accountId: a.receivable, credit: amount },
      ],
    });
  }

  /**
   * Item Masuk / Item Keluar / Stock Opname: nilai = Σ mutasi ledger dokumen × HPP per satuan dasar.
   *   nilai > 0 (stok bertambah): Dr Persediaan / Cr Kode Akun (default Item Masuk / Selisih Stok)
   *   nilai < 0 (stok berkurang): Dr Kode Akun (default Item Keluar / Selisih Stok) / Cr Persediaan
   * Idempoten: jurnal lama dokumen selalu dibalik dulu.
   */
  async postStockDoc(
    tx: Tx,
    kind: 'STOCK_IN' | 'STOCK_OUT' | 'STOCK_OPNAME',
    doc: { ID: number; Code: string; Date: Date; AccountID?: number | null; CreatedByID?: string | null },
    userId?: string,
  ) {
    const ref = REF[kind];
    await this.reverse(tx, ref, doc.ID);
    const ledgerType = kind === 'STOCK_OPNAME' ? 'OPNAME' : kind;
    const rows = await tx.stockLedger.findMany({ where: { RefType: ledgerType, RefID: doc.ID }, select: { QtyIn: true, QtyOut: true, UnitCost: true } });
    const value = r2(rows.reduce((a, x) => a + (Number(x.QtyIn) - Number(x.QtyOut)) * Number(x.UnitCost), 0));
    if (Math.abs(value) < 0.005) return null;
    const key = kind === 'STOCK_IN' ? 'stockIn' : kind === 'STOCK_OUT' ? 'stockOut' : 'stockDiff';
    const a = await this.accounts(tx, doc.AccountID ? ['inventory'] : ['inventory', key]);
    const counter = doc.AccountID ?? a[key];
    const label = kind === 'STOCK_IN' ? 'Item masuk' : kind === 'STOCK_OUT' ? 'Item keluar' : 'Stock opname';
    const amount = Math.abs(value);
    return this.post(tx, {
      referenceType: ref, referenceId: doc.ID, date: doc.Date, description: `${label} ${doc.Code}`,
      userId: userId ?? doc.CreatedByID ?? 'system', referenceNumber: doc.Code,
      lines: value > 0
        ? [{ accountId: a.inventory, debit: amount }, { accountId: counter, credit: amount }]
        : [{ accountId: counter, debit: amount }, { accountId: a.inventory, credit: amount }],
    });
  }

  /**
   * Bayar Komisi Sales: Dr Beban Komisi Sales, Cr Kas/Bank (Kode Akun pilihan / akun metode bayar).
   * Cek/BG yang belum cair tidak diposting (diposting saat Status Lunas Cek/Bg Sales dicentang).
   */
  async postCommissionPayment(tx: Tx, paymentId: number, userId?: string) {
    const p = await tx.salesCommissionPayment.findUnique({ where: { ID: paymentId }, include: { SalesPerson: { select: { Name: true } } } });
    if (!p) throw new NotFoundException(`Pembayaran komisi #${paymentId} tidak ditemukan`);
    await this.reverse(tx, REF.SALES_COMMISSION, p.ID);
    const amount = Number(p.Total);
    if (!p.IsCleared || !(amount > 0)) return null;
    const a = await this.accounts(tx, ['salesCommission']);
    const creditAcc = p.AccountID ?? (p.MethodID ? await this.paymentAccount(tx, p.MethodID, p.InstrumentType) : (await this.accounts(tx, ['cash'])).cash);
    const desc = `Bayar komisi sales ${p.SalesPerson.Name} ${p.Code}${p.Number ? ` (${p.Number})` : ''}`;
    return this.post(tx, {
      referenceType: REF.SALES_COMMISSION, referenceId: p.ID, date: p.ClearedAt && p.InstrumentType !== 'CASH' ? p.ClearedAt : p.Date,
      description: desc, userId: userId ?? p.CreatedByID, referenceNumber: p.Code,
      lines: [
        { accountId: a.salesCommission, debit: amount },
        { accountId: creditAcc, credit: amount },
      ],
    });
  }

  /**
   * Pembelian. Call inside the purchase's transaction after PurchaseItems/PurchasePayments exist. Idempotent.
   *   Dr Persediaan (Total - TaxAmount) | Dr PPN Masukan (TaxAmount) | Cr Hutang (Total)
   * Then every PurchasePayment is posted via postPurchasePayment (Dr Hutang, Cr Kas/Bank|Deposit Supplier).
   */
  async postPurchase(tx: Tx, purchaseId: number, userId?: string) {
    const pu = await tx.purchase.findUnique({ where: { ID: purchaseId }, include: { PurchasePayments: true } });
    if (!pu) throw new NotFoundException(`Pembelian #${purchaseId} tidak ditemukan`);
    const uid = userId ?? pu.CreatedByID;
    const total = Number(pu.Total);
    const tax = Number(pu.TaxAmount);
    const a = await this.accounts(tx, tax ? ['inventory', 'payable', 'vatIn'] : ['inventory', 'payable']);
    const desc = `Pembelian ${pu.Code}`;
    const lines: JournalLineInput[] = [
      { accountId: a.inventory, debit: r2(total - tax), memo: desc },
      { accountId: a.payable, credit: total, memo: desc },
    ];
    if (tax) lines.push({ accountId: a.vatIn, debit: tax, memo: `PPN ${pu.Code}` });
    await this.reverseBySource(tx, REF.PURCHASE, pu.ID);
    const j = await this.post(tx, { referenceType: REF.PURCHASE, referenceId: pu.ID, date: pu.Date, description: desc, lines, userId: uid, referenceNumber: pu.Code });
    for (const p of pu.PurchasePayments) await this.postPurchasePayment(tx, p.ID, uid);
    return j;
  }

  async reversePurchase(tx: Tx, purchaseId: number) {
    return this.reverseBySource(tx, REF.PURCHASE, purchaseId);
  }

  /** Pembayaran pembelian: Dr Hutang, Cr Kas/Bank (per metode) atau Cr Deposit Supplier (DEPOSIT). Cek/BG belum cair tidak diposting. */
  async postPurchasePayment(tx: Tx, paymentId: number, userId?: string) {
    const p = await tx.purchasePayment.findUnique({ where: { ID: paymentId }, include: { Purchase: { select: { ID: true, Code: true } } } });
    if (!p) throw new NotFoundException(`Pembayaran pembelian #${paymentId} tidak ditemukan`);
    if (!p.IsCleared) {
      await this.reverse(tx, REF.PURCHASE_PAYMENT, p.ID);
      return null;
    }
    const isDeposit = p.InstrumentType === 'DEPOSIT';
    const isDiscount = p.InstrumentType === 'DISCOUNT';
    const a = await this.accounts(tx, isDeposit ? ['payable', 'suppDeposit'] : isDiscount ? ['payable', 'purchaseDiscount'] : ['payable']);
    // Potongan pelunasan: Cr Potongan Pembelian; Kode Akun pilihan user menimpa akun metode bayar.
    const creditAcc = isDeposit ? a.suppDeposit : isDiscount ? a.purchaseDiscount : p.AccountID ?? (await this.paymentAccount(tx, p.MethodID, p.InstrumentType));
    const desc = `${isDeposit ? 'Pemakaian deposit' : isDiscount ? 'Potongan pelunasan' : 'Pembayaran'} pembelian ${p.Purchase.Code}${p.ReferenceNumber ? ` (${p.ReferenceNumber})` : ''}`;
    const amount = Number(p.Amount);
    return this.post(tx, {
      referenceType: REF.PURCHASE_PAYMENT, referenceId: p.ID, date: p.InstrumentType === 'CEK' || p.InstrumentType === 'BG' ? p.ClearedAt ?? p.Date : p.Date,
      description: desc, userId: userId ?? p.CreatedByID, source: { type: REF.PURCHASE, id: p.PurchaseID }, referenceNumber: p.Purchase.Code,
      lines: [
        { accountId: a.payable, debit: amount },
        { accountId: creditAcc, credit: amount },
      ],
    });
  }

  /**
   * Retur penjualan (nota kredit ke pelanggan). Idempotent.
   *   Dr Retur Penjualan / Cr Piutang = TotalReturn
   *   Dr Persediaan / Cr HPP = Σ BaseQuantity × CostPrice of the original SaleItem (same product)
   */
  async postSaleReturn(tx: Tx, saleReturnId: number, userId?: string) {
    const r = await tx.saleReturn.findUnique({ where: { ID: saleReturnId }, include: { ReturnItems: true, Sale: { include: { SaleItems: true } } } });
    if (!r) throw new NotFoundException(`Retur penjualan #${saleReturnId} tidak ditemukan`);
    const total = Number(r.TotalReturn);
    const cost = r2(r.ReturnItems.reduce((s, it) => {
      const src = r.Sale.SaleItems.find((x) => x.ProductID === it.ProductID);
      const qty = Number(it.BaseQuantity) > 0 ? Number(it.BaseQuantity) : Number(it.Quantity);
      return s + qty * Number(src?.CostPrice ?? 0);
    }, 0));
    const a = await this.accounts(tx, cost ? ['salesReturn', 'receivable', 'inventory', 'cogs'] : ['salesReturn', 'receivable']);
    const desc = `Retur penjualan ${r.Code} (${r.Sale.Code})`;
    const lines: JournalLineInput[] = [
      { accountId: a.salesReturn, debit: total },
      { accountId: a.receivable, credit: total },
    ];
    if (cost) {
      lines.push({ accountId: a.inventory, debit: cost, memo: `Persediaan kembali ${r.Code}` });
      lines.push({ accountId: a.cogs, credit: cost, memo: `Koreksi HPP ${r.Code}` });
    }
    return this.post(tx, { referenceType: REF.SALE_RETURN, referenceId: r.ID, date: r.Date, description: desc, lines, userId: userId ?? r.CreatedByID, referenceNumber: r.Code });
  }

  async reverseSaleReturn(tx: Tx, saleReturnId: number) {
    return this.reverse(tx, REF.SALE_RETURN, saleReturnId);
  }

  /** Retur pembelian (nota debet ke supplier): Dr Hutang / Cr Persediaan = TotalReturn. Idempotent. */
  async postPurchaseReturn(tx: Tx, purchaseReturnId: number, userId?: string) {
    const r = await tx.purchaseReturn.findUnique({ where: { ID: purchaseReturnId }, include: { Purchase: { select: { Code: true } } } });
    if (!r) throw new NotFoundException(`Retur pembelian #${purchaseReturnId} tidak ditemukan`);
    const total = Number(r.TotalReturn);
    const a = await this.accounts(tx, ['payable', 'inventory']);
    const desc = `Retur pembelian ${r.Code} (${r.Purchase.Code})`;
    return this.post(tx, {
      referenceType: REF.PURCHASE_RETURN, referenceId: r.ID, date: r.Date, description: desc, userId: userId ?? r.CreatedByID, referenceNumber: r.Code,
      lines: [
        { accountId: a.payable, debit: total },
        { accountId: a.inventory, credit: total },
      ],
    });
  }

  async reversePurchaseReturn(tx: Tx, purchaseReturnId: number) {
    return this.reverse(tx, REF.PURCHASE_RETURN, purchaseReturnId);
  }
}
