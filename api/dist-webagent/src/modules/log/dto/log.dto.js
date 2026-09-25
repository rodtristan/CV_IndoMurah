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
exports.QueryLogDto = exports.LogResponseDto = exports.UpdateLogDto = exports.CreateLogDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class CreateLogDto {
}
exports.CreateLogDto = CreateLogDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'method' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLogDto.prototype, "method", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'endpoint' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLogDto.prototype, "endpoint", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'headers' }),
    __metadata("design:type", Object)
], CreateLogDto.prototype, "headers", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'payload' }),
    __metadata("design:type", Object)
], CreateLogDto.prototype, "payload", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'responseStatus' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateLogDto.prototype, "responseStatus", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'message' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLogDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'requesterLoginId' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateLogDto.prototype, "requesterLoginId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'requesterFullName' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLogDto.prototype, "requesterFullName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'ipAddress' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLogDto.prototype, "ipAddress", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'userAgent' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLogDto.prototype, "userAgent", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'durationMs' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateLogDto.prototype, "durationMs", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'logDatetime' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], CreateLogDto.prototype, "logDatetime", void 0);
class UpdateLogDto {
}
exports.UpdateLogDto = UpdateLogDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'method' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateLogDto.prototype, "method", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'endpoint' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateLogDto.prototype, "endpoint", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'headers' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateLogDto.prototype, "headers", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'payload' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateLogDto.prototype, "payload", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'responseStatus' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateLogDto.prototype, "responseStatus", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'message' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateLogDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'requesterLoginId' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateLogDto.prototype, "requesterLoginId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'requesterFullName' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateLogDto.prototype, "requesterFullName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'ipAddress' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateLogDto.prototype, "ipAddress", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'userAgent' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateLogDto.prototype, "userAgent", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'durationMs' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateLogDto.prototype, "durationMs", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'logDatetime' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], UpdateLogDto.prototype, "logDatetime", void 0);
class LogResponseDto {
}
exports.LogResponseDto = LogResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'method' }),
    __metadata("design:type", String)
], LogResponseDto.prototype, "method", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'endpoint' }),
    __metadata("design:type", String)
], LogResponseDto.prototype, "endpoint", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'headers' }),
    __metadata("design:type", Object)
], LogResponseDto.prototype, "headers", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'payload' }),
    __metadata("design:type", Object)
], LogResponseDto.prototype, "payload", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'responseStatus' }),
    __metadata("design:type", Number)
], LogResponseDto.prototype, "responseStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'message' }),
    __metadata("design:type", String)
], LogResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'requesterLoginId' }),
    __metadata("design:type", Number)
], LogResponseDto.prototype, "requesterLoginId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'requesterFullName' }),
    __metadata("design:type", String)
], LogResponseDto.prototype, "requesterFullName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ipAddress' }),
    __metadata("design:type", String)
], LogResponseDto.prototype, "ipAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'userAgent' }),
    __metadata("design:type", String)
], LogResponseDto.prototype, "userAgent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'durationMs' }),
    __metadata("design:type", Number)
], LogResponseDto.prototype, "durationMs", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'logDatetime' }),
    __metadata("design:type", Date)
], LogResponseDto.prototype, "logDatetime", void 0);
class QueryLogDto {
}
exports.QueryLogDto = QueryLogDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Fields to select' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryLogDto.prototype, "$select", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Relations to include' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryLogDto.prototype, "$include", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of records to skip' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QueryLogDto.prototype, "$skip", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of records to take' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QueryLogDto.prototype, "$take", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Search keyword' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryLogDto.prototype, "$search", void 0);
