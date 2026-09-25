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
exports.GeneralSettingsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth-guard");
const prisma_service_1 = require("../../common/prisma/prisma-service");
const STORE_KEY = 'app-setting:general';
const NS = 'general.';
let GeneralSettingsController = class GeneralSettingsController {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async row() {
        return this.prisma.reportTemplate.findFirst({ where: { ReportKey: STORE_KEY } });
    }
    async get() {
        const r = await this.row();
        return { success: true, data: r?.Definition ?? {} };
    }
    async put(body) {
        const clean = {};
        for (const [k, v] of Object.entries(body ?? {})) {
            if (k.startsWith(NS) && (v === null || ['string', 'number', 'boolean'].includes(typeof v)))
                clean[k] = v;
        }
        const r = await this.row();
        const merged = { ...(r?.Definition ?? {}), ...clean };
        if (r)
            await this.prisma.reportTemplate.update({ where: { ID: r.ID }, data: { Definition: merged } });
        else
            await this.prisma.reportTemplate.create({ data: { ReportKey: STORE_KEY, Name: 'Pengaturan Umum', Definition: merged } });
        return { success: true, data: merged };
    }
};
exports.GeneralSettingsController = GeneralSettingsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all general.* settings as a flat key/value object' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], GeneralSettingsController.prototype, "get", null);
__decorate([
    (0, common_1.Put)(':scope'),
    (0, swagger_1.ApiOperation)({ summary: 'Merge general.* settings (keys outside the namespace are ignored; :scope is a placeholder, use "all")' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GeneralSettingsController.prototype, "put", null);
exports.GeneralSettingsController = GeneralSettingsController = __decorate([
    (0, swagger_1.ApiTags)('AppSettings'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('general-settings'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GeneralSettingsController);
