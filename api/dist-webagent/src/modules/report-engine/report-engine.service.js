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
exports.ReportEngineService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma-service");
const registry_1 = require("./registry");
const report_engine_types_1 = require("./report-engine.types");
const helpers_1 = require("./helpers");
const LOOKUP_MODELS = {
    products: 'product',
    categories: 'category',
    supplier: 'supplier',
    customer: 'customer',
    warehouse: 'warehouse',
    account: 'account',
    'sales-person': 'salesPerson',
};
const isObj = (v) => typeof v === 'object' && v !== null && !Array.isArray(v);
let ReportEngineService = class ReportEngineService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    catalog() {
        return registry_1.REPORT_PROVIDERS.map(({ key, group, title, description, params, fields, variants, chart }) => ({
            key,
            group,
            title,
            description,
            params,
            fields,
            ...(variants ? { variants } : {}),
            ...(chart ? { chart } : {}),
        }));
    }
    async getData(key, body, user) {
        const provider = registry_1.REPORT_MAP.get(key);
        if (!provider)
            throw new common_1.NotFoundException(`Laporan '${key}' tidak ditemukan`);
        const params = isObj(body.params) ? body.params : {};
        let variant = (0, helpers_1.str)(body, 'variant');
        if (provider.variants?.length) {
            if (variant && !provider.variants.some((v) => v.key === variant)) {
                throw new common_1.BadRequestException(`Varian '${variant}' tidak dikenal`);
            }
            variant = variant ?? provider.variants[0].key;
        }
        else {
            variant = undefined;
        }
        for (const req of provider.required ?? []) {
            const def = provider.params.find((p) => p.key === req);
            const label = def?.label ?? req;
            const v = (0, helpers_1.str)(params, req);
            if (!v)
                throw new common_1.BadRequestException(`Parameter '${label}' wajib diisi`);
            if (def?.type === 'date' && isNaN(new Date(v.slice(0, 10)).getTime())) {
                throw new common_1.BadRequestException(`Parameter '${label}' bukan tanggal yang valid`);
            }
        }
        const rows = (await provider.run(params, { prisma: this.prisma, variant })).slice(0, report_engine_types_1.MAX_ROWS);
        const info = await this.buildInfo(provider, params, variant, user);
        return { info, rows };
    }
    async buildInfo(provider, params, variant, user) {
        const [company, dbUser] = await Promise.all([
            user?.companyId ? this.prisma.company.findUnique({ where: { ID: user.companyId } }) : null,
            user?.id ? this.prisma.user.findUnique({ where: { ID: user.id }, select: { Name: true, Username: true } }) : null,
        ]);
        const alamat2 = [company?.City, company?.Province, company?.PostalCode].filter(Boolean).join(', ');
        const InfoFilter = {
            NamaLaporan: provider.variants?.find((v) => v.key === variant)?.title ?? provider.title,
        };
        for (const def of provider.params) {
            const raw = (0, helpers_1.str)(params, def.key);
            InfoFilter[def.label] = raw ? await this.humanize(def, raw, params) : '-';
        }
        return {
            InfoReport: {
                NamaPerusahaan: company?.Name ?? '',
                Alamat1: company?.Address ?? '',
                Alamat2: alamat2,
                Telepon: company?.Phone ?? '',
                Fax: '',
                LogoUrl: company?.LogoUrl ?? '',
            },
            InfoFilter,
            UserLogin: dbUser?.Name ?? dbUser?.Username ?? user?.username ?? '',
            Tanggal: new Date().toISOString(),
        };
    }
    async humanize(def, raw, params) {
        if (def.type === 'date') {
            const [y, m, d] = raw.slice(0, 10).split('-');
            return y && m && d ? `${d}/${m}/${y}` : raw;
        }
        if (def.type === 'checkbox')
            return params[def.key] === true || raw === 'true' ? 'Ya' : 'Tidak';
        const opt = def.options?.find((o) => o.value === raw);
        if (opt)
            return opt.label;
        if (def.source) {
            const model = LOOKUP_MODELS[def.source.endpoint];
            const byId = def.source.valueField === 'ID';
            if (model && (!byId || Number.isFinite(Number(raw)))) {
                const where = byId ? { ID: Number(raw) } : { [def.source.valueField]: raw };
                const rec = await this.prisma[model].findFirst({ where });
                if (rec?.[def.source.labelField])
                    return String(rec[def.source.labelField]);
            }
        }
        return raw;
    }
    scope(user) {
        return { CompanyID: user?.companyId ?? null };
    }
    validateDefinition(def) {
        const bad = (m) => new common_1.BadRequestException(`Definition tidak valid: ${m}`);
        if (!isObj(def))
            throw bad('harus berupa objek');
        if (def.version !== 1)
            throw bad('version harus 1');
        if (!isObj(def.page))
            throw bad('page wajib ada');
        if (!isObj(def.table) || !Array.isArray(def.table.columns))
            throw bad('table.columns harus berupa array');
    }
    toRecord(t) {
        return {
            ID: t.ID,
            ReportKey: t.ReportKey,
            Name: t.Name,
            Definition: t.Definition,
            IsDefault: t.IsDefault,
            CreatedAt: t.CreatedAt.toISOString(),
            UpdatedAt: t.UpdatedAt.toISOString(),
        };
    }
    async listTemplates(key, user) {
        const rows = await this.prisma.reportTemplate.findMany({
            where: { ReportKey: key, ...this.scope(user) },
            orderBy: [{ IsDefault: 'desc' }, { CreatedAt: 'desc' }, { ID: 'desc' }],
        });
        return rows.map((r) => this.toRecord(r));
    }
    async createTemplate(body, user) {
        const { ReportKey, Name, Definition, IsDefault } = body ?? {};
        if (typeof ReportKey !== 'string' || !ReportKey.trim() || ReportKey.length > 100)
            throw new common_1.BadRequestException('ReportKey wajib diisi');
        if (typeof Name !== 'string' || !Name.trim() || Name.length > 255)
            throw new common_1.BadRequestException('Name wajib diisi');
        this.validateDefinition(Definition);
        const scope = this.scope(user);
        const key = ReportKey.trim();
        const created = await this.prisma.$transaction(async (tx) => {
            if (IsDefault)
                await tx.reportTemplate.updateMany({ where: { ReportKey: key, ...scope }, data: { IsDefault: false } });
            return tx.reportTemplate.create({
                data: { ReportKey: key, Name: Name.trim(), Definition, IsDefault: !!IsDefault, CompanyID: scope.CompanyID, CreatedByID: user?.id ?? null },
            });
        });
        return this.toRecord(created);
    }
    async findOwned(id, user) {
        const t = await this.prisma.reportTemplate.findFirst({ where: { ID: id, ...this.scope(user) } });
        if (!t)
            throw new common_1.NotFoundException('Template tidak ditemukan');
        return t;
    }
    async updateTemplate(id, body, user) {
        const existing = await this.findOwned(id, user);
        const data = {};
        if (body?.Name !== undefined) {
            if (typeof body.Name !== 'string' || !body.Name.trim() || body.Name.length > 255)
                throw new common_1.BadRequestException('Name tidak valid');
            data.Name = body.Name.trim();
        }
        if (body?.Definition !== undefined) {
            this.validateDefinition(body.Definition);
            data.Definition = body.Definition;
        }
        if (body?.IsDefault !== undefined)
            data.IsDefault = !!body.IsDefault;
        const updated = await this.prisma.$transaction(async (tx) => {
            if (data.IsDefault) {
                await tx.reportTemplate.updateMany({
                    where: { ReportKey: existing.ReportKey, ...this.scope(user), NOT: { ID: id } },
                    data: { IsDefault: false },
                });
            }
            return tx.reportTemplate.update({ where: { ID: id }, data });
        });
        return this.toRecord(updated);
    }
    async deleteTemplate(id, user) {
        await this.findOwned(id, user);
        await this.prisma.reportTemplate.delete({ where: { ID: id } });
    }
};
exports.ReportEngineService = ReportEngineService;
exports.ReportEngineService = ReportEngineService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportEngineService);
