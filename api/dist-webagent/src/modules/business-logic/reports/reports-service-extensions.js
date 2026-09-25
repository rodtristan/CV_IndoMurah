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
exports.ReportsServiceExtensions = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/prisma/prisma-service");
let ReportsServiceExtensions = class ReportsServiceExtensions {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getPayrollSummary(dto) {
        const where = {};
        if (dto.Period) {
            where.Period = dto.Period;
        }
        if (dto.DepartmentId) {
            where.Employee = { DepartmentID: dto.DepartmentId };
        }
        const payrolls = await this.prisma.payroll.findMany({
            where,
            include: {
                Employee: { include: { Department: true } },
            },
            orderBy: { Period: 'desc' },
        });
        const byPeriod = {};
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
            if (payroll.IsPaid)
                byPeriod[payroll.Period].paidCount++;
            totalSalary += Number(payroll.TotalSalary);
            if (payroll.IsPaid)
                paidCount++;
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
};
exports.ReportsServiceExtensions = ReportsServiceExtensions;
exports.ReportsServiceExtensions = ReportsServiceExtensions = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportsServiceExtensions);
