import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma-service';
import { Prisma } from '@prisma/client';
import {
  CreateChequePaymentDto,
  UpdateChequePaymentDto,
  ClearChequeDto,
  BounceChequeDto,
  ChequePaymentFilterDto,
} from './dto/cheque-payment.dto';

@Injectable()
export class ChequePaymentService {
  constructor(private prisma: PrismaService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // CREATE
  // ─────────────────────────────────────────────────────────────────────────────

  async create(dto: CreateChequePaymentDto, userId: string) {
    // Generate code
    const code = await this.generateCode(dto.Type);

    // Validate bank if provided
    if (dto.BankId) {
      const bank = await this.prisma.bank.findUnique({ where: { ID: dto.BankId } });
      if (!bank) throw new NotFoundException('Bank not found');
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
        Amount: new Prisma.Decimal(dto.Amount),
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

  // ─────────────────────────────────────────────────────────────────────────────
  // READ
  // ─────────────────────────────────────────────────────────────────────────────

  async findAll(dto: ChequePaymentFilterDto) {
    const where: any = {};

    if (dto.Type) where.Type = dto.Type;
    if (dto.Status) where.Status = dto.Status;
    if (dto.BankId) where.BankID = dto.BankId;

    if (dto.StartDate || dto.EndDate) {
      where.ChequeDate = {};
      if (dto.StartDate) where.ChequeDate.gte = new Date(dto.StartDate);
      if (dto.EndDate) where.ChequeDate.lte = new Date(dto.EndDate);
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

  async findById(id: number) {
    const cheque = await this.prisma.chequePayment.findUnique({
      where: { ID: id },
      include: { Bank: true },
    });

    if (!cheque) throw new NotFoundException('Cheque payment not found');

    return this.formatCheque(cheque);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // UPDATE
  // ─────────────────────────────────────────────────────────────────────────────

  async update(id: number, dto: UpdateChequePaymentDto) {
    const cheque = await this.prisma.chequePayment.findUnique({ where: { ID: id } });
    if (!cheque) throw new NotFoundException('Cheque payment not found');

    if (cheque.Status !== 'PENDING') {
      throw new BadRequestException('Only PENDING cheques can be updated');
    }

    const updated = await this.prisma.chequePayment.update({
      where: { ID: id },
      data: {
        BankID: dto.BankId,
        ChequeNumber: dto.ChequeNumber,
        DueDate: dto.DueDate ? new Date(dto.DueDate) : undefined,
        Notes: dto.Notes,
      },
      include: { Bank: true },
    });

    return {
      success: true,
      cheque: this.formatCheque(updated),
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // STATUS CHANGES
  // ─────────────────────────────────────────────────────────────────────────────

  async clearCheque(id: number, dto: ClearChequeDto, userId: string) {
    const cheque = await this.prisma.chequePayment.findUnique({ where: { ID: id } });
    if (!cheque) throw new NotFoundException('Cheque payment not found');

    if (cheque.Status !== 'PENDING') {
      throw new BadRequestException(`Cannot clear cheque with status ${cheque.Status}`);
    }

    const clearedDate = dto.ClearedDate ? new Date(dto.ClearedDate) : new Date();

    const updated = await this.prisma.chequePayment.update({
      where: { ID: id },
      data: {
        Status: 'CLEARED',
        ClearedDate: clearedDate,
        Notes: dto.Notes ? `${cheque.Notes || ''}\n${dto.Notes}` : cheque.Notes,
      },
      include: { Bank: true },
    });

    // Create journal entry for cleared cheque
    await this.createClearedJournalEntry(updated, userId);

    return {
      success: true,
      message: 'Cheque cleared successfully',
      cheque: this.formatCheque(updated),
    };
  }

  async bounceCheque(id: number, dto: BounceChequeDto, userId: string) {
    const cheque = await this.prisma.chequePayment.findUnique({ where: { ID: id } });
    if (!cheque) throw new NotFoundException('Cheque payment not found');

    if (cheque.Status !== 'PENDING') {
      throw new BadRequestException(`Cannot bounce cheque with status ${cheque.Status}`);
    }

    const bouncedDate = dto.BouncedDate ? new Date(dto.BouncedDate) : new Date();

    const updated = await this.prisma.chequePayment.update({
      where: { ID: id },
      data: {
        Status: 'BOUNCED',
        BouncedDate: bouncedDate,
        Notes: `${cheque.Notes || ''}\n[Bounced] ${dto.Reason}`,
      },
      include: { Bank: true },
    });

    // Create reversal journal entry for bounced cheque
    await this.createBouncedJournalEntry(updated, userId, dto.Reason);

    return {
      success: true,
      message: 'Cheque bounced successfully',
      cheque: this.formatCheque(updated),
    };
  }

  async cancelCheque(id: number, reason: string, userId: string) {
    const cheque = await this.prisma.chequePayment.findUnique({ where: { ID: id } });
    if (!cheque) throw new NotFoundException('Cheque payment not found');

    if (cheque.Status !== 'PENDING') {
      throw new BadRequestException(`Cannot cancel cheque with status ${cheque.Status}`);
    }

    const updated = await this.prisma.chequePayment.update({
      where: { ID: id },
      data: {
        Status: 'CANCELLED',
        Notes: `${cheque.Notes || ''}\n[Cancelled] ${reason}`,
      },
      include: { Bank: true },
    });

    return {
      success: true,
      message: 'Cheque cancelled successfully',
      cheque: this.formatCheque(updated),
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // DELETE
  // ─────────────────────────────────────────────────────────────────────────────

  async delete(id: number) {
    const cheque = await this.prisma.chequePayment.findUnique({ where: { ID: id } });
    if (!cheque) throw new NotFoundException('Cheque payment not found');

    if (cheque.Status !== 'PENDING') {
      throw new BadRequestException('Only PENDING cheques can be deleted');
    }

    await this.prisma.chequePayment.delete({ where: { ID: id } });

    return {
      success: true,
      message: 'Cheque payment deleted successfully',
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────────────────────────────────────

  private async generateCode(type: string): Promise<string> {
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

  private formatCheque(cheque: any) {
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

  private async createClearedJournalEntry(cheque: any, userId: string) {
    // Get account settings
    const bankAccountSetting = await this.prisma.accountSetting.findUnique({
      where: { Key: 'bank' },
    });

    if (!bankAccountSetting?.AccountID) return; // Skip if no account configured

    const journalNumber = await this.generateJournalNumber();
    const amount = Number(cheque.Amount);

    await this.prisma.journalEntry.create({
      data: {
        JournalNumber: journalNumber,
        Date: cheque.ClearedDate || new Date(),
        Reference: cheque.Code,
        Description: `Cleared Cheque - ${cheque.ChequeNumber} - ${cheque.Type}`,
        SourceDocumentType: 'CHEQUE_PAYMENT',
        SourceDocumentID: cheque.ID,
        TotalDebit: new Prisma.Decimal(amount),
        TotalCredit: new Prisma.Decimal(amount),
        CreatedByID: userId,
        Lines: {
          create: [
            {
              AccountID: bankAccountSetting.AccountID,
              DebitCredit: 'DEBIT',
              Amount: new Prisma.Decimal(amount),
              Description: `Receive from cheque ${cheque.ChequeNumber}`,
              LineNumber: 1,
            },
            {
              AccountID: bankAccountSetting.AccountID, // Placeholder - should be customer/supplier receivable
              DebitCredit: 'KREDIT',
              Amount: new Prisma.Decimal(amount),
              Description: `Cheque ${cheque.ChequeNumber} cleared`,
              LineNumber: 2,
            },
          ],
        },
      },
    });
  }

  private async createBouncedJournalEntry(cheque: any, userId: string, reason: string) {
    const journalNumber = await this.generateJournalNumber();
    const amount = Number(cheque.Amount);

    await this.prisma.journalEntry.create({
      data: {
        JournalNumber: journalNumber,
        Date: cheque.BouncedDate || new Date(),
        Reference: cheque.Code,
        Description: `Bounced Cheque - ${cheque.ChequeNumber} - ${reason}`,
        SourceDocumentType: 'CHEQUE_PAYMENT',
        SourceDocumentID: cheque.ID,
        TotalDebit: new Prisma.Decimal(amount),
        TotalCredit: new Prisma.Decimal(amount),
        CreatedByID: userId,
        Lines: {
          create: [
            {
              AccountID: 0, // Should be customer/supplier payable
              DebitCredit: 'DEBIT',
              Amount: new Prisma.Decimal(amount),
              Description: `Cheque ${cheque.ChequeNumber} bounced - ${reason}`,
              LineNumber: 1,
            },
            {
              AccountID: 0, // Bank account
              DebitCredit: 'KREDIT',
              Amount: new Prisma.Decimal(amount),
              Description: `Cheque ${cheque.ChequeNumber} bounced`,
              LineNumber: 2,
            },
          ],
        },
      },
    });
  }

  private async generateJournalNumber(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const prefix = `JE-${year}${month}`;

    const lastEntry = await this.prisma.journalEntry.findFirst({
      where: { JournalNumber: { startsWith: prefix } },
      orderBy: { JournalNumber: 'desc' },
      select: { JournalNumber: true },
    });

    let nextNumber = 1;
    if (lastEntry) {
      const lastSeq = parseInt(lastEntry.JournalNumber.split('-').pop() || '0', 10);
      nextNumber = lastSeq + 1;
    }

    return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
  }
}
