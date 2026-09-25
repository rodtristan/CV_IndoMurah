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
exports.MemberCardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/prisma/prisma-service");
const client_1 = require("@prisma/client");
const number_1 = require("../../../common/utils/number");
let MemberCardService = class MemberCardService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createCard(dto, UserId) {
        const existingCard = await this.prisma.memberCard.findUnique({
            where: { CardNumber: dto.CardNumber },
        });
        if (existingCard) {
            throw new common_1.ConflictException('Card number already exists');
        }
        const existingCustomerCard = await this.prisma.memberCard.findFirst({
            where: { CustomerID: dto.CustomerId, IsActive: true },
        });
        if (existingCustomerCard) {
            throw new common_1.ConflictException('Customer already has an Active card');
        }
        const Customer = await this.prisma.customer.findUnique({
            where: { ID: dto.CustomerId },
            include: { CustomerGroup: true },
        });
        if (!Customer) {
            throw new common_1.NotFoundException('Customer not found');
        }
        const CardType = dto.CardType || this.getCardTypeFromGroup(Customer.CustomerGroup?.Name);
        const ActiveStatus = await this.prisma.memberCardStatus.findFirst({
            where: { Code: 'ACTIVE' },
        });
        const Code = await this.generateCardCode();
        const card = await this.prisma.memberCard.create({
            data: {
                Code: Code,
                CardNumber: dto.CardNumber,
                CustomerID: dto.CustomerId,
                CardType: CardType,
                Balance: new client_1.Prisma.Decimal(dto.InitialDeposit || 0),
                MinimumBalance: this.getMinimumBalanceByType(CardType),
                StatusID: ActiveStatus?.ID || 1,
                Notes: dto.Notes,
            },
            include: {
                Customer: { include: { CustomerGroup: true } },
                Status: true,
            },
        });
        if (dto.InitialDeposit && dto.InitialDeposit > 0) {
            await this.recordTransaction(card.ID, 'TOP_UP', dto.InitialDeposit, 0, dto.InitialDeposit, 'Initial Deposit', null, UserId);
        }
        return {
            success: true,
            card: this.formatCard(card),
        };
    }
    async getCard(CardId) {
        const card = await this.prisma.memberCard.findUnique({
            where: { ID: CardId },
            include: {
                Customer: { include: { CustomerGroup: true } },
                Status: true,
            },
        });
        if (!card) {
            throw new common_1.NotFoundException('Card not found');
        }
        return {
            ...this.formatCard(card),
            Customer: {
                ID: card.Customer.ID,
                Code: card.Customer.Code,
                Name: card.Customer.Name,
                Phone: card.Customer.Phone,
                Group: card.Customer.CustomerGroup?.Name || null,
            },
        };
    }
    async getCardByNumber(CardNumber) {
        const card = await this.prisma.memberCard.findUnique({
            where: { CardNumber: CardNumber },
            include: {
                Customer: { include: { CustomerGroup: true } },
                Status: true,
            },
        });
        if (!card) {
            throw new common_1.NotFoundException('Card not found');
        }
        return this.formatCard(card);
    }
    async listCards(dto) {
        const where = {};
        if (dto.ActiveOnly !== false) {
            where.IsActive = true;
        }
        if (dto.CardType) {
            where.CardType = dto.CardType;
        }
        if (dto.Search) {
            where.OR = [
                { CardNumber: { contains: dto.Search, mode: 'insensitive' } },
                { Customer: { Name: { contains: dto.Search, mode: 'insensitive' } } },
                { Customer: { Code: { contains: dto.Search, mode: 'insensitive' } } },
            ];
        }
        if (dto.LowBalanceOnly) {
            where.Balance = { lt: dto.MinBalance || 50000 };
        }
        if (dto.CustomerGroupId) {
            where.Customer = { CustomerGroupID: dto.CustomerGroupId };
        }
        const Page = dto.Page || 1;
        const Limit = dto.Limit || 20;
        const skip = (Page - 1) * Limit;
        const [cards, Total] = await Promise.all([
            this.prisma.memberCard.findMany({
                where,
                include: {
                    Customer: { include: { CustomerGroup: true } },
                    Status: true,
                },
                orderBy: { CreatedAt: 'desc' },
                skip,
                take: Limit,
            }),
            this.prisma.memberCard.count({ where }),
        ]);
        return {
            data: cards.map((c) => this.formatCard(c)),
            pagination: {
                Page,
                Limit,
                Total,
                TotalPages: Math.ceil(Total / Limit),
            },
        };
    }
    async updateCard(CardId, dto, UserId) {
        const card = await this.prisma.memberCard.findUnique({
            where: { ID: CardId },
        });
        if (!card) {
            throw new common_1.NotFoundException('Card not found');
        }
        const updateData = {};
        if (dto.CardType) {
            updateData.CardType = dto.CardType;
            updateData.MinimumBalance = this.getMinimumBalanceByType(dto.CardType);
        }
        if (dto.IsActive !== undefined) {
            updateData.IsActive = dto.IsActive;
        }
        if (dto.Notes !== undefined) {
            updateData.Notes = dto.Notes;
        }
        const updated = await this.prisma.memberCard.update({
            where: { ID: CardId },
            data: updateData,
            include: {
                Customer: { include: { CustomerGroup: true } },
                Status: true,
            },
        });
        return {
            success: true,
            card: this.formatCard(updated),
        };
    }
    async activateCard(CardId, UserId) {
        const card = await this.prisma.memberCard.findUnique({
            where: { ID: CardId },
        });
        if (!card) {
            throw new common_1.NotFoundException('Card not found');
        }
        const ActiveStatus = await this.prisma.memberCardStatus.findFirst({
            where: { Code: 'ACTIVE' },
        });
        await this.prisma.memberCard.update({
            where: { ID: CardId },
            data: {
                IsActive: true,
                StatusID: ActiveStatus?.ID || 1,
            },
        });
        return {
            success: true,
            message: 'Card activated successfully',
        };
    }
    async deactivateCard(CardId, UserId) {
        const card = await this.prisma.memberCard.findUnique({
            where: { ID: CardId },
        });
        if (!card) {
            throw new common_1.NotFoundException('Card not found');
        }
        const InactiveStatus = await this.prisma.memberCardStatus.findFirst({
            where: { Code: 'INACTIVE' },
        });
        await this.prisma.memberCard.update({
            where: { ID: CardId },
            data: {
                IsActive: false,
                StatusID: InactiveStatus?.ID || 2,
            },
        });
        return {
            success: true,
            message: 'Card deactivated successfully',
        };
    }
    async replaceCard(CardId, dto, UserId) {
        const oldCard = await this.prisma.memberCard.findUnique({
            where: { ID: CardId },
            include: { Customer: true },
        });
        if (!oldCard) {
            throw new common_1.NotFoundException('Card not found');
        }
        const newCardNumber = await this.generateNewCardNumber();
        await this.prisma.memberCard.update({
            where: { ID: CardId },
            data: {
                IsActive: false,
                Notes: `Replaced on ${new Date().toISOString()}: ${dto.Reason}. New card: ${newCardNumber}`,
            },
        });
        const ActiveStatus = await this.prisma.memberCardStatus.findFirst({
            where: { Code: 'ACTIVE' },
        });
        const newCard = await this.prisma.memberCard.create({
            data: {
                Code: await this.generateCardCode(),
                CardNumber: newCardNumber,
                CustomerID: oldCard.CustomerID,
                CardType: oldCard.CardType,
                Balance: oldCard.Balance,
                MinimumBalance: oldCard.MinimumBalance,
                StatusID: ActiveStatus?.ID || 1,
                Notes: `Replacement card for ${oldCard.CardNumber}. Reason: ${dto.Reason}`,
                ReplacedFromID: oldCard.ID,
            },
            include: {
                Customer: { include: { CustomerGroup: true } },
                Status: true,
            },
        });
        return {
            success: true,
            oldCard: {
                ID: oldCard.ID,
                CardNumber: oldCard.CardNumber,
                Status: 'REPLACED',
            },
            newCard: this.formatCard(newCard),
        };
    }
    async topUp(CardId, dto, UserId) {
        const card = await this.prisma.memberCard.findUnique({
            where: { ID: CardId },
        });
        if (!card) {
            throw new common_1.NotFoundException('Card not found');
        }
        if (!card.IsActive) {
            throw new common_1.BadRequestException('Card is not Active');
        }
        const BalanceBefore = Number(card.Balance);
        const BalanceAfter = BalanceBefore + dto.Amount;
        await this.prisma.memberCard.update({
            where: { ID: CardId },
            data: { Balance: { increment: new client_1.Prisma.Decimal(dto.Amount) } },
        });
        const transaction = await this.recordTransaction(CardId, 'TOP_UP', dto.Amount, BalanceBefore, BalanceAfter, dto.Notes || 'Card top-up', dto.ReferenceNumber || null, UserId);
        return {
            success: true,
            transaction: {
                ID: transaction.ID,
                CardNumber: card.CardNumber,
                Type: 'TOP_UP',
                Amount: dto.Amount,
                BalanceBefore,
                BalanceAfter,
                ReferenceNumber: dto.ReferenceNumber,
                CreatedAt: transaction.CreatedAt,
            },
        };
    }
    async withdraw(CardId, dto, UserId) {
        const card = await this.prisma.memberCard.findUnique({
            where: { ID: CardId },
        });
        if (!card) {
            throw new common_1.NotFoundException('Card not found');
        }
        if (!card.IsActive) {
            throw new common_1.BadRequestException('Card is not Active');
        }
        const BalanceBefore = Number(card.Balance);
        const BalanceAfter = BalanceBefore - dto.Amount;
        if (BalanceAfter < 0) {
            throw new common_1.BadRequestException(`Insufficient Balance. Available: ${BalanceBefore}`);
        }
        await this.prisma.memberCard.update({
            where: { ID: CardId },
            data: { Balance: { decrement: new client_1.Prisma.Decimal(dto.Amount) } },
        });
        const transaction = await this.recordTransaction(CardId, 'WITHDRAW', dto.Amount, BalanceBefore, BalanceAfter, dto.Notes || 'Card withdrawal', dto.ReferenceNumber || null, UserId);
        return {
            success: true,
            transaction: {
                ID: transaction.ID,
                CardNumber: card.CardNumber,
                Type: 'WITHDRAW',
                Amount: dto.Amount,
                BalanceBefore,
                BalanceAfter,
                ReferenceNumber: dto.ReferenceNumber,
                CreatedAt: transaction.CreatedAt,
            },
        };
    }
    async transfer(CardId, dto, UserId) {
        const sourceCard = await this.prisma.memberCard.findUnique({
            where: { ID: CardId },
        });
        if (!sourceCard) {
            throw new common_1.NotFoundException('Source card not found');
        }
        const targetCard = await this.prisma.memberCard.findUnique({
            where: { ID: dto.TargetCardId },
        });
        if (!targetCard) {
            throw new common_1.NotFoundException('Target card not found');
        }
        if (!sourceCard.IsActive || !targetCard.IsActive) {
            throw new common_1.BadRequestException('One or both cards are not Active');
        }
        const sourceBalanceBefore = Number(sourceCard.Balance);
        const sourceBalanceAfter = sourceBalanceBefore - dto.Amount;
        if (sourceBalanceAfter < 0) {
            throw new common_1.BadRequestException(`Insufficient Balance. Available: ${sourceBalanceBefore}`);
        }
        await this.prisma.$transaction(async (tx) => {
            await tx.memberCard.update({
                where: { ID: CardId },
                data: { Balance: { decrement: new client_1.Prisma.Decimal(dto.Amount) } },
            });
            await tx.memberCard.update({
                where: { ID: dto.TargetCardId },
                data: { Balance: { increment: new client_1.Prisma.Decimal(dto.Amount) } },
            });
            await this.recordTransactionInternal(tx, CardId, 'TRANSFER_OUT', dto.Amount, sourceBalanceBefore, sourceBalanceAfter, `Transfer to ${targetCard.CardNumber}`, null, UserId);
            await this.recordTransactionInternal(tx, dto.TargetCardId, 'TRANSFER_IN', dto.Amount, Number(targetCard.Balance), Number(targetCard.Balance) + dto.Amount, `Transfer from ${sourceCard.CardNumber}`, null, UserId);
        });
        return {
            success: true,
            transfer: {
                SourceCard: sourceCard.CardNumber,
                TargetCard: targetCard.CardNumber,
                Amount: dto.Amount,
                SourceBalanceBefore: sourceBalanceBefore,
                SourceBalanceAfter: sourceBalanceAfter,
                TargetBalanceBefore: (0, number_1.number)(targetCard.Balance),
                TargetBalanceAfter: (0, number_1.number)(targetCard.Balance) + dto.Amount,
            },
        };
    }
    async getBalance(CardId) {
        const card = await this.prisma.memberCard.findUnique({
            where: { ID: CardId },
            include: { Customer: true },
        });
        if (!card) {
            throw new common_1.NotFoundException('Card not found');
        }
        return {
            CardId: card.ID,
            CardNumber: card.CardNumber,
            CustomerName: card.Customer?.Name,
            Balance: (0, number_1.number)(card.Balance),
            MinimumBalance: (0, number_1.number)(card.MinimumBalance),
            IsLowBalance: (0, number_1.number)(card.Balance) < Number(card.MinimumBalance),
            CardType: card.CardType,
            IsActive: card.IsActive,
        };
    }
    async getTransactions(CardId, dto) {
        const card = await this.prisma.memberCard.findUnique({
            where: { ID: CardId },
        });
        if (!card) {
            throw new common_1.NotFoundException('Card not found');
        }
        const where = { MemberCardID: CardId };
        if (dto.TransactionType) {
            where.TransactionType = dto.TransactionType;
        }
        if (dto.StartDate || dto.EndDate) {
            where.CreatedAt = {};
            if (dto.StartDate) {
                where.CreatedAt.gte = new Date(dto.StartDate);
            }
            if (dto.EndDate) {
                where.CreatedAt.lte = new Date(dto.EndDate);
            }
        }
        const transactions = await this.prisma.memberCardTransaction.findMany({
            where,
            orderBy: { CreatedAt: 'desc' },
            take: 100,
        });
        return {
            CardNumber: card.CardNumber,
            CurrentBalance: (0, number_1.number)(card.Balance),
            transactions: transactions.map((t) => ({
                ID: t.ID,
                Type: t.TransactionType,
                Amount: (0, number_1.number)(t.Amount),
                BalanceBefore: (0, number_1.number)(t.BalanceBefore),
                BalanceAfter: (0, number_1.number)(t.BalanceAfter),
                ReferenceNumber: t.ReferenceNumber,
                Notes: t.Notes,
                CreatedAt: t.CreatedAt,
            })),
        };
    }
    async getBalanceReport(dto) {
        const where = { IsActive: true };
        if (dto.CustomerGroupId) {
            where.Customer = { CustomerGroupID: dto.CustomerGroupId };
        }
        const cards = await this.prisma.memberCard.findMany({
            where,
            include: {
                Customer: { include: { CustomerGroup: true } },
            },
        });
        const Report = cards.map((c) => ({
            CardId: c.ID,
            CardNumber: c.CardNumber,
            CustomerName: c.Customer?.Name,
            CustomerCode: c.Customer?.Code,
            CustomerGroup: c.Customer?.CustomerGroup?.Name,
            CardType: c.CardType,
            Balance: (0, number_1.number)(c.Balance),
            MinimumBalance: (0, number_1.number)(c.MinimumBalance),
            IsLowBalance: (0, number_1.number)(c.Balance) < Number(c.MinimumBalance),
        }));
        const Summary = {
            TotalCards: Report.length,
            TotalBalance: Report.reduce((sum, r) => sum + r.Balance, 0),
            TotalMinimumRequired: Report.reduce((sum, r) => sum + r.MinimumBalance, 0),
            LowBalanceCount: Report.filter((r) => r.IsLowBalance).length,
            ZeroBalanceCount: Report.filter((r) => r.Balance === 0).length,
        };
        return {
            AsOfDate: dto.AsOfDate || new Date().toISOString(),
            Summary,
            cards: Report,
        };
    }
    async getCardStats() {
        const [TotalCards, ActiveCards, TotalBalance] = await Promise.all([
            this.prisma.memberCard.count({ where: { IsActive: true } }),
            this.prisma.memberCard.count({ where: { IsActive: true, Balance: { gt: 0 } } }),
            this.prisma.memberCard.aggregate({
                where: { IsActive: true },
                _sum: { Balance: true },
            }),
        ]);
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const topUps = await this.prisma.memberCardTransaction.aggregate({
            where: {
                TransactionType: 'TOP_UP',
                CreatedAt: { gte: startOfMonth },
            },
            _sum: { Amount: true },
            _count: true,
        });
        return {
            TotalActiveCards: TotalCards,
            CardsWithBalance: ActiveCards,
            TotalBalance: (0, number_1.number)(TotalBalance._sum.Balance) || 0,
            ThisMonthTopUps: {
                Count: topUps._count || 0,
                TotalAmount: (0, number_1.number)(topUps._sum.Amount) || 0,
            },
        };
    }
    async recordTransaction(CardId, Type, Amount, BalanceBefore, BalanceAfter, Notes, ReferenceNumber, UserId) {
        const transaction = await this.prisma.memberCardTransaction.create({
            data: {
                MemberCardID: CardId,
                TransactionType: Type,
                Amount: new client_1.Prisma.Decimal(Amount),
                BalanceBefore: new client_1.Prisma.Decimal(BalanceBefore),
                BalanceAfter: new client_1.Prisma.Decimal(BalanceAfter),
                ReferenceNumber: ReferenceNumber,
                Notes: Notes,
                CreatedByID: UserId,
            },
        });
        return {
            ID: transaction.ID,
            CreatedAt: transaction.CreatedAt,
        };
    }
    async recordTransactionInternal(tx, CardId, Type, Amount, BalanceBefore, BalanceAfter, Notes, ReferenceNumber, UserId) {
        return tx.memberCardTransaction.create({
            data: {
                MemberCardID: CardId,
                TransactionType: Type,
                Amount: new client_1.Prisma.Decimal(Amount),
                BalanceBefore: new client_1.Prisma.Decimal(BalanceBefore),
                BalanceAfter: new client_1.Prisma.Decimal(BalanceAfter),
                ReferenceNumber: ReferenceNumber,
                Notes: Notes,
                CreatedByID: UserId,
            },
        });
    }
    formatCard(card) {
        return {
            ID: card.ID,
            Code: card.Code,
            CardNumber: card.CardNumber,
            CustomerId: card.CustomerID,
            CustomerName: card.Customer?.Name,
            CustomerCode: card.Customer?.Code,
            CardType: card.CardType,
            Balance: (0, number_1.number)(card.Balance),
            MinimumBalance: (0, number_1.number)(card.MinimumBalance),
            IsLowBalance: (0, number_1.number)(card.Balance) < Number(card.MinimumBalance),
            IsActive: card.IsActive,
            Status: card.Status?.Name,
            Notes: card.Notes,
            CreatedAt: card.CreatedAt,
            UpdatedAt: card.UpdatedAt,
        };
    }
    getCardTypeFromGroup(GroupName) {
        if (!GroupName)
            return 'STANDARD';
        const lowerName = GroupName.toLowerCase();
        if (lowerName.includes('platinum'))
            return 'PLATINUM';
        if (lowerName.includes('gold'))
            return 'GOLD';
        if (lowerName.includes('silver'))
            return 'SILVER';
        return 'STANDARD';
    }
    getMinimumBalanceByType(CardType) {
        switch (CardType) {
            case 'PLATINUM':
                return new client_1.Prisma.Decimal(500000);
            case 'GOLD':
                return new client_1.Prisma.Decimal(250000);
            case 'SILVER':
                return new client_1.Prisma.Decimal(100000);
            default:
                return new client_1.Prisma.Decimal(50000);
        }
    }
    async generateCardCode() {
        const prefix = 'CARD';
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const lastCard = await this.prisma.memberCard.findFirst({
            where: { Code: { startsWith: `${prefix}-${year}${month}` } },
            orderBy: { Code: 'desc' },
            select: { Code: true },
        });
        let nextNumber = 1;
        if (lastCard) {
            const lastSeq = parseInt(lastCard.Code.split('-').pop() || '0', 10);
            nextNumber = lastSeq + 1;
        }
        return `${prefix}-${year}${month}-${String(nextNumber).padStart(4, '0')}`;
    }
    async generateNewCardNumber() {
        const timestamp = Date.now().toString().slice(-8);
        const random = Math.floor(Math.random() * 10000)
            .toString()
            .padStart(4, '0');
        return `MC${timestamp}${random}`;
    }
};
exports.MemberCardService = MemberCardService;
exports.MemberCardService = MemberCardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MemberCardService);
