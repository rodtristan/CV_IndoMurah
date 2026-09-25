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
exports.RestoreBackupDto = exports.BackupListQueryDto = exports.BackupResponseDto = exports.UpdateBackupDto = exports.CreateBackupDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateBackupDto {
    constructor() {
        this.includeDatabase = true;
        this.includeFiles = true;
    }
}
exports.CreateBackupDto = CreateBackupDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Optional name for the backup' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBackupDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Optional description for the backup' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBackupDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Whether to include database in backup', default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateBackupDto.prototype, "includeDatabase", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Whether to include files in backup', default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateBackupDto.prototype, "includeFiles", void 0);
class UpdateBackupDto {
}
exports.UpdateBackupDto = UpdateBackupDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Updated name for the backup' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBackupDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Updated description for the backup' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBackupDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Whether the backup is marked as favorite' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateBackupDto.prototype, "isFavorite", void 0);
class BackupResponseDto {
}
exports.BackupResponseDto = BackupResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Unique identifier for the backup' }),
    __metadata("design:type", String)
], BackupResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Backup name' }),
    __metadata("design:type", String)
], BackupResponseDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Backup description' }),
    __metadata("design:type", String)
], BackupResponseDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Filename of the backup file' }),
    __metadata("design:type", String)
], BackupResponseDto.prototype, "filename", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'File path to the backup' }),
    __metadata("design:type", String)
], BackupResponseDto.prototype, "filePath", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'File size in bytes' }),
    __metadata("design:type", Number)
], BackupResponseDto.prototype, "fileSize", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Human readable file size' }),
    __metadata("design:type", String)
], BackupResponseDto.prototype, "fileSizeFormatted", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Timestamp when backup was created' }),
    __metadata("design:type", Date)
], BackupResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether database was included in backup' }),
    __metadata("design:type", Boolean)
], BackupResponseDto.prototype, "includeDatabase", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether files were included in backup' }),
    __metadata("design:type", Boolean)
], BackupResponseDto.prototype, "includeFiles", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether this backup is marked as favorite' }),
    __metadata("design:type", Boolean)
], BackupResponseDto.prototype, "isFavorite", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Database version at backup time' }),
    __metadata("design:type", String)
], BackupResponseDto.prototype, "databaseVersion", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Status of the backup' }),
    __metadata("design:type", String)
], BackupResponseDto.prototype, "status", void 0);
class BackupListQueryDto {
    constructor() {
        this.sortBy = 'createdAt';
        this.sortOrder = 'desc';
    }
}
exports.BackupListQueryDto = BackupListQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Sort by field', default: 'createdAt' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BackupListQueryDto.prototype, "sortBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Sort order (asc/desc)', default: 'desc' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BackupListQueryDto.prototype, "sortOrder", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by status' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BackupListQueryDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter favorites only' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], BackupListQueryDto.prototype, "favoritesOnly", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Search by name or description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BackupListQueryDto.prototype, "search", void 0);
class RestoreBackupDto {
    constructor() {
        this.createBackupBeforeRestore = true;
    }
}
exports.RestoreBackupDto = RestoreBackupDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID of the backup to restore' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RestoreBackupDto.prototype, "backupId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Whether to create a backup before restoring', default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], RestoreBackupDto.prototype, "createBackupBeforeRestore", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Optional name for the auto backup before restore' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RestoreBackupDto.prototype, "autoBackupName", void 0);
