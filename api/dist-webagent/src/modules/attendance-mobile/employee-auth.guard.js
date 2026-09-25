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
exports.CurrentEmployee = exports.EmployeeAuthGuard = exports.EMPLOYEE_JWT = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../../common/prisma/prisma-service");
exports.EMPLOYEE_JWT = 'EMPLOYEE_JWT';
let EmployeeAuthGuard = class EmployeeAuthGuard {
    constructor(jwt, prisma) {
        this.jwt = jwt;
        this.prisma = prisma;
    }
    async canActivate(ctx) {
        const req = ctx.switchToHttp().getRequest();
        const header = req.headers?.authorization ?? '';
        const token = header.startsWith('Bearer ') ? header.slice(7) : '';
        if (!token)
            throw new common_1.UnauthorizedException('Silakan login');
        let payload;
        try {
            payload = await this.jwt.verifyAsync(token);
        }
        catch {
            throw new common_1.UnauthorizedException('Sesi berakhir, silakan login ulang');
        }
        if (payload.typ !== 'employee' || !payload.employeeId)
            throw new common_1.UnauthorizedException('Token tidak valid');
        const emp = await this.prisma.employee.findUnique({
            where: { ID: payload.employeeId },
            select: { ID: true, Code: true, Name: true, IsActive: true, Username: true, AttendanceLocationID: true },
        });
        if (!emp || !emp.IsActive || !emp.Username)
            throw new common_1.UnauthorizedException('Akun absensi tidak aktif');
        req.employee = emp;
        return true;
    }
};
exports.EmployeeAuthGuard = EmployeeAuthGuard;
exports.EmployeeAuthGuard = EmployeeAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        prisma_service_1.PrismaService])
], EmployeeAuthGuard);
exports.CurrentEmployee = (0, common_1.createParamDecorator)((_, ctx) => ctx.switchToHttp().getRequest().employee);
