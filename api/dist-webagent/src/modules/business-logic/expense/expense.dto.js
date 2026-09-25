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
exports.CreateExpenseCategoryDto = exports.ExpenseFilterDto = exports.ApproveExpenseDto = exports.BulkCreateExpenseDto = exports.CreateExpenseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class CreateExpenseDto {
}
exports.CreateExpenseDto = CreateExpenseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Expense Date' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateExpenseDto.prototype, "Date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Expense category ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateExpenseDto.prototype, "CategoryId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Expense Amount' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.01),
    __metadata("design:type", Number)
], CreateExpenseDto.prototype, "Amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Expense Description' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateExpenseDto.prototype, "Description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Reference number' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateExpenseDto.prototype, "ReferenceNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateExpenseDto.prototype, "Notes", void 0);
class BulkCreateExpenseDto {
}
exports.BulkCreateExpenseDto = BulkCreateExpenseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Expenses to create', type: [CreateExpenseDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreateExpenseDto),
    __metadata("design:type", Array)
], BulkCreateExpenseDto.prototype, "Expenses", void 0);
class ApproveExpenseDto {
}
exports.ApproveExpenseDto = ApproveExpenseDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Approval Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ApproveExpenseDto.prototype, "Notes", void 0);
class ExpenseFilterDto {
}
exports.ExpenseFilterDto = ExpenseFilterDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Category ID filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ExpenseFilterDto.prototype, "CategoryId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Start Date filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], ExpenseFilterDto.prototype, "StartDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'End Date filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], ExpenseFilterDto.prototype, "EndDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Approved only' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ExpenseFilterDto.prototype, "ApprovedOnly", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Pending approval only' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ExpenseFilterDto.prototype, "PendingOnly", void 0);
class CreateExpenseCategoryDto {
}
exports.CreateExpenseCategoryDto = CreateExpenseCategoryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Category Code' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateExpenseCategoryDto.prototype, "Code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Category Name' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateExpenseCategoryDto.prototype, "Name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Category Description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateExpenseCategoryDto.prototype, "Description", void 0);
