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
exports.ChequePaymentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma-service");
const client_1 = require("@prisma/client");
const auto_journal_service_1 = require("../../common/accounting/auto-journal.service");
const sale_payment_service_1 = require("../sale-payment/sale-payment.service");
const purchase_payment_service_1 = require("../purchase-payment/purchase-payment.service");
let ChequePaymentService = class ChequePaymentService {
    constructor(prisma, autoJournal, salePayments, purchasePayments) {
        this.prisma = prisma;
        this.autoJournal = autoJournal;
        this.salePayments = salePayments;
        this.purchasePayments = purchasePayments;
    }
    linkedKind(cheque) {
        if (!cheque.ReferenceID)
            return null;
        if (cheque.ReferenceType === 'SALE_PAYMENT')
            return 'SALE';
        if (cheque.ReferenceType === 'PURCHASE_PAYMENT')
            return 'PURCHASE';
        return null;
    }
    async removeLinkedPayment(tx, cheque) {
        const kind = this.linkedKind(cheque);
        if (!kind)
            return null;
        const svc = kind === 'SALE' ? this.salePayments : this.purchasePayments;
        const model = kind === 'SALE' ? tx.salePayment : tx.purchasePayment;
        const exists = await model.findUnique({ where: { ID: cheque.ReferenceID } });
        if (!exists)
            return null;
        const pay = await svc.deleteTx(tx, cheque.ReferenceID);
        return { kind, parentId: kind === 'SALE' ? pay.SaleID : pay.PurchaseID };
    }
    async invalidateLinked(r) {
        if (!r)
            return;
        if (r.kind === 'SALE')
            await this.salePayments.invalidateFor(r.parentId);
        else
            await this.purchasePayments.invalidateFor(r.parentId);
    }
    async create(dto, userId) {
        if (dto.ReferenceType === 'SALE_PAYMENT' || dto.ReferenceType === 'PURCHASE_PAYMENT') {
            throw new common_1.BadRequestException('Cek/BG untuk pembayaran penjualan/pembelian dibuat otomatis dari menu Pembayaran (Jenis: Cek / BG)');
        }
        if (dto.Type !== 'SALE' && dto.Type !== 'PURCHASE')
            throw new common_1.BadRequestException('Type harus SALE atau PURCHASE');
        const code = await this.generateCode(dto.Type);
        if (dto.BankId) {
            const bank = await this.prisma.bank.findUnique({ where: { ID: dto.BankId } });
            if (!bank)
                throw new common_1.NotFoundException('Bank not found');
        }
        const cheque = await this.prisma.chequePayment.create({
            data: {
                Code: code,
                Type: dto.Type,
                ReferenceType: dto.ReferenceType,
                ReferenceID: dto.ReferenceId,
                BankID: dto.BankId,
                ChequeNumber: dto.ChequeNumber,
                ChequeDate: new Date(dto.ChequeDate),
                DueDate: dto.DueDate ? new Date(dto.DueDate) : null,
                Amount: new client_1.Prisma.Decimal(dto.Amount),
                Status: 'PENDING',
                Notes: dto.Notes,
            },
            include: { Bank: true },
        });
        return {
            success: true,
            cheque: this.formatCheque(cheque),
        };
    }
    async findAll(dto) {
        const where = {};
        if (dto.Type)
            where.Type = dto.Type;
        if (dto.Status)
            where.Status = dto.Status;
        if (dto.BankId)
            where.BankID = dto.BankId;
        if (dto.StartDate || dto.EndDate) {
            where.ChequeDate = {};
            if (dto.StartDate)
                where.ChequeDate.gte = new Date(dto.StartDate);
            if (dto.EndDate)
                where.ChequeDate.lte = new Date(dto.EndDate);
        }
        if (dto.Search) {
            where.OR = [
                { ChequeNumber: { contains: dto.Search, mode: 'insensitive' } },
                { Code: { contains: dto.Search, mode: 'insensitive' } },
            ];
        }
        const cheques = await this.prisma.chequePayment.findMany({
            where,
            include: { Bank: true },
            orderBy: { ChequeDate: 'desc' },
        });
        return {
            count: cheques.length,
            cheques: cheques.map((c) => this.formatCheque(c)),
        };
    }
    async findById(id) {
        const cheque = await this.prisma.chequePayment.findUnique({
            where: { ID: id },
            include: { Bank: true },
        });
        if (!cheque)
            throw new common_1.NotFoundException('Cheque payment not found');
        return this.formatCheque(cheque);
    }
    async update(id, dto) {
        const cheque = await this.prisma.chequePayment.findUnique({ where: { ID: id } });
        if (!cheque)
            throw new common_1.NotFoundException('Cheque payment not found');
        if (cheque.Status !== 'PENDING') {
            throw new common_1.BadRequestException('Only PENDING cheques can be updated');
        }
        const updated = await this.prisma.$transaction(async (tx) => {
            const kind = this.linkedKind(cheque);
            if (kind) {
                const data = {};
                if (dto.ChequeNumber !== undefined)
                    data.ReferenceNumber = dto.ChequeNumber;
                if (dto.DueDate)
                    data.DueDate = new Date(dto.DueDate);
                if (Object.keys(data).length) {
                    const model = kind === 'SALE' ? tx.salePayment : tx.purchasePayment;
                    await model.updateMany({ where: { ID: cheque.ReferenceID }, data });
                }
            }
            return tx.chequePayment.update({
                where: { ID: id },
                data: {
                    BankID: dto.BankId,
                    ChequeNumber: dto.ChequeNumber,
                    DueDate: dto.DueDate ? new Date(dto.DueDate) : undefined,
                    Notes: dto.Notes,
                },
                include: { Bank: true },
            });
        });
        return {
            success: true,
            cheque: this.formatCheque(updated),
        };
    }
    async clearCheque(id, dto, userId) {
        const cheque = await this.prisma.chequePayment.findUnique({ where: { ID: id } });
        if (!cheque)
            throw new common_1.NotFoundException('Cheque payment not found');
        if (cheque.Status !== 'PENDING') {
            throw new common_1.BadRequestException(`Cannot clear cheque with status ${cheque.Status}`);
        }
        const clearedDate = dto.ClearedDate ? new Date(dto.ClearedDate) : new Date();
        const kind = this.linkedKind(cheque);
        const updated = await this.prisma.$transaction(async (tx) => {
            if (kind) {
                const svc = kind === 'SALE' ? this.salePayments : this.purchasePayments;
                await svc.clearTx(tx, cheque.ReferenceID, userId, clearedDate);
            }
            else {
                await tx.chequePayment.update({ where: { ID: id }, data: { Status: 'CLEARED', ClearedDate: clearedDate } });
                await this.postStandalone(tx, id, userId);
            }
            return tx.chequePayment.update({
                where: { ID: id },
                data: { Notes: dto.Notes ? `${cheque.Notes || ''}\n${dto.Notes}` : cheque.Notes },
                include: { Bank: true },
            });
        });
        if (kind) {
            const pay = kind === 'SALE'
                ? await this.prisma.salePayment.findUnique({ where: { ID: cheque.ReferenceID } })
                : await this.prisma.purchasePayment.findUnique({ where: { ID: cheque.ReferenceID } });
            if (pay)
                await this.invalidateLinked({ kind, parentId: kind === 'SALE' ? pay.SaleID : pay.PurchaseID });
        }
        return {
            success: true,
            message: 'Cheque cleared successfully',
            cheque: this.formatCheque(updated),
        };
    }
    async bounceCheque(id, dto, userId) {
        return this.closeWithoutClearing(id, 'BOUNCED', dto.Reason, dto.BouncedDate ? new Date(dto.BouncedDate) : new Date());
    }
    async cancelCheque(id, reason, userId) {
        return this.closeWithoutClearing(id, 'CANCELLED', reason, null);
    }
    async closeWithoutClearing(id, status, reason, bouncedDate) {
        const cheque = await this.prisma.chequePayment.findUnique({ where: { ID: id } });
        if (!cheque)
            throw new common_1.NotFoundException('Cheque payment not found');
        if (cheque.Status !== 'PENDING') {
            throw new common_1.BadRequestException(`Cannot ${status === 'BOUNCED' ? 'bounce' : 'cancel'} cheque with status ${cheque.Status}`);
        }
        const tag = status === 'BOUNCED' ? '[Bounced]' : '[Cancelled]';
        let linked = null;
        const updated = await this.prisma.$transaction(async (tx) => {
            const u = await tx.chequePayment.update({
                where: { ID: id },
                data: { Status: status, ...(bouncedDate ? { BouncedDate: bouncedDate } : {}), Notes: `${cheque.Notes || ''}\n${tag} ${reason ?? ''}`.trim() },
                include: { Bank: true },
            });
            linked = await this.removeLinkedPayment(tx, cheque);
            return u;
        });
        await this.invalidateLinked(linked);
        return {
            success: true,
            message: status === 'BOUNCED' ? 'Cheque bounced successfully' : 'Cheque cancelled successfully',
            cheque: this.formatCheque(updated),
        };
    }
    async delete(id) {
        const cheque = await this.prisma.chequePayment.findUnique({ where: { ID: id } });
        if (!cheque)
            throw new common_1.NotFoundException('Cheque payment not found');
        if (cheque.Status !== 'PENDING') {
            throw new common_1.BadRequestException('Only PENDING cheques can be deleted');
        }
        let linked = null;
        await this.prisma.$transaction(async (tx) => {
            linked = await this.removeLinkedPayment(tx, cheque);
            await tx.chequePayment.deleteMany({ where: { ID: id } });
        });
        await this.invalidateLinked(linked);
        return {
            success: true,
            message: 'Cheque payment deleted successfully',
        };
    }
    async postStandalone(tx, id, userId) {
        const c = await tx.chequePayment.findUniqueOrThrow({ where: { ID: id } });
        const amount = Number(c.Amount);
        const bank = await this.autoJournal.paymentAccount(tx, null, 'CEK');
        const isSale = c.Type === 'SALE';
        const a = await this.autoJournal.accounts(tx, [isSale ? 'receivable' : 'payable']);
        const desc = `Pencairan ${isSale ? 'cek/BG masuk' : 'cek/BG keluar'} ${c.ChequeNumber} (${c.Code})`;
        await this.autoJournal.post(tx, {
            referenceType: auto_journal_service_1.REF.CHEQUE_PAYMENT, referenceId: c.ID, date: c.ClearedDate ?? new Date(), description: desc, userId, referenceNumber: c.Code,
            lines: isSale
                ? [{ accountId: bank, debit: amount }, { accountId: a.receivable, credit: amount }]
                : [{ accountId: a.payable, debit: amount }, { accountId: bank, credit: amount }],
        });
    }
    async generateCode(type) {
        const prefix = type === 'SALE' ? 'CHQ-S' : 'CHQ-P';
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const codePrefix = `${prefix}-${year}${month}`;
        const lastCheque = await this.prisma.chequePayment.findFirst({
            where: { Code: { startsWith: codePrefix } },
            orderBy: { Code: 'desc' },
            select: { Code: true },
        });
        let nextNumber = 1;
        if (lastCheque) {
            const lastSeq = parseInt(lastCheque.Code.split('-').pop() || '0', 10);
            nextNumber = lastSeq + 1;
        }
        return `${codePrefix}-${String(nextNumber).padStart(4, '0')}`;
    }
    formatCheque(cheque) {
        return {
            id: cheque.ID,
            code: cheque.Code,
            type: cheque.Type,
            referenceType: cheque.ReferenceType,
            referenceId: cheque.ReferenceID,
            bankId: cheque.BankID,
            bank: cheque.Bank ? {
                id: cheque.Bank.ID,
                code: cheque.Bank.Code,
                name: cheque.Bank.Name,
            } : null,
            chequeNumber: cheque.ChequeNumber,
            chequeDate: cheque.ChequeDate,
            dueDate: cheque.DueDate,
            amount: Number(cheque.Amount),
            status: cheque.Status,
            clearedDate: cheque.ClearedDate,
            bouncedDate: cheque.BouncedDate,
            notes: cheque.Notes,
            createdAt: cheque.CreatedAt,
            updatedAt: cheque.UpdatedAt,
        };
    }
};
exports.ChequePaymentService = ChequePaymentService;
exports.ChequePaymentService = ChequePaymentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        auto_journal_service_1.AutoJournalService,
        sale_payment_service_1.SalePaymentService,
        purchase_payment_service_1.PurchasePaymentService])
], ChequePaymentService);
