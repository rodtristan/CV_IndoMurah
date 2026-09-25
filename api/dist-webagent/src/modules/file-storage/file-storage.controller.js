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
exports.FileStorageController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth-guard");
const gdrive_service_1 = require("./gdrive.service");
const ALLOWED = new Set(['image/png', 'image/jpeg', 'image/gif', 'image/webp']);
const EXT = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/gif': 'gif', 'image/webp': 'webp' };
let FileStorageController = class FileStorageController {
    constructor(drive) {
        this.drive = drive;
    }
    async uploadImage(req) {
        if (!req.isMultipart?.())
            throw new common_1.BadRequestException('Gunakan multipart/form-data dengan field "file"');
        const file = await req.file();
        if (!file)
            throw new common_1.BadRequestException('File tidak ditemukan');
        if (!ALLOWED.has(file.mimetype))
            throw new common_1.BadRequestException('Hanya gambar PNG, JPG, GIF, atau WEBP');
        const buf = await file.toBuffer();
        if (file.file.truncated || buf.length > 2 * 1024 * 1024)
            throw new common_1.BadRequestException('Ukuran gambar maksimal 2 MB');
        const id = await this.drive.upload(`report-${Date.now()}.${EXT[file.mimetype]}`, file.mimetype, buf);
        return { success: true, data: { id, path: `files/${id}/content` } };
    }
    async content(id, reply) {
        if (!/^[A-Za-z0-9_-]{10,100}$/.test(id))
            throw new common_1.BadRequestException('ID tidak valid');
        const { mimeType, data } = await this.drive.download(id);
        reply
            .header('Content-Type', mimeType)
            .header('Cache-Control', 'public, max-age=86400')
            .header('Cross-Origin-Resource-Policy', 'cross-origin')
            .header('X-Content-Type-Options', 'nosniff')
            .send(data);
    }
};
exports.FileStorageController = FileStorageController;
__decorate([
    (0, common_1.Post)('image'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FileStorageController.prototype, "uploadImage", null);
__decorate([
    (0, common_1.Get)(':id/content'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FileStorageController.prototype, "content", null);
exports.FileStorageController = FileStorageController = __decorate([
    (0, swagger_1.ApiTags)('File Storage'),
    (0, common_1.Controller)('files'),
    __metadata("design:paramtypes", [gdrive_service_1.GDriveService])
], FileStorageController);
