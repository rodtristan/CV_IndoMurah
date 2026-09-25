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
exports.QCCheckFilterDto = exports.RecordQCCheckDto = exports.QCCheckpointResultDto = exports.UpdateQCCheckpointDto = exports.CreateQCCheckpointDto = exports.UpdateQCCategoryDto = exports.CreateQCCategoryDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class CreateQCCategoryDto {
}
exports.CreateQCCategoryDto = CreateQCCategoryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Category Code' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateQCCategoryDto.prototype, "Code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Category Name' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateQCCategoryDto.prototype, "Name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Category Description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateQCCategoryDto.prototype, "Description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'QC Type: INSPECTION, TEST, APPROVAL' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateQCCategoryDto.prototype, "QcType", void 0);
class UpdateQCCategoryDto {
}
exports.UpdateQCCategoryDto = UpdateQCCategoryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Category Name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateQCCategoryDto.prototype, "Name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Category Description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateQCCategoryDto.prototype, "Description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'QC Type' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateQCCategoryDto.prototype, "QcType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Is active' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateQCCategoryDto.prototype, "IsActive", void 0);
class CreateQCCheckpointDto {
}
exports.CreateQCCheckpointDto = CreateQCCheckpointDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Checkpoint Name' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateQCCheckpointDto.prototype, "Name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'QC Category ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateQCCheckpointDto.prototype, "CategoryId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateQCCheckpointDto.prototype, "Description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Is required' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateQCCheckpointDto.prototype, "IsRequired", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Pass criteria' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateQCCheckpointDto.prototype, "PassCriteria", void 0);
class UpdateQCCheckpointDto {
}
exports.UpdateQCCheckpointDto = UpdateQCCheckpointDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Checkpoint Name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateQCCheckpointDto.prototype, "Name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateQCCheckpointDto.prototype, "Description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Is required' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateQCCheckpointDto.prototype, "IsRequired", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Pass criteria' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateQCCheckpointDto.prototype, "PassCriteria", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Is active' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateQCCheckpointDto.prototype, "IsActive", void 0);
class QCCheckpointResultDto {
}
exports.QCCheckpointResultDto = QCCheckpointResultDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Checkpoint ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], QCCheckpointResultDto.prototype, "CheckpointId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Result: PASS, FAIL, NA' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QCCheckpointResultDto.prototype, "Result", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Actual value' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QCCheckpointResultDto.prototype, "ActualValue", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QCCheckpointResultDto.prototype, "Notes", void 0);
class RecordQCCheckDto {
}
exports.RecordQCCheckDto = RecordQCCheckDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'QC Category ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], RecordQCCheckDto.prototype, "CategoryId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Reference Type (e.g., PRODUCTION, PURCHASE)' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RecordQCCheckDto.prototype, "ReferenceType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Reference ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], RecordQCCheckDto.prototype, "ReferenceId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'QC Date' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RecordQCCheckDto.prototype, "Date", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Inspector Name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RecordQCCheckDto.prototype, "InspectorName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Overall result: PASS, FAIL, CONDITIONAL' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RecordQCCheckDto.prototype, "Result", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RecordQCCheckDto.prototype, "Notes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Checkpoint results', type: [QCCheckpointResultDto] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => QCCheckpointResultDto),
    __metadata("design:type", Array)
], RecordQCCheckDto.prototype, "CheckpointResults", void 0);
class QCCheckFilterDto {
}
exports.QCCheckFilterDto = QCCheckFilterDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Start Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QCCheckFilterDto.prototype, "StartDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'End Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QCCheckFilterDto.prototype, "EndDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Category ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], QCCheckFilterDto.prototype, "CategoryId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Result filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QCCheckFilterDto.prototype, "Result", void 0);
