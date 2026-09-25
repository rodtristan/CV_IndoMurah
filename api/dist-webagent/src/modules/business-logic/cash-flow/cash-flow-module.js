"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CashFlowModule = void 0;
const common_1 = require("@nestjs/common");
const cash_flow_controller_1 = require("./cash-flow-controller");
const cash_flow_service_1 = require("./cash-flow-service");
const prisma_module_1 = require("../../../common/prisma/prisma-module");
let CashFlowModule = class CashFlowModule {
};
exports.CashFlowModule = CashFlowModule;
exports.CashFlowModule = CashFlowModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [cash_flow_controller_1.CashFlowController],
        providers: [cash_flow_service_1.CashFlowService],
        exports: [cash_flow_service_1.CashFlowService],
    })
], CashFlowModule);
