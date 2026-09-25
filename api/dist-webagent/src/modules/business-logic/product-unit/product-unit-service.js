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
exports.ProductUnitService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/prisma/prisma-service");
const client_1 = require("@prisma/client");
const number_1 = require("../../../common/utils/number");
let ProductUnitService = class ProductUnitService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async setProductUnits(dto, UserId) {
        const Product = await this.prisma.product.findUnique({
            where: { ID: dto.ProductId },
        });
        if (!Product) {
            throw new common_1.NotFoundException(`Product ${dto.ProductId} not found`);
        }
        const UnitIds = dto.Units.map(u => u.UnitId);
        const Units = await this.prisma.unit.findMany({
            where: { ID: { in: UnitIds } },
        });
        if (Units.length !== UnitIds.length) {
            throw new common_1.BadRequestException('One or more Unit IDs are invalid');
        }
        const baseUnits = dto.Units.filter(u => u.isBase);
        if (baseUnits.length > 1) {
            throw new common_1.BadRequestException('Only one Unit can be the base Unit');
        }
        const Result = await this.prisma.$transaction(async (tx) => {
            await tx.productUnit.deleteMany({
                where: { ProductID: dto.ProductId },
            });
            const createdUnits = await tx.productUnit.createMany({
                data: dto.Units.map((Unit) => ({
                    ProductID: dto.ProductId,
                    UnitID: Unit.UnitId,
                    IsBase: Unit.isBase || false,
                    ConversionValue: new client_1.Prisma.Decimal(Unit.ConversionValue || 1),
                    IsPrimary: Unit.isPrimary || false,
                    IsSell: Unit.isSell ?? true,
                    IsPurchase: Unit.isPurchase ?? true,
                })),
            });
            return createdUnits;
        });
        return {
            success: true,
            ProductId: dto.ProductId,
            ProductName: Product.Name,
            UnitsCreated: Result.count,
            message: 'Product Units configured successfully',
        };
    }
    async getProductUnits(ProductId) {
        const ProductUnits = await this.prisma.productUnit.findMany({
            where: { ProductID: ProductId },
            include: {
                Product: true,
                Unit: true,
            },
            orderBy: [
                { IsBase: 'desc' },
                { IsPrimary: 'desc' },
            ],
        });
        if (ProductUnits.length === 0) {
            const Product = await this.prisma.product.findUnique({
                where: { ID: ProductId },
                include: { Unit: true },
            });
            if (!Product) {
                throw new common_1.NotFoundException(`Product ${ProductId} not found`);
            }
            return {
                ProductId,
                ProductName: Product.Name,
                DefaultUnit: Product.Unit?.Name || 'Default',
                DefaultUnitId: Product.UnitID,
                Units: [],
            };
        }
        return {
            ProductId,
            ProductName: ProductUnits[0].Product?.Name,
            baseUnit: ProductUnits.find(u => u.IsBase)?.Unit?.Name || ProductUnits[0].Unit?.Name,
            Units: ProductUnits.map((pu) => ({
                ID: pu.ID,
                UnitId: pu.UnitID,
                UnitName: pu.Unit?.Name,
                isBase: pu.IsBase,
                conversionValue: (0, number_1.number)(pu.ConversionValue),
                isPrimary: pu.IsPrimary,
                isSell: pu.IsSell,
                isPurchase: pu.IsPurchase,
            })),
        };
    }
    async listProductUnits(dto) {
        const where = {};
        if (dto.ProductId) {
            where.ProductID = dto.ProductId;
        }
        if (dto.UnitId) {
            where.UnitID = dto.UnitId;
        }
        if (dto.PrimaryOnly) {
            where.IsPrimary = true;
        }
        const ProductUnits = await this.prisma.productUnit.findMany({
            where,
            include: {
                Product: { select: { ID: true, Code: true, Name: true } },
                Unit: true,
            },
            orderBy: [
                { Product: { Code: 'asc' } },
                { IsBase: 'desc' },
            ],
        });
        return ProductUnits.map((pu) => ({
            ID: pu.ID,
            ProductId: pu.ProductID,
            ProductCode: pu.Product?.Code,
            ProductName: pu.Product?.Name,
            UnitId: pu.UnitID,
            UnitName: pu.Unit?.Name,
            isBase: pu.IsBase,
            conversionValue: (0, number_1.number)(pu.ConversionValue),
            isPrimary: pu.IsPrimary,
            isSell: pu.IsSell,
            isPurchase: pu.IsPurchase,
        }));
    }
    async convertUnit(dto) {
        const ProductUnits = await this.prisma.productUnit.findMany({
            where: { ProductID: dto.ProductId },
            include: { Unit: true },
        });
        if (ProductUnits.length === 0) {
            throw new common_1.BadRequestException('No Unit configuration found for this Product');
        }
        const fromUnit = ProductUnits.find(u => u.UnitID === dto.FromUnitId);
        const toUnit = ProductUnits.find(u => u.UnitID === dto.ToUnitId);
        if (!fromUnit) {
            throw new common_1.NotFoundException(`Source Unit ${dto.FromUnitId} not configured for this Product`);
        }
        if (!toUnit) {
            throw new common_1.NotFoundException(`Target Unit ${dto.ToUnitId} not configured for this Product`);
        }
        const baseUnit = ProductUnits.find(u => u.IsBase);
        let convertedQuantity;
        if (dto.FromUnitId === baseUnit?.UnitID) {
            convertedQuantity = dto.Quantity / Number(toUnit.ConversionValue);
        }
        else if (dto.ToUnitId === baseUnit?.UnitID) {
            convertedQuantity = dto.Quantity * Number(fromUnit.ConversionValue);
        }
        else {
            const inBase = dto.Quantity * Number(fromUnit.ConversionValue);
            convertedQuantity = inBase / Number(toUnit.ConversionValue);
        }
        return {
            ProductId: dto.ProductId,
            fromUnitId: dto.FromUnitId,
            fromUnitName: fromUnit.Unit?.Name,
            toUnitId: dto.ToUnitId,
            toUnitName: toUnit.Unit?.Name,
            originalQuantity: dto.Quantity,
            convertedQuantity: Math.round(convertedQuantity * 10000) / 10000,
            conversionRate: (0, number_1.number)(toUnit.ConversionValue) / Number(fromUnit.ConversionValue),
        };
    }
    async getProductUnitOptions(ProductId, Type = 'sell') {
        const where = { ProductID: ProductId };
        if (Type === 'sell') {
            where.IsSell = true;
        }
        else {
            where.IsPurchase = true;
        }
        const ProductUnits = await this.prisma.productUnit.findMany({
            where,
            include: { Unit: true },
            orderBy: [
                { IsPrimary: 'desc' },
                { ConversionValue: 'asc' },
            ],
        });
        return {
            ProductId,
            Units: ProductUnits.map((pu) => ({
                UnitId: pu.UnitID,
                UnitName: pu.Unit?.Name,
                conversionValue: (0, number_1.number)(pu.ConversionValue),
                isPrimary: pu.IsPrimary,
                isBase: pu.IsBase,
            })),
        };
    }
};
exports.ProductUnitService = ProductUnitService;
exports.ProductUnitService = ProductUnitService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductUnitService);
