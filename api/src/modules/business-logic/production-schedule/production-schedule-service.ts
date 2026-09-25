import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { resolveDateRange } from '../shared/date-range';
import { PrismaService } from '../../../common/prisma/prisma-service';
import { Prisma } from '@prisma/client'
import { number } from '../../../common/utils/number';
import { CreateProductionScheduleDto, UpDateProductionScheduleDto, ProductionScheduleFilterDto } from './production-schedule.dto';

@Injectable()
export class ProductionScheduleService {
  constructor(private prisma: PrismaService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // PRODUCTION SCHEDULE MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Create Production Schedule
   * Flow: Manager jadwalkan produksi → sistem buat Schedule dengan tanggal & Qty
   */
  async createSchedule(dto: CreateProductionScheduleDto, CreatedBy: string) {
    // Validate Product
    const Product = await this.prisma.product.findUnique({
      where: { ID: dto.ProductId },
    });

    if (!Product) {
      throw new NotFoundException(`Product ${dto.ProductId} not found`);
    }

    // generate Schedule Number
    const Schedulenumber = await this.generateScheduleNumber();

    const Schedule = await this.prisma.productionSchedule.create({
      data: {
        ProductID: dto.ProductId,
        ScheduledDate: new Date(dto.ScheduledDate),
        Quantity: new Prisma.Decimal(dto.Quantity),
        Status: dto.Status || 'SCHEDULED',
        Notes: dto.Notes ?? null,
        CreatedBy: CreatedBy,
      } as any,
    });

    return {
      success: true,
      Schedule: {
        ID: Schedule.ID,
        ScheduleNumber: Schedule.ProductionScheduleNumber,
        ProductId: Schedule.ProductID,
        ProductName: Product.Name,
        WarehouseId: Schedule.WarehouseID,
        ScheduledDate: Schedule.ScheduledDate,
        Quantity: number(Schedule.Quantity),
        Status: Schedule.Status,
        Notes: Schedule.Notes,
        createdBy: Schedule.CreatedBy,
        createdAt: Schedule.CreatedAt,
      },
    };
  }

  /**
   * Get Schedule by ID
   */
  async getSchedule(ID: number) {
    const Schedule = await this.prisma.productionSchedule.findUnique({
      where: { ID: ID },
      include: {
        Product: true,
        Warehouse: true,
      },
    });

    if (!Schedule) {
      throw new NotFoundException(`Schedule ${ID} not found`);
    }

    return {
      ID: Schedule.ID,
      ScheduleNumber: Schedule.ProductionScheduleNumber,
      ProductId: Schedule.ProductID,
      ProductName: Schedule.Product?.Name,
      ProductCode: Schedule.Product?.Code,
      WarehouseId: Schedule.WarehouseID,
      WarehouseName: Schedule.Warehouse?.Name,
      ScheduledDate: Schedule.ScheduledDate,
      Quantity: number(Schedule.Quantity),
      Status: Schedule.Status,
      Notes: Schedule.Notes,
      createdBy: Schedule.CreatedBy,
      createdAt: Schedule.CreatedAt,
      updatedAt: Schedule.UpdatedAt,
    };
  }

  /**
   * List Schedules
   */
  async listSchedules(dto: ProductionScheduleFilterDto) {
    const where: any = {};

    if (dto.ProductId) {
      where.ProductID = dto.ProductId;
    }

    if (dto.WarehouseId) {
      where.WarehouseID = dto.WarehouseId;
    }

    if (dto.Status) {
      where.Status = dto.Status.toUpperCase();
    }

    if (dto.StartDate || dto.EndDate) {
      where.ScheduledDate = {};
      if (dto.StartDate) {
        where.ScheduledDate.gte = new Date(dto.StartDate);
      }
      if (dto.EndDate) {
        where.ScheduledDate.lte = new Date(dto.EndDate);
      }
    }

    const Schedules = await this.prisma.productionSchedule.findMany({
      where,
      include: {
        Product: { select: { ID: true, Code: true, Name: true } },
        Warehouse: { select: { ID: true, Name: true } },
      },
      orderBy: { ScheduledDate: 'asc' },
    });

    return Schedules.map((s) => ({
      ID: s.ID,
      ScheduleNumber: s.ProductionScheduleNumber,
      ProductId: s.ProductID,
      ProductCode: s.Product?.Code,
      ProductName: s.Product?.Name,
      WarehouseId: s.WarehouseID,
      WarehouseName: s.Warehouse?.Name,
      ScheduledDate: s.ScheduledDate,
      Quantity: number(s.Quantity),
      Status: s.Status,
      Notes: s.Notes,
      createdAt: s.CreatedAt,
    }));
  }

  /**
   * UpDate Schedule
   */
  async updateSchedule(ID: number, dto: UpDateProductionScheduleDto, CreatedBy: string) {
    const Schedule = await this.prisma.productionSchedule.findUnique({
      where: { ID: ID },
    });

    if (!Schedule) {
      throw new NotFoundException(`Schedule ${ID} not found`);
    }

    if (Schedule.Status === 'COMPLETED' || Schedule.Status === 'CANCELLED') {
      throw new BadRequestException('Cannot update completed or cancelled Schedules');
    }

    const updated = await this.prisma.productionSchedule.update({
      where: { ID: ID },
      data: {
        ScheduledDate: dto.ScheduledDate ? new Date(dto.ScheduledDate) : undefined,
        Quantity: dto.Quantity ? new Prisma.Decimal(dto.Quantity) : undefined,
        Status: dto.Status,
        Notes: dto.Notes,
      },
    });

    return {
      success: true,
      Schedule: {
        ID: updated.ID,
        ScheduleNumber: updated.ProductionScheduleNumber,
        ScheduledDate: updated.ScheduledDate,
        Quantity: number(updated.Quantity),
        Status: updated.Status,
        Notes: updated.Notes,
      },
    };
  }

  /**
   * Get Schedule by Date range (calendar view)
   */
  async getCalendarView(startDate?: string, endDate?: string, WarehouseId?: number) {
    const { start, end } = resolveDateRange(startDate, endDate);
    const where: any = {
      ScheduledDate: {
        gte: start,
        lte: end,
      },
    };

    if (WarehouseId) {
      where.WarehouseID = Number(WarehouseId);
    }

    const Schedules = await this.prisma.productionSchedule.findMany({
      where,
      include: {
        Product: { select: { ID: true, Code: true, Name: true } },
        Warehouse: { select: { ID: true, Name: true } },
      },
      orderBy: { ScheduledDate: 'asc' },
    });

    // Group by Date
    const GroupedByDate: Record<string, any[]> = {};

    for (const Schedule of Schedules) {
      const DateKey = Schedule.ScheduledDate.toISOString().split('T')[0];
      if (!GroupedByDate[DateKey]) {
        GroupedByDate[DateKey] = [];
      }
      GroupedByDate[DateKey].push({
        ID: Schedule.ID,
        ScheduleNumber: Schedule.ProductionScheduleNumber,
        ProductCode: Schedule.Product?.Code,
        ProductName: Schedule.Product?.Name,
        WarehouseName: Schedule.Warehouse?.Name,
        Quantity: number(Schedule.Quantity),
        Status: Schedule.Status,
      });
    }

    return {
      startDate,
      endDate,
      TotalSchedules: Schedules.length,
      TotalQuantity: Schedules.reduce((sum, s) => sum + Number(s.Quantity), 0),
      GroupedByDate,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // HELPER METHODS
  // ─────────────────────────────────────────────────────────────────────────────

  private async generateScheduleNumber(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const prefix = `SCH-${year}${month}`;

    const lastSchedule = await this.prisma.productionSchedule.findFirst({
      where: { ProductionScheduleNumber: { startsWith: prefix } },
      orderBy: { ProductionScheduleNumber: 'desc' },
      select: { ProductionScheduleNumber: true },
    });

    let nextNumber = 1;
    if (lastSchedule) {
      const lastSeq = parseInt(lastSchedule.ProductionScheduleNumber.split('-').pop() || '0', 10);
      nextNumber = lastSeq + 1;
    }

    return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
  }
}
