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
exports.ImportService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma-service");
const client_1 = require("@prisma/client");
let ImportService = class ImportService {
    constructor(prisma) {
        this.prisma = prisma;
        this.importProgress = new Map();
    }
    async validateImport(dto) {
        switch (dto.type) {
            case 'satuan':
                return this.validateSatuan(dto.data);
            case 'level':
                return this.validateLevel(dto.data);
            case 'jumlah':
                return this.validateJumlah(dto.data);
            default:
                throw new common_1.BadRequestException(`Invalid import type: ${dto.type}`);
        }
    }
    validateSatuan(data) {
        const errors = [];
        data.forEach((row, index) => {
            const rowNum = index + 1;
            if (!row.Code)
                errors.push({ row: rowNum, field: 'Code', message: 'Kode barang wajib diisi', value: row.Code });
            if (!row.Name)
                errors.push({ row: rowNum, field: 'Name', message: 'Nama barang wajib diisi', value: row.Name });
            if (row.PurchasePrice === undefined || row.PurchasePrice < 0) {
                errors.push({ row: rowNum, field: 'PurchasePrice', message: 'Harga beli harus angka positif', value: row.PurchasePrice });
            }
        });
        return { valid: errors.length === 0, errors };
    }
    validateLevel(data) {
        const errors = [];
        data.forEach((row, index) => {
            const rowNum = index + 1;
            if (!row.Code)
                errors.push({ row: rowNum, field: 'Code', message: 'Kode barang wajib diisi', value: row.Code });
            if (!row.Name)
                errors.push({ row: rowNum, field: 'Name', message: 'Nama barang wajib diisi', value: row.Name });
            if (row.MinQty1 >= row.MinQty2) {
                errors.push({ row: rowNum, field: 'MinQty2', message: 'Minimum qty level 2 harus lebih besar dari level 1', value: row.MinQty2 });
            }
        });
        return { valid: errors.length === 0, errors };
    }
    validateJumlah(data) {
        const errors = [];
        data.forEach((row, index) => {
            const rowNum = index + 1;
            if (!row.Code)
                errors.push({ row: rowNum, field: 'Code', message: 'Kode barang wajib diisi', value: row.Code });
            if (!row.Name)
                errors.push({ row: rowNum, field: 'Name', message: 'Nama barang wajib diisi', value: row.Name });
            if (!row.SalePrices || row.SalePrices.length === 0) {
                errors.push({ row: rowNum, field: 'SalePrices', message: 'Minimal harus ada satu harga jual', value: row.SalePrices });
            }
            if (!row.Quantities || row.Quantities.length === 0) {
                errors.push({ row: rowNum, field: 'Quantities', message: 'Minimal harus ada satu quantity', value: row.Quantities });
            }
        });
        return { valid: errors.length === 0, errors };
    }
    async importSatuan(data, userId) {
        const importId = `import_${Date.now()}`;
        const progress = {
            importId,
            status: 'processing',
            totalRows: data.length,
            processedRows: 0,
            successCount: 0,
            errorCount: 0,
            errors: [],
            startedAt: new Date(),
        };
        this.importProgress.set(importId, progress);
        const result = {
            totalRows: data.length, successCount: 0, errorCount: 0, errors: [], createdItems: [], updatedItems: [],
        };
        try {
            let defaultUnit = await this.prisma.unit.findFirst();
            if (!defaultUnit) {
                defaultUnit = await this.prisma.unit.create({ data: { Name: 'Pieces', Code: 'PCS' } });
            }
            for (let i = 0; i < data.length; i++) {
                const row = data[i];
                progress.processedRows = i + 1;
                try {
                    const existing = await this.prisma.product.findFirst({ where: { Code: row.Code } });
                    let categoryId = null;
                    let brandId = null;
                    if (row.CategoryCode) {
                        const category = await this.prisma.category.findFirst({ where: { Code: row.CategoryCode } });
                        categoryId = category?.ID || null;
                    }
                    if (row.BrandName) {
                        let brand = await this.prisma.brand.findFirst({
                            where: { Name: { contains: row.BrandName, mode: 'insensitive' } },
                        });
                        if (!brand) {
                            const brandCode = `BRAND-${Date.now()}`.substring(0, 20);
                            brand = await this.prisma.brand.create({
                                data: { Code: brandCode, Name: row.BrandName, IsActive: true },
                            });
                        }
                        brandId = brand.ID;
                    }
                    const productData = {
                        Code: row.Code,
                        Name: row.Name,
                        Barcode: row.Barcode || null,
                        PurchasePrice: new client_1.Prisma.Decimal(row.PurchasePrice),
                        SellingPrice: new client_1.Prisma.Decimal(row.SalePrice),
                        Stock: new client_1.Prisma.Decimal(row.Stock || 0),
                        MinimumStock: new client_1.Prisma.Decimal(row.MinimumStock || 0),
                        UnitID: defaultUnit.ID,
                        IsActive: true,
                    };
                    if (categoryId)
                        productData.CategoryID = categoryId;
                    if (brandId)
                        productData.BrandID = brandId;
                    let productId;
                    if (existing) {
                        await this.prisma.product.update({
                            where: { ID: existing.ID },
                            data: {
                                Name: row.Name,
                                Barcode: row.Barcode || null,
                                PurchasePrice: new client_1.Prisma.Decimal(row.PurchasePrice),
                                SellingPrice: new client_1.Prisma.Decimal(row.SalePrice),
                            },
                        });
                        productId = existing.ID;
                        result.updatedItems.push(existing.ID);
                    }
                    else {
                        const created = await this.prisma.product.create({ data: productData });
                        productId = created.ID;
                        result.createdItems.push(created.ID);
                    }
                    if (row.WarehouseCode) {
                        const warehouse = await this.prisma.warehouse.findFirst({ where: { Code: row.WarehouseCode } });
                        if (warehouse && (row.Stock || 0) > 0) {
                            await this.prisma.productStock.upsert({
                                where: { ProductID_WarehouseID: { ProductID: productId, WarehouseID: warehouse.ID } },
                                update: { Quantity: new client_1.Prisma.Decimal(row.Stock || 0) },
                                create: {
                                    ProductID: productId,
                                    WarehouseID: warehouse.ID,
                                    Quantity: new client_1.Prisma.Decimal(row.Stock || 0),
                                },
                            });
                        }
                    }
                    result.successCount++;
                }
                catch (error) {
                    result.errorCount++;
                    result.errors.push({ row: i + 1, field: 'general', message: error.message, value: null });
                }
            }
            progress.status = 'completed';
            progress.completedAt = new Date();
            progress.successCount = result.successCount;
            progress.errorCount = result.errorCount;
            progress.errors = result.errors;
            return result;
        }
        catch (error) {
            progress.status = 'failed';
            progress.completedAt = new Date();
            throw new common_1.BadRequestException(`Import failed: ${error.message}`);
        }
    }
    async importLevel(data, userId) {
        const result = {
            totalRows: data.length, successCount: 0, errorCount: 0, errors: [], createdItems: [], updatedItems: [],
        };
        let defaultUnit = await this.prisma.unit.findFirst();
        if (!defaultUnit) {
            defaultUnit = await this.prisma.unit.create({ data: { Name: 'Pieces', Code: 'PCS' } });
        }
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            try {
                const existing = await this.prisma.product.findFirst({ where: { Code: row.Code } });
                const productData = {
                    Code: row.Code,
                    Name: row.Name,
                    Barcode: row.Barcode || null,
                    PurchasePrice: new client_1.Prisma.Decimal(row.PurchasePrice),
                    SellingPrice: new client_1.Prisma.Decimal(row.SalePrice1),
                    UnitID: defaultUnit.ID,
                    IsActive: true,
                };
                let productId;
                if (existing) {
                    await this.prisma.product.update({
                        where: { ID: existing.ID },
                        data: {
                            Name: row.Name,
                            Barcode: row.Barcode || null,
                            PurchasePrice: new client_1.Prisma.Decimal(row.PurchasePrice),
                            SellingPrice: new client_1.Prisma.Decimal(row.SalePrice1),
                        },
                    });
                    productId = existing.ID;
                    result.updatedItems.push(existing.ID);
                }
                else {
                    const created = await this.prisma.product.create({ data: productData });
                    productId = created.ID;
                    result.createdItems.push(created.ID);
                }
                const prices = [
                    { minQty: row.MinQty1, price: row.SalePrice1 },
                    { minQty: row.MinQty2, price: row.SalePrice2 },
                    ...(row.SalePrice3 && row.MinQty3 ? [{ minQty: row.MinQty3, price: row.SalePrice3 }] : []),
                ];
                for (const p of prices) {
                    await this.prisma.productPrice.upsert({
                        where: {
                            ProductID_UnitID_PriceType: {
                                ProductID: productId,
                                UnitID: defaultUnit.ID,
                                PriceType: 'LEVEL',
                            },
                        },
                        update: { Price: new client_1.Prisma.Decimal(p.price), MinQuantity: new client_1.Prisma.Decimal(p.minQty) },
                        create: {
                            ProductID: productId,
                            UnitID: defaultUnit.ID,
                            PriceType: 'LEVEL',
                            Price: new client_1.Prisma.Decimal(p.price),
                            MinQuantity: new client_1.Prisma.Decimal(p.minQty),
                        },
                    });
                }
                result.successCount++;
            }
            catch (error) {
                result.errorCount++;
                result.errors.push({ row: i + 1, field: 'general', message: error.message, value: null });
            }
        }
        return result;
    }
    async importJumlah(data, userId) {
        const result = {
            totalRows: data.length, successCount: 0, errorCount: 0, errors: [], createdItems: [], updatedItems: [],
        };
        let defaultUnit = await this.prisma.unit.findFirst();
        if (!defaultUnit) {
            defaultUnit = await this.prisma.unit.create({ data: { Name: 'Pieces', Code: 'PCS' } });
        }
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            try {
                const existing = await this.prisma.product.findFirst({ where: { Code: row.Code } });
                const productData = {
                    Code: row.Code,
                    Name: row.Name,
                    Barcode: row.Barcode || null,
                    PurchasePrice: new client_1.Prisma.Decimal(row.PurchasePrice),
                    SellingPrice: new client_1.Prisma.Decimal(row.SalePrices[0]),
                    Stock: new client_1.Prisma.Decimal(row.Stock || 0),
                    UnitID: defaultUnit.ID,
                    IsActive: true,
                };
                let productId;
                if (existing) {
                    await this.prisma.product.update({
                        where: { ID: existing.ID },
                        data: {
                            Name: row.Name,
                            Barcode: row.Barcode || null,
                            PurchasePrice: new client_1.Prisma.Decimal(row.PurchasePrice),
                            SellingPrice: new client_1.Prisma.Decimal(row.SalePrices[0]),
                        },
                    });
                    productId = existing.ID;
                    result.updatedItems.push(existing.ID);
                }
                else {
                    const created = await this.prisma.product.create({ data: productData });
                    productId = created.ID;
                    result.createdItems.push(created.ID);
                }
                for (let j = 0; j < row.Quantities.length; j++) {
                    await this.prisma.productPrice.upsert({
                        where: {
                            ProductID_UnitID_PriceType: {
                                ProductID: productId,
                                UnitID: defaultUnit.ID,
                                PriceType: 'QTY_BASED',
                            },
                        },
                        update: { Price: new client_1.Prisma.Decimal(row.SalePrices[j]), MinQuantity: new client_1.Prisma.Decimal(row.Quantities[j]) },
                        create: {
                            ProductID: productId,
                            UnitID: defaultUnit.ID,
                            PriceType: 'QTY_BASED',
                            Price: new client_1.Prisma.Decimal(row.SalePrices[j]),
                            MinQuantity: new client_1.Prisma.Decimal(row.Quantities[j]),
                        },
                    });
                }
                result.successCount++;
            }
            catch (error) {
                result.errorCount++;
                result.errors.push({ row: i + 1, field: 'general', message: error.message, value: null });
            }
        }
        return result;
    }
    async parseCSV(buffer) {
        const content = buffer.toString('utf-8');
        const lines = content.split('\n').filter(line => line.trim());
        if (lines.length < 2) {
            throw new common_1.BadRequestException('CSV file is empty or has no data rows');
        }
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const data = [];
        for (let i = 1; i < lines.length; i++) {
            const values = this.parseCSVLine(lines[i]);
            const row = {};
            headers.forEach((header, index) => {
                const value = values[index]?.trim().replace(/"/g, '');
                row[header] = this.parseValue(value);
            });
            data.push(row);
        }
        return data;
    }
    parseCSVLine(line) {
        const values = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            }
            else if (char === ',' && !inQuotes) {
                values.push(current);
                current = '';
            }
            else {
                current += char;
            }
        }
        values.push(current);
        return values;
    }
    parseValue(value) {
        if (!value || value === '')
            return undefined;
        if (value === 'true')
            return true;
        if (value === 'false')
            return false;
        if (!isNaN(Number(value)) && value.trim() !== '')
            return Number(value);
        return value;
    }
    getProgress(importId) {
        return this.importProgress.get(importId);
    }
};
exports.ImportService = ImportService;
exports.ImportService = ImportService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ImportService);
