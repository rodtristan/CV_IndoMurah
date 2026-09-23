import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma-service';
import { Prisma } from '@prisma/client'
import { number } from '../../../common/utils/number';
import {
  CreatePayrollDto,
  UpdatePayrollDto,
  PayrollFilterDto,
  PaymentPayrollDto,
  PayrollSummaryDto,
} from './Payroll.dto';

@Injectable()
export class PayrollService {
  constructor(private prisma: PrismaService) {}

  async createPayroll(dto: CreatePayrollDto, UserId: string) {
    const Employee = await this.prisma.employee.findUnique({
      where: { ID: dto.EmployeeId },
    });

    if (!Employee) {
      throw new NotFoundException('Employee not found');
    }

    // Check if Payroll already exists for this period
    const existing = await this.prisma.payroll.findFirst({
      where: {
        EmployeeID: dto.EmployeeId,
        Period: dto.Period,
      },
    });

    if (existing) {
      throw new BadRequestException(`Payroll already exists for Employee in period ${dto.Period}`);
    }

    const Code = await this.generatePayrollCode();

    const allowances = dto.Allowances || 0;
    const deductions = dto.Deductions || 0;
    const overtimePay = dto.OvertimePay || 0;
    const TotalSalary = Number(Employee.BasicSalary) + allowances + overtimePay - deductions;

    const Payroll = await this.prisma.payroll.create({
      data: {
        Code: Code,
        EmployeeID: dto.EmployeeId,
        Period: dto.Period,
        BasicSalary: new Prisma.Decimal(dto.BasicSalary),
        Allowances: new Prisma.Decimal(allowances),
        Deductions: new Prisma.Decimal(deductions),
        OvertimePay: new Prisma.Decimal(overtimePay),
        TotalSalary: new Prisma.Decimal(TotalSalary),
        Notes: dto.Notes,
      },
      include: {
        Employee: true,
      },
    });

    await this.prisma.activityLog.create({
      data: {
        Type: 'PAYROLL_CREATED',
        Title: 'Payroll Created',
        Description: `Payroll ${Code} created for ${Employee.Name} (${dto.Period})`,
        ReferenceType: 'PAYROLL',
        ReferenceID: Payroll.ID,
        Amount: new Prisma.Decimal(TotalSalary),
        CreatedByID: UserId,
      },
    });

    return {
      success: true,
      Payroll: this.formatPayroll(Payroll),
    };
  }

  async updatePayroll(PayrollId: number, dto: UpdatePayrollDto, UserId: string) {
    const Payroll = await this.prisma.payroll.findUnique({
      where: { ID: PayrollId },
      include: { Employee: true },
    });

    if (!Payroll) {
      throw new NotFoundException('Payroll not found');
    }

    if (Payroll.IsPaid) {
      throw new BadRequestException('Cannot update paid Payroll');
    }

    const allowances = dto.Allowances ?? Number(Payroll.Allowances);
    const deductions = dto.Deductions ?? Number(Payroll.Deductions);
    const overtimePay = dto.OvertimePay ?? Number(Payroll.OvertimePay);
    const TotalSalary = Number(Payroll.BasicSalary) + allowances + overtimePay - deductions;

    const updated = await this.prisma.payroll.update({
      where: { ID: PayrollId },
      data: {
        Allowances: new Prisma.Decimal(allowances),
        Deductions: new Prisma.Decimal(deductions),
        OvertimePay: new Prisma.Decimal(overtimePay),
        TotalSalary: new Prisma.Decimal(TotalSalary),
        Notes: dto.Notes ?? Payroll.Notes,
      },
      include: { Employee: true },
    });

    return {
      success: true,
      Payroll: this.formatPayroll(updated),
    };
  }

  async getPayroll(PayrollId: number) {
    const Payroll = await this.prisma.payroll.findUnique({
      where: { ID: PayrollId },
      include: {
        Employee: {
          include: {
            Department: true,
            Position: true,
          },
        },
      },
    });

    if (!Payroll) {
      throw new NotFoundException('Payroll not found');
    }

    return this.formatPayroll(Payroll);
  }

  async listPayrolls(dto: PayrollFilterDto) {
    const where: any = {};

    if (dto.EmployeeId) {
      where.EmployeeID = dto.EmployeeId;
    }

    if (dto.Period) {
      where.Period = dto.Period;
    }

    if (dto.UnpaidOnly) {
      where.IsPaid = false;
    }

    const page = dto.Page || 1;
    const limit = dto.Limit || 20;
    const skip = (page - 1) * limit;

    const [Payrolls, Total] = await Promise.all([
      this.prisma.payroll.findMany({
        where,
        include: {
          Employee: {
            include: {
              Department: true,
              Position: true,
            },
          },
        },
        orderBy: [{ Period: 'desc' }, { Employee: { Name: 'asc' } }],
        skip,
        take: limit,
      }),
      this.prisma.payroll.count({ where }),
    ]);

    return {
      data: Payrolls.map((p) => this.formatPayroll(p)),
      pagination: {
        page,
        limit,
        Total,
        TotalPages: Math.ceil(Total / limit),
      },
    };
  }

  async deletePayroll(PayrollId: number) {
    const Payroll = await this.prisma.payroll.findUnique({
      where: { ID: PayrollId },
    });

    if (!Payroll) {
      throw new NotFoundException('Payroll not found');
    }

    if (Payroll.IsPaid) {
      throw new BadRequestException('Cannot delete paid Payroll');
    }

    await this.prisma.payroll.delete({
      where: { ID: PayrollId },
    });

    return { success: true, message: 'Payroll deleted' };
  }

  async paymentPayroll(dto: PaymentPayrollDto, UserId: string) {
    const Payroll = await this.prisma.payroll.findUnique({
      where: { ID: dto.PayrollId },
      include: { Employee: true },
    });

    if (!Payroll) {
      throw new NotFoundException('Payroll not found');
    }

    if (Payroll.IsPaid) {
      throw new BadRequestException('Payroll already paid');
    }

    const updated = await this.prisma.payroll.update({
      where: { ID: dto.PayrollId },
      data: {
        IsPaid: true,
        PaymentDate: dto.PaymentDate ? new Date(dto.PaymentDate) : new Date(),
      },
      include: { Employee: true },
    });

    await this.prisma.activityLog.create({
      data: {
        Type: 'PAYROLL_PAID',
        Title: 'Payroll PaID',
        Description: `Payroll ${Payroll.Code} paid to ${Payroll.Employee.Name}`,
        ReferenceType: 'PAYROLL',
        ReferenceID: Payroll.ID,
        Amount: new Prisma.Decimal(Number(Payroll.TotalSalary)),
        CreatedByID: UserId,
      },
    });

    return {
      success: true,
      Payroll: this.formatPayroll(updated),
    };
  }

  async getPayrollSummary(dto: PayrollSummaryDto) {
    const Payrolls = await this.prisma.payroll.findMany({
      where: { Period: dto.Period },
      include: { Employee: true },
    });

    const unpaid = Payrolls.filter((p) => !p.IsPaid);
    const paid = Payrolls.filter((p) => p.IsPaid);

    return {
      period: dto.Period,
      TotalEmployees: Payrolls.length,
      paidEmployees: paid.length,
      unpaidEmployees: unpaid.length,
      TotalPayroll: Payrolls.reduce((sum, p) => sum + Number(p.TotalSalary), 0),
      TotalPaid: paid.reduce((sum, p) => sum + Number(p.TotalSalary), 0),
      TotalUnPaid: unpaid.reduce((sum, p) => sum + Number(p.TotalSalary), 0),
    };
  }

  async getEmployeePayrollHistory(EmployeeId: number) {
    const Employee = await this.prisma.employee.findUnique({
      where: { ID: EmployeeId },
    });

    if (!Employee) {
      throw new NotFoundException('Employee not found');
    }

    const Payrolls = await this.prisma.payroll.findMany({
      where: { EmployeeID: EmployeeId },
      orderBy: { Period: 'desc' },
    });

    const TotalPaid = Payrolls
      .filter((p) => p.IsPaid)
      .reduce((sum, p) => sum + Number(p.TotalSalary), 0);

    const TotalUnpaid = Payrolls
      .filter((p) => !p.IsPaid)
      .reduce((sum, p) => sum + Number(p.TotalSalary), 0);

    return {
      Employee: {
        ID: Employee.ID,
        Code: Employee.Code,
        Name: Employee.Name,
        basicSalary: number(Employee.BasicSalary),
      },
      TotalPayrolls: Payrolls.length,
      TotalPaid,
      TotalUnpaid,
      Payrolls: Payrolls.map((p) => this.formatPayroll(p)),
    };
  }

  private async generatePayrollCode(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const prefix = `PAY-${year}${month}`;

    const lastPayroll = await this.prisma.payroll.findFirst({
      where: { Code: { startsWith: prefix } },
      orderBy: { Code: 'desc' },
      select: { Code: true },
    });

    let nextNumber = 1;
    if (lastPayroll) {
      const lastSeq = parseInt(lastPayroll.Code.split('-').pop() || '0', 10);
      nextNumber = lastSeq + 1;
    }

    return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
  }

  private formatPayroll(Payroll: any) {
    return {
      ID: Payroll.ID,
      Code: Payroll.Code,
      EmployeeId: Payroll.EmployeeID,
      EmployeeName: Payroll.Employee?.Name,
      EmployeeCode: Payroll.Employee?.Code,
      Department: Payroll.Employee?.Department?.Name,
      Position: Payroll.Employee?.Position?.Name,
      period: Payroll.Period,
      basicSalary: number(Payroll.BasicSalary),
      allowances: number(Payroll.Allowances),
      deductions: number(Payroll.Deductions),
      overtimePay: number(Payroll.OvertimePay),
      TotalSalary: number(Payroll.TotalSalary),
      IsPaid: Payroll.IsPaid,
      PaymentDate: Payroll.PaymentDate,
      Notes: Payroll.Notes,
      createdAt: Payroll.CreatedAt,
    };
  }
}
