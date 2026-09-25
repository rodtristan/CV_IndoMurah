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
exports.ProductionRequestService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/prisma/prisma-service");
const client_1 = require("@prisma/client");
const number_1 = require("../../../common/utils/number");
let ProductionRequestService = class ProductionRequestService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createRequest(dto, UserId) {
        const requestNumber = await this.generateRequestNumber();
        if (dto.SupplierId) {
            const Supplier = await this.prisma.supplier.findUnique({
                where: { ID: dto.SupplierId },
            });
            if (!Supplier) {
                throw new common_1.NotFoundException(`Supplier ${dto.SupplierId} not found`);
            }
        }
        for (const item of dto.Items) {
            const Product = await this.prisma.product.findUnique({
                where: { ID: item.ProductId },
            });
            if (!Product) {
                throw new common_1.NotFoundException(`Product ${item.ProductId} not found`);
            }
        }
        const Request = await this.prisma.$transaction(async (tx) => {
            const newRequest = await tx.productionRequest.create({
                data: {
                    ...(dto.SupplierId && { SupplierID: dto.SupplierId }),
                    ...(dto.WarehouseId && { WarehouseID: dto.WarehouseId }),
                    RequestDate: dto.RequestDate ? new Date(dto.RequestDate) : new Date(),
                    Status: dto.Status || 'PENDING',
                    Notes: dto.Notes ?? null,
                    CreatedBy: UserId,
                },
            });
            let TotalQuantity = 0;
            const items = [];
            for (const item of dto.Items) {
                const Product = await tx.product.findUnique({
                    where: { ID: item.ProductId },
                });
                if (!Product) {
                    throw new common_1.NotFoundException(`Product ${item.ProductId} not found`);
                }
                const Price = item.Price ?? Number(Product.PurchasePrice);
                const subTotal = Price * item.Quantity;
                TotalQuantity += item.Quantity;
                const createdItem = await tx.productionRequestItem.create({
                    data: {
                        ProductionRequestID: newRequest.ID,
                        ProductID: item.ProductId,
                        WarehouseID: item.WarehouseId,
                        UnitID: item.UnitId || Product.UnitID,
                        Quantity: new client_1.Prisma.Decimal(item.Quantity),
                        Price: new client_1.Prisma.Decimal(Price),
                    },
                });
                items.push({
                    ID: createdItem.ID,
                    ProductId: item.ProductId,
                    ProductName: Product.Name,
                    WarehouseId: item.WarehouseId,
                    UnitId: item.UnitId || Product.UnitID,
                    Quantity: item.Quantity,
                    Price,
                });
            }
            return { Request: newRequest, items, TotalQuantity };
        });
        return {
            success: true,
            Request: {
                ID: Request.Request.ID,
                RequestNumber: Request.Request.RequestNumber,
                SupplierId: Request.Request.SupplierID,
                WarehouseId: Request.Request.WarehouseID,
                RequestDate: Request.Request.RequestDate,
                Status: Request.Request.Status,
                Notes: Request.Request.Notes,
                TotalQuantity: Request.TotalQuantity,
                itemCount: Request.items.length,
                items: Request.items,
            },
        };
    }
    async getRequest(ID) {
        const Request = await this.prisma.productionRequest.findUnique({
            where: { ID: ID },
            include: {
                Supplier: true,
                Warehouse: true,
                Items: {
                    include: {
                        Product: true,
                        Unit: true,
                        Warehouse: true,
                    },
                },
            },
        });
        if (!Request) {
            throw new common_1.NotFoundException(`Request ${ID} not found`);
        }
        return {
            ID: Request.ID,
            RequestNumber: Request.RequestNumber,
            SupplierId: Request.SupplierID,
            SupplierName: Request.Supplier?.Name,
            WarehouseId: Request.WarehouseID,
            WarehouseName: Request.Warehouse?.Name,
            RequestDate: Request.RequestDate,
            Status: Request.Status,
            Notes: Request.Notes,
            createdBy: Request.CreatedBy,
            createdAt: Request.CreatedAt,
            items: Request.Items.map((item) => ({
                ID: item.ID,
                ProductId: item.ProductID,
                ProductName: item.Product?.Name,
                ProductCode: item.Product?.Code,
                WarehouseId: item.WarehouseID,
                WarehouseName: item.Warehouse?.Name,
                UnitId: item.UnitID,
                UnitName: item.Unit?.Name,
                Quantity: (0, number_1.number)(item.Quantity),
                Price: (0, number_1.number)(item.Price),
                subTotal: (0, number_1.number)(item.Quantity) * Number(item.Price),
            })),
        };
    }
    async listRequests(dto) {
        const where = {};
        if (dto.SupplierId) {
            where.SupplierID = dto.SupplierId;
        }
        if (dto.WarehouseId) {
            where.WarehouseID = dto.WarehouseId;
        }
        if (dto.Status) {
            where.Status = dto.Status.toUpperCase();
        }
        if (dto.StartDate || dto.EndDate) {
            where.RequestDate = {};
            if (dto.StartDate) {
                where.RequestDate.gte = new Date(dto.StartDate);
            }
            if (dto.EndDate) {
                where.RequestDate.lte = new Date(dto.EndDate);
            }
        }
        const Requests = await this.prisma.productionRequest.findMany({
            where,
            include: {
                Supplier: { select: { ID: true, Name: true } },
                Warehouse: { select: { ID: true, Name: true } },
                Items: true,
            },
            orderBy: { RequestDate: 'desc' },
        });
        return Requests.map((r) => ({
            ID: r.ID,
            RequestNumber: r.RequestNumber,
            SupplierId: r.SupplierID,
            SupplierName: r.Supplier?.Name,
            WarehouseId: r.WarehouseID,
            WarehouseName: r.Warehouse?.Name,
            RequestDate: r.RequestDate,
            Status: r.Status,
            itemCount: r.Items.length,
            TotalQuantity: r.Items.reduce((sum, item) => sum + Number(item.Quantity), 0),
            Notes: r.Notes,
            createdAt: r.CreatedAt,
        }));
    }
    async approveRequest(ID, UserId) {
        const Request = await this.prisma.productionRequest.findUnique({
            where: { ID: ID },
        });
        if (!Request) {
            throw new common_1.NotFoundException(`Request ${ID} not found`);
        }
        if (Request.Status !== 'PENDING') {
            throw new common_1.BadRequestException('Only pending Requests can be approved');
        }
        const updated = await this.prisma.productionRequest.update({
            where: { ID: ID },
            data: { Status: 'APPROVED' },
        });
        return {
            success: true,
            RequestNumber: updated.RequestNumber,
            Status: updated.Status,
            message: 'Request approved successfully',
        };
    }
    async rejectRequest(ID, UserId, reason) {
        const Request = await this.prisma.productionRequest.findUnique({
            where: { ID: ID },
        });
        if (!Request) {
            throw new common_1.NotFoundException(`Request ${ID} not found`);
        }
        if (Request.Status !== 'PENDING') {
            throw new common_1.BadRequestException('Only pending Requests can be rejected');
        }
        const updated = await this.prisma.productionRequest.update({
            where: { ID: ID },
            data: {
                Status: 'REJECTED',
                Notes: reason ? `${Request.Notes || ''}\nRejected: ${reason}` : Request.Notes,
            },
        });
        return {
            success: true,
            RequestNumber: updated.RequestNumber,
            Status: updated.Status,
            message: 'Request rejected',
        };
    }
    async generateRequestNumber() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const prefix = `PRQ-${year}${month}${day}`;
        const lastRequest = await this.prisma.productionRequest.findFirst({
            where: { RequestNumber: { startsWith: prefix } },
            orderBy: { RequestNumber: 'desc' },
            select: { RequestNumber: true },
        });
        let nextNumber = 1;
        if (lastRequest) {
            const lastSeq = parseInt(lastRequest.RequestNumber.split('-').pop() || '0', 10);
            nextNumber = lastSeq + 1;
        }
        return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
    }
};
exports.ProductionRequestService = ProductionRequestService;
exports.ProductionRequestService = ProductionRequestService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductionRequestService);
