import { computeDocTotals } from '../../common/accounting/doc-totals';
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma-service';
import { RedisService } from '../../common/redis/redis-service';
import { QueryService } from '../../common/query/query-service';
import { StockLedgerService } from '../../common/stock/stock-ledger.service';
import { PartyBalanceService } from '../../common/stock/party-balance.service';
import { AutoJournalService } from '../../common/accounting/auto-journal.service';
import { DepositLedgerService } from '../../common/accounting/deposit-ledger.service';
import { ensureDepositMethod, isChequeInstrument, syncChequeMirror } from '../../common/accounting/payment-link';
import { recalcSaleOrderDelivery } from '../../common/sales/sale-order-delivery';
import { computeSalePoints, recalcCustomerPoints } from '../../common/sales/points';
import { NotificationService } from '../notification/notification.service';
import { Prisma } from '@prisma/client';
import { CreateSaleDto, UpdateSaleDto, PaymentDto, UpdateStatusDto, UpdateShippingDto } from './dto/sale.dto';

type Tx = Prisma.TransactionClient;
const r2 = (n: number) => Math.round((Number(n) || 0) * 100) / 100;
const idr = (v: number) => `Rp ${Number(v).toLocaleString('id-ID')}`;

/**
 * Penjualan (POS & faktur penjualan).
 * Stok: setiap item dikeluarkan dari gudang penjualan (atau gudang default) lewat
 * StockLedgerService dalam satuan dasar; CostPrice = HPP rata-rata per satuan dasar
 * saat transaksi. Batal/hapus membalik mutasi ledger dokumen ini.
 */
@Injectable()
export class SaleService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private queryService: QueryService,
    private notificationService: NotificationService,
    private ledger: StockLedgerService,
    private party: PartyBalanceService,
    private journal: AutoJournalService,
    private deposits: DepositLedgerService,
  ) {}

  async findAll(query: Record<string, unknown>) {
    const prismaQuery = this.queryService.buildPrismaQuery(query, {
      searchableFields: ['*'],
      allowedIncludes: ['*'],
      defaultOrderBy: { CreatedAt: 'desc' },
    });

    const findArgs: Record<string, unknown> = {
      where: prismaQuery.where,
      orderBy: prismaQuery.orderBy,
      skip: prismaQuery.skip,
      take: prismaQuery.take,
    };

    if (prismaQuery.select) {
      findArgs.select = prismaQuery.select;
    } else if (prismaQuery.include) {
      findArgs.include = prismaQuery.include;
    }

    const [data, total] = await Promise.all([
      this.prisma.sale.findMany(findArgs as Parameters<typeof this.prisma.sale.findMany>[0]),
      this.prisma.sale.count({ where: prismaQuery.where }),
    ]);

    return {
      data: data.map((item) => this.serialize(item)),
      total,
      skip: prismaQuery.skip,
      take: prismaQuery.take,
    };
  }

  async findOne(id: number, query: Record<string, unknown> = {}) {
    const prismaQuery = this.queryService.buildPrismaQuery(query, {
      allowedIncludes: ['*'],
    });

    const findArgs: Record<string, unknown> = { where: { ID: id } };

    if (prismaQuery.select) {
      findArgs.select = prismaQuery.select;
    } else if (prismaQuery.include) {
      findArgs.include = prismaQuery.include;
    }

    const data = await this.prisma.sale.findUnique(findArgs as Parameters<typeof this.prisma.sale.findUnique>[0]);
    if (!data) throw new NotFoundException('Sale not found');
    return this.serialize(data);
  }

  async create(dto: CreateSaleDto, userId: string) {
    if (!dto.Items || dto.Items.length === 0) throw new BadRequestException('Item penjualan tidak boleh kosong');
    if (dto.Items.some((i) => !(Number(i.Quantity) > 0))) throw new BadRequestException('Jumlah item harus lebih dari 0');

    const customer = await this.prisma.customer.findUnique({ where: { ID: dto.CustomerID } });
    if (!customer) throw new BadRequestException(`Pelanggan dengan ID ${dto.CustomerID} tidak ditemukan`);
    if (dto.SaleOrderID) await this.assertSaleOrder(dto.SaleOrderID, dto.CustomerID);

    const saleDate = dto.Date ? new Date(dto.Date) : new Date();
    if (Number.isNaN(saleDate.getTime())) throw new BadRequestException('Tanggal penjualan tidak valid');
    const code = await this.generateCode();

    // Totals
    const subtotal = r2(dto.Items.reduce((sum, item) => sum + (item.UnitPrice * item.Quantity - (item.DiscountAmount || 0)), 0));
    const discountAmount = r2(dto.DiscountAmount || 0);
    const paymentMethodId = dto.PaymentMethodID ?? dto.paymentMethodId ?? (await this.getCashMethodId(this.prisma));
    const requestedWarehouse = dto.WarehouseID ?? dto.warehouseId;

    const sale = await this.prisma.$transaction(
      async (tx) => {
        const warehouseId = await this.ledger.resolveWarehouseId(tx, requestedWarehouse);

        // Voucher (validasi + klaim kuota secara atomik)
        let voucherId: number | null = null;
        let voucherDiscount = 0;
        if (dto.VoucherID || dto.VoucherCode) {
          const v = await this.claimVoucher(tx, dto.VoucherID, dto.VoucherCode, Math.max(subtotal - discountAmount, 0));
          voucherId = v.id;
          voucherDiscount = v.discount;
        }

        const taxMode = dto.TaxMode ?? (dto.TaxPercent ? 'EXCLUDE' : 'NON');
        const docT = computeDocTotals({
          subtotal, discount: discountAmount + voucherDiscount, taxMode, taxPercent: dto.TaxPercent || 0,
          otherCost: dto.OtherCost || 0, otherCostAdds: dto.OtherCostAdds ?? true,
        });
        const taxAmount = docT.tax;
        const total = docT.total;

        // Bayar: DP SO / Tunai / Deposit / Debit / Kartu Kredit / E-Money; sisanya = Kredit (piutang)
        const pay = await this.paymentLines(tx, dto, total, paymentMethodId);
        const paid = pay.paid;
        const unpaid = r2(total - paid);

        // Batas kredit (0 = tanpa batas)
        const creditLimit = Number(customer.CreditLimit ?? 0);
        if (unpaid > 0.005 && creditLimit > 0) {
          const outstanding = await this.party.customerOutstanding(tx, customer.ID);
          if (outstanding + unpaid > creditLimit + 0.005) {
            throw new BadRequestException(
              `Melebihi batas kredit pelanggan ${customer.Name}: limit ${idr(creditLimit)}, piutang berjalan ${idr(outstanding)}, transaksi ini belum dibayar ${idr(unpaid)}`,
            );
          }
        }

        // Jatuh tempo: dari input, atau tanggal + termin pelanggan bila ada sisa tagihan
        let dueDate: Date | null = null;
        if (dto.DueDate) {
          dueDate = new Date(dto.DueDate);
          if (Number.isNaN(dueDate.getTime())) throw new BadRequestException('Tanggal jatuh tempo tidak valid');
        } else if (unpaid > 0.005 && customer.DueDays > 0) {
          dueDate = new Date(saleDate.getTime() + customer.DueDays * 86400000);
        }

        const paymentStatus = await this.getPaymentStatusByCode(tx, paid >= total ? 'PAID' : paid > 0 ? 'PARTIAL' : 'PENDING');
        const itemsData = await this.buildItems(tx, dto.Items);
        const pointEarned = await computeSalePoints(tx, dto.CustomerID, total, saleDate);

        const newSale = await tx.sale.create({
          data: {
            Code: code,
            Date: saleDate,
            DueDate: dueDate,
            CustomerID: dto.CustomerID,
            SalesPersonID: dto.SalesPersonID,
            SalePointID: dto.SalePointID,
            WarehouseID: warehouseId,
            SaleOrderID: dto.SaleOrderID ?? null,
            Subtotal: new Prisma.Decimal(subtotal),
            DiscountPercent: new Prisma.Decimal(dto.DiscountPercent || 0),
            DiscountAmount: new Prisma.Decimal(discountAmount),
            VoucherID: voucherId,
            VoucherDiscount: new Prisma.Decimal(voucherDiscount),
            TaxPercent: new Prisma.Decimal(docT.taxPercent),
            TaxAmount: new Prisma.Decimal(taxAmount),
            TaxMode: taxMode,
            OtherCost: new Prisma.Decimal(docT.otherCost),
            OtherCostAdds: dto.OtherCostAdds ?? true,
            ReferenceNo: dto.ReferenceNo || null,
            ShipName: dto.ShipName || null,
            ShipAddress: dto.ShipAddress || null,
            ShipCity: dto.ShipCity || null,
            ShipPhone: dto.ShipPhone || null,
            Courier: dto.Courier || null,
            PointEarned: new Prisma.Decimal(pointEarned),
            Total: new Prisma.Decimal(total),
            CashAmount: new Prisma.Decimal(pay.entered),
            ChangeAmount: new Prisma.Decimal(pay.change),
            PaymentStatusID: paymentStatus.ID,
            PaymentMethodID: pay.lines[0]?.methodId ?? paymentMethodId,
            Notes: dto.Notes,
            CreatedByID: userId,
            SaleItems: { create: itemsData },
          },
          include: { SaleItems: true },
        });

        // Stok keluar per gudang (ditolak bila stok tidak cukup)
        await this.applyStock(tx, newSale.ID, warehouseId, userId, saleDate);

        // Baris pembayaran (deposit dipakai, cek/BG menunggu cair)
        for (const l of pay.lines) {
          const cleared = !isChequeInstrument(l.inst);
          const p = await tx.salePayment.create({
            data: {
              SaleID: newSale.ID,
              MethodID: l.methodId,
              Amount: new Prisma.Decimal(l.amount),
              Date: saleDate,
              ReferenceNumber: l.referenceNumber,
              Notes: l.notes,
              InstrumentType: l.inst,
              DueDate: l.dueDate,
              IsCleared: cleared,
              ClearedAt: cleared ? saleDate : null,
              AccountID: l.accountId,
              CreatedByID: userId,
            },
          });
          if (l.inst === 'DEPOSIT') {
            await this.deposits.useCustomerDeposit(tx, {
              customerId: dto.CustomerID, salePaymentId: p.ID, amount: l.amount, date: saleDate, userId,
              note: `Pembayaran penjualan ${code} memakai deposit`,
            });
          }
          if (!cleared) await syncChequeMirror(tx, 'SALE_PAYMENT', p);
        }

        await this.journal.postSale(tx, newSale.ID, userId);
        await this.party.recalcSale(tx, newSale.ID);
        await this.party.recalcCustomer(tx, customer.ID);
        await recalcSaleOrderDelivery(tx, dto.SaleOrderID);
        await recalcCustomerPoints(tx, customer.ID);

        return tx.sale.findUniqueOrThrow({
          where: { ID: newSale.ID },
          include: {
            Customer: true,
            SalesPerson: true,
            SalePoint: true,
            Warehouse: true,
            SaleItems: { include: { Product: true, Unit: true } },
          },
        });
      },
      { timeout: 30000 },
    );

    await this.afterWrite();

    await this.notificationService.notify({
      title: 'Penjualan Baru',
      message: `Transaksi ${sale.Code} sebesar ${idr(Number(sale.Total))} telah dibuat`,
      typeCode: 'SALE',
      referenceType: 'Sale',
      referenceId: sale.ID,
    });

    for (const item of sale.SaleItems) {
      const product = await this.prisma.product.findUnique({ where: { ID: item.ProductID } });
      if (product && Number(product.Stock) <= Number(product.MinimumStock)) {
        await this.notificationService.notify({
          title: Number(product.Stock) <= 0 ? 'Stok Habis' : 'Stok Menipis',
          message: `${product.Name} (${product.Code}) sisa stok ${Number(product.Stock)}`,
          typeCode: 'STOCK',
          referenceType: 'Product',
          referenceId: product.ID,
        });
      }
    }

    return this.serialize(sale);
  }

  async update(id: number, dto: UpdateSaleDto, userId?: string) {
    const sale = await this.prisma.sale.findUnique({
      where: { ID: id },
      include: { PaymentStatus: true, SaleReturns: { include: { Status: true } } },
    });
    if (!sale) throw new NotFoundException('Sale not found');

    const statusCode = sale.PaymentStatus?.Code?.toUpperCase();
    // Seperti Ketoko: penjualan dapat diedit selama belum dibatalkan (pembayaran yang sudah ada tetap berlaku).
    if (statusCode === 'CANCELLED') throw new BadRequestException('Penjualan yang dibatalkan tidak dapat diubah');
    if (dto.Items) {
      if (!dto.Items.length) throw new BadRequestException('Item penjualan tidak boleh kosong');
      if (dto.Items.some((i) => !(Number(i.Quantity) > 0))) throw new BadRequestException('Jumlah item harus lebih dari 0');
      if (sale.SaleReturns.some((r) => r.Status?.Code?.toUpperCase() !== 'CANCELLED')) {
        throw new BadRequestException('Item tidak dapat diubah karena penjualan sudah memiliki retur');
      }
    }
    const customerId = dto.CustomerID ?? sale.CustomerID;
    const soId = dto.SaleOrderID !== undefined ? dto.SaleOrderID ?? null : sale.SaleOrderID;
    if (soId && soId !== sale.SaleOrderID) await this.assertSaleOrder(soId, customerId);

    const updated = await this.prisma.$transaction(
      async (tx) => {
        const updateData: Prisma.SaleUncheckedUpdateInput = {};
        if (dto.CustomerID !== undefined) updateData.CustomerID = dto.CustomerID;
        if (dto.SalesPersonID !== undefined) updateData.SalesPersonID = dto.SalesPersonID ?? null;
        if (dto.SalePointID !== undefined) updateData.SalePointID = dto.SalePointID;
        if (dto.SaleOrderID !== undefined) updateData.SaleOrderID = soId;
        if (dto.Date) updateData.Date = new Date(dto.Date);
        if (dto.DueDate !== undefined) updateData.DueDate = dto.DueDate ? new Date(dto.DueDate) : null;
        if (dto.DiscountPercent !== undefined) updateData.DiscountPercent = new Prisma.Decimal(dto.DiscountPercent);
        if (dto.PaymentMethodID !== undefined) updateData.PaymentMethodID = dto.PaymentMethodID;
        if (dto.Notes !== undefined) updateData.Notes = dto.Notes;
        if (dto.ReferenceNo !== undefined) updateData.ReferenceNo = dto.ReferenceNo || null;
        for (const k of ['ShipName', 'ShipAddress', 'ShipCity', 'ShipPhone', 'Courier'] as const) {
          if (dto[k] !== undefined) (updateData as any)[k] = dto[k] || null;
        }

        // Gudang
        let warehouseId = sale.WarehouseID;
        if (dto.WarehouseID !== undefined && dto.WarehouseID !== null) {
          warehouseId = await this.ledger.resolveWarehouseId(tx, dto.WarehouseID);
          if (warehouseId !== sale.WarehouseID) updateData.WarehouseID = warehouseId;
        }

        // Item diganti: balik stok lama, simpan item baru, keluarkan stok baru
        let subtotal = Number(sale.Subtotal);
        if (dto.Items) {
          await this.ledger.reverseRef(tx, ['SALE'], id, { refCode: sale.Code, userId, notes: `Ubah penjualan ${sale.Code}` });
          const items = await this.buildItems(tx, dto.Items);
          await tx.saleItem.deleteMany({ where: { SaleID: id } });
          updateData.SaleItems = { create: items } as any;
          subtotal = r2(dto.Items.reduce((s, i) => s + (i.UnitPrice * i.Quantity - (i.DiscountAmount || 0)), 0));
          updateData.Subtotal = new Prisma.Decimal(subtotal);
        } else if (warehouseId !== sale.WarehouseID && warehouseId) {
          await this.ledger.relocateRef(tx, ['SALE'], id, warehouseId, { refCode: sale.Code, userId });
        }

        // Total dihitung ulang dari subtotal, potongan, PPN, biaya
        const taxMode = dto.TaxMode ?? sale.TaxMode;
        const discount = dto.DiscountAmount ?? Number(sale.DiscountAmount);
        const t = computeDocTotals({
          subtotal,
          discount: discount + Number(sale.VoucherDiscount ?? 0),
          taxMode,
          taxPercent: dto.TaxPercent ?? Number(sale.TaxPercent),
          otherCost: dto.OtherCost ?? Number(sale.OtherCost),
          otherCostAdds: dto.OtherCostAdds ?? sale.OtherCostAdds,
        });
        Object.assign(updateData, {
          DiscountAmount: new Prisma.Decimal(discount),
          TaxMode: taxMode,
          TaxPercent: new Prisma.Decimal(t.taxPercent),
          TaxAmount: new Prisma.Decimal(t.tax),
          OtherCost: new Prisma.Decimal(t.otherCost),
          OtherCostAdds: dto.OtherCostAdds ?? sale.OtherCostAdds,
          Total: new Prisma.Decimal(t.total),
        });
        const saleDate = dto.Date ? new Date(dto.Date) : sale.Date;
        updateData.PointEarned = new Prisma.Decimal(await computeSalePoints(tx, customerId, t.total, saleDate));

        const u = await tx.sale.update({ where: { ID: id }, data: updateData });
        if (dto.Items) await this.applyStock(tx, id, u.WarehouseID ?? warehouseId, userId ?? sale.CreatedByID, saleDate);

        const o = await this.party.saleOutstanding(tx, id);
        if (o && o.committed > o.total - o.returns + 0.005) {
          throw new BadRequestException(`Total baru (${idr(o.total)}) lebih kecil dari pembayaran yang sudah ada (${idr(o.committed)})`);
        }
        await this.party.recalcSale(tx, id);
        await this.journal.postSale(tx, id, userId);
        await this.party.recalcCustomer(tx, u.CustomerID);
        if (u.CustomerID !== sale.CustomerID) {
          await this.party.recalcCustomer(tx, sale.CustomerID);
          await recalcCustomerPoints(tx, sale.CustomerID);
        }
        await recalcCustomerPoints(tx, u.CustomerID);
        await recalcSaleOrderDelivery(tx, u.SaleOrderID);
        if (sale.SaleOrderID !== u.SaleOrderID) await recalcSaleOrderDelivery(tx, sale.SaleOrderID);
        return tx.sale.findUniqueOrThrow({
          where: { ID: id },
          include: {
            Customer: true,
            SalesPerson: true,
            SalePoint: true,
            Warehouse: true,
            SaleItems: { include: { Product: true, Unit: true } },
          },
        });
      },
      { timeout: 30000 },
    );

    await this.afterWrite();
    return this.serialize(updated);
  }

  async updateShipping(id: number, dto: UpdateShippingDto) {
    const sale = await this.prisma.sale.findUnique({ where: { ID: id } });
    if (!sale) throw new NotFoundException('Sale not found');

    const updateData: Record<string, unknown> = {};
    if (dto.ShippingStatus !== undefined) updateData.ShippingStatus = dto.ShippingStatus;
    if (dto.ShippingDate !== undefined) updateData.ShippingDate = dto.ShippingDate ? new Date(dto.ShippingDate) : null;
    if (dto.TrackingNumber !== undefined) updateData.TrackingNumber = dto.TrackingNumber;
    if (dto.Courier !== undefined) updateData.Courier = dto.Courier || null;

    const updated = await this.prisma.sale.update({
      where: { ID: id },
      data: updateData,
      include: { Customer: true },
    });
    await this.redis.invalidatePattern('sales:*');
    return this.serialize(updated);
  }

  // ─── Item, stok, pembayaran ─────────────────────────────────────────────

  /** Item: satuan dasar + HPP saat transaksi. */
  private async buildItems(tx: Tx, items: CreateSaleDto['Items']) {
    const itemsData: Prisma.SaleItemCreateWithoutSaleInput[] = [];
    for (const item of items) {
      const product = await tx.product.findUnique({ where: { ID: item.ProductID }, select: { ID: true, UnitID: true, PurchasePrice: true } });
      if (!product) throw new BadRequestException(`Produk dengan ID ${item.ProductID} tidak ditemukan`);
      const unitId = item.UnitID ?? product.UnitID;
      const baseQty = await this.ledger.toBaseQty(tx, product.ID, unitId, item.Quantity);
      const itemDiscount = item.DiscountAmount || 0;
      itemsData.push({
        Product: { connect: { ID: product.ID } },
        Unit: { connect: { ID: unitId } },
        Quantity: new Prisma.Decimal(item.Quantity),
        BaseQuantity: baseQty,
        CostPrice: new Prisma.Decimal(product.PurchasePrice),
        UnitPrice: new Prisma.Decimal(item.UnitPrice),
        DiscountPercent: new Prisma.Decimal(item.DiscountPercent || 0),
        DiscountAmount: new Prisma.Decimal(itemDiscount),
        Subtotal: new Prisma.Decimal(r2(item.UnitPrice * item.Quantity - itemDiscount)),
      });
    }
    return itemsData;
  }

  /** Keluarkan stok semua item faktur dari gudang (ditolak bila stok tidak cukup). */
  private async applyStock(tx: Tx, saleId: number, warehouseId: number | null, userId: string, date: Date) {
    const s = await tx.sale.findUniqueOrThrow({ where: { ID: saleId }, include: { SaleItems: true } });
    const wh = warehouseId ?? (await this.ledger.resolveWarehouseId(tx, undefined));
    for (const it of s.SaleItems) {
      await this.ledger.move(tx, {
        productId: it.ProductID,
        warehouseId: wh,
        qty: new Prisma.Decimal(it.BaseQuantity).neg(),
        refType: 'SALE',
        refId: s.ID,
        refCode: s.Code,
        unitCost: it.CostPrice,
        userId,
        date,
      });
    }
  }

  /**
   * Baris dialog Bayar → pembayaran. Kelebihan bayar hanya boleh dari uang tunai (menjadi Kembali).
   * Tanpa `Payments`, CashAmount lama tetap didukung (POS).
   */
  private async paymentLines(tx: Tx, dto: CreateSaleDto, total: number, fallbackMethodId?: number) {
    const raw = dto.Payments?.length
      ? dto.Payments.filter((p) => Number(p.Amount) > 0)
      : Number(dto.CashAmount || 0) > 0
        ? [{ MethodID: fallbackMethodId, InstrumentType: 'CASH', Amount: Number(dto.CashAmount) }]
        : [];
    const cashId = await this.getCashMethodId(tx);
    const lines: {
      methodId: number; isCash: boolean; inst: string; amount: number; accountId: number | null;
      referenceNumber: string | null; dueDate: Date | null; notes: string | null;
    }[] = [];
    for (const p of raw as NonNullable<CreateSaleDto['Payments']>) {
      let inst = p.InstrumentType ?? 'CASH';
      let method = p.MethodID ? await tx.paymentMethod.findUnique({ where: { ID: p.MethodID } }) : null;
      if (p.MethodID && !method) throw new BadRequestException('Metode pembayaran tidak ditemukan');
      if (method?.Code === 'DEPOSIT') inst = 'DEPOSIT';
      if (inst === 'DEPOSIT') method = await ensureDepositMethod(tx);
      const methodId = method?.ID ?? cashId;
      if (!methodId) throw new BadRequestException('Metode pembayaran wajib dipilih');
      lines.push({
        methodId,
        isCash: inst === 'CASH' && (!method || method.Code === 'CASH'),
        inst,
        amount: r2(Number(p.Amount)),
        accountId: inst === 'DEPOSIT' ? null : p.AccountID ?? null,
        referenceNumber: p.ReferenceNumber || null,
        dueDate: p.DueDate ? new Date(p.DueDate) : null,
        notes: p.Notes || null,
      });
    }
    const entered = r2(lines.reduce((a, l) => a + l.amount, 0));
    let change = 0;
    if (entered > total + 0.005) {
      const excess = r2(entered - total);
      const cash = r2(lines.filter((l) => l.isCash).reduce((a, l) => a + l.amount, 0));
      if (excess > cash + 0.005) throw new BadRequestException('Pembayaran non-tunai melebihi total faktur');
      change = excess;
      let left = excess;
      for (let i = lines.length - 1; i >= 0 && left > 0.005; i--) {
        if (!lines[i].isCash) continue;
        const d = Math.min(left, lines[i].amount);
        lines[i].amount = r2(lines[i].amount - d);
        left = r2(left - d);
      }
    }
    const kept = lines.filter((l) => l.amount > 0.005);
    const paid = r2(kept.filter((l) => !isChequeInstrument(l.inst)).reduce((a, l) => a + l.amount, 0));
    return { lines: kept, entered, change, paid };
  }

  private async assertSaleOrder(saleOrderId: number, customerId: number) {
    const so = await this.prisma.saleOrder.findUnique({ where: { ID: saleOrderId }, include: { Status: true } });
    if (!so) throw new BadRequestException('Pesanan penjualan tidak ditemukan');
    if (so.CustomerID !== customerId) throw new BadRequestException(`Pesanan ${so.Code} bukan milik pelanggan ini`);
    if (so.Status.Code === 'CANCELLED' || so.OrderStatus === 'CANCELLED') throw new BadRequestException(`Pesanan ${so.Code} sudah dibatalkan`);
  }

  async payment(id: number, dto: PaymentDto, userId: string) {
    const sale = await this.prisma.sale.findUnique({
      where: { ID: id },
      include: { SalePayments: true, PaymentStatus: true },
    });
    if (!sale) throw new NotFoundException('Sale not found');

    const statusCode = sale.PaymentStatus?.Code?.toUpperCase();
    if (statusCode === 'CANCELLED') {
      throw new BadRequestException('Tidak dapat menambah pembayaran pada penjualan yang dibatalkan');
    }
    if (!(dto.Amount > 0)) throw new BadRequestException('Jumlah pembayaran harus lebih dari 0');

    const outstanding = await this.party.saleOutstanding(this.prisma, id);
    const open = outstanding ? r2(outstanding.total - outstanding.returns - outstanding.committed) : 0;
    if (dto.Amount > open + 0.005) {
      throw new BadRequestException(`Jumlah pembayaran (${idr(dto.Amount)}) melebihi sisa tagihan (${idr(Math.max(open, 0))})`);
    }

    const paymentMethodId = dto.PaymentMethodID ?? sale.PaymentMethodID ?? (await this.getCashMethodId(this.prisma));
    if (!paymentMethodId) throw new BadRequestException('Metode pembayaran wajib diisi');

    await this.prisma.$transaction(async (tx) => {
      const p = await tx.salePayment.create({
        data: {
          SaleID: id,
          MethodID: paymentMethodId,
          Amount: new Prisma.Decimal(dto.Amount),
          ReferenceNumber: dto.ReferenceNumber,
          Notes: dto.Notes,
          CreatedByID: userId,
        },
      });
      await tx.sale.update({ where: { ID: id }, data: { PaymentMethodID: paymentMethodId } });
      const after = await this.party.recalcSale(tx, id);
      await this.journal.postSalePayment(tx, p.ID, userId);
      await this.party.recalcCustomer(tx, sale.CustomerID);
      void after;
    });

    await this.afterWrite();
    return this.findOne(id, {});
  }

  async updateStatus(id: number, dto: UpdateStatusDto, userId?: string) {
    const sale = await this.prisma.sale.findUnique({
      where: { ID: id },
      include: { PaymentStatus: true, SaleReturns: { include: { Status: true } } },
    });
    if (!sale) throw new NotFoundException('Sale not found');

    const currentStatus = sale.PaymentStatus?.Code?.toUpperCase() || 'PENDING';
    const newStatus = dto.PaymentStatusCode.toUpperCase();

    const validTransitions: Record<string, string[]> = {
      PENDING: ['PARTIAL', 'PAID', 'CANCELLED'],
      PARTIAL: ['PAID', 'CANCELLED'],
      INSTALMENT: ['PARTIAL', 'PAID', 'CANCELLED'],
    };

    const allowed = validTransitions[currentStatus] || [];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(`Status tidak dapat diubah dari '${currentStatus}' ke '${newStatus}'`);
    }

    if (newStatus === 'CANCELLED' && sale.SaleReturns.some((r) => r.Status?.Code?.toUpperCase() !== 'CANCELLED')) {
      throw new BadRequestException('Penjualan memiliki retur aktif. Batalkan returnya terlebih dahulu.');
    }

    const newPaymentStatus = await this.getPaymentStatusByCode(this.prisma, newStatus);

    const updated = await this.prisma.$transaction(
      async (tx) => {
        if (newStatus === 'CANCELLED') {
          await this.ledger.reverseRef(tx, ['SALE'], id, { refCode: sale.Code, userId, notes: `Pembatalan penjualan ${sale.Code}` });
          await this.releaseVoucher(tx, sale.VoucherID);
          await this.journal.reverseSale(tx, id);
        }
        const u = await tx.sale.update({
          where: { ID: id },
          data: { PaymentStatusID: newPaymentStatus.ID },
          include: {
            Customer: true,
            SalesPerson: true,
            SaleItems: { include: { Product: true, Unit: true } },
          },
        });
        await this.party.recalcCustomer(tx, sale.CustomerID);
        await recalcCustomerPoints(tx, sale.CustomerID);
        await recalcSaleOrderDelivery(tx, sale.SaleOrderID);
        return u;
      },
      { timeout: 30000 },
    );

    await this.afterWrite();
    return this.serialize(updated);
  }

  async cancel(id: number, userId?: string) {
    return this.updateStatus(id, { PaymentStatusCode: 'CANCELLED' }, userId);
  }

  async delete(id: number, userId?: string) {
    const sale = await this.prisma.sale.findUnique({
      where: { ID: id },
      include: { SalePayments: true, SaleReturns: true, SaleItems: true, PaymentStatus: true },
    });
    if (!sale) throw new NotFoundException('Sale not found');
    if (sale.SalePayments && sale.SalePayments.length > 0) {
      throw new BadRequestException('Penjualan yang sudah memiliki pembayaran tidak dapat dihapus (batalkan saja)');
    }
    if (sale.SaleReturns && sale.SaleReturns.length > 0) {
      throw new BadRequestException('Penjualan yang sudah memiliki retur tidak dapat dihapus');
    }

    const statusCode = sale.PaymentStatus?.Code?.toUpperCase();
    if (statusCode && statusCode !== 'PENDING' && statusCode !== 'CANCELLED') {
      throw new BadRequestException('Hanya penjualan berstatus PENDING atau CANCELLED yang dapat dihapus');
    }

    await this.prisma.$transaction(
      async (tx) => {
        // Kembalikan stok (idempoten: penjualan yang sudah dibatalkan tidak dibalik dua kali)
        await this.ledger.reverseRef(tx, ['SALE'], id, { refCode: sale.Code, userId, notes: `Hapus penjualan ${sale.Code}` });
        if (statusCode !== 'CANCELLED') await this.releaseVoucher(tx, sale.VoucherID);
        await this.journal.reverseSale(tx, id);
        await tx.sale.delete({ where: { ID: id } });
        await this.party.recalcCustomer(tx, sale.CustomerID);
        await recalcCustomerPoints(tx, sale.CustomerID);
        await recalcSaleOrderDelivery(tx, sale.SaleOrderID);
      },
      { timeout: 30000 },
    );

    await this.afterWrite();
    return { id };
  }

  // ─── Voucher ─────────────────────────────────────────────────────────────

  /**
   * Validasi voucher & klaim 1 kuota secara atomik (UPDATE ... WHERE UsedCount < UsageLimit).
   * Nilai diskon: PERCENTAGE = base × Value% (dibatasi MaxDiscountAmount bila > 0), FIXED = Value.
   * Diskon tidak pernah melebihi base (subtotal setelah potongan).
   */
  private async claimVoucher(tx: Tx, voucherId: number | undefined, voucherCode: string | undefined, base: number) {
    const v = await tx.voucher.findFirst({
      where: voucherId ? { ID: voucherId } : { Code: { equals: String(voucherCode).trim(), mode: 'insensitive' } },
      include: { Type: true },
    });
    if (!v) throw new BadRequestException('Voucher tidak ditemukan');
    if (!v.IsActive) throw new BadRequestException(`Voucher ${v.Code} tidak aktif`);
    const now = new Date();
    if (now < v.StartDate) throw new BadRequestException(`Voucher ${v.Code} belum berlaku`);
    const end = new Date(v.EndDate);
    if (end.getUTCHours() === 0 && end.getUTCMinutes() === 0 && end.getUTCSeconds() === 0) end.setUTCDate(end.getUTCDate() + 1);
    if (now >= end) throw new BadRequestException(`Voucher ${v.Code} sudah kedaluwarsa`);
    if (v.UsageLimit !== null && v.UsedCount >= v.UsageLimit) throw new BadRequestException(`Kuota voucher ${v.Code} sudah habis`);
    const minPurchase = Number(v.MinPurchaseAmount ?? 0);
    if (base < minPurchase) throw new BadRequestException(`Voucher ${v.Code} berlaku untuk minimal belanja ${idr(minPurchase)}`);

    const typeCode = (v.Type?.Code ?? '').toUpperCase();
    const value = Number(v.Value);
    let discount = typeCode.startsWith('PERC') ? (base * value) / 100 : value;
    const maxDisc = Number(v.MaxDiscountAmount ?? 0);
    if (typeCode.startsWith('PERC') && maxDisc > 0) discount = Math.min(discount, maxDisc);
    discount = r2(Math.max(0, Math.min(discount, base)));

    const claimed = await tx.$executeRaw`UPDATE "Vouchers" SET "UsedCount" = "UsedCount" + 1, "UpdatedAt" = NOW()
      WHERE "ID" = ${v.ID} AND ("UsageLimit" IS NULL OR "UsedCount" < "UsageLimit")`;
    if (claimed === 0) throw new BadRequestException(`Kuota voucher ${v.Code} sudah habis`);
    return { id: v.ID, discount };
  }

  private async releaseVoucher(tx: Tx, voucherId: number | null) {
    if (!voucherId) return;
    await tx.$executeRaw`UPDATE "Vouchers" SET "UsedCount" = GREATEST("UsedCount" - 1, 0), "UpdatedAt" = NOW() WHERE "ID" = ${voucherId}`;
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  private async afterWrite() {
    await Promise.all([
      this.ledger.invalidateCaches(),
      this.redis.invalidatePattern('sales:*'),
      this.redis.invalidatePattern('customer:*'),
      this.redis.invalidatePattern('voucher:*'),
      this.redis.invalidatePattern('sale_orders:*'),
    ]);
  }

  private async getCashMethodId(client: Prisma.TransactionClient | PrismaService): Promise<number | undefined> {
    const cashMethod = await client.paymentMethod.findUnique({ where: { Code: 'CASH' } });
    return cashMethod?.ID;
  }

  private async getPaymentStatusByCode(client: Prisma.TransactionClient | PrismaService, code: string) {
    const status = await client.paymentStatus.findUnique({ where: { Code: code } });
    if (!status) throw new BadRequestException(`Payment status '${code}' tidak ditemukan`);
    return status;
  }

  private async generateCode(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const prefix = `SA-${year}${month}`;

    const lastSale = await this.prisma.sale.findFirst({
      where: { Code: { startsWith: prefix } },
      orderBy: { Code: 'desc' },
      select: { Code: true },
    });

    let nextNumber = 1;
    if (lastSale) {
      const lastSeq = parseInt(lastSale.Code.split('-').pop() || '0', 10);
      nextNumber = lastSeq + 1;
    }

    return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
  }

  private serialize(data: any): any {
    if (!data) return null;
    const result: any = {};
    for (const [key, value] of Object.entries(data)) {
      if (value instanceof Prisma.Decimal) {
        result[key] = Number(value);
      } else if (value instanceof Date) {
        result[key] = value.toISOString();
      } else {
        result[key] = value;
      }
    }
    if (data.SaleItems && Array.isArray(data.SaleItems)) {
      result.SaleItems = data.SaleItems.map((item: any) => this.serialize(item));
    }
    return result;
  }
}
