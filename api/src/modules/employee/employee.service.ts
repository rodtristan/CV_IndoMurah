
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma-service';
import { RedisService } from '../../common/redis/redis-service';
import { QueryService } from '../../common/query/query-service';
import { BaseService } from '../../common/templates/base.service';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto/employee.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class EmployeeService extends BaseService<
  any,
  CreateEmployeeDto,
  UpdateEmployeeDto
> {
  constructor(
    readonly prisma: PrismaService,
    readonly redis: RedisService,
    readonly queryService: QueryService,
  ) {
    super(prisma, redis, queryService, {
      modelName: 'employee',
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
    const status = await this.prisma.employeeStatus.findUnique({
      where: { Code: statusCode || fallbackCode },
    });
    if (!status) throw new BadRequestException(`Status karyawan '${statusCode || fallbackCode}' tidak ditemukan`);
    return status.ID;
  }

  async createEmployee(dto: CreateEmployeeDto): Promise<any> {
    const statusId = await this.resolveStatusId(dto.statusCode, 'ACTIVE');

    const result = await this.prisma.employee.create({
      data: {
        Code: dto.code,
        Name: dto.name,
        DepartmentID: dto.departmentId,
        PositionID: dto.positionId,
        JoinDate: dto.joinDate ? new Date(dto.joinDate) : undefined,
        EndDate: dto.endDate ? new Date(dto.endDate) : undefined,
        BirthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
        Gender: dto.gender,
        Phone: dto.phone,
        Email: dto.email,
        Address: dto.address,
        EmergencyContact: dto.emergencyContact,
        EmergencyPhone: dto.emergencyPhone,
        BasicSalary: new Prisma.Decimal(dto.basicSalary || 0),
        StatusID: statusId,
      },
      include: { Department: true, Position: true, Status: true },
    });

    await this.invalidateCache();
    return result;
  }

  async updateEmployee(id: number, dto: UpdateEmployeeDto): Promise<any> {
    const data: Record<string, unknown> = {};
    if (dto.code !== undefined) data.Code = dto.code;
    if (dto.name !== undefined) data.Name = dto.name;
    if (dto.departmentId !== undefined) data.DepartmentID = dto.departmentId;
    if (dto.positionId !== undefined) data.PositionID = dto.positionId;
    if (dto.joinDate !== undefined) data.JoinDate = dto.joinDate ? new Date(dto.joinDate) : null;
    if (dto.endDate !== undefined) data.EndDate = dto.endDate ? new Date(dto.endDate) : null;
    if (dto.birthDate !== undefined) data.BirthDate = dto.birthDate ? new Date(dto.birthDate) : null;
    if (dto.gender !== undefined) data.Gender = dto.gender;
    if (dto.phone !== undefined) data.Phone = dto.phone;
    if (dto.email !== undefined) data.Email = dto.email;
    if (dto.address !== undefined) data.Address = dto.address;
    if (dto.emergencyContact !== undefined) data.EmergencyContact = dto.emergencyContact;
    if (dto.emergencyPhone !== undefined) data.EmergencyPhone = dto.emergencyPhone;
    if (dto.basicSalary !== undefined) data.BasicSalary = new Prisma.Decimal(dto.basicSalary);
    if (dto.statusCode !== undefined) data.StatusID = await this.resolveStatusId(dto.statusCode, 'ACTIVE');
    if (dto.isActive !== undefined) data.IsActive = dto.isActive;

    const result = await this.prisma.employee.update({
      where: { ID: id },
      data,
      include: { Department: true, Position: true, Status: true },
    });

    await this.invalidateCache();
    await this.invalidateItemCache(id);
    return result;
  }
}
