import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma-service';
import { Prisma } from '@prisma/client';
import {
  CreateLeaveDto,
  UpdateLeaveDto,
  ApproveLeaveDto,
  RejectLeaveDto,
  LeaveFilterDto,
  LeaveBalanceDto,
  InitializeLeaveBalanceDto,
} from './Leave.dto';

@Injectable()
export class LeaveService {
  constructor(private prisma: PrismaService) {}

  async createLeave(dto: CreateLeaveDto, UserId: string) {
    const Employee = await this.prisma.employee.findUnique({
      where: { ID: dto.EmployeeId },
    });

    if (!Employee) {
      throw new NotFoundException('Employee not found');
    }

    const LeaveType = await this.prisma.leaveType.findUnique({
      where: { ID: dto.TypeId },
    });

    if (!LeaveType) {
      throw new NotFoundException('Leave Type not found');
    }

    const Code = await this.generateLeaveCode();

    const Leave = await this.prisma.leave.create({
      data: {
        Code: Code,
        EmployeeID: dto.EmployeeId,
        TypeID: dto.TypeId,
        StartDate: new Date(dto.StartDate),
        EndDate: new Date(dto.EndDate),
        TotalDays: dto.TotalDays,
        Reason: dto.Reason,
        Notes: dto.Notes,
        StatusID: 1, // Pending
      },
      include: {
        Employee: true,
        Type: true,
        Status: true,
      },
    });

    await this.prisma.activityLog.create({
      data: {
        Type: 'LEAVE_CREATED',
        Title: 'Leave Request Created',
        Description: `Leave ${Code} created for ${Employee.Name} (${dto.TotalDays} days)`,
        ReferenceType: 'LEAVE',
        ReferenceID: Leave.ID,
        CreatedByID: UserId,
      },
    });

    return {
      success: true,
      Leave: this.formatLeave(Leave),
    };
  }

  async updateLeave(LeaveId: number, dto: UpdateLeaveDto, UserId: string) {
    const Leave = await this.prisma.leave.findUnique({
      where: { ID: LeaveId },
    });

    if (!Leave) {
      throw new NotFoundException('Leave not found');
    }

    const pendingStatus = await this.prisma.leaveStatus.findFirst({
      where: { Code: 'PENDING' },
    });

    if (Leave.StatusID !== pendingStatus?.ID) {
      throw new BadRequestException('Can only update pending Leaves');
    }

    const updated = await this.prisma.leave.update({
      where: { ID: LeaveId },
      data: {
        StartDate: dto.StartDate ? new Date(dto.StartDate) : Leave.StartDate,
        EndDate: dto.EndDate ? new Date(dto.EndDate) : Leave.EndDate,
        TotalDays: dto.TotalDays || Leave.TotalDays,
        Reason: dto.Reason ?? Leave.Reason,
        Notes: dto.Notes ?? Leave.Notes,
      },
      include: {
        Employee: true,
        Type: true,
        Status: true,
      },
    });

    return {
      success: true,
      Leave: this.formatLeave(updated),
    };
  }

  async approveLeave(LeaveId: number, dto: ApproveLeaveDto, UserId: string) {
    const Leave = await this.prisma.leave.findUnique({
      where: { ID: LeaveId },
      include: { Employee: true, Type: true },
    });

    if (!Leave) {
      throw new NotFoundException('Leave not found');
    }

    const approvedStatus = await this.prisma.leaveStatus.findFirst({
      where: { Code: 'APPROVED' },
    });

    if (!approvedStatus) {
      throw new BadRequestException('Approved Status not found');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      // UpDate Leave Status
      const updatedLeave = await tx.leave.update({
        where: { ID: LeaveId },
        data: {
          StatusID: approvedStatus.ID,
          ApprovedByID: UserId,
          ApprovedAt: new Date(),
          Notes: dto.Notes,
        },
        include: { Employee: true, Type: true, Status: true },
      });

      // UpDate Leave Balance
      await tx.leaveBalance.updateMany({
        where: {
          EmployeeID: Leave.EmployeeID,
          Year: Leave.StartDate.getFullYear(),
          TypeID: Leave.TypeID,
        },
        data: {
          UsedDays: { increment: Leave.TotalDays },
          RemainingDays: { decrement: Leave.TotalDays },
        },
      });

      return updatedLeave;
    });

    await this.prisma.activityLog.create({
      data: {
        Type: 'LEAVE_APPROVED',
        Title: 'Leave Approved',
        Description: `Leave ${Leave.Code} approved for ${Leave.Employee.Name}`,
        ReferenceType: 'LEAVE',
        ReferenceID: Leave.ID,
        CreatedByID: UserId,
      },
    });

    return {
      success: true,
      Leave: this.formatLeave(updated),
    };
  }

  async rejectLeave(LeaveId: number, dto: RejectLeaveDto, UserId: string) {
    const Leave = await this.prisma.leave.findUnique({
      where: { ID: LeaveId },
      include: { Employee: true },
    });

    if (!Leave) {
      throw new NotFoundException('Leave not found');
    }

    const rejectedStatus = await this.prisma.leaveStatus.findFirst({
      where: { Code: 'REJECTED' },
    });

    if (!rejectedStatus) {
      throw new BadRequestException('Rejected Status not found');
    }

    const updated = await this.prisma.leave.update({
      where: { ID: LeaveId },
      data: {
        StatusID: rejectedStatus.ID,
        ApprovedByID: UserId,
        ApprovedAt: new Date(),
        RejectedReason: dto.Reason,
        Notes: dto.Notes,
      },
      include: { Employee: true, Type: true, Status: true },
    });

    return {
      success: true,
      Leave: this.formatLeave(updated),
    };
  }

  async getLeave(LeaveId: number) {
    const Leave = await this.prisma.leave.findUnique({
      where: { ID: LeaveId },
      include: {
        Employee: {
          include: {
            Department: true,
            Position: true,
          },
        },
        Type: true,
        Status: true,
        Approver: true,
      },
    });

    if (!Leave) {
      throw new NotFoundException('Leave not found');
    }

    return this.formatLeave(Leave);
  }

  async listLeaves(dto: LeaveFilterDto) {
    const where: any = {};

    if (dto.EmployeeId) {
      where.EmployeeID = dto.EmployeeId;
    }

    if (dto.TypeId) {
      where.TypeID = dto.TypeId;
    }

    if (dto.StatusId) {
      where.StatusID = dto.StatusId;
    }

    if (dto.StartDate || dto.EndDate) {
      where.StartDate = {};
      if (dto.StartDate) {
        where.StartDate.gte = new Date(dto.StartDate);
      }
      if (dto.EndDate) {
        where.StartDate.lte = new Date(dto.EndDate);
      }
    }

    const page = dto.Page || 1;
    const limit = dto.Limit || 20;
    const skip = (page - 1) * limit;

    const [Leaves, Total] = await Promise.all([
      this.prisma.leave.findMany({
        where,
        include: {
          Employee: true,
          Type: true,
          Status: true,
        },
        orderBy: { StartDate: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.leave.count({ where }),
    ]);

    return {
      data: Leaves.map((l) => this.formatLeave(l)),
      pagination: {
        page,
        limit,
        Total,
        TotalPages: Math.ceil(Total / limit),
      },
    };
  }

  async getLeaveBalances(dto: LeaveBalanceDto) {
    const Employee = await this.prisma.employee.findUnique({
      where: { ID: dto.EmployeeId },
    });

    if (!Employee) {
      throw new NotFoundException('Employee not found');
    }

    const Balances = await this.prisma.leaveBalance.findMany({
      where: {
        EmployeeID: dto.EmployeeId,
        Year: dto.Year,
      },
      include: {
        Type: true,
      },
    });

    const LeaveTypes = await this.prisma.leaveType.findMany({
      where: { IsActive: true },
    });

    return {
      Employee: {
        ID: Employee.ID,
        Code: Employee.Code,
        Name: Employee.Name,
      },
      year: dto.Year,
      Balances: Balances.map((b) => ({
        ID: b.ID,
        TypeId: b.TypeID,
        TypeName: b.Type?.Name,
        TotalDays: b.TotalDays,
        usedDays: b.UsedDays,
        remainingDays: b.RemainingDays,
      })),
      uninitializedTypes: LeaveTypes
        .filter((t) => !Balances.find((b) => b.TypeID === t.ID))
        .map((t) => ({
          ID: t.ID,
          Name: t.Name,
          DefaultDays: t.DefaultDays,
        })),
    };
  }

  async initializeLeaveBalances(dto: InitializeLeaveBalanceDto, UserId: string) {
    const Employee = await this.prisma.employee.findUnique({
      where: { ID: dto.EmployeeId },
    });

    if (!Employee) {
      throw new NotFoundException('Employee not found');
    }

    await this.prisma.leaveBalance.createMany({
      data: dto.Balances.map((b) => ({
        EmployeeID: dto.EmployeeId,
        Year: dto.Year,
        TypeID: b.TypeId,
        TotalDays: b.TotalDays,
        UsedDays: 0,
        RemainingDays: b.TotalDays,
      })),
      skipDuplicates: true,
    });

    return {
      success: true,
      message: 'Leave Balances initialized',
    };
  }

  async getLeaveTypes() {
    const Types = await this.prisma.leaveType.findMany({
      where: { IsActive: true },
      orderBy: { SortOrder: 'asc' },
    });

    return Types.map((t) => ({
      ID: t.ID,
      Code: t.Code,
      Name: t.Name,
      Description: t.Description,
      IsPaidLeave: t.IsPaidLeave,
      DefaultDays: t.DefaultDays,
      color: t.Color,
    }));
  }

  async getLeaveStatuses() {
    const Statuses = await this.prisma.leaveStatus.findMany({
      where: { IsActive: true },
      orderBy: { SortOrder: 'asc' },
    });

    return Statuses.map((s) => ({
      ID: s.ID,
      Code: s.Code,
      Name: s.Name,
      color: s.Color,
      requiresApproval: s.RequiresApproval,
      IsTerminal: s.IsTerminal,
    }));
  }

  private async generateLeaveCode(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const prefix = `LEAVE-${year}${month}`;

    const lastLeave = await this.prisma.leave.findFirst({
      where: { Code: { startsWith: prefix } },
      orderBy: { Code: 'desc' },
      select: { Code: true },
    });

    let nextNumber = 1;
    if (lastLeave) {
      const lastSeq = parseInt(lastLeave.Code.split('-').pop() || '0', 10);
      nextNumber = lastSeq + 1;
    }

    return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
  }

  private formatLeave(Leave: any) {
    return {
      ID: Leave.ID,
      Code: Leave.Code,
      EmployeeId: Leave.EmployeeID,
      EmployeeName: Leave.Employee?.Name,
      EmployeeCode: Leave.Employee?.Code,
      TypeId: Leave.TypeID,
      LeaveType: Leave.Type?.Name,
      startDate: Leave.StartDate,
      endDate: Leave.EndDate,
      TotalDays: Leave.TotalDays,
      reason: Leave.Reason,
      StatusId: Leave.StatusID,
      Status: Leave.Status
        ? { ID: Leave.Status.ID, Code: Leave.Status.Code, Name: Leave.Status.Name, color: Leave.Status.Color }
        : null,
      approvedBy: Leave.Approver?.Name,
      approvedAt: Leave.ApprovedAt,
      rejectedReason: Leave.RejectedReason,
      Notes: Leave.Notes,
      createdAt: Leave.CreatedAt,
    };
  }
}
