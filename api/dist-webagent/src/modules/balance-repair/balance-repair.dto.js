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
exports.BalanceCheckDto = exports.BalanceRepairReportDto = exports.RepairResultDto = exports.BalanceHistoryDto = exports.BalanceDiscrepancyDto = exports.RepairBalanceDto = void 0;
const class_validator_1 = require("class-validator");
class RepairBalanceDto {
}
exports.RepairBalanceDto = RepairBalanceDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], RepairBalanceDto.prototype, "accountId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], RepairBalanceDto.prototype, "repairAll", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], RepairBalanceDto.prototype, "asOfDate", void 0);
class BalanceDiscrepancyDto {
}
exports.BalanceDiscrepancyDto = BalanceDiscrepancyDto;
class BalanceHistoryDto {
}
exports.BalanceHistoryDto = BalanceHistoryDto;
class RepairResultDto {
}
exports.RepairResultDto = RepairResultDto;
class BalanceRepairReportDto {
}
exports.BalanceRepairReportDto = BalanceRepairReportDto;
class BalanceCheckDto {
}
exports.BalanceCheckDto = BalanceCheckDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], BalanceCheckDto.prototype, "accountId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], BalanceCheckDto.prototype, "asOfDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], BalanceCheckDto.prototype, "showZeroBalance", void 0);
