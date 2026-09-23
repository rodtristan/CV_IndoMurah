
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma-service';
import { RedisService } from '../../common/redis/redis-service';
import { QueryService } from '../../common/query/query-service';
import { BaseService } from '../../common/templates/base.service';
import { CreateAttendanceDto, UpdateAttendanceDto } from './dto/attendance.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class AttendanceService extends BaseService<
  any,
  CreateAttendanceDto,
  UpdateAttendanceDto
> {
  constructor(
    readonly prisma: PrismaService,
    readonly redis: RedisService,
    readonly queryService: QueryService,
  ) {
    super(prisma, redis, queryService, {
      modelName: 'attendance',
      primaryKey: 'ID',
      searchableFields: ['*'],
      allowedIncludes: ['*'],
      allowedSortFields: ['*'],
      allowedSelectFields: ['*'],
      defaultOrderBy: { CreatedAt: 'desc' },
      maxTake: 100,
      defaultTake: 20,
      cacheTtl: 60,
      softDelete: true,
      softDeleteField: 'IsActive',
    });
  }

  // ═══════════════════════════════════════════════════════════════════
  // BUSINESS LOGIC METHODS
  // ═══════════════════════════════════════════════════════════════════

  private async resolveStatusId(statusCode: string | undefined, fallbackCode: string): Promise<number> {
    const status = await this.prisma.attendanceStatus.findUnique({
      where: { Code: statusCode || fallbackCode },
    });
    if (!status) throw new BadRequestException(`Status kehadiran '${statusCode || fallbackCode}' tidak ditemukan`);
    return status.ID;
  }

  async createAttendance(dto: CreateAttendanceDto): Promise<any> {
    const statusId = await this.resolveStatusId(dto.statusCode, 'PRESENT');

    const result = await this.prisma.attendance.create({
      data: {
        Employee: { connect: { ID: dto.employeeId } },
        Date: new Date(dto.date),
        CheckIn: dto.checkIn ? new Date(dto.checkIn) : undefined,
        CheckInLatitude: dto.checkInLatitude != null ? new Prisma.Decimal(dto.checkInLatitude) : undefined,
        CheckInLongitude: dto.checkInLongitude != null ? new Prisma.Decimal(dto.checkInLongitude) : undefined,
        CheckOut: dto.checkOut ? new Date(dto.checkOut) : undefined,
        CheckOutLatitude: dto.checkOutLatitude != null ? new Prisma.Decimal(dto.checkOutLatitude) : undefined,
        CheckOutLongitude: dto.checkOutLongitude != null ? new Prisma.Decimal(dto.checkOutLongitude) : undefined,
        Status: { connect: { ID: statusId } },
        Notes: dto.notes,
      },
      include: { Employee: true, Status: true },
    });

    await this.invalidateCache();
    return result;
  }

  async updateAttendance(id: number, dto: UpdateAttendanceDto): Promise<any> {
    const data: Record<string, unknown> = {};
    if (dto.employeeId !== undefined) data.Employee = { connect: { ID: dto.employeeId } };
    if (dto.date !== undefined) data.Date = new Date(dto.date);
    if (dto.checkIn !== undefined) data.CheckIn = dto.checkIn ? new Date(dto.checkIn) : null;
    if (dto.checkInLatitude !== undefined) data.CheckInLatitude = dto.checkInLatitude != null ? new Prisma.Decimal(dto.checkInLatitude) : null;
    if (dto.checkInLongitude !== undefined) data.CheckInLongitude = dto.checkInLongitude != null ? new Prisma.Decimal(dto.checkInLongitude) : null;
    if (dto.checkOut !== undefined) data.CheckOut = dto.checkOut ? new Date(dto.checkOut) : null;
    if (dto.checkOutLatitude !== undefined) data.CheckOutLatitude = dto.checkOutLatitude != null ? new Prisma.Decimal(dto.checkOutLatitude) : null;
    if (dto.checkOutLongitude !== undefined) data.CheckOutLongitude = dto.checkOutLongitude != null ? new Prisma.Decimal(dto.checkOutLongitude) : null;
    if (dto.statusCode !== undefined) data.Status = { connect: { ID: await this.resolveStatusId(dto.statusCode, 'PRESENT') } };
    if (dto.notes !== undefined) data.Notes = dto.notes;
    if (dto.isActive !== undefined) data.IsActive = dto.isActive;

    const result = await this.prisma.attendance.update({
      where: { ID: id },
      data,
      include: { Employee: true, Status: true },
    });

    await this.invalidateCache();
    await this.invalidateItemCache(id);
    return result;
  }
}
