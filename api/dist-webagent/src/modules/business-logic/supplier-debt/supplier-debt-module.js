"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupplierDebtModule = void 0;
const common_1 = require("@nestjs/common");
const supplier_debt_controller_1 = require("./supplier-debt-controller");
const supplier_debt_service_1 = require("./supplier-debt-service");
let SupplierDebtModule = class SupplierDebtModule {
};
exports.SupplierDebtModule = SupplierDebtModule;
exports.SupplierDebtModule = SupplierDebtModule = __decorate([
    (0, common_1.Module)({
        controllers: [supplier_debt_controller_1.SupplierDebtController],
        providers: [supplier_debt_service_1.SupplierDebtService],
        exports: [supplier_debt_service_1.SupplierDebtService],
    })
], SupplierDebtModule);
