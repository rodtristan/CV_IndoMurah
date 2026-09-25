"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalculateRecipeDto = exports.RecipeFilterDto = exports.CreateRecipeDto = exports.RecipeItemDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class RecipeItemDto {
}
exports.RecipeItemDto = RecipeItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Material product ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], RecipeItemDto.prototype, "ProductId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Warehouse ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], RecipeItemDto.prototype, "WarehouseId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Unit ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], RecipeItemDto.prototype, "UnitId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Quantity needed per production batch' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.0001),
    __metadata("design:type", Number)
], RecipeItemDto.prototype, "Quantity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Price per unit (for cost calculation)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], RecipeItemDto.prototype, "Price", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Is active' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], RecipeItemDto.prototype, "IsActive", void 0);
class CreateRecipeDto {
}
exports.CreateRecipeDto = CreateRecipeDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Finished product ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateRecipeDto.prototype, "ProductId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Recipe Name' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRecipeDto.prototype, "Name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRecipeDto.prototype, "Description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Recipe Items (materials)', type: [RecipeItemDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => RecipeItemDto),
    __metadata("design:type", Array)
], CreateRecipeDto.prototype, "Items", void 0);
class RecipeFilterDto {
}
exports.RecipeFilterDto = RecipeFilterDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Product ID filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], RecipeFilterDto.prototype, "ProductId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Active only' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], RecipeFilterDto.prototype, "ActiveOnly", void 0);
class CalculateRecipeDto {
}
exports.CalculateRecipeDto = CalculateRecipeDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Recipe ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CalculateRecipeDto.prototype, "RecipeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Production Quantity' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.0001),
    __metadata("design:type", Number)
], CalculateRecipeDto.prototype, "Quantity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Warehouse ID (for stock check)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CalculateRecipeDto.prototype, "WarehouseId", void 0);
