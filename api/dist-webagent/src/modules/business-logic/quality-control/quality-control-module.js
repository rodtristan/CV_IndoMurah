"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QualityControlModule = void 0;
const common_1 = require("@nestjs/common");
const quality_control_controller_1 = require("./quality-control-controller");
const quality_control_service_1 = require("./quality-control-service");
const prisma_module_1 = require("../../../common/prisma/prisma-module");
let QualityControlModule = class QualityControlModule {
};
exports.QualityControlModule = QualityControlModule;
exports.QualityControlModule = QualityControlModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [quality_control_controller_1.QualityControlController],
        providers: [quality_control_service_1.QualityControlService],
        exports: [quality_control_service_1.QualityControlService],
    })
], QualityControlModule);
