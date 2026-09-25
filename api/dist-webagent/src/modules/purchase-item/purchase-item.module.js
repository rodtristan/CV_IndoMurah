"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchaseItemModule = void 0;
const common_1 = require("@nestjs/common");
const purchase_item_controller_1 = require("./purchase-item.controller");
const purchase_item_service_1 = require("./purchase-item.service");
const prisma_module_1 = require("../../common/prisma/prisma-module");
const redis_module_1 = require("../../common/redis/redis-module");
let PurchaseItemModule = class PurchaseItemModule {
};
exports.PurchaseItemModule = PurchaseItemModule;
exports.PurchaseItemModule = PurchaseItemModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, redis_module_1.RedisModule],
        controllers: [purchase_item_controller_1.PurchaseItemController],
        providers: [purchase_item_service_1.PurchaseItemService],
        exports: [purchase_item_service_1.PurchaseItemService],
    })
], PurchaseItemModule);
