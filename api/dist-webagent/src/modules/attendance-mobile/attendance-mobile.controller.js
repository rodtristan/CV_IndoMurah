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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceMobileController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const throttler_1 = require("@nestjs/throttler");
const class_validator_1 = require("class-validator");
const attendance_mobile_service_1 = require("./attendance-mobile.service");
const employee_auth_guard_1 = require("./employee-auth.guard");
class MobileLoginDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], MobileLoginDto.prototype, "username", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], MobileLoginDto.prototype, "password", void 0);
const PHOTO_TYPES = new Set(['image/jpeg', 'image/png']);
const MAX_PHOTO_BYTES = 2 * 1024 * 1024;
async function readClock(req) {
    if (!req.isMultipart?.())
        throw new common_1.BadRequestException('Kirim sebagai multipart/form-data');
    const fields = {};
    let photo;
    for await (const part of req.parts()) {
        if (part.type === 'file') {
            if (part.fieldname !== 'photo') {
                await part.toBuffer();
                continue;
            }
            if (!PHOTO_TYPES.has(part.mimetype))
                throw new common_1.BadRequestException('Foto harus JPG atau PNG');
            const data = await part.toBuffer();
            if (part.file.truncated || data.length > MAX_PHOTO_BYTES)
                throw new common_1.BadRequestException('Ukuran foto maksimal 2 MB');
            photo = { data, mimeType: part.mimetype };
        }
        else {
            fields[part.fieldname] = String(part.value ?? '');
        }
    }
    if (!photo?.data.length)
        throw new common_1.BadRequestException('Foto selfie wajib diunggah');
    return {
        latitude: Number(fields.latitude),
        longitude: Number(fields.longitude),
        accuracy: Number(fields.accuracy),
        isMocked: fields.isMocked === 'true',
        offline: fields.offline === 'true',
        capturedAt: fields.capturedAt || undefined,
        photo,
    };
}
let AttendanceMobileController = class AttendanceMobileController {
    constructor(service) {
        this.service = service;
    }
    login(dto) {
        return this.service.login(dto.username, dto.password);
    }
    me(emp) {
        return this.service.profile(emp);
    }
    history(emp, month) {
        return this.service.history(emp, month);
    }
    async clockIn(emp, req) {
        return this.service.clockIn(emp, await readClock(req));
    }
    async clockOut(emp, req) {
        return this.service.clockOut(emp, await readClock(req));
    }
};
exports.AttendanceMobileController = AttendanceMobileController;
__decorate([
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(200),
    (0, throttler_1.Throttle)({ default: { limit: 5, ttl: 60000 } }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [MobileLoginDto]),
    __metadata("design:returntype", void 0)
], AttendanceMobileController.prototype, "login", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)(employee_auth_guard_1.EmployeeAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, employee_auth_guard_1.CurrentEmployee)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AttendanceMobileController.prototype, "me", null);
__decorate([
    (0, common_1.Get)('history'),
    (0, common_1.UseGuards)(employee_auth_guard_1.EmployeeAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, employee_auth_guard_1.CurrentEmployee)()),
    __param(1, (0, common_1.Query)('month')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AttendanceMobileController.prototype, "history", null);
__decorate([
    (0, common_1.Post)('clock-in'),
    (0, common_1.UseGuards)(employee_auth_guard_1.EmployeeAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    __param(0, (0, employee_auth_guard_1.CurrentEmployee)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AttendanceMobileController.prototype, "clockIn", null);
__decorate([
    (0, common_1.Post)('clock-out'),
    (0, common_1.UseGuards)(employee_auth_guard_1.EmployeeAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    __param(0, (0, employee_auth_guard_1.CurrentEmployee)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AttendanceMobileController.prototype, "clockOut", null);
exports.AttendanceMobileController = AttendanceMobileController = __decorate([
    (0, swagger_1.ApiTags)('Absensi Mobile'),
    (0, common_1.Controller)('attendance-mobile'),
    __metadata("design:paramtypes", [attendance_mobile_service_1.AttendanceMobileService])
], AttendanceMobileController);
