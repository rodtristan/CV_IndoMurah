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
exports.HRMService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/prisma/prisma-service");
const client_1 = require("@prisma/client");
const number_1 = require("../../../common/utils/number");
let HRMService = class HRMService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createEmployee(dto, UserId) {
        const existing = await this.prisma.employee.findUnique({
            where: { Code: dto.Code },
        });
        if (existing) {
            throw new common_1.ConflictException('Employee Code already exists');
        }
        const ActiveStatus = await this.prisma.employeeStatus.findFirst({
            where: { Code: 'ACTIVE' },
        });
        const Employee = await this.prisma.employee.create({
            data: {
                Code: dto.Code,
                Name: dto.Name,
                DepartmentID: dto.DepartmentId || null,
                PositionID: dto.PositionId || null,
                JoinDate: dto.JoinDate ? new Date(dto.JoinDate) : null,
                BirthDate: dto.BirthDate ? new Date(dto.BirthDate) : null,
                Gender: dto.Gender,
                Phone: dto.Phone,
                Email: dto.Email,
                Address: dto.Address,
                EmergencyContact: dto.EmergencyContact,
                EmergencyPhone: dto.EmergencyPhone,
                BasicSalary: new client_1.Prisma.Decimal(dto.BasicSalary || 0),
                StatusID: ActiveStatus?.ID || 1,
                Notes: dto.Notes,
            },
        });
        const [Department, Position, Status] = await Promise.all([
            dto.DepartmentId ? this.prisma.department.findUnique({ where: { ID: dto.DepartmentId } }) : null,
            dto.PositionId ? this.prisma.position.findUnique({ where: { ID: dto.PositionId } }) : null,
            this.prisma.employeeStatus.findUnique({ where: { ID: ActiveStatus?.ID || 1 } }),
        ]);
        return {
            success: true,
            Employee: {
                ID: Employee.ID,
                Code: Employee.Code,
                Name: Employee.Name,
                Department: Department?.Name || null,
                Position: Position?.Name || null,
                JoinDate: Employee.JoinDate,
                Status: Status?.Name || 'Active',
                BasicSalary: (0, number_1.number)(Employee.BasicSalary),
            },
        };
    }
    async getEmployee(EmployeeId) {
        const Employee = await this.prisma.employee.findUnique({
            where: { ID: EmployeeId },
            include: {
                Department: true,
                Position: true,
                Status: true,
            },
        });
        if (!Employee) {
            throw new common_1.NotFoundException('Employee not found');
        }
        return {
            ID: Employee.ID,
            Code: Employee.Code,
            Name: Employee.Name,
            Department: Employee.Department,
            Position: Employee.Position,
            JoinDate: Employee.JoinDate,
            EndDate: Employee.EndDate,
            BirthDate: Employee.BirthDate,
            Gender: Employee.Gender,
            Phone: Employee.Phone,
            Email: Employee.Email,
            Address: Employee.Address,
            EmergencyContact: Employee.EmergencyContact,
            EmergencyPhone: Employee.EmergencyPhone,
            BasicSalary: (0, number_1.number)(Employee.BasicSalary),
            Status: Employee.Status,
            Notes: Employee.Notes,
        };
    }
    async listEmployees(dto) {
        const where = {};
        if (dto.DepartmentId) {
            where.DepartmentID = dto.DepartmentId;
        }
        if (dto.PositionId) {
            where.PositionID = dto.PositionId;
        }
        if (dto.StatusId) {
            where.StatusID = dto.StatusId;
        }
        if (dto.ActiveOnly !== false) {
            where.IsActive = true;
        }
        const Employees = await this.prisma.employee.findMany({
            where,
            include: {
                Department: true,
                Position: true,
                Status: true,
            },
            orderBy: { Name: 'asc' },
        });
        return Employees.map((emp) => ({
            ID: emp.ID,
            Code: emp.Code,
            Name: emp.Name,
            Department: emp.Department?.Name || null,
            Position: emp.Position?.Name || null,
            JoinDate: emp.JoinDate,
            Status: emp.Status?.Name || 'Active',
            StatusColor: emp.Status?.Color,
            Phone: emp.Phone,
            BasicSalary: (0, number_1.number)(emp.BasicSalary),
        }));
    }
    async updateEmployee(EmployeeId, dto, UserId) {
        const Employee = await this.prisma.employee.findUnique({
            where: { ID: EmployeeId },
        });
        if (!Employee) {
            throw new common_1.NotFoundException('Employee not found');
        }
        const updated = await this.prisma.employee.update({
            where: { ID: EmployeeId },
            data: {
                DepartmentID: dto.DepartmentId,
                PositionID: dto.PositionId,
                EndDate: dto.EndDate ? new Date(dto.EndDate) : undefined,
                Phone: dto.Phone,
                Email: dto.Email,
                Address: dto.Address,
                EmergencyContact: dto.EmergencyContact,
                EmergencyPhone: dto.EmergencyPhone,
                BasicSalary: dto.BasicSalary !== undefined ? new client_1.Prisma.Decimal(dto.BasicSalary) : undefined,
                StatusID: dto.StatusId,
                Notes: dto.Notes,
            },
        });
        const [Department, Position, Status] = await Promise.all([
            dto.DepartmentId ? this.prisma.department.findUnique({ where: { ID: dto.DepartmentId } }) : null,
            dto.PositionId ? this.prisma.position.findUnique({ where: { ID: dto.PositionId } }) : null,
            dto.StatusId ? this.prisma.employeeStatus.findUnique({ where: { ID: dto.StatusId } }) : null,
        ]);
        return {
            success: true,
            Employee: {
                ID: updated.ID,
                Code: updated.Code,
                Name: updated.Name,
                Department: Department?.Name || null,
                Position: Position?.Name || null,
                Status: Status?.Name || 'Active',
            },
        };
    }
    async RecordAttendance(dto, UserId) {
        const Employee = await this.prisma.employee.findUnique({
            where: { ID: dto.EmployeeId },
        });
        if (!Employee) {
            throw new common_1.NotFoundException('Employee not found');
        }
        const existing = await this.prisma.attendance.findFirst({
            where: {
                EmployeeID: dto.EmployeeId,
                Date: new Date(dto.Date),
            },
        });
        if (existing) {
            throw new common_1.ConflictException('Attendance already Recorded for this Date');
        }
        const presentStatus = await this.prisma.attendanceStatus.findFirst({
            where: { Code: 'PRESENT' },
        });
        const attendance = await this.prisma.attendance.create({
            data: {
                EmployeeID: dto.EmployeeId,
                Date: new Date(dto.Date),
                CheckIn: dto.CheckIn ? new Date(`${dto.Date}T${dto.CheckIn}`) : null,
                CheckOut: dto.CheckOut ? new Date(`${dto.Date}T${dto.CheckOut}`) : null,
                StatusID: dto.StatusId || presentStatus?.ID || 1,
                Notes: dto.Notes,
            },
            include: {
                Employee: true,
                Status: true,
            },
        });
        return {
            success: true,
            attendance: {
                ID: attendance.ID,
                Employee: attendance.Employee.Name,
                Date: attendance.Date,
                CheckIn: attendance.CheckIn,
                CheckOut: attendance.CheckOut,
                Status: attendance.Status.Name,
                StatusColor: attendance.Status.Color,
            },
        };
    }
    async bulkRecordAttendance(dto, UserId) {
        const Results = [];
        for (const Record of dto.Records) {
            try {
                const Result = await this.RecordAttendance(Record, UserId);
                Results.push({ success: true, ...Result.attendance });
            }
            catch (error) {
                Results.push({
                    success: false,
                    EmployeeId: Record.EmployeeId,
                    Date: Record.Date,
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        }
        return {
            success: true,
            Total: dto.Records.length,
            succeeded: Results.filter((r) => r.success).length,
            failed: Results.filter((r) => !r.success).length,
            Results,
        };
    }
    async listAttendance(dto) {
        const where = {};
        if (dto.EmployeeId) {
            where.EmployeeID = dto.EmployeeId;
        }
        if (dto.DepartmentId) {
            where.Employee = { DepartmentID: dto.DepartmentId };
        }
        if (dto.StatusId) {
            where.StatusID = dto.StatusId;
        }
        if (dto.StartDate || dto.EndDate) {
            where.Date = {};
            if (dto.StartDate) {
                where.Date.gte = new Date(dto.StartDate);
            }
            if (dto.EndDate) {
                where.Date.lte = new Date(dto.EndDate);
            }
        }
        const attendance = await this.prisma.attendance.findMany({
            where,
            include: {
                Employee: { include: { Department: true } },
                Status: true,
            },
            orderBy: { Date: 'desc' },
            take: 100,
        });
        return attendance.map((a) => ({
            ID: a.ID,
            EmployeeId: a.EmployeeID,
            EmployeeName: a.Employee.Name,
            EmployeeCode: a.Employee.Code,
            Department: a.Employee.Department?.Name || null,
            Date: a.Date,
            CheckIn: a.CheckIn,
            CheckOut: a.CheckOut,
            Status: a.Status.Name,
            StatusColor: a.Status.Color,
            Notes: a.Notes,
        }));
    }
    async getAttendanceSummary(EmployeeId, startDate, endDate) {
        const attendance = await this.prisma.attendance.findMany({
            where: {
                EmployeeID: EmployeeId,
                Date: {
                    gte: new Date(startDate),
                    lte: new Date(endDate),
                },
            },
            include: { Status: true },
        });
        const Summary = {
            TotalDays: attendance.length,
            present: attendance.filter((a) => a.Status.Code === 'PRESENT').length,
            sick: attendance.filter((a) => a.Status.Code === 'SICK').length,
            Leave: attendance.filter((a) => a.Status.Code === 'LEAVE').length,
            absent: attendance.filter((a) => a.Status.Code === 'ABSENT').length,
        };
        return {
            EmployeeId,
            period: { startDate, endDate },
            Summary,
            attendance: attendance.map((a) => ({
                Date: a.Date,
                Status: a.Status.Name,
                CheckIn: a.CheckIn,
                CheckOut: a.CheckOut,
            })),
        };
    }
    async createLeave(dto, UserId) {
        const Employee = await this.prisma.employee.findUnique({
            where: { ID: dto.EmployeeId },
        });
        if (!Employee) {
            throw new common_1.NotFoundException('Employee not found');
        }
        const year = new Date(dto.StartDate).getFullYear();
        const LeaveBalance = await this.prisma.leaveBalance.findFirst({
            where: {
                EmployeeID: dto.EmployeeId,
                Year: year,
                TypeID: dto.TypeId,
            },
        });
        const availableDays = LeaveBalance ? LeaveBalance.RemainingDays : 0;
        if (availableDays < dto.TotalDays) {
            throw new common_1.BadRequestException(`Insufficient Leave Balance. Available: ${availableDays}, Requested: ${dto.TotalDays}`);
        }
        const Code = await this.generateLeaveCode();
        const pendingStatus = await this.prisma.leaveStatus.findFirst({
            where: { Code: 'PENDING' },
        });
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
                StatusID: pendingStatus?.ID || 1,
            },
            include: {
                Employee: true,
                Type: true,
                Status: true,
            },
        });
        return {
            success: true,
            Leave: {
                ID: Leave.ID,
                Code: Leave.Code,
                Employee: Leave.Employee.Name,
                Type: Leave.Type.Name,
                startDate: Leave.StartDate,
                endDate: Leave.EndDate,
                TotalDays: Leave.TotalDays,
                reason: Leave.Reason,
                Status: Leave.Status.Name,
                StatusColor: Leave.Status.Color,
            },
        };
    }
    async approveLeave(LeaveId, dto, UserId) {
        const Leave = await this.prisma.leave.findUnique({
            where: { ID: LeaveId },
            include: { Type: true },
        });
        if (!Leave) {
            throw new common_1.NotFoundException('Leave not found');
        }
        const approvedStatus = await this.prisma.leaveStatus.findFirst({
            where: { Code: 'APPROVED' },
        });
        await this.prisma.$transaction(async (tx) => {
            await tx.leave.update({
                where: { ID: LeaveId },
                data: {
                    StatusID: approvedStatus?.ID || 2,
                    ApprovedByID: UserId,
                    ApprovedAt: new Date(),
                    Notes: dto.Notes,
                },
            });
            const year = Leave.StartDate.getFullYear();
            const LeaveBalance = await tx.leaveBalance.findFirst({
                where: {
                    EmployeeID: Leave.EmployeeID,
                    Year: year,
                    TypeID: Leave.TypeID,
                },
            });
            if (LeaveBalance) {
                await tx.leaveBalance.update({
                    where: { ID: LeaveBalance.ID },
                    data: {
                        UsedDays: { increment: Leave.TotalDays },
                        RemainingDays: { decrement: Leave.TotalDays },
                    },
                });
            }
        });
        return {
            success: true,
            LeaveId,
            Code: Leave.Code,
            Status: 'APPROVED',
        };
    }
    async rejectLeave(LeaveId, dto, UserId) {
        const Leave = await this.prisma.leave.findUnique({
            where: { ID: LeaveId },
        });
        if (!Leave) {
            throw new common_1.NotFoundException('Leave not found');
        }
        const rejectedStatus = await this.prisma.leaveStatus.findFirst({
            where: { Code: 'REJECTED' },
        });
        await this.prisma.leave.update({
            where: { ID: LeaveId },
            data: {
                StatusID: rejectedStatus?.ID || 3,
                ApprovedByID: UserId,
                ApprovedAt: new Date(),
                RejectedReason: dto.Reason,
            },
        });
        return {
            success: true,
            LeaveId,
            Code: Leave.Code,
            Status: 'REJECTED',
            reason: dto.Reason,
        };
    }
    async listLeaves(dto) {
        const where = {};
        if (dto.EmployeeId) {
            where.EmployeeID = dto.EmployeeId;
        }
        if (dto.TypeId) {
            where.TypeID = dto.TypeId;
        }
        if (dto.StatusId) {
            where.StatusID = dto.StatusId;
        }
        if (dto.Year) {
            where.StartDate = {
                gte: new Date(`${dto.Year}-01-01`),
                lte: new Date(`${dto.Year}-12-31`),
            };
        }
        const Leaves = await this.prisma.leave.findMany({
            where,
            include: {
                Employee: { include: { Department: true } },
                Type: true,
                Status: true,
            },
            orderBy: { CreatedAt: 'desc' },
        });
        return Leaves.map((l) => ({
            ID: l.ID,
            Code: l.Code,
            EmployeeId: l.EmployeeID,
            EmployeeName: l.Employee.Name,
            Department: l.Employee.Department?.Name || null,
            Type: l.Type.Name,
            startDate: l.StartDate,
            endDate: l.EndDate,
            TotalDays: l.TotalDays,
            reason: l.Reason,
            Status: l.Status.Name,
            StatusColor: l.Status.Color,
        }));
    }
    async initializeLeaveBalance(dto, UserId) {
        const Employee = await this.prisma.employee.findUnique({
            where: { ID: dto.EmployeeId },
        });
        if (!Employee) {
            throw new common_1.NotFoundException('Employee not found');
        }
        const existing = await this.prisma.leaveBalance.findFirst({
            where: {
                EmployeeID: dto.EmployeeId,
                Year: dto.Year,
                TypeID: dto.TypeId,
            },
        });
        if (existing) {
            throw new common_1.ConflictException('Leave Balance already exists for this year and Type');
        }
        const Balance = await this.prisma.leaveBalance.create({
            data: {
                EmployeeID: dto.EmployeeId,
                Year: dto.Year,
                TypeID: dto.TypeId,
                TotalDays: dto.TotalDays,
                UsedDays: 0,
                RemainingDays: dto.TotalDays,
            },
            include: {
                Employee: true,
                Type: true,
            },
        });
        return {
            success: true,
            Balance: {
                ID: Balance.ID,
                Employee: Balance.Employee.Name,
                year: Balance.Year,
                Type: Balance.Type.Name,
                TotalDays: Balance.TotalDays,
                usedDays: Balance.UsedDays,
                remainingDays: Balance.RemainingDays,
            },
        };
    }
    async listLeaveBalances(dto) {
        const where = {};
        if (dto.EmployeeId) {
            where.EmployeeID = dto.EmployeeId;
        }
        if (dto.Year) {
            where.Year = dto.Year;
        }
        if (dto.TypeId) {
            where.TypeID = dto.TypeId;
        }
        const Balances = await this.prisma.leaveBalance.findMany({
            where,
            include: {
                Employee: true,
                Type: true,
            },
            orderBy: [{ Year: 'desc' }, { Employee: { Name: 'asc' } }],
        });
        return Balances.map((b) => ({
            ID: b.ID,
            EmployeeId: b.EmployeeID,
            EmployeeName: b.Employee.Name,
            EmployeeCode: b.Employee.Code,
            year: b.Year,
            Type: b.Type.Name,
            TotalDays: b.TotalDays,
            usedDays: b.UsedDays,
            remainingDays: b.RemainingDays,
        }));
    }
    async createPayroll(dto, UserId) {
        const Employee = await this.prisma.employee.findUnique({
            where: { ID: dto.EmployeeId },
        });
        if (!Employee) {
            throw new common_1.NotFoundException('Employee not found');
        }
        const existing = await this.prisma.payroll.findFirst({
            where: {
                EmployeeID: dto.EmployeeId,
                Period: dto.Period,
            },
        });
        if (existing) {
            throw new common_1.ConflictException('Payroll for this period already exists');
        }
        const allowances = dto.Allowances || 0;
        const deductions = dto.Deductions || 0;
        const overtimePay = dto.OvertimePay || 0;
        const TotalSalary = dto.BasicSalary + allowances - deductions + overtimePay;
        const Code = await this.generatePayrollCode();
        const Payroll = await this.prisma.payroll.create({
            data: {
                Code: Code,
                EmployeeID: dto.EmployeeId,
                Period: dto.Period,
                BasicSalary: new client_1.Prisma.Decimal(dto.BasicSalary),
                Allowances: new client_1.Prisma.Decimal(allowances),
                Deductions: new client_1.Prisma.Decimal(deductions),
                OvertimePay: new client_1.Prisma.Decimal(overtimePay),
                TotalSalary: new client_1.Prisma.Decimal(TotalSalary),
                PaymentDate: dto.PaymentDate ? new Date(dto.PaymentDate) : null,
                Notes: dto.Notes,
            },
            include: {
                Employee: true,
            },
        });
        return {
            success: true,
            Payroll: {
                ID: Payroll.ID,
                Code: Payroll.Code,
                Employee: Payroll.Employee.Name,
                period: Payroll.Period,
                basicSalary: (0, number_1.number)(Payroll.BasicSalary),
                allowances: (0, number_1.number)(Payroll.Allowances),
                deductions: (0, number_1.number)(Payroll.Deductions),
                overtimePay: (0, number_1.number)(Payroll.OvertimePay),
                TotalSalary: (0, number_1.number)(Payroll.TotalSalary),
                IsPaid: Payroll.IsPaid,
            },
        };
    }
    async markPayrollAsPaID(PayrollId, PaymentDate, UserId) {
        const Payroll = await this.prisma.payroll.findUnique({
            where: { ID: PayrollId },
        });
        if (!Payroll) {
            throw new common_1.NotFoundException('Payroll not found');
        }
        await this.prisma.payroll.update({
            where: { ID: PayrollId },
            data: {
                IsPaid: true,
                PaymentDate: new Date(PaymentDate),
            },
        });
        return {
            success: true,
            PayrollId,
            Code: Payroll.Code,
            period: Payroll.Period,
            TotalSalary: (0, number_1.number)(Payroll.TotalSalary),
            PaymentDate,
        };
    }
    async listPayroll(dto) {
        const where = {};
        if (dto.EmployeeId) {
            where.EmployeeID = dto.EmployeeId;
        }
        if (dto.Period) {
            where.Period = dto.Period;
        }
        if (dto.IsPaid !== undefined) {
            where.IsPaid = dto.IsPaid;
        }
        const Payrolls = await this.prisma.payroll.findMany({
            where,
            include: {
                Employee: { include: { Department: true } },
            },
            orderBy: { Period: 'desc' },
        });
        return Payrolls.map((p) => ({
            ID: p.ID,
            Code: p.Code,
            EmployeeId: p.EmployeeID,
            EmployeeName: p.Employee.Name,
            Department: p.Employee.Department?.Name || null,
            period: p.Period,
            basicSalary: (0, number_1.number)(p.BasicSalary),
            allowances: (0, number_1.number)(p.Allowances),
            deductions: (0, number_1.number)(p.Deductions),
            overtimePay: (0, number_1.number)(p.OvertimePay),
            TotalSalary: (0, number_1.number)(p.TotalSalary),
            IsPaid: p.IsPaid,
            PaymentDate: p.PaymentDate,
        }));
    }
    async getPayrollSummary(period) {
        const Payrolls = await this.prisma.payroll.findMany({
            where: { Period: period },
            include: { Employee: { include: { Department: true } } },
        });
        const byDepartment = {};
        let TotalSalary = 0;
        for (const Payroll of Payrolls) {
            const dept = Payroll.Employee.Department?.Name || 'Unassigned';
            if (!byDepartment[dept]) {
                byDepartment[dept] = {
                    Department: dept,
                    EmployeeCount: 0,
                    TotalBasicSalary: 0,
                    TotalAllowances: 0,
                    TotalDeductions: 0,
                    TotalSalary: 0,
                };
            }
            byDepartment[dept].EmployeeCount++;
            byDepartment[dept].TotalBasicSalary += Number(Payroll.BasicSalary);
            byDepartment[dept].TotalAllowances += Number(Payroll.Allowances);
            byDepartment[dept].TotalDeductions += Number(Payroll.Deductions);
            byDepartment[dept].TotalSalary += Number(Payroll.TotalSalary);
            TotalSalary += Number(Payroll.TotalSalary);
        }
        return {
            period,
            TotalEmployees: Payrolls.length,
            TotalSalary,
            paidCount: Payrolls.filter((p) => p.IsPaid).length,
            unpaidCount: Payrolls.filter((p) => !p.IsPaid).length,
            byDepartment: Object.values(byDepartment),
        };
    }
    async createLoan(dto, UserId) {
        const Employee = await this.prisma.employee.findUnique({
            where: { ID: dto.EmployeeId },
        });
        if (!Employee) {
            throw new common_1.NotFoundException('Employee not found');
        }
        const LoanType = await this.prisma.loanType.findUnique({
            where: { ID: dto.LoanTypeId },
        });
        if (!LoanType) {
            throw new common_1.NotFoundException('Loan Type not found');
        }
        const principalAmount = dto.PrincipalAmount;
        const interestRate = dto.InterestRate ?? Number(LoanType.InterestRate);
        const tenorMonths = dto.TenorMonths ?? LoanType.MaxTenorMonths;
        const TotalAmount = principalAmount * (1 + interestRate / 100);
        const InstallmentAmount = TotalAmount / tenorMonths;
        const Code = await this.generateLoanCode();
        const ActiveStatus = await this.prisma.loanStatus.findFirst({
            where: { Code: 'ACTIVE' },
        });
        const Loan = await this.prisma.$transaction(async (tx) => {
            const newLoan = await tx.loan.create({
                data: {
                    Code: Code,
                    EmployeeID: dto.EmployeeId,
                    LoanTypeID: dto.LoanTypeId,
                    PrincipalAmount: new client_1.Prisma.Decimal(principalAmount),
                    InterestRate: new client_1.Prisma.Decimal(interestRate),
                    TenorMonths: tenorMonths,
                    InstallmentAmount: new client_1.Prisma.Decimal(InstallmentAmount),
                    TotalAmount: new client_1.Prisma.Decimal(TotalAmount),
                    RemainingAmount: new client_1.Prisma.Decimal(TotalAmount),
                    StartDate: dto.StartDate ? new Date(dto.StartDate) : new Date(),
                    StatusID: ActiveStatus?.ID || 1,
                    Notes: dto.Notes,
                },
                include: {
                    Employee: true,
                    LoanType: true,
                },
            });
            const Installments = [];
            for (let i = 1; i <= tenorMonths; i++) {
                const periodDate = new Date(dto.StartDate || new Date());
                periodDate.setMonth(periodDate.getMonth() + i);
                Installments.push({
                    LoanID: newLoan.ID,
                    Period: `${periodDate.getFullYear()}-${String(periodDate.getMonth() + 1).padStart(2, '0')}`,
                    Amount: new client_1.Prisma.Decimal(InstallmentAmount),
                    Principal: new client_1.Prisma.Decimal(principalAmount / tenorMonths),
                    Interest: new client_1.Prisma.Decimal((TotalAmount - principalAmount) / tenorMonths),
                    RemainingBefore: new client_1.Prisma.Decimal(TotalAmount - (InstallmentAmount * (i - 1))),
                    RemainingAfter: new client_1.Prisma.Decimal(TotalAmount - (InstallmentAmount * i)),
                    Status: 'UNPAID',
                });
            }
            await tx.loanInstallment.createMany({
                data: Installments,
            });
            return newLoan;
        });
        return {
            success: true,
            Loan: {
                ID: Loan.ID,
                Code: Loan.Code,
                Employee: Loan.Employee.Name,
                LoanType: Loan.LoanType.Name,
                principalAmount,
                interestRate,
                tenorMonths,
                TotalAmount,
                InstallmentAmount,
                remainingAmount: TotalAmount,
                Status: ActiveStatus?.Name || 'Active',
            },
        };
    }
    async RecordLoanPayment(dto, UserId) {
        const Installment = await this.prisma.loanInstallment.findUnique({
            where: { ID: dto.InstallmentId },
            include: { Loan: true },
        });
        if (!Installment) {
            throw new common_1.NotFoundException('Installment not found');
        }
        if (Installment.Status === 'PAID') {
            throw new common_1.BadRequestException('Installment already paid');
        }
        await this.prisma.$transaction(async (tx) => {
            await tx.loanInstallment.update({
                where: { ID: dto.InstallmentId },
                data: {
                    PaymentDate: dto.PaymentDate ? new Date(dto.PaymentDate) : new Date(),
                    Status: 'PAID',
                },
            });
            const newRemaining = Number(Installment.Loan.RemainingAmount) - Number(Installment.Amount);
            await tx.loan.update({
                where: { ID: Installment.LoanID },
                data: {
                    RemainingAmount: new client_1.Prisma.Decimal(newRemaining),
                },
            });
            const unpaidCount = await tx.loanInstallment.count({
                where: {
                    LoanID: Installment.LoanID,
                    Status: 'UNPAID',
                },
            });
            if (unpaidCount === 0) {
                const completedStatus = await tx.loanStatus.findFirst({ where: { Code: 'COMPLETED' } });
                await tx.loan.update({
                    where: { ID: Installment.LoanID },
                    data: { StatusID: completedStatus?.ID || 2 },
                });
            }
        });
        return {
            success: true,
            InstallmentId: dto.InstallmentId,
            LoanCode: Installment.Loan.Code,
            Amount: (0, number_1.number)(Installment.Amount),
            PaymentDate: dto.PaymentDate || new Date().toISOString(),
            remainingAmount: (0, number_1.number)(Installment.Loan.RemainingAmount) - Number(Installment.Amount),
        };
    }
    async listLoans(dto) {
        const where = {};
        if (dto.EmployeeId) {
            where.EmployeeID = dto.EmployeeId;
        }
        if (dto.LoanTypeId) {
            where.LoanTypeID = dto.LoanTypeId;
        }
        if (dto.StatusId) {
            where.StatusID = dto.StatusId;
        }
        const Loans = await this.prisma.loan.findMany({
            where,
            include: {
                Employee: true,
                LoanType: true,
                Status: true,
            },
            orderBy: { CreatedAt: 'desc' },
        });
        return Loans.map((l) => ({
            ID: l.ID,
            Code: l.Code,
            EmployeeId: l.EmployeeID,
            EmployeeName: l.Employee.Name,
            LoanType: l.LoanType.Name,
            principalAmount: (0, number_1.number)(l.PrincipalAmount),
            interestRate: (0, number_1.number)(l.InterestRate),
            tenorMonths: l.TenorMonths,
            TotalAmount: (0, number_1.number)(l.TotalAmount),
            remainingAmount: (0, number_1.number)(l.RemainingAmount),
            InstallmentAmount: (0, number_1.number)(l.InstallmentAmount),
            startDate: l.StartDate,
            Status: l.Status.Name,
            StatusColor: l.Status.Color,
        }));
    }
    async getLoanDetails(LoanId) {
        const Loan = await this.prisma.loan.findUnique({
            where: { ID: LoanId },
            include: {
                Employee: { include: { Department: true } },
                LoanType: true,
                Status: true,
                Installments: {
                    orderBy: { Period: 'asc' },
                },
            },
        });
        if (!Loan) {
            throw new common_1.NotFoundException('Loan not found');
        }
        return {
            ID: Loan.ID,
            Code: Loan.Code,
            Employee: Loan.Employee,
            LoanType: Loan.LoanType,
            principalAmount: (0, number_1.number)(Loan.PrincipalAmount),
            interestRate: (0, number_1.number)(Loan.InterestRate),
            tenorMonths: Loan.TenorMonths,
            TotalAmount: (0, number_1.number)(Loan.TotalAmount),
            remainingAmount: (0, number_1.number)(Loan.RemainingAmount),
            InstallmentAmount: (0, number_1.number)(Loan.InstallmentAmount),
            startDate: Loan.StartDate,
            Status: Loan.Status,
            Notes: Loan.Notes,
            Installments: Loan.Installments.map((i) => ({
                ID: i.ID,
                period: i.Period,
                Amount: (0, number_1.number)(i.Amount),
                principal: (0, number_1.number)(i.Principal),
                interest: (0, number_1.number)(i.Interest),
                PaymentDate: i.PaymentDate,
                Status: i.Status,
            })),
        };
    }
    async generateLeaveCode() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const prefix = `CUTI-${year}${month}`;
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
    async generatePayrollCode() {
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
    async generateLoanCode() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const prefix = `PINJAMAN-${year}${month}`;
        const lastLoan = await this.prisma.loan.findFirst({
            where: { Code: { startsWith: prefix } },
            orderBy: { Code: 'desc' },
            select: { Code: true },
        });
        let nextNumber = 1;
        if (lastLoan) {
            const lastSeq = parseInt(lastLoan.Code.split('-').pop() || '0', 10);
            nextNumber = lastSeq + 1;
        }
        return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
    }
};
exports.HRMService = HRMService;
exports.HRMService = HRMService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], HRMService);
