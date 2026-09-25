"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppSettingModule = void 0;
const common_1 = require("@nestjs/common");
const app_setting_controller_1 = require("./app-setting.controller");
const general_settings_controller_1 = require("./general-settings.controller");
const app_setting_service_1 = require("./app-setting.service");
const prisma_module_1 = require("../../common/prisma/prisma-module");
const redis_module_1 = require("../../common/redis/redis-module");
let AppSettingModule = class AppSettingModule {
};
exports.AppSettingModule = AppSettingModule;
exports.AppSettingModule = AppSettingModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, redis_module_1.RedisModule],
        controllers: [app_setting_controller_1.AppSettingController, general_settings_controller_1.GeneralSettingsController],
        providers: [app_setting_service_1.AppSettingService],
        exports: [app_setting_service_1.AppSettingService],
    })
], AppSettingModule);
