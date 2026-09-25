"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpenseCategoryModule = void 0;
const common_1 = require("@nestjs/common");
const expense_category_controller_1 = require("./expense-category.controller");
const expense_category_service_1 = require("./expense-category.service");
const prisma_module_1 = require("../../common/prisma/prisma-module");
const redis_module_1 = require("../../common/redis/redis-module");
let ExpenseCategoryModule = class ExpenseCategoryModule {
};
exports.ExpenseCategoryModule = ExpenseCategoryModule;
exports.ExpenseCategoryModule = ExpenseCategoryModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, redis_module_1.RedisModule],
        controllers: [expense_category_controller_1.ExpenseCategoryController],
        providers: [expense_category_service_1.ExpenseCategoryService],
        exports: [expense_category_service_1.ExpenseCategoryService],
    })
], ExpenseCategoryModule);
