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
exports.ProductionScheduleFilterDto = exports.UpDateProductionScheduleDto = exports.CreateProductionScheduleDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateProductionScheduleDto {
}
exports.CreateProductionScheduleDto = CreateProductionScheduleDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Product ID to produce' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateProductionScheduleDto.prototype, "ProductId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Warehouse ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateProductionScheduleDto.prototype, "WarehouseId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Scheduled production Date' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateProductionScheduleDto.prototype, "ScheduledDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Quantity to produce' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.0001),
    __metadata("design:type", Number)
], CreateProductionScheduleDto.prototype, "Quantity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Status: SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProductionScheduleDto.prototype, "Status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProductionScheduleDto.prototype, "Notes", void 0);
class UpDateProductionScheduleDto {
}
exports.UpDateProductionScheduleDto = UpDateProductionScheduleDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Scheduled Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpDateProductionScheduleDto.prototype, "ScheduledDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Quantity' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpDateProductionScheduleDto.prototype, "Quantity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Status' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpDateProductionScheduleDto.prototype, "Status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpDateProductionScheduleDto.prototype, "Notes", void 0);
class ProductionScheduleFilterDto {
}
exports.ProductionScheduleFilterDto = ProductionScheduleFilterDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Product ID filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ProductionScheduleFilterDto.prototype, "ProductId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Warehouse ID filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ProductionScheduleFilterDto.prototype, "WarehouseId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Status filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProductionScheduleFilterDto.prototype, "Status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Start Date filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], ProductionScheduleFilterDto.prototype, "StartDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'End Date filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], ProductionScheduleFilterDto.prototype, "EndDate", void 0);
