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
exports.AttendanceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/prisma/prisma-service");
let AttendanceService = class AttendanceService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async recordAttendance(dto, UserId) {
        const Employee = await this.prisma.employee.findUnique({
            where: { ID: dto.EmployeeId },
        });
        if (!Employee) {
            throw new common_1.NotFoundException('Employee not found');
        }
        const attendanceDate = new Date(dto.Date);
        attendanceDate.setHours(0, 0, 0, 0);
        const existing = await this.prisma.attendance.findFirst({
            where: {
                EmployeeID: dto.EmployeeId,
                Date: attendanceDate,
            },
        });
        if (existing) {
            throw new common_1.BadRequestException('Attendance already Recorded for this Date');
        }
        let StatusId = dto.StatusId;
        if (!StatusId) {
            const DefaultStatus = await this.prisma.attendanceStatus.findFirst({
                where: { Code: 'PRESENT' },
            });
            StatusId = DefaultStatus?.ID || 1;
        }
        const attendance = await this.prisma.attendance.create({
            data: {
                EmployeeID: dto.EmployeeId,
                Date: attendanceDate,
                CheckIn: dto.CheckIn ? new Date(dto.CheckIn) : null,
                CheckOut: dto.CheckOut ? new Date(dto.CheckOut) : null,
                StatusID: StatusId,
                Notes: dto.Notes,
            },
            include: {
                Employee: true,
                Status: true,
            },
        });
        await this.prisma.activityLog.create({
            data: {
                Type: 'ATTENDANCE_RECORDED',
                Title: 'Attendance Recorded',
                Description: `Attendance Recorded for ${Employee.Name} on ${dto.Date}`,
                ReferenceType: 'ATTENDANCE',
                ReferenceID: attendance.ID,
                CreatedByID: UserId,
            },
        });
        return {
            success: true,
            attendance: this.formatAttendance(attendance),
        };
    }
    async updateAttendance(attendanceId, dto, UserId) {
        const attendance = await this.prisma.attendance.findUnique({
            where: { ID: attendanceId },
        });
        if (!attendance) {
            throw new common_1.NotFoundException('Attendance Record not found');
        }
        const updated = await this.prisma.attendance.update({
            where: { ID: attendanceId },
            data: {
                CheckIn: dto.CheckIn ? new Date(dto.CheckIn) : attendance.CheckIn,
                CheckOut: dto.CheckOut ? new Date(dto.CheckOut) : attendance.CheckOut,
                StatusID: dto.StatusId || attendance.StatusID,
                Notes: dto.Notes ?? attendance.Notes,
            },
            include: {
                Employee: true,
                Status: true,
            },
        });
        return {
            success: true,
            attendance: this.formatAttendance(updated),
        };
    }
    async getAttendance(attendanceId) {
        const attendance = await this.prisma.attendance.findUnique({
            where: { ID: attendanceId },
            include: {
                Employee: {
                    include: {
                        Department: true,
                        Position: true,
                    },
                },
                Status: true,
            },
        });
        if (!attendance) {
            throw new common_1.NotFoundException('Attendance Record not found');
        }
        return this.formatAttendance(attendance);
    }
    async listAttendances(dto) {
        const where = {};
        if (dto.EmployeeId) {
            where.EmployeeID = dto.EmployeeId;
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
                const endDate = new Date(dto.EndDate);
                endDate.setHours(23, 59, 59, 999);
                where.Date.lte = endDate;
            }
        }
        const page = dto.Page || 1;
        const limit = dto.Limit || 50;
        const skip = (page - 1) * limit;
        const [Attendances, Total] = await Promise.all([
            this.prisma.attendance.findMany({
                where,
                include: {
                    Employee: true,
                    Status: true,
                },
                orderBy: [{ Date: 'desc' }, { Employee: { Name: 'asc' } }],
                skip,
                take: limit,
            }),
            this.prisma.attendance.count({ where }),
        ]);
        return {
            data: Attendances.map((a) => this.formatAttendance(a)),
            pagination: {
                page,
                limit,
                Total,
                TotalPages: Math.ceil(Total / limit),
            },
        };
    }
    async deleteAttendance(attendanceId) {
        const attendance = await this.prisma.attendance.findUnique({
            where: { ID: attendanceId },
        });
        if (!attendance) {
            throw new common_1.NotFoundException('Attendance Record not found');
        }
        await this.prisma.attendance.delete({
            where: { ID: attendanceId },
        });
        return { success: true, message: 'Attendance deleted' };
    }
    async getAttendanceSummary(dto) {
        const where = {
            Date: {
                gte: new Date(dto.StartDate),
                lte: new Date(dto.EndDate),
            },
        };
        if (dto.EmployeeId) {
            where.EmployeeID = dto.EmployeeId;
        }
        const Attendances = await this.prisma.attendance.findMany({
            where,
            include: {
                Status: true,
            },
        });
        const StatusCounts = Attendances.reduce((acc, a) => {
            const StatusName = a.Status?.Name || 'Unknown';
            acc[StatusName] = (acc[StatusName] || 0) + 1;
            return acc;
        }, {});
        const TotalWorkHours = Attendances.reduce((sum, a) => {
            if (a.CheckIn && a.CheckOut) {
                const hours = (a.CheckOut.getTime() - a.CheckIn.getTime()) / (1000 * 60 * 60);
                return sum + hours;
            }
            return sum;
        }, 0);
        const Employees = await this.prisma.employee.findMany({
            where: { IsActive: true },
        });
        return {
            period: { startDate: dto.StartDate, endDate: dto.EndDate },
            TotalRecords: Attendances.length,
            TotalEmployees: Employees.length,
            ActiveEmployees: Employees.length,
            StatusBreakdown: StatusCounts,
            TotalWorkHours: Math.round(TotalWorkHours * 100) / 100,
            averageWorkHoursPerDay: Attendances.length > 0
                ? Math.round((TotalWorkHours / Attendances.length) * 100) / 100
                : 0,
        };
    }
    async getEmployeeAttendanceHistory(EmployeeId, startDate, endDate) {
        const Employee = await this.prisma.employee.findUnique({
            where: { ID: EmployeeId },
        });
        if (!Employee) {
            throw new common_1.NotFoundException('Employee not found');
        }
        const Attendances = await this.prisma.attendance.findMany({
            where: {
                EmployeeID: EmployeeId,
                Date: {
                    gte: new Date(startDate),
                    lte: new Date(endDate),
                },
            },
            include: {
                Status: true,
            },
            orderBy: { Date: 'desc' },
        });
        const StatusCounts = Attendances.reduce((acc, a) => {
            const StatusName = a.Status?.Name || 'Unknown';
            acc[StatusName] = (acc[StatusName] || 0) + 1;
            return acc;
        }, {});
        return {
            Employee: {
                ID: Employee.ID,
                Code: Employee.Code,
                Name: Employee.Name,
            },
            period: { startDate, endDate },
            TotalDays: Attendances.length,
            StatusBreakdown: StatusCounts,
            Attendances: Attendances.map((a) => this.formatAttendance(a)),
        };
    }
    async getAttendanceStatuses() {
        const Statuses = await this.prisma.attendanceStatus.findMany({
            orderBy: { SortOrder: 'asc' },
        });
        return Statuses.map((s) => ({
            ID: s.ID,
            Code: s.Code,
            Name: s.Name,
            color: s.Color,
        }));
    }
    formatAttendance(attendance) {
        let workHours = 0;
        if (attendance.CheckIn && attendance.CheckOut) {
            workHours = (attendance.CheckOut.getTime() - attendance.CheckIn.getTime()) / (1000 * 60 * 60);
        }
        return {
            ID: attendance.ID,
            EmployeeId: attendance.EmployeeID,
            EmployeeName: attendance.Employee?.Name,
            EmployeeCode: attendance.Employee?.Code,
            Date: attendance.Date,
            CheckIn: attendance.CheckIn,
            CheckOut: attendance.CheckOut,
            workHours: Math.round(workHours * 100) / 100,
            StatusId: attendance.StatusID,
            Status: attendance.Status
                ? { ID: attendance.Status.ID, Code: attendance.Status.Code, Name: attendance.Status.Name, color: attendance.Status.Color }
                : null,
            Notes: attendance.Notes,
            createdAt: attendance.CreatedAt,
        };
    }
};
exports.AttendanceService = AttendanceService;
exports.AttendanceService = AttendanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AttendanceService);
