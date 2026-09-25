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
exports.AccountSettingService = exports.ACCOUNT_SETTING_KEYS = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma-service");
const account_keys_1 = require("../../common/accounting/account-keys");
exports.ACCOUNT_SETTING_KEYS = account_keys_1.ACCOUNT_KEYS;
let AccountSettingService = class AccountSettingService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAll() {
        const rows = await this.prisma.accountSetting.findMany();
        const out = {};
        for (const k of exports.ACCOUNT_SETTING_KEYS)
            out[k] = null;
        for (const r of rows)
            out[r.Key] = r.AccountID;
        return out;
    }
    async saveAll(values) {
        const entries = Object.entries(values ?? {});
        for (const [k] of entries) {
            if (!exports.ACCOUNT_SETTING_KEYS.includes(k))
                throw new common_1.BadRequestException(`Kunci setting tidak dikenal: ${k}`);
        }
        const norm = entries.map(([k, v]) => [k, v === null || v === '' || v === undefined ? null : Number(v)]);
        const ids = [...new Set(norm.map(([, v]) => v).filter((v) => v !== null))];
        if (ids.some((n) => !Number.isInteger(n)))
            throw new common_1.BadRequestException('ID perkiraan tidak valid');
        if (ids.length) {
            const found = await this.prisma.account.count({ where: { ID: { in: ids } } });
            if (found !== ids.length)
                throw new common_1.BadRequestException('Ada perkiraan yang tidak ditemukan');
        }
        await this.prisma.$transaction(norm.map(([k, AccountID]) => this.prisma.accountSetting.upsert({ where: { Key: k }, create: { Key: k, AccountID }, update: { AccountID } })));
        return this.getAll();
    }
};
exports.AccountSettingService = AccountSettingService;
exports.AccountSettingService = AccountSettingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AccountSettingService);
