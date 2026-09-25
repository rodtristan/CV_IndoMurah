"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchasePaymentModule = void 0;
const common_1 = require("@nestjs/common");
const purchase_payment_controller_1 = require("./purchase-payment.controller");
const purchase_payment_service_1 = require("./purchase-payment.service");
let PurchasePaymentModule = class PurchasePaymentModule {
};
exports.PurchasePaymentModule = PurchasePaymentModule;
exports.PurchasePaymentModule = PurchasePaymentModule = __decorate([
    (0, common_1.Module)({
        controllers: [purchase_payment_controller_1.PurchasePaymentController],
        providers: [purchase_payment_service_1.PurchasePaymentService],
        exports: [purchase_payment_service_1.PurchasePaymentService],
    })
], PurchasePaymentModule);
