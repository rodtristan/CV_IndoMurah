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
var GDriveService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GDriveService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const FOLDER_NAME = 'IndoMurah Report Assets';
const FOLDER_MIME = 'application/vnd.google-apps.folder';
let GDriveService = GDriveService_1 = class GDriveService {
    constructor(config) {
        this.config = config;
        this.log = new common_1.Logger(GDriveService_1.name);
        this.token = null;
        this.folderId = null;
    }
    cfg(k) {
        return (this.config.get(k) ?? '').trim();
    }
    assertConfigured() {
        for (const k of ['GDRIVE_CLIENT_ID', 'GDRIVE_CLIENT_SECRET', 'GDRIVE_REFRESH_TOKEN']) {
            if (!this.cfg(k))
                throw new common_1.ServiceUnavailableException(`Google Drive belum dikonfigurasi (${k} kosong di .env)`);
        }
    }
    async accessToken() {
        this.assertConfigured();
        if (this.token && this.token.exp > Date.now() + 60_000)
            return this.token.value;
        const res = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: this.cfg('GDRIVE_CLIENT_ID'),
                client_secret: this.cfg('GDRIVE_CLIENT_SECRET'),
                refresh_token: this.cfg('GDRIVE_REFRESH_TOKEN'),
                grant_type: 'refresh_token',
            }),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || !json.access_token) {
            this.log.error(`Token Google gagal: ${json.error ?? res.status} ${json.error_description ?? ''}`);
            throw new common_1.ServiceUnavailableException('Gagal autentikasi ke Google Drive (refresh token tidak valid/kedaluwarsa)');
        }
        this.token = { value: json.access_token, exp: Date.now() + (json.expires_in ?? 3600) * 1000 };
        return this.token.value;
    }
    async api(url, init = {}) {
        const t = await this.accessToken();
        return fetch(url, { ...init, headers: { Authorization: `Bearer ${t}`, ...init.headers } });
    }
    async folder() {
        if (this.folderId)
            return this.folderId;
        const fixed = this.cfg('GDRIVE_FOLDER_ID');
        if (fixed)
            return (this.folderId = fixed);
        const q = encodeURIComponent(`name='${FOLDER_NAME}' and mimeType='${FOLDER_MIME}' and trashed=false`);
        const found = await (await this.api(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id)`)).json();
        if (found.files?.[0]?.id)
            return (this.folderId = found.files[0].id);
        const created = await (await this.api('https://www.googleapis.com/drive/v3/files?fields=id', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: FOLDER_NAME, mimeType: FOLDER_MIME }),
        })).json();
        if (!created.id)
            throw new common_1.ServiceUnavailableException('Gagal membuat folder di Google Drive');
        return (this.folderId = created.id);
    }
    async upload(name, mimeType, data) {
        const parent = await this.folder();
        const boundary = `b${Date.now().toString(16)}`;
        const meta = JSON.stringify({ name, parents: [parent] });
        const body = Buffer.concat([
            Buffer.from(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${meta}\r\n--${boundary}\r\nContent-Type: ${mimeType}\r\n\r\n`),
            data,
            Buffer.from(`\r\n--${boundary}--`),
        ]);
        const res = await this.api('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id&supportsAllDrives=true', {
            method: 'POST',
            headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
            body,
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || !json.id) {
            this.log.error(`Upload Drive gagal: ${res.status} ${JSON.stringify(json).slice(0, 200)}`);
            throw new common_1.BadRequestException('Gagal mengunggah ke Google Drive');
        }
        return json.id;
    }
    async download(id) {
        const parent = await this.folder();
        const metaRes = await this.api(`https://www.googleapis.com/drive/v3/files/${id}?fields=mimeType,parents,trashed&supportsAllDrives=true`);
        if (!metaRes.ok)
            throw new common_1.NotFoundException('File tidak ditemukan');
        const meta = await metaRes.json();
        if (meta.trashed || !meta.parents?.includes(parent) || !String(meta.mimeType).startsWith('image/')) {
            throw new common_1.NotFoundException('File tidak ditemukan');
        }
        const res = await this.api(`https://www.googleapis.com/drive/v3/files/${id}?alt=media&supportsAllDrives=true`);
        if (!res.ok)
            throw new common_1.NotFoundException('File tidak ditemukan');
        return { mimeType: meta.mimeType, data: Buffer.from(await res.arrayBuffer()) };
    }
};
exports.GDriveService = GDriveService;
exports.GDriveService = GDriveService = GDriveService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], GDriveService);
