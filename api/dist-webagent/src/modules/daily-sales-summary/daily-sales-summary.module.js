"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DailySalesSummaryModule = void 0;
const common_1 = require("@nestjs/common");
const daily_sales_summary_controller_1 = require("./daily-sales-summary.controller");
const daily_sales_summary_service_1 = require("./daily-sales-summary.service");
const prisma_module_1 = require("../../common/prisma/prisma-module");
const redis_module_1 = require("../../common/redis/redis-module");
let DailySalesSummaryModule = class DailySalesSummaryModule {
};
exports.DailySalesSummaryModule = DailySalesSummaryModule;
exports.DailySalesSummaryModule = DailySalesSummaryModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, redis_module_1.RedisModule],
        controllers: [daily_sales_summary_controller_1.DailySalesSummaryController],
        providers: [daily_sales_summary_service_1.DailySalesSummaryService],
        exports: [daily_sales_summary_service_1.DailySalesSummaryService],
    })
], DailySalesSummaryModule);
