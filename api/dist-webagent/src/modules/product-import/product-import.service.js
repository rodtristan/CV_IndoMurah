"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductImportService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../common/prisma/prisma-service");
const D = (n) => new client_1.Prisma.Decimal(Number(n) || 0);
const eq = (a, b) => !!a && !!b && a.trim().toLowerCase() === b.trim().toLowerCase();
let ProductImportService = class ProductImportService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async import(body) {
        const [units, cats, brands, whs] = await Promise.all([
            this.prisma.unit.findMany(),
            this.prisma.category.findMany(),
            this.prisma.brand.findMany(),
            this.prisma.warehouse.findMany({ orderBy: { ID: 'asc' } }),
        ]);
        const findBy = (list, v) => v ? list.find((x) => eq(x.Code, v) || eq(x.Name, v)) : undefined;
        let successCount = 0;
        const failed = [];
        for (const it of body.items ?? []) {
            try {
                if (!it.code?.trim() || !it.name?.trim())
                    throw new Error('Kode Item dan Nama Item wajib diisi');
                if (!it.units?.length)
                    throw new Error('Satuan 1 wajib diisi');
                if (it.units.length > 4)
                    throw new Error('Maksimum 4 satuan');
                const resolved = it.units.map((u) => {
                    const unit = findBy(units, u.unit);
                    if (!unit)
                        throw new Error(`Satuan '${u.unit}' tidak ditemukan`);
                    return { u, unit };
                });
                if (new Set(resolved.map((r) => r.unit.ID)).size !== resolved.length)
                    throw new Error('Satuan tidak boleh duplikat');
                const wh = it.warehouse ? findBy(whs, it.warehouse) : whs.find((w) => w.IsDefault) ?? whs[0];
                if (it.warehouse && !wh)
                    throw new Error(`Kantor/Gudang '${it.warehouse}' tidak ditemukan`);
                const base = resolved[0];
                await this.prisma.$transaction(async (tx) => {
                    if (await tx.product.findUnique({ where: { Code: it.code.trim() } }))
                        throw new Error(`Kode item '${it.code}' sudah ada`);
                    const stock = Number(it.stock) || 0;
                    const product = await tx.product.create({
                        data: {
                            Code: it.code.trim(), Name: it.name.trim(), Barcode: it.barcode || base.u.barcode || null,
                            CategoryID: findBy(cats, it.category)?.ID ?? null, BrandID: findBy(brands, it.brand)?.ID ?? null,
                            UnitID: base.unit.ID, WarehouseID: wh?.ID ?? null,
                            PurchasePrice: D(base.u.purchasePrice),
                            SellingPrice: D(body.variant === 'level' ? base.u.levelPrices?.[0] ?? base.u.sellingPrice : base.u.sellingPrice ?? base.u.qtyTiers?.[0]?.price),
                            Stock: D(stock), MinimumStock: D(it.minStock), Description: it.description || null,
                        },
                    });
                    for (let i = 0; i < resolved.length; i++) {
                        const { u, unit } = resolved[i];
                        await tx.productUnit.create({
                            data: {
                                ProductID: product.ID, UnitID: unit.ID, IsBase: i === 0, IsPrimary: i === 0,
                                ConversionValue: D(i === 0 ? 1 : u.conversion || 1),
                            },
                        });
                        const sell = body.variant === 'level' ? u.levelPrices?.[0] ?? u.sellingPrice : u.sellingPrice;
                        await tx.productPrice.create({ data: { ProductID: product.ID, UnitID: unit.ID, PriceType: 'STANDARD', Price: D(sell ?? u.qtyTiers?.[0]?.price) } });
                        if (body.variant === 'level') {
                            for (let lv = 1; lv < 4; lv++) {
                                const price = u.levelPrices?.[lv];
                                if (price && price > 0)
                                    await tx.productPrice.create({ data: { ProductID: product.ID, UnitID: unit.ID, PriceType: `LEVEL${lv + 1}`, Price: D(price) } });
                            }
                        }
                        if (body.variant === 'qty') {
                            let prev = 0;
                            const tiers = (u.qtyTiers ?? []).filter((t) => t.upTo > 0 && t.price > 0);
                            for (let n = 0; n < tiers.length; n++) {
                                await tx.productPrice.create({
                                    data: { ProductID: product.ID, UnitID: unit.ID, PriceType: `QTY${n + 1}`, Price: D(tiers[n].price), MinQuantity: D(prev), MaxQuantity: D(tiers[n].upTo) },
                                });
                                prev = tiers[n].upTo;
                            }
                        }
                    }
                    if (wh && stock !== 0) {
                        await tx.productStock.upsert({
                            where: { ProductID_WarehouseID: { ProductID: product.ID, WarehouseID: wh.ID } },
                            update: { Quantity: D(stock) },
                            create: { ProductID: product.ID, WarehouseID: wh.ID, Quantity: D(stock), MinimumStock: D(it.minStock) },
                        });
                    }
                });
                successCount++;
            }
            catch (e) {
                failed.push({ data: { code: it?.code, name: it?.name }, error: e instanceof Error ? e.message : String(e) });
            }
        }
        return { successCount, failedCount: failed.length, failed };
    }
};
exports.ProductImportService = ProductImportService;
exports.ProductImportService = ProductImportService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductImportService);
