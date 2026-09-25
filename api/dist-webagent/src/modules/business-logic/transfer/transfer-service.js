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
exports.TransferService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/prisma/prisma-service");
const client_1 = require("@prisma/client");
const number_1 = require("../../../common/utils/number");
let TransferService = class TransferService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createTransfer(dto, UserId) {
        const isCashTransfer = dto.FromAccountId && dto.ToAccountId;
        const isWarehouseTransfer = dto.FromWarehouseId && dto.ToWarehouseId;
        if (!isCashTransfer && !isWarehouseTransfer) {
            throw new common_1.BadRequestException('Transfer must specify either account IDs (Cash Transfer) or Warehouse IDs (Stock Transfer)');
        }
        if (isCashTransfer) {
            const [fromAccount, toAccount] = await Promise.all([
                this.prisma.account.findUnique({ where: { ID: dto.FromAccountId } }),
                this.prisma.account.findUnique({ where: { ID: dto.ToAccountId } }),
            ]);
            if (!fromAccount) {
                throw new common_1.NotFoundException('From account not found');
            }
            if (!toAccount) {
                throw new common_1.NotFoundException('To account not found');
            }
        }
        if (isWarehouseTransfer) {
            const [fromWarehouse, toWarehouse] = await Promise.all([
                this.prisma.warehouse.findUnique({ where: { ID: dto.FromWarehouseId } }),
                this.prisma.warehouse.findUnique({ where: { ID: dto.ToWarehouseId } }),
            ]);
            if (!fromWarehouse) {
                throw new common_1.NotFoundException('From Warehouse not found');
            }
            if (!toWarehouse) {
                throw new common_1.NotFoundException('To Warehouse not found');
            }
            if (fromWarehouse.ID === toWarehouse.ID) {
                throw new common_1.BadRequestException('Cannot Transfer to the same Warehouse');
            }
        }
        const completedStatus = await this.prisma.transactionStatus.findFirst({
            where: { IsTerminal: true },
        });
        const Transfer = await this.prisma.transfer.create({
            data: {
                Code: dto.Code,
                Date: new Date(dto.Date),
                FromAccountID: dto.FromAccountId,
                ToAccountID: dto.ToAccountId,
                FromWarehouseID: dto.FromWarehouseId,
                ToWarehouseID: dto.ToWarehouseId,
                Amount: new client_1.Prisma.Decimal(dto.Amount),
                Description: dto.Description,
                Notes: dto.Notes,
                StatusID: completedStatus?.ID || 3,
            },
        });
        await this.prisma.activityLog.create({
            data: {
                Type: 'TRANSFER_CREATED',
                Title: 'Transfer Created',
                Description: `Transfer ${Transfer.Code} created: ${dto.Amount}`,
                ReferenceType: 'TRANSFER',
                ReferenceID: Transfer.ID,
                Amount: new client_1.Prisma.Decimal(dto.Amount),
                CreatedByID: UserId,
            },
        });
        return {
            success: true,
            Transfer: await this.formatTransfer(Transfer.ID),
        };
    }
    async getTransfer(TransferId) {
        const Transfer = await this.prisma.transfer.findUnique({
            where: { ID: TransferId },
            include: {
                FromAccount: true,
                ToAccount: true,
                FromWarehouse: true,
                ToWarehouse: true,
                Status: true,
            },
        });
        if (!Transfer) {
            throw new common_1.NotFoundException('Transfer not found');
        }
        return this.formatTransfer(Transfer);
    }
    async listTransfers(dto) {
        const where = {};
        if (dto.StartDate || dto.EndDate) {
            where.Date = {};
            if (dto.StartDate) {
                where.Date.gte = new Date(dto.StartDate);
            }
            if (dto.EndDate) {
                const endDate = new Date(dto.EndDate);
                endDate.setHours(23, 59, 59, 999);
                where.Date.lte = endDate;
            }
        }
        if (dto.FromAccountId) {
            where.FromAccountID = dto.FromAccountId;
        }
        if (dto.ToAccountId) {
            where.ToAccountID = dto.ToAccountId;
        }
        const page = dto.Page || 1;
        const limit = dto.Limit || 20;
        const skip = (page - 1) * limit;
        const [Transfers, Total] = await Promise.all([
            this.prisma.transfer.findMany({
                where,
                include: {
                    FromAccount: true,
                    ToAccount: true,
                    FromWarehouse: true,
                    ToWarehouse: true,
                    Status: true,
                },
                orderBy: { Date: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.transfer.count({ where }),
        ]);
        return {
            data: await Promise.all(Transfers.map((t) => this.formatTransfer(t))),
            pagination: {
                page,
                limit,
                Total,
                TotalPages: Math.ceil(Total / limit),
            },
        };
    }
    async deleteTransfer(TransferId) {
        const Transfer = await this.prisma.transfer.findUnique({
            where: { ID: TransferId },
        });
        if (!Transfer) {
            throw new common_1.NotFoundException('Transfer not found');
        }
        await this.prisma.transfer.delete({
            where: { ID: TransferId },
        });
        return { success: true, message: 'Transfer deleted' };
    }
    async getTransferSummary(dto) {
        const where = {};
        if (dto.StartDate || dto.EndDate) {
            where.Date = {};
            if (dto.StartDate) {
                where.Date.gte = new Date(dto.StartDate);
            }
            if (dto.EndDate) {
                const endDate = new Date(dto.EndDate);
                endDate.setHours(23, 59, 59, 999);
                where.Date.lte = endDate;
            }
        }
        const Transfers = await this.prisma.transfer.findMany({
            where,
        });
        const CashTransfers = Transfers.filter((t) => t.FromAccountID && t.ToAccountID);
        const WarehouseTransfers = Transfers.filter((t) => t.FromWarehouseID && t.ToWarehouseID);
        return {
            period: { startDate: dto.StartDate, endDate: dto.EndDate },
            TotalTransfers: Transfers.length,
            CashTransfers: {
                Count: CashTransfers.length,
                TotalAmount: CashTransfers.reduce((sum, t) => sum + Number(t.Amount), 0),
            },
            WarehouseTransfers: {
                Count: WarehouseTransfers.length,
                TotalAmount: WarehouseTransfers.reduce((sum, t) => sum + Number(t.Amount), 0),
            },
        };
    }
    async getAccounts() {
        const Accounts = await this.prisma.account.findMany({
            where: { IsActive: true },
            include: {
                Type: true,
            },
            orderBy: { Code: 'asc' },
        });
        return Accounts.map((a) => ({
            ID: a.ID,
            Code: a.Code,
            Name: a.Name,
            Type: a.Type?.Name,
        }));
    }
    async formatTransfer(transfer) {
        const fullTransfer = typeof transfer === 'number'
            ? await this.prisma.transfer.findUnique({
                where: { ID: transfer },
                include: {
                    FromAccount: true,
                    ToAccount: true,
                    FromWarehouse: true,
                    ToWarehouse: true,
                    Status: true,
                },
            })
            : transfer;
        if (!fullTransfer) {
            throw new common_1.NotFoundException('Transfer not found');
        }
        return {
            ID: fullTransfer.ID,
            Code: fullTransfer.Code,
            Date: fullTransfer.Date,
            TransferType: fullTransfer.FromAccountID ? 'CASH' : 'WAREHOUSE',
            fromAccount: fullTransfer.FromAccount
                ? { ID: fullTransfer.FromAccount.ID, Code: fullTransfer.FromAccount.Code, Name: fullTransfer.FromAccount.Name }
                : null,
            toAccount: fullTransfer.ToAccount
                ? { ID: fullTransfer.ToAccount.ID, Code: fullTransfer.ToAccount.Code, Name: fullTransfer.ToAccount.Name }
                : null,
            fromWarehouse: fullTransfer.FromWarehouse
                ? { ID: fullTransfer.FromWarehouse.ID, Code: fullTransfer.FromWarehouse.Code, Name: fullTransfer.FromWarehouse.Name }
                : null,
            toWarehouse: fullTransfer.ToWarehouse
                ? { ID: fullTransfer.ToWarehouse.ID, Code: fullTransfer.ToWarehouse.Code, Name: fullTransfer.ToWarehouse.Name }
                : null,
            Amount: (0, number_1.number)(fullTransfer.Amount),
            Description: fullTransfer.Description,
            Notes: fullTransfer.Notes,
            Status: fullTransfer.Status
                ? { ID: fullTransfer.Status.ID, Code: fullTransfer.Status.Code, Name: fullTransfer.Status.Name, color: fullTransfer.Status.Color }
                : null,
            createdAt: fullTransfer.CreatedAt,
        };
    }
};
exports.TransferService = TransferService;
exports.TransferService = TransferService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TransferService);
