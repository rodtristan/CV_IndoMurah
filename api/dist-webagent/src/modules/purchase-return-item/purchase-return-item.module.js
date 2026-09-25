"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchaseReturnItemModule = void 0;
const common_1 = require("@nestjs/common");
const purchase_return_item_controller_1 = require("./purchase-return-item.controller");
const purchase_return_item_service_1 = require("./purchase-return-item.service");
const prisma_module_1 = require("../../common/prisma/prisma-module");
const redis_module_1 = require("../../common/redis/redis-module");
let PurchaseReturnItemModule = class PurchaseReturnItemModule {
};
exports.PurchaseReturnItemModule = PurchaseReturnItemModule;
exports.PurchaseReturnItemModule = PurchaseReturnItemModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, redis_module_1.RedisModule],
        controllers: [purchase_return_item_controller_1.PurchaseReturnItemController],
        providers: [purchase_return_item_service_1.PurchaseReturnItemService],
        exports: [purchase_return_item_service_1.PurchaseReturnItemService],
    })
], PurchaseReturnItemModule);
