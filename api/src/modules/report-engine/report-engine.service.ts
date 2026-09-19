import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma-service';
import { REPORT_MAP, REPORT_PROVIDERS } from './registry';
import { MAX_ROWS, ReportCatalogItem, ReportParamDef, ReportProvider } from './report-engine.types';
import { str } from './helpers';

const LOOKUP_MODELS: Record<string, string> = {
  products: 'product',
  categories: 'category',
  supplier: 'supplier',
  customer: 'customer',
  warehouse: 'warehouse',
  account: 'account',
  'sales-person': 'salesPerson',
};

const isObj = (v: unknown): v is Record<string, any> => typeof v === 'object' && v !== null && !Array.isArray(v);

@Injectable()
export class ReportEngineService {
  constructor(private prisma: PrismaService) {}

  // ─── Catalog ───────────────────────────────────────────────
  catalog(): ReportCatalogItem[] {
    return REPORT_PROVIDERS.map(({ key, group, title, description, params, fields, variants }) => ({
      key,
      group,
      title,
      description,
      params,
      fields,
      ...(variants ? { variants } : {}),
    }));
  }

  // ─── Data ──────────────────────────────────────────────────
  async getData(key: string, body: { params?: Record<string, any>; variant?: string }, user: any) {
    const provider = REPORT_MAP.get(key);
    if (!provider) throw new NotFoundException(`Laporan '${key}' tidak ditemukan`);

    const params = isObj(body.params) ? body.params : {};
    let variant = str(body as any, 'variant');
    if (provider.variants?.length) {
      if (variant && !provider.variants.some((v) => v.key === variant)) {
        throw new BadRequestException(`Varian '${variant}' tidak dikenal`);
      }
      variant = variant ?? provider.variants[0].key;
    } else {
      variant = undefined;
    }

    for (const req of provider.required ?? []) {
      const def = provider.params.find((p) => p.key === req);
      const label = def?.label ?? req;
      const v = str(params, req);
      if (!v) throw new BadRequestException(`Parameter '${label}' wajib diisi`);
      if (def?.type === 'date' && isNaN(new Date(v.slice(0, 10)).getTime())) {
        throw new BadRequestException(`Parameter '${label}' bukan tanggal yang valid`);
      }
    }

    const rows = (await provider.run(params, { prisma: this.prisma, variant })).slice(0, MAX_ROWS);
    const info = await this.buildInfo(provider, params, variant, user);
    return { info, rows };
  }

  private async buildInfo(provider: ReportProvider, params: Record<string, any>, variant: string | undefined, user: any) {
    const [company, dbUser] = await Promise.all([
      user?.companyId ? this.prisma.company.findUnique({ where: { ID: user.companyId } }) : null,
      user?.id ? this.prisma.user.findUnique({ where: { ID: user.id }, select: { Name: true, Username: true } }) : null,
    ]);
    const alamat2 = [company?.City, company?.Province, company?.PostalCode].filter(Boolean).join(', ');
    const InfoFilter: Record<string, string> = {
      NamaLaporan: provider.variants?.find((v) => v.key === variant)?.title ?? provider.title,
    };
    for (const def of provider.params) {
      const raw = str(params, def.key);
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

  private async humanize(def: ReportParamDef, raw: string, params: Record<string, any>): Promise<string> {
    if (def.type === 'date') {
      const [y, m, d] = raw.slice(0, 10).split('-');
      return y && m && d ? `${d}/${m}/${y}` : raw;
    }
    if (def.type === 'checkbox') return params[def.key] === true || raw === 'true' ? 'Ya' : 'Tidak';
    const opt = def.options?.find((o) => o.value === raw);
    if (opt) return opt.label;
    if (def.source) {
      const model = LOOKUP_MODELS[def.source.endpoint];
      const byId = def.source.valueField === 'ID';
      if (model && (!byId || Number.isFinite(Number(raw)))) {
        const where = byId ? { ID: Number(raw) } : { [def.source.valueField]: raw };
        const rec = await (this.prisma as any)[model].findFirst({ where });
        if (rec?.[def.source.labelField]) return String(rec[def.source.labelField]);
      }
    }
    return raw;
  }

  // ─── Templates ─────────────────────────────────────────────
  private scope(user: any) {
    return { CompanyID: user?.companyId ?? null };
  }

  private validateDefinition(def: any) {
    const bad = (m: string) => new BadRequestException(`Definition tidak valid: ${m}`);
    if (!isObj(def)) throw bad('harus berupa objek');
    if (def.version !== 1) throw bad('version harus 1');
    if (!isObj(def.page)) throw bad('page wajib ada');
    if (!isObj(def.table) || !Array.isArray(def.table.columns)) throw bad('table.columns harus berupa array');
  }

  private toRecord(t: any) {
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

  async listTemplates(key: string, user: any) {
    const rows = await this.prisma.reportTemplate.findMany({
      where: { ReportKey: key, ...this.scope(user) },
      orderBy: [{ IsDefault: 'desc' }, { CreatedAt: 'desc' }, { ID: 'desc' }],
    });
    return rows.map((r) => this.toRecord(r));
  }

  async createTemplate(body: any, user: any) {
    const { ReportKey, Name, Definition, IsDefault } = body ?? {};
    if (typeof ReportKey !== 'string' || !ReportKey.trim() || ReportKey.length > 100) throw new BadRequestException('ReportKey wajib diisi');
    if (typeof Name !== 'string' || !Name.trim() || Name.length > 255) throw new BadRequestException('Name wajib diisi');
    this.validateDefinition(Definition);
    const scope = this.scope(user);
    const key = ReportKey.trim();
    const created = await this.prisma.$transaction(async (tx) => {
      if (IsDefault) await tx.reportTemplate.updateMany({ where: { ReportKey: key, ...scope }, data: { IsDefault: false } });
      return tx.reportTemplate.create({
        data: { ReportKey: key, Name: Name.trim(), Definition, IsDefault: !!IsDefault, CompanyID: scope.CompanyID, CreatedByID: user?.id ?? null },
      });
    });
    return this.toRecord(created);
  }

  private async findOwned(id: number, user: any) {
    const t = await this.prisma.reportTemplate.findFirst({ where: { ID: id, ...this.scope(user) } });
    if (!t) throw new NotFoundException('Template tidak ditemukan');
    return t;
  }

  async updateTemplate(id: number, body: any, user: any) {
    const existing = await this.findOwned(id, user);
    const data: any = {};
    if (body?.Name !== undefined) {
      if (typeof body.Name !== 'string' || !body.Name.trim() || body.Name.length > 255) throw new BadRequestException('Name tidak valid');
      data.Name = body.Name.trim();
    }
    if (body?.Definition !== undefined) {
      this.validateDefinition(body.Definition);
      data.Definition = body.Definition;
    }
    if (body?.IsDefault !== undefined) data.IsDefault = !!body.IsDefault;
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

  async deleteTemplate(id: number, user: any) {
    await this.findOwned(id, user);
    await this.prisma.reportTemplate.delete({ where: { ID: id } });
  }
}
