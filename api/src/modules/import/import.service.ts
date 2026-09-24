import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma-service';
import { Prisma } from '@prisma/client';
import {
  ImportItemSatuanDto,
  ImportItemLevelDto,
  ImportItemJumlahDto,
  ValidateImportDto,
  ImportResultDto,
  ImportErrorDto,
  ImportProgressDto,
} from './import.dto';

@Injectable()
export class ImportService {
  private importProgress: Map<string, ImportProgressDto> = new Map();

  constructor(private readonly prisma: PrismaService) {}

  async validateImport(dto: ValidateImportDto): Promise<{ valid: boolean; errors: ImportErrorDto[] }> {
    switch (dto.type) {
      case 'satuan':
        return this.validateSatuan(dto.data);
      case 'level':
        return this.validateLevel(dto.data);
      case 'jumlah':
        return this.validateJumlah(dto.data);
      default:
        throw new BadRequestException(`Invalid import type: ${dto.type}`);
    }
  }

  private validateSatuan(data: ImportItemSatuanDto[]): { valid: boolean; errors: ImportErrorDto[] } {
    const errors: ImportErrorDto[] = [];
    data.forEach((row, index) => {
      const rowNum = index + 1;
      if (!row.Code) errors.push({ row: rowNum, field: 'Code', message: 'Kode barang wajib diisi', value: row.Code });
      if (!row.Name) errors.push({ row: rowNum, field: 'Name', message: 'Nama barang wajib diisi', value: row.Name });
      if (row.PurchasePrice === undefined || row.PurchasePrice < 0) {
        errors.push({ row: rowNum, field: 'PurchasePrice', message: 'Harga beli harus angka positif', value: row.PurchasePrice });
      }
    });
    return { valid: errors.length === 0, errors };
  }

  private validateLevel(data: ImportItemLevelDto[]): { valid: boolean; errors: ImportErrorDto[] } {
    const errors: ImportErrorDto[] = [];
    data.forEach((row, index) => {
      const rowNum = index + 1;
      if (!row.Code) errors.push({ row: rowNum, field: 'Code', message: 'Kode barang wajib diisi', value: row.Code });
      if (!row.Name) errors.push({ row: rowNum, field: 'Name', message: 'Nama barang wajib diisi', value: row.Name });
      if (row.MinQty1 >= row.MinQty2) {
        errors.push({ row: rowNum, field: 'MinQty2', message: 'Minimum qty level 2 harus lebih besar dari level 1', value: row.MinQty2 });
      }
    });
    return { valid: errors.length === 0, errors };
  }

  private validateJumlah(data: ImportItemJumlahDto[]): { valid: boolean; errors: ImportErrorDto[] } {
    const errors: ImportErrorDto[] = [];
    data.forEach((row, index) => {
      const rowNum = index + 1;
      if (!row.Code) errors.push({ row: rowNum, field: 'Code', message: 'Kode barang wajib diisi', value: row.Code });
      if (!row.Name) errors.push({ row: rowNum, field: 'Name', message: 'Nama barang wajib diisi', value: row.Name });
      if (!row.SalePrices || row.SalePrices.length === 0) {
        errors.push({ row: rowNum, field: 'SalePrices', message: 'Minimal harus ada satu harga jual', value: row.SalePrices });
      }
      if (!row.Quantities || row.Quantities.length === 0) {
        errors.push({ row: rowNum, field: 'Quantities', message: 'Minimal harus ada satu quantity', value: row.Quantities });
      }
    });
    return { valid: errors.length === 0, errors };
  }

  async importSatuan(data: ImportItemSatuanDto[], userId: string): Promise<ImportResultDto> {
    const importId = `import_${Date.now()}`;
    const progress: ImportProgressDto = {
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

    const result: ImportResultDto = {
      totalRows: data.length, successCount: 0, errorCount: 0, errors: [], createdItems: [], updatedItems: [],
    };

    try {
      // Get default unit
      let defaultUnit = await this.prisma.unit.findFirst();
      if (!defaultUnit) {
        defaultUnit = await this.prisma.unit.create({ data: { Name: 'Pieces', Code: 'PCS' } });
      }

      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        progress.processedRows = i + 1;

        try {
          const existing = await this.prisma.product.findFirst({ where: { Code: row.Code } });

          let categoryId: number | null = null;
          let brandId: number | null = null;

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

          const productData: any = {
            Code: row.Code,
            Name: row.Name,
            Barcode: row.Barcode || null,
            PurchasePrice: new Prisma.Decimal(row.PurchasePrice),
            SellingPrice: new Prisma.Decimal(row.SalePrice),
            Stock: new Prisma.Decimal(row.Stock || 0),
            MinimumStock: new Prisma.Decimal(row.MinimumStock || 0),
            UnitID: defaultUnit.ID,
            IsActive: true,
          };

          if (categoryId) productData.CategoryID = categoryId;
          if (brandId) productData.BrandID = brandId;

          let productId: number;

          if (existing) {
            await this.prisma.product.update({
              where: { ID: existing.ID },
              data: {
                Name: row.Name,
                Barcode: row.Barcode || null,
                PurchasePrice: new Prisma.Decimal(row.PurchasePrice),
                SellingPrice: new Prisma.Decimal(row.SalePrice),
              },
            });
            productId = existing.ID;
            result.updatedItems.push(existing.ID);
          } else {
            const created = await this.prisma.product.create({ data: productData });
            productId = created.ID;
            result.createdItems.push(created.ID);
          }

          // Update stock if warehouse specified
          if (row.WarehouseCode) {
            const warehouse = await this.prisma.warehouse.findFirst({ where: { Code: row.WarehouseCode } });
            if (warehouse && (row.Stock || 0) > 0) {
              await this.prisma.productStock.upsert({
                where: { ProductID_WarehouseID: { ProductID: productId, WarehouseID: warehouse.ID } },
                update: { Quantity: new Prisma.Decimal(row.Stock || 0) },
                create: {
                  ProductID: productId,
                  WarehouseID: warehouse.ID,
                  Quantity: new Prisma.Decimal(row.Stock || 0),
                },
              });
            }
          }

          result.successCount++;
        } catch (error: any) {
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
    } catch (error: any) {
      progress.status = 'failed';
      progress.completedAt = new Date();
      throw new BadRequestException(`Import failed: ${error.message}`);
    }
  }

  async importLevel(data: ImportItemLevelDto[], userId: string): Promise<ImportResultDto> {
    const result: ImportResultDto = {
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

        const productData: any = {
          Code: row.Code,
          Name: row.Name,
          Barcode: row.Barcode || null,
          PurchasePrice: new Prisma.Decimal(row.PurchasePrice),
          SellingPrice: new Prisma.Decimal(row.SalePrice1),
          UnitID: defaultUnit.ID,
          IsActive: true,
        };

        let productId: number;

        if (existing) {
          await this.prisma.product.update({
            where: { ID: existing.ID },
            data: {
              Name: row.Name,
              Barcode: row.Barcode || null,
              PurchasePrice: new Prisma.Decimal(row.PurchasePrice),
              SellingPrice: new Prisma.Decimal(row.SalePrice1),
            },
          });
          productId = existing.ID;
          result.updatedItems.push(existing.ID);
        } else {
          const created = await this.prisma.product.create({ data: productData });
          productId = created.ID;
          result.createdItems.push(created.ID);
        }

        // Create product prices for levels
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
            update: { Price: new Prisma.Decimal(p.price), MinQuantity: new Prisma.Decimal(p.minQty) },
            create: {
              ProductID: productId,
              UnitID: defaultUnit.ID,
              PriceType: 'LEVEL',
              Price: new Prisma.Decimal(p.price),
              MinQuantity: new Prisma.Decimal(p.minQty),
            },
          });
        }

        result.successCount++;
      } catch (error: any) {
        result.errorCount++;
        result.errors.push({ row: i + 1, field: 'general', message: error.message, value: null });
      }
    }

    return result;
  }

  async importJumlah(data: ImportItemJumlahDto[], userId: string): Promise<ImportResultDto> {
    const result: ImportResultDto = {
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

        const productData: any = {
          Code: row.Code,
          Name: row.Name,
          Barcode: row.Barcode || null,
          PurchasePrice: new Prisma.Decimal(row.PurchasePrice),
          SellingPrice: new Prisma.Decimal(row.SalePrices[0]),
          Stock: new Prisma.Decimal(row.Stock || 0),
          UnitID: defaultUnit.ID,
          IsActive: true,
        };

        let productId: number;

        if (existing) {
          await this.prisma.product.update({
            where: { ID: existing.ID },
            data: {
              Name: row.Name,
              Barcode: row.Barcode || null,
              PurchasePrice: new Prisma.Decimal(row.PurchasePrice),
              SellingPrice: new Prisma.Decimal(row.SalePrices[0]),
            },
          });
          productId = existing.ID;
          result.updatedItems.push(existing.ID);
        } else {
          const created = await this.prisma.product.create({ data: productData });
          productId = created.ID;
          result.createdItems.push(created.ID);
        }

        // Create product prices based on quantity
        for (let j = 0; j < row.Quantities.length; j++) {
          await this.prisma.productPrice.upsert({
            where: {
              ProductID_UnitID_PriceType: {
                ProductID: productId,
                UnitID: defaultUnit.ID,
                PriceType: 'QTY_BASED',
              },
            },
            update: { Price: new Prisma.Decimal(row.SalePrices[j]), MinQuantity: new Prisma.Decimal(row.Quantities[j]) },
            create: {
              ProductID: productId,
              UnitID: defaultUnit.ID,
              PriceType: 'QTY_BASED',
              Price: new Prisma.Decimal(row.SalePrices[j]),
              MinQuantity: new Prisma.Decimal(row.Quantities[j]),
            },
          });
        }

        result.successCount++;
      } catch (error: any) {
        result.errorCount++;
        result.errors.push({ row: i + 1, field: 'general', message: error.message, value: null });
      }
    }

    return result;
  }

  async parseCSV(buffer: Buffer): Promise<any[]> {
    const content = buffer.toString('utf-8');
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      throw new BadRequestException('CSV file is empty or has no data rows');
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      const row: any = {};
      headers.forEach((header, index) => {
        const value = values[index]?.trim().replace(/"/g, '');
        row[header] = this.parseValue(value);
      });
      data.push(row);
    }

    return data;
  }

  private parseCSVLine(line: string): string[] {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current);
    return values;
  }

  private parseValue(value: string): any {
    if (!value || value === '') return undefined;
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (!isNaN(Number(value)) && value.trim() !== '') return Number(value);
    return value;
  }

  getProgress(importId: string): ImportProgressDto | undefined {
    return this.importProgress.get(importId);
  }
}
