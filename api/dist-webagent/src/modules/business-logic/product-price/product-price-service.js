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
exports.ProductPriceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/prisma/prisma-service");
const client_1 = require("@prisma/client");
const number_1 = require("../../../common/utils/number");
let ProductPriceService = class ProductPriceService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async setProductPrice(dto, UserId) {
        const Product = await this.prisma.product.findUnique({
            where: { ID: dto.ProductId },
        });
        if (!Product) {
            throw new common_1.NotFoundException(`Product ${dto.ProductId} not found`);
        }
        const Unit = await this.prisma.unit.findUnique({
            where: { ID: dto.UnitId },
        });
        if (!Unit) {
            throw new common_1.NotFoundException(`Unit ${dto.UnitId} not found`);
        }
        const existing = await this.prisma.productPrice.findFirst({
            where: {
                ProductID: dto.ProductId,
                UnitID: dto.UnitId,
                PriceType: dto.PriceType.toUpperCase(),
            },
        });
        let Price;
        if (existing) {
            Price = await this.prisma.productPrice.update({
                where: { ID: existing.ID },
                data: {
                    Price: new client_1.Prisma.Decimal(dto.Price),
                    MinQuantity: dto.MinQuantity ? new client_1.Prisma.Decimal(dto.MinQuantity) : null,
                    MaxQuantity: dto.MaxQuantity ? new client_1.Prisma.Decimal(dto.MaxQuantity) : null,
                    StartDate: dto.StartDate ? new Date(dto.StartDate) : null,
                    EndDate: dto.EndDate ? new Date(dto.EndDate) : null,
                    IsActive: dto.IsActive ?? 1,
                },
            });
        }
        else {
            Price = await this.prisma.productPrice.create({
                data: {
                    ProductID: dto.ProductId,
                    UnitID: dto.UnitId,
                    PriceType: dto.PriceType.toUpperCase(),
                    Price: new client_1.Prisma.Decimal(dto.Price),
                    MinQuantity: dto.MinQuantity ? new client_1.Prisma.Decimal(dto.MinQuantity) : null,
                    MaxQuantity: dto.MaxQuantity ? new client_1.Prisma.Decimal(dto.MaxQuantity) : null,
                    StartDate: dto.StartDate ? new Date(dto.StartDate) : null,
                    EndDate: dto.EndDate ? new Date(dto.EndDate) : null,
                    IsActive: dto.IsActive ?? 1,
                },
            });
        }
        return {
            success: true,
            Price: {
                ID: Price.ID,
                ProductId: Price.ProductID,
                ProductName: Product.Name,
                UnitId: Price.UnitID,
                UnitName: Unit.Name,
                PriceType: Price.PriceType,
                Price: (0, number_1.number)(Price.Price),
                minQuantity: Price.MinQuantity ? Number(Price.MinQuantity) : null,
                maxQuantity: Price.MaxQuantity ? Number(Price.MaxQuantity) : null,
                startDate: Price.StartDate,
                endDate: Price.EndDate,
                IsActive: Price.IsActive === 1,
            },
        };
    }
    async getProductPrices(ProductId) {
        const Product = await this.prisma.product.findUnique({
            where: { ID: ProductId },
        });
        if (!Product) {
            throw new common_1.NotFoundException(`Product ${ProductId} not found`);
        }
        const Prices = await this.prisma.productPrice.findMany({
            where: { ProductID: ProductId },
            include: { Unit: true },
            orderBy: [
                { Unit: { Name: 'asc' } },
                { PriceType: 'asc' },
            ],
        });
        return {
            ProductId,
            ProductName: Product.Name,
            basePrice: (0, number_1.number)(Product.SellingPrice),
            Prices: Prices.map((p) => ({
                ID: p.ID,
                UnitId: p.UnitID,
                UnitName: p.Unit?.Name,
                PriceType: p.PriceType,
                Price: (0, number_1.number)(p.Price),
                minQuantity: p.MinQuantity ? Number(p.MinQuantity) : null,
                maxQuantity: p.MaxQuantity ? Number(p.MaxQuantity) : null,
                startDate: p.StartDate,
                endDate: p.EndDate,
                IsActive: p.IsActive === 1,
            })),
        };
    }
    async getApplicablePrice(dto) {
        const now = new Date();
        const where = {
            ProductID: dto.ProductId,
            IsActive: 1,
        };
        if (dto.UnitId) {
            where.UnitID = dto.UnitId;
        }
        if (dto.PriceType) {
            where.PriceType = dto.PriceType.toUpperCase();
        }
        where.OR = [
            { StartDate: null, EndDate: null },
            { StartDate: { lte: now }, EndDate: null },
            { StartDate: null, EndDate: { gte: now } },
            { StartDate: { lte: now }, EndDate: { gte: now } },
        ];
        if (dto.Quantity) {
            where.AND = [
                {
                    OR: [
                        { MinQuantity: null, MaxQuantity: null },
                        { MinQuantity: { lte: dto.Quantity }, MaxQuantity: null },
                        { MinQuantity: null, MaxQuantity: { gte: dto.Quantity } },
                        { MinQuantity: { lte: dto.Quantity }, MaxQuantity: { gte: dto.Quantity } },
                    ],
                },
            ];
        }
        const Prices = await this.prisma.productPrice.findMany({
            where,
            include: { Unit: true },
            orderBy: [
                { MinQuantity: 'desc' },
                { PriceType: 'asc' },
            ],
        });
        if (Prices.length === 0) {
            const Product = await this.prisma.product.findUnique({
                where: { ID: dto.ProductId },
                include: { Unit: true },
            });
            return {
                ProductId: dto.ProductId,
                ProductName: Product?.Name,
                Price: (0, number_1.number)(Product?.SellingPrice) || 0,
                UnitId: Product?.UnitID,
                UnitName: Product?.Unit?.Name,
                PriceType: 'STANDARD',
                isFromBasePrice: true,
            };
        }
        const applicablePrice = Prices[0];
        return {
            ProductId: dto.ProductId,
            ProductName: (await this.prisma.product.findUnique({ where: { ID: dto.ProductId } }))?.Name,
            Price: (0, number_1.number)(applicablePrice.Price),
            UnitId: applicablePrice.UnitID,
            UnitName: applicablePrice.Unit?.Name,
            PriceType: applicablePrice.PriceType,
            minQuantity: applicablePrice.MinQuantity ? Number(applicablePrice.MinQuantity) : null,
            maxQuantity: applicablePrice.MaxQuantity ? Number(applicablePrice.MaxQuantity) : null,
            isFromBasePrice: false,
        };
    }
    async listPrices(dto) {
        const where = {};
        if (dto.ProductId) {
            where.ProductID = dto.ProductId;
        }
        if (dto.UnitId) {
            where.UnitID = dto.UnitId;
        }
        if (dto.PriceType) {
            where.PriceType = dto.PriceType.toUpperCase();
        }
        if (dto.ActiveOnly) {
            where.IsActive = 1;
        }
        const Prices = await this.prisma.productPrice.findMany({
            where,
            include: {
                Product: { select: { ID: true, Code: true, Name: true } },
                Unit: true,
            },
            orderBy: [
                { Product: { Code: 'asc' } },
                { Unit: { Name: 'asc' } },
            ],
        });
        return Prices.map((p) => ({
            ID: p.ID,
            ProductId: p.ProductID,
            ProductCode: p.Product?.Code,
            ProductName: p.Product?.Name,
            UnitId: p.UnitID,
            UnitName: p.Unit?.Name,
            PriceType: p.PriceType,
            Price: (0, number_1.number)(p.Price),
            minQuantity: p.MinQuantity ? Number(p.MinQuantity) : null,
            maxQuantity: p.MaxQuantity ? Number(p.MaxQuantity) : null,
            startDate: p.StartDate,
            endDate: p.EndDate,
            IsActive: p.IsActive === 1,
        }));
    }
    async deletePrice(ID) {
        const Price = await this.prisma.productPrice.findUnique({
            where: { ID: ID },
        });
        if (!Price) {
            throw new common_1.NotFoundException(`Price ${ID} not found`);
        }
        await this.prisma.productPrice.delete({
            where: { ID: ID },
        });
        return {
            success: true,
            message: 'Price deleted successfully',
        };
    }
};
exports.ProductPriceService = ProductPriceService;
exports.ProductPriceService = ProductPriceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductPriceService);
