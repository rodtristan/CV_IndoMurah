import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';
import { PrismaService } from '../../common/prisma/prisma-service';

/**
 * Persists the Pengaturan Umum options that have no AppSetting column
 * (namespaced "general.*" keys). The AppSetting table is a fixed-column
 * singleton, so the key/value bag lives as JSON in one ReportTemplate row
 * (ReportKey = 'app-setting:general'). No schema change required.
 */
const STORE_KEY = 'app-setting:general';
const NS = 'general.';

@ApiTags('AppSettings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('general-settings')
export class GeneralSettingsController {
  constructor(private readonly prisma: PrismaService) {}

  private async row() {
    return this.prisma.reportTemplate.findFirst({ where: { ReportKey: STORE_KEY } });
  }

  @Get()
  @ApiOperation({ summary: 'Get all general.* settings as a flat key/value object' })
  async get() {
    const r = await this.row();
    return { success: true, data: (r?.Definition as Record<string, unknown>) ?? {} };
  }

  @Put(':scope')
  @ApiOperation({ summary: 'Merge general.* settings (keys outside the namespace are ignored; :scope is a placeholder, use "all")' })
  async put(@Body() body: Record<string, unknown>) {
    const clean: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(body ?? {})) {
      if (k.startsWith(NS) && (v === null || ['string', 'number', 'boolean'].includes(typeof v))) clean[k] = v;
    }
    const r = await this.row();
    const merged = { ...((r?.Definition as Record<string, unknown>) ?? {}), ...clean } as object;
    if (r) await this.prisma.reportTemplate.update({ where: { ID: r.ID }, data: { Definition: merged } });
    else await this.prisma.reportTemplate.create({ data: { ReportKey: STORE_KEY, Name: 'Pengaturan Umum', Definition: merged } });
    return { success: true, data: merged };
  }
}
