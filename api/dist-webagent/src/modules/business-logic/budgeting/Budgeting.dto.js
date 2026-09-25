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
exports.CopyBudgetDto = exports.BudgetAlertDto = exports.SalesTargetReportDto = exports.BudgetComparisonDto = exports.SalesTargetFilterDto = exports.UpdateSalesTargetDto = exports.CreateSalesTargetDto = exports.BudgetFilterDto = exports.UpdateBudgetDto = exports.CreateBudgetDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateBudgetDto {
}
exports.CreateBudgetDto = CreateBudgetDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Budget Name' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateBudgetDto.prototype, "Name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Budget Type' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBudgetDto.prototype, "Type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Period start Date' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateBudgetDto.prototype, "StartDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Period end Date' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateBudgetDto.prototype, "EndDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Category ID (for category-based budget)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateBudgetDto.prototype, "CategoryId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Warehouse ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateBudgetDto.prototype, "WarehouseId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Department ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateBudgetDto.prototype, "DepartmentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Budgeted Amount' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateBudgetDto.prototype, "BudgetedAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBudgetDto.prototype, "Description", void 0);
class UpdateBudgetDto {
}
exports.UpdateBudgetDto = UpdateBudgetDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Budget Name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBudgetDto.prototype, "Name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Budgeted Amount' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateBudgetDto.prototype, "BudgetedAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Is active' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateBudgetDto.prototype, "IsActive", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBudgetDto.prototype, "Description", void 0);
class BudgetFilterDto {
}
exports.BudgetFilterDto = BudgetFilterDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Budget Type' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BudgetFilterDto.prototype, "Type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Category ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], BudgetFilterDto.prototype, "CategoryId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Warehouse ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], BudgetFilterDto.prototype, "WarehouseId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Department ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], BudgetFilterDto.prototype, "DepartmentId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Active only' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], BudgetFilterDto.prototype, "ActiveOnly", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Period year' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], BudgetFilterDto.prototype, "Year", void 0);
class CreateSalesTargetDto {
}
exports.CreateSalesTargetDto = CreateSalesTargetDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Target Name' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateSalesTargetDto.prototype, "Name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Target Type' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSalesTargetDto.prototype, "Type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Period start Date' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateSalesTargetDto.prototype, "StartDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Period end Date' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateSalesTargetDto.prototype, "EndDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Employee ID (for personal target)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateSalesTargetDto.prototype, "EmployeeId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Warehouse ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateSalesTargetDto.prototype, "WarehouseId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Category ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateSalesTargetDto.prototype, "CategoryId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Target revenue' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateSalesTargetDto.prototype, "TargetRevenue", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Target Quantity' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateSalesTargetDto.prototype, "TargetQuantity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSalesTargetDto.prototype, "Description", void 0);
class UpdateSalesTargetDto {
}
exports.UpdateSalesTargetDto = UpdateSalesTargetDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Target Name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSalesTargetDto.prototype, "Name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Target revenue' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateSalesTargetDto.prototype, "TargetRevenue", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Target Quantity' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateSalesTargetDto.prototype, "TargetQuantity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Is active' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateSalesTargetDto.prototype, "IsActive", void 0);
class SalesTargetFilterDto {
}
exports.SalesTargetFilterDto = SalesTargetFilterDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Employee ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SalesTargetFilterDto.prototype, "EmployeeId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Warehouse ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SalesTargetFilterDto.prototype, "WarehouseId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Period year' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SalesTargetFilterDto.prototype, "Year", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Period month' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SalesTargetFilterDto.prototype, "Month", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Active only' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SalesTargetFilterDto.prototype, "ActiveOnly", void 0);
class BudgetComparisonDto {
}
exports.BudgetComparisonDto = BudgetComparisonDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Start Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], BudgetComparisonDto.prototype, "StartDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'End Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], BudgetComparisonDto.prototype, "EndDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Budget ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], BudgetComparisonDto.prototype, "BudgetId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Category ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], BudgetComparisonDto.prototype, "CategoryId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Department ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], BudgetComparisonDto.prototype, "DepartmentId", void 0);
class SalesTargetReportDto {
}
exports.SalesTargetReportDto = SalesTargetReportDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Period year' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SalesTargetReportDto.prototype, "Year", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Period month' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SalesTargetReportDto.prototype, "Month", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Employee ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SalesTargetReportDto.prototype, "EmployeeId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Warehouse ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SalesTargetReportDto.prototype, "WarehouseId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Show only underperforming' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SalesTargetReportDto.prototype, "UnderperformingOnly", void 0);
class BudgetAlertDto {
}
exports.BudgetAlertDto = BudgetAlertDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Alert threshold percentage' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(50),
    __metadata("design:type", Number)
], BudgetAlertDto.prototype, "Threshold", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Budget ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], BudgetAlertDto.prototype, "BudgetId", void 0);
class CopyBudgetDto {
}
exports.CopyBudgetDto = CopyBudgetDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Source budget ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CopyBudgetDto.prototype, "SourceBudgetId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'New period start Date' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CopyBudgetDto.prototype, "NewStartDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'New period end Date' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CopyBudgetDto.prototype, "NewEndDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Apply percentage Adjustment' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CopyBudgetDto.prototype, "AdjustmentPercent", void 0);
