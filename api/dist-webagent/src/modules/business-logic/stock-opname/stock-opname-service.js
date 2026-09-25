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
exports.StockOpnameService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/prisma/prisma-service");
const client_1 = require("@prisma/client");
let StockOpnameService = class StockOpnameService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const Code = await this.generateCode();
        const draftStatusId = await this.getStatusIdByCode('DRAFT', 1);
        const CreatedByID = dto.CreatedById ? String(dto.CreatedById) : 'system';
        const opname = await this.prisma.$transaction(async (tx) => {
            const itemsData = await Promise.all(dto.Items.map(async (item) => {
                const Product = await tx.product.findUnique({ where: { ID: item.ProductId } });
                if (!Product) {
                    throw new common_1.NotFoundException(`Product ${item.ProductId} not found`);
                }
                const ProductStock = await tx.productStock.findUnique({
                    where: {
                        ProductID_WarehouseID: {
                            ProductID: item.ProductId,
                            WarehouseID: dto.WarehouseId,
                        },
                    },
                });
                const systemQty = ProductStock ? Number(ProductStock.Quantity) : Number(Product.Stock);
                const physicalQty = item.PhysicalQuantity;
                const variance = physicalQty - systemQty;
                return {
                    ProductID: item.ProductId,
                    SystemStock: new client_1.Prisma.Decimal(systemQty),
                    CountedStock: new client_1.Prisma.Decimal(physicalQty),
                    Difference: new client_1.Prisma.Decimal(variance),
                    UnitID: Product.UnitID,
                    UnitPrice: new client_1.Prisma.Decimal(0),
                    Note: item.VarianceReason || item.Notes || null,
                };
            }));
            const header = await tx.stockOpname.create({
                data: {
                    Code,
                    Date: dto.Date ? new Date(dto.Date) : new Date(),
                    WarehouseID: dto.WarehouseId,
                    TotalItems: new client_1.Prisma.Decimal(itemsData.length),
                    StatusID: draftStatusId,
                    Notes: dto.Notes,
                    CreatedByID,
                    OpnameItems: {
                        create: itemsData,
                    },
                },
                include: {
                    Warehouse: true,
                    Status: true,
                    OpnameItems: { include: { Product: true } },
                },
            });
            return header;
        });
        return opname;
    }
    async findAll(query) {
        const { Search, Page = 1, Limit = 20, WarehouseId, Status, StartDate, EndDate } = query;
        const where = {};
        if (Search) {
            where.OR = [{ Code: { contains: Search, mode: 'insensitive' } }];
        }
        if (WarehouseId)
            where.WarehouseID = WarehouseId;
        if (Status)
            where.Status = { Code: Status };
        if (StartDate || EndDate) {
            where.Date = {};
            if (StartDate)
                where.Date.gte = new Date(StartDate);
            if (EndDate)
                where.Date.lte = new Date(EndDate);
        }
        const page = Page;
        const limit = Limit;
        const skip = (page - 1) * limit;
        const [data, Total] = await Promise.all([
            this.prisma.stockOpname.findMany({
                where,
                include: {
                    Warehouse: true,
                    Status: true,
                    OpnameItems: { include: { Product: true } },
                },
                skip,
                take: limit,
                orderBy: { CreatedAt: 'desc' },
            }),
            this.prisma.stockOpname.count({ where }),
        ]);
        return {
            data,
            pagination: { page, limit, Total, TotalPages: Math.ceil(Total / limit) },
        };
    }
    async findById(ID) {
        const opname = await this.prisma.stockOpname.findUnique({
            where: { ID },
            include: {
                Warehouse: true,
                Status: true,
                OpnameItems: { include: { Product: true } },
            },
        });
        if (!opname) {
            throw new common_1.NotFoundException('Stock Opname not found');
        }
        return opname;
    }
    async update(ID, dto) {
        const existing = await this.findById(ID);
        if (existing.Status.Code !== 'DRAFT') {
            throw new common_1.BadRequestException('Can only update draft Stock Opname');
        }
        const data = {
            Date: dto.Date ? new Date(dto.Date) : undefined,
            Notes: dto.Notes,
        };
        if (dto.Status) {
            const statusId = await this.getStatusIdByCode(dto.Status);
            if (statusId) {
                data.Status = { connect: { ID: statusId } };
            }
        }
        return this.prisma.stockOpname.update({
            where: { ID },
            data,
            include: {
                Warehouse: true,
                Status: true,
                OpnameItems: { include: { Product: true } },
            },
        });
    }
    async approve(ID, dto) {
        const opname = await this.findById(ID);
        if (opname.Status.Code === 'COMPLETED') {
            throw new common_1.ConflictException('Stock Opname already completed');
        }
        if (opname.Status.Code === 'CANCELLED') {
            throw new common_1.ConflictException('Cannot approve cancelled Stock Opname');
        }
        const applyAdjustment = dto.ApplyAdjustment === 'true' || dto.ApplyAdjustment === true;
        const completedStatusId = await this.getStatusIdByCode('COMPLETED', opname.StatusID);
        await this.prisma.$transaction(async (tx) => {
            await tx.stockOpname.update({
                where: { ID },
                data: { StatusID: completedStatusId },
            });
            if (applyAdjustment) {
                for (const item of opname.OpnameItems) {
                    const difference = Number(item.Difference);
                    if (difference !== 0) {
                        await tx.productStock
                            .update({
                            where: {
                                ProductID_WarehouseID: {
                                    ProductID: item.ProductID,
                                    WarehouseID: opname.WarehouseID,
                                },
                            },
                            data: { Quantity: item.CountedStock },
                        })
                            .catch(() => {
                            return tx.productStock.create({
                                data: {
                                    ProductID: item.ProductID,
                                    WarehouseID: opname.WarehouseID,
                                    Quantity: item.CountedStock,
                                },
                            });
                        });
                        await tx.product.update({
                            where: { ID: item.ProductID },
                            data: { Stock: item.CountedStock },
                        });
                    }
                }
            }
        });
        return this.findById(ID);
    }
    async cancel(ID, dto) {
        const opname = await this.findById(ID);
        if (opname.Status.Code === 'COMPLETED') {
            throw new common_1.BadRequestException('Cannot cancel completed Stock Opname');
        }
        const cancelledStatusId = await this.getStatusIdByCode('CANCELLED', opname.StatusID);
        return this.prisma.stockOpname.update({
            where: { ID },
            data: {
                StatusID: cancelledStatusId,
                Notes: `${opname.Notes || ''}\nCancellation: ${dto.Reason}`,
            },
            include: {
                Warehouse: true,
                Status: true,
                OpnameItems: { include: { Product: true } },
            },
        });
    }
    async delete(ID) {
        const opname = await this.findById(ID);
        if (opname.Status.Code !== 'DRAFT') {
            throw new common_1.BadRequestException('Can only delete draft Stock Opname');
        }
        return this.prisma.stockOpname.delete({ where: { ID } });
    }
    async generateOpnameList(dto) {
        const where = { IsActive: true };
        if (dto.CategoryId) {
            where.CategoryID = dto.CategoryId;
        }
        if (dto.InStockOnly === 'true' || dto.InStockOnly === true) {
            where.Stock = { gt: 0 };
        }
        const Products = await this.prisma.product.findMany({
            where,
            include: { Category: true },
        });
        const items = [];
        for (const Product of Products) {
            const ProductStock = await this.prisma.productStock.findUnique({
                where: {
                    ProductID_WarehouseID: {
                        ProductID: Product.ID,
                        WarehouseID: dto.WarehouseId,
                    },
                },
            });
            items.push({
                ProductId: Product.ID,
                ProductCode: Product.Code,
                ProductName: Product.Name,
                Category: Product.Category?.Name,
                systemQuantity: ProductStock ? Number(ProductStock.Quantity) : Number(Product.Stock),
                physicalQuantity: 0,
                variance: 0,
            });
        }
        return { WarehouseId: dto.WarehouseId, items, TotalProducts: items.length };
    }
    async getStatusIdByCode(code, fallback) {
        const Status = await this.prisma.stockOpnameStatus.findFirst({ where: { Code: code } });
        if (Status)
            return Status.ID;
        if (fallback !== undefined)
            return fallback;
        throw new common_1.BadRequestException(`Stock Opname status '${code}' not configured`);
    }
    async generateCode() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const prefix = `SO-${year}${month}${day}`;
        const lastOpname = await this.prisma.stockOpname.findFirst({
            where: { Code: { startsWith: prefix } },
            orderBy: { Code: 'desc' },
            select: { Code: true },
        });
        let nextNumber = 1;
        if (lastOpname) {
            const lastSeq = parseInt(lastOpname.Code.split('-').pop() || '0', 10);
            nextNumber = lastSeq + 1;
        }
        return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
    }
};
exports.StockOpnameService = StockOpnameService;
exports.StockOpnameService = StockOpnameService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StockOpnameService);
