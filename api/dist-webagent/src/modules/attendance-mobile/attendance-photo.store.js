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
exports.AttendancePhotoStore = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../common/prisma/prisma-service");
const gdrive_service_1 = require("../file-storage/gdrive.service");
let AttendancePhotoStore = class AttendancePhotoStore {
    constructor(prisma, drive, config) {
        this.prisma = prisma;
        this.drive = drive;
        this.config = config;
    }
    driveEnabled() {
        return !!(this.config.get('GDRIVE_REFRESH_TOKEN') ?? '').trim();
    }
    async save(name, mimeType, data) {
        if (this.driveEnabled())
            return `gdrive:${await this.drive.upload(name, mimeType, data)}`;
        const row = await this.prisma.attendancePhoto.create({ data: { MimeType: mimeType, Data: new Uint8Array(data) } });
        return `db:${row.ID}`;
    }
    async load(ref) {
        const [kind, id] = ref.split(':');
        if (kind === 'gdrive' && id)
            return this.drive.download(id);
        if (kind === 'db' && /^\d+$/.test(id ?? '')) {
            const row = await this.prisma.attendancePhoto.findUnique({ where: { ID: Number(id) } });
            if (row)
                return { mimeType: row.MimeType, data: Buffer.from(row.Data) };
        }
        throw new common_1.NotFoundException('Foto tidak ditemukan');
    }
};
exports.AttendancePhotoStore = AttendancePhotoStore;
exports.AttendancePhotoStore = AttendancePhotoStore = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        gdrive_service_1.GDriveService,
        config_1.ConfigService])
], AttendancePhotoStore);
