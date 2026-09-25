"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChequePaymentModule = void 0;
const common_1 = require("@nestjs/common");
const cheque_payment_controller_1 = require("./cheque-payment.controller");
const cheque_payment_service_1 = require("./cheque-payment.service");
const sale_payment_module_1 = require("../sale-payment/sale-payment.module");
const purchase_payment_module_1 = require("../purchase-payment/purchase-payment.module");
let ChequePaymentModule = class ChequePaymentModule {
};
exports.ChequePaymentModule = ChequePaymentModule;
exports.ChequePaymentModule = ChequePaymentModule = __decorate([
    (0, common_1.Module)({
        imports: [sale_payment_module_1.SalePaymentModule, purchase_payment_module_1.PurchasePaymentModule],
        controllers: [cheque_payment_controller_1.ChequePaymentController],
        providers: [cheque_payment_service_1.ChequePaymentService],
        exports: [cheque_payment_service_1.ChequePaymentService],
    })
], ChequePaymentModule);
