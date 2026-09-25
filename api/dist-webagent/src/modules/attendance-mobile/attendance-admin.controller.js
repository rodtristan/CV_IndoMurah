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
exports.AttendanceAdminController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth-guard");
const attendance_admin_service_1 = require("./attendance-admin.service");
class LocationDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(150),
    __metadata("design:type", String)
], LocationDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], LocationDto.prototype, "address", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], LocationDto.prototype, "latitude", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], LocationDto.prototype, "longitude", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], LocationDto.prototype, "radiusMeters", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LocationDto.prototype, "workStart", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LocationDto.prototype, "workEnd", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], LocationDto.prototype, "lateToleranceMinutes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], LocationDto.prototype, "isActive", void 0);
class AccountDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], AccountDto.prototype, "username", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], AccountDto.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Object)
], AccountDto.prototype, "attendanceLocationId", void 0);
let AttendanceAdminController = class AttendanceAdminController {
    constructor(service) {
        this.service = service;
    }
    listLocations() {
        return this.service.listLocations();
    }
    createLocation(dto) {
        return this.service.createLocation(dto);
    }
    updateLocation(id, dto) {
        return this.service.updateLocation(id, dto);
    }
    deleteLocation(id) {
        return this.service.deleteLocation(id);
    }
    setAccount(id, dto) {
        return this.service.setAccount(id, dto);
    }
    removeAccount(id) {
        return this.service.removeAccount(id);
    }
    daily(date) {
        return this.service.daily(date);
    }
    async photo(id, kind, reply) {
        const { mimeType, data } = await this.service.photo(id, kind);
        reply.header('Content-Type', mimeType).header('Cache-Control', 'private, max-age=3600').send(data);
    }
    async export(from, to, reply) {
        const { filename, data } = await this.service.exportXlsx(from, to);
        reply
            .header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            .header('Content-Disposition', `attachment; filename="${filename}"`)
            .send(data);
    }
};
exports.AttendanceAdminController = AttendanceAdminController;
__decorate([
    (0, common_1.Get)('locations'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AttendanceAdminController.prototype, "listLocations", null);
__decorate([
    (0, common_1.Post)('locations'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [LocationDto]),
    __metadata("design:returntype", void 0)
], AttendanceAdminController.prototype, "createLocation", null);
__decorate([
    (0, common_1.Patch)('locations/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, LocationDto]),
    __metadata("design:returntype", void 0)
], AttendanceAdminController.prototype, "updateLocation", null);
__decorate([
    (0, common_1.Delete)('locations/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AttendanceAdminController.prototype, "deleteLocation", null);
__decorate([
    (0, common_1.Put)('employees/:id/account'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, AccountDto]),
    __metadata("design:returntype", void 0)
], AttendanceAdminController.prototype, "setAccount", null);
__decorate([
    (0, common_1.Delete)('employees/:id/account'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AttendanceAdminController.prototype, "removeAccount", null);
__decorate([
    (0, common_1.Get)('daily'),
    __param(0, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AttendanceAdminController.prototype, "daily", null);
__decorate([
    (0, common_1.Get)('photo/:id/:kind'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('kind')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, Object]),
    __metadata("design:returntype", Promise)
], AttendanceAdminController.prototype, "photo", null);
__decorate([
    (0, common_1.Get)('export'),
    __param(0, (0, common_1.Query)('from')),
    __param(1, (0, common_1.Query)('to')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AttendanceAdminController.prototype, "export", null);
exports.AttendanceAdminController = AttendanceAdminController = __decorate([
    (0, swagger_1.ApiTags)('Absensi - HRD'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('attendance-admin'),
    __metadata("design:paramtypes", [attendance_admin_service_1.AttendanceAdminService])
], AttendanceAdminController);
