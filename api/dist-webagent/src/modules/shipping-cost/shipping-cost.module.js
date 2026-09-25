"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShippingCostModule = void 0;
const common_1 = require("@nestjs/common");
const shipping_cost_controller_1 = require("./shipping-cost.controller");
const shipping_cost_service_1 = require("./shipping-cost.service");
let ShippingCostModule = class ShippingCostModule {
};
exports.ShippingCostModule = ShippingCostModule;
exports.ShippingCostModule = ShippingCostModule = __decorate([
    (0, common_1.Module)({
        controllers: [shipping_cost_controller_1.ShippingCostController],
        providers: [shipping_cost_service_1.ShippingCostService],
        exports: [shipping_cost_service_1.ShippingCostService],
    })
], ShippingCostModule);
