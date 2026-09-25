"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockInItemModule = void 0;
const common_1 = require("@nestjs/common");
const stock_in_item_controller_1 = require("./stock-in-item.controller");
const stock_in_item_service_1 = require("./stock-in-item.service");
const prisma_module_1 = require("../../common/prisma/prisma-module");
const redis_module_1 = require("../../common/redis/redis-module");
let StockInItemModule = class StockInItemModule {
};
exports.StockInItemModule = StockInItemModule;
exports.StockInItemModule = StockInItemModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, redis_module_1.RedisModule],
        controllers: [stock_in_item_controller_1.StockInItemController],
        providers: [stock_in_item_service_1.StockInItemService],
        exports: [stock_in_item_service_1.StockInItemService],
    })
], StockInItemModule);
