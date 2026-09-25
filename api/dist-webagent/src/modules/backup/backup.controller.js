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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackupController = void 0;
const swagger_1 = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const backup_service_1 = require("./backup.service");
const backup_dto_1 = require("./dto/backup.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth-guard");
let BackupController = class BackupController {
    constructor(backupService) {
        this.backupService = backupService;
    }
    async listBackups(query) {
        return this.backupService.listBackups({
            sortBy: query.sortBy,
            sortOrder: query.sortOrder,
            status: query.status,
            favoritesOnly: query.favoritesOnly,
            search: query.search,
        });
    }
    async getBackupStats() {
        return this.backupService.getBackupStats();
    }
    async getBackupById(id) {
        return this.backupService.getBackupById(id);
    }
    async createBackup(dto) {
        return this.backupService.createBackup(dto);
    }
    async restoreBackup(id, dto) {
        return this.backupService.restoreBackup(id, dto.createBackupBeforeRestore);
    }
    async updateBackup(id, dto) {
        return this.backupService.updateBackup(id, dto);
    }
    async toggleFavorite(id) {
        return this.backupService.toggleFavorite(id);
    }
    async deleteBackup(id) {
        return this.backupService.deleteBackup(id);
    }
};
exports.BackupController = BackupController;
__decorate([
    (0, common_1.Get)('list'),
    (0, swagger_1.ApiOperation)({ summary: 'List all backups with optional filters and sorting' }),
    (0, swagger_1.ApiQuery)({ name: 'sortBy', required: false, description: 'Field to sort by (default: createdAt)' }),
    (0, swagger_1.ApiQuery)({ name: 'sortOrder', required: false, description: 'Sort order: asc or desc (default: desc)' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, description: 'Filter by status' }),
    (0, swagger_1.ApiQuery)({ name: 'favoritesOnly', required: false, description: 'Show only favorites' }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, description: 'Search by name or description' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of backups', type: [backup_dto_1.BackupResponseDto] }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [backup_dto_1.BackupListQueryDto]),
    __metadata("design:returntype", Promise)
], BackupController.prototype, "listBackups", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get backup statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Backup statistics' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BackupController.prototype, "getBackupStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get backup details by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Backup ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Backup details', type: backup_dto_1.BackupResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Backup not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BackupController.prototype, "getBackupById", null);
__decorate([
    (0, common_1.Post)('create'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new backup' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Backup created successfully', type: backup_dto_1.BackupResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Backup creation failed' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [backup_dto_1.CreateBackupDto]),
    __metadata("design:returntype", Promise)
], BackupController.prototype, "createBackup", null);
__decorate([
    (0, common_1.Post)('restore/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Restore database from a backup' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Backup ID to restore from' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Backup restored successfully', type: backup_dto_1.BackupResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Backup not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Cannot restore incomplete backup' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, backup_dto_1.RestoreBackupDto]),
    __metadata("design:returntype", Promise)
], BackupController.prototype, "restoreBackup", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update backup metadata' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Backup ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Backup updated successfully', type: backup_dto_1.BackupResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Backup not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, backup_dto_1.UpdateBackupDto]),
    __metadata("design:returntype", Promise)
], BackupController.prototype, "updateBackup", null);
__decorate([
    (0, common_1.Patch)(':id/favorite'),
    (0, swagger_1.ApiOperation)({ summary: 'Toggle backup favorite status' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Backup ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Favorite toggled successfully', type: backup_dto_1.BackupResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Backup not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BackupController.prototype, "toggleFavorite", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a backup' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Backup ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Backup deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Backup not found' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BackupController.prototype, "deleteBackup", null);
exports.BackupController = BackupController = __decorate([
    (0, swagger_1.ApiTags)('Backup'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('backup'),
    __metadata("design:paramtypes", [backup_service_1.BackupService])
], BackupController);
