import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma-service';
import { PayrollSummaryReportDto } from './reports.dto';

@Injectable()
export class ReportsServiceExtensions {
  constructor(private prisma: PrismaService) {}

  /**
   * Get payroll summary report
   */
  async getPayrollSummary(dto: PayrollSummaryReportDto) {
    const where: any = {};

    if (dto.period) {
      where.Period = dto.period;
    }

    if (dto.departmentId) {
      where.Employee = { DepartmentID: dto.departmentId };
    }

    const payrolls = await this.prisma.payroll.findMany({
      where,
      include: {
        Employee: { include: { Department: true } },
      },
      orderBy: { Period: 'desc' },
    });

    // Group by period
    const byPeriod: Record<string, any> = {};
    let totalSalary = 0;
    let paidCount = 0;

    for (const payroll of payrolls) {
      if (!byPeriod[payroll.Period]) {
        byPeriod[payroll.Period] = {
          period: payroll.Period,
          employeeCount: 0,
          totalBasicSalary: 0,
          totalAllowances: 0,
          totalDeductions: 0,
          totalOvertime: 0,
          totalSalary: 0,
          paidCount: 0,
        };
      }

      byPeriod[payroll.Period].employeeCount++;
      byPeriod[payroll.Period].totalBasicSalary += Number(payroll.BasicSalary);
      byPeriod[payroll.Period].totalAllowances += Number(payroll.Allowances);
      byPeriod[payroll.Period].totalDeductions += Number(payroll.Deductions);
      byPeriod[payroll.Period].totalOvertime += Number(payroll.OvertimePay);
      byPeriod[payroll.Period].totalSalary += Number(payroll.TotalSalary);
      if (payroll.IsPaid) byPeriod[payroll.Period].paidCount++;

      totalSalary += Number(payroll.TotalSalary);
      if (payroll.IsPaid) paidCount++;
    }

    return {
      summary: {
        totalPeriods: Object.keys(byPeriod).length,
        totalPayrolls: payrolls.length,
        totalSalary,
        paidCount,
        unpaidCount: payrolls.length - paidCount,
      },
      byPeriod: Object.values(byPeriod),
    };
  }
}
