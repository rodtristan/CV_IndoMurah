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
exports.BulkNotificationDto = exports.UpdateNotificationSettingsDto = exports.MarkReadDto = exports.NotificationFilterDto = exports.CreateNotificationDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateNotificationDto {
}
exports.CreateNotificationDto = CreateNotificationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User ID to send notification to' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateNotificationDto.prototype, "UserId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Notification title' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateNotificationDto.prototype, "Title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Notification message' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateNotificationDto.prototype, "Message", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notification Type ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateNotificationDto.prototype, "TypeId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Reference Type (e.g., SALE, PURCHASE)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateNotificationDto.prototype, "ReferenceType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Reference ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateNotificationDto.prototype, "ReferenceId", void 0);
class NotificationFilterDto {
}
exports.NotificationFilterDto = NotificationFilterDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'User ID filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], NotificationFilterDto.prototype, "UserId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notification Type ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], NotificationFilterDto.prototype, "TypeId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Show only unread' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], NotificationFilterDto.prototype, "UnreadOnly", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Page number' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], NotificationFilterDto.prototype, "Page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Page size' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], NotificationFilterDto.prototype, "Limit", void 0);
class MarkReadDto {
}
exports.MarkReadDto = MarkReadDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Notification IDs to mark as read', type: [Number] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsNumber)({}, { each: true }),
    __metadata("design:type", Array)
], MarkReadDto.prototype, "NotificationIds", void 0);
class UpdateNotificationSettingsDto {
}
exports.UpdateNotificationSettingsDto = UpdateNotificationSettingsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User ID' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UpdateNotificationSettingsDto.prototype, "UserId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Email enabled' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateNotificationSettingsDto.prototype, "EmailEnabled", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Push enabled' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateNotificationSettingsDto.prototype, "PushEnabled", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'In-app enabled' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateNotificationSettingsDto.prototype, "InAppEnabled", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Threshold Amount' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateNotificationSettingsDto.prototype, "Threshold", void 0);
class BulkNotificationDto {
}
exports.BulkNotificationDto = BulkNotificationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User IDs to send notification to', type: [String] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], BulkNotificationDto.prototype, "UserIds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Notification title' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], BulkNotificationDto.prototype, "Title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Notification message' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], BulkNotificationDto.prototype, "Message", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notification Type ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], BulkNotificationDto.prototype, "TypeId", void 0);
