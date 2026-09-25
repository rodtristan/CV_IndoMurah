"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryBrandModule = void 0;
const common_1 = require("@nestjs/common");
const category_brand_controller_1 = require("./category-brand-controller");
const category_brand_service_1 = require("./category-brand-service");
let CategoryBrandModule = class CategoryBrandModule {
};
exports.CategoryBrandModule = CategoryBrandModule;
exports.CategoryBrandModule = CategoryBrandModule = __decorate([
    (0, common_1.Module)({
        controllers: [category_brand_controller_1.CategoryBrandController],
        providers: [category_brand_service_1.CategoryBrandService],
        exports: [category_brand_service_1.CategoryBrandService],
    })
], CategoryBrandModule);
