"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockOutModule = void 0;
const common_1 = require("@nestjs/common");
const stock_out_controller_1 = require("./stock-out.controller");
const stock_out_service_1 = require("./stock-out.service");
let StockOutModule = class StockOutModule {
};
exports.StockOutModule = StockOutModule;
exports.StockOutModule = StockOutModule = __decorate([
    (0, common_1.Module)({
        controllers: [stock_out_controller_1.StockOutController],
        providers: [stock_out_service_1.StockOutService],
        exports: [stock_out_service_1.StockOutService],
    })
], StockOutModule);
