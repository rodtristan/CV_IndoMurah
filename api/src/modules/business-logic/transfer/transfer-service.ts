import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma-service';
import { Prisma } from '@prisma/client'
import { number } from '../../../common/utils/number';
import {
  CreateTransferDto,
  TransferFilterDto,
  TransferSummaryDto,
} from './Transfer.dto';

@Injectable()
export class TransferService {
  constructor(private prisma: PrismaService) {}

  async createTransfer(dto: CreateTransferDto, UserId: string) {
    // Validate based on Transfer Type
    const isCashTransfer = dto.FromAccountId && dto.ToAccountId;
    const isWarehouseTransfer = dto.FromWarehouseId && dto.ToWarehouseId;

    if (!isCashTransfer && !isWarehouseTransfer) {
      throw new BadRequestException(
        'Transfer must specify either account IDs (Cash Transfer) or Warehouse IDs (Stock Transfer)',
      );
    }

    // Validate Accounts if Cash Transfer
    if (isCashTransfer) {
      const [fromAccount, toAccount] = await Promise.all([
        this.prisma.account.findUnique({ where: { ID: dto.FromAccountId } }),
        this.prisma.account.findUnique({ where: { ID: dto.ToAccountId } }),
      ]);

      if (!fromAccount) {
        throw new NotFoundException('From account not found');
      }

      if (!toAccount) {
        throw new NotFoundException('To account not found');
      }
    }

    // Validate Warehouses if Warehouse Transfer
    if (isWarehouseTransfer) {
      const [fromWarehouse, toWarehouse] = await Promise.all([
        this.prisma.warehouse.findUnique({ where: { ID: dto.FromWarehouseId } }),
        this.prisma.warehouse.findUnique({ where: { ID: dto.ToWarehouseId } }),
      ]);

      if (!fromWarehouse) {
        throw new NotFoundException('From Warehouse not found');
      }

      if (!toWarehouse) {
        throw new NotFoundException('To Warehouse not found');
      }

      if (fromWarehouse.ID === toWarehouse.ID) {
        throw new BadRequestException('Cannot Transfer to the same Warehouse');
      }
    }

    // Get completed Status
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
        Amount: new Prisma.Decimal(dto.Amount),
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
        Amount: new Prisma.Decimal(dto.Amount),
        CreatedByID: UserId,
      },
    });

    return {
      success: true,
      Transfer: await this.formatTransfer(Transfer.ID),
    };
  }

  async getTransfer(TransferId: number) {
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
      throw new NotFoundException('Transfer not found');
    }

    return this.formatTransfer(Transfer);
  }

  async listTransfers(dto: TransferFilterDto) {
    const where: any = {};

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

  async deleteTransfer(TransferId: number) {
    const Transfer = await this.prisma.transfer.findUnique({
      where: { ID: TransferId },
    });

    if (!Transfer) {
      throw new NotFoundException('Transfer not found');
    }

    await this.prisma.transfer.delete({
      where: { ID: TransferId },
    });

    return { success: true, message: 'Transfer deleted' };
  }

  async getTransferSummary(dto: TransferSummaryDto) {
    const where: any = {};

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

  private async formatTransfer(transfer: any) {
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
      throw new NotFoundException('Transfer not found');
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
      Amount: number(fullTransfer.Amount),
      Description: fullTransfer.Description,
      Notes: fullTransfer.Notes,
      Status: fullTransfer.Status
        ? { ID: fullTransfer.Status.ID, Code: fullTransfer.Status.Code, Name: fullTransfer.Status.Name, color: fullTransfer.Status.Color }
        : null,
      createdAt: fullTransfer.CreatedAt,
    };
  }
}
