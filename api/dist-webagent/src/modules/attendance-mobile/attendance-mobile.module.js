"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceMobileModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const file_storage_module_1 = require("../file-storage/file-storage.module");
const attendance_admin_controller_1 = require("./attendance-admin.controller");
const attendance_admin_service_1 = require("./attendance-admin.service");
const attendance_mobile_controller_1 = require("./attendance-mobile.controller");
const attendance_mobile_service_1 = require("./attendance-mobile.service");
const attendance_photo_store_1 = require("./attendance-photo.store");
const employee_auth_guard_1 = require("./employee-auth.guard");
let AttendanceMobileModule = class AttendanceMobileModule {
};
exports.AttendanceMobileModule = AttendanceMobileModule;
exports.AttendanceMobileModule = AttendanceMobileModule = __decorate([
    (0, common_1.Module)({
        imports: [
            file_storage_module_1.FileStorageModule,
            jwt_1.JwtModule.registerAsync({
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    secret: config.get('EMPLOYEE_JWT_SECRET') ||
                        `${config.get('JWT_SECRET') || config.get('jwt.secret') || 'fallback-secret'}:employee-mobile`,
                    signOptions: { expiresIn: '30d' },
                }),
            }),
        ],
        controllers: [attendance_mobile_controller_1.AttendanceMobileController, attendance_admin_controller_1.AttendanceAdminController],
        providers: [attendance_mobile_service_1.AttendanceMobileService, attendance_admin_service_1.AttendanceAdminService, attendance_photo_store_1.AttendancePhotoStore, employee_auth_guard_1.EmployeeAuthGuard],
    })
], AttendanceMobileModule);
