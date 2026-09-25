import { BadRequestException, Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ImportService } from './import.service';
import { ImportItemSatuanDto, ImportItemLevelDto, ImportItemJumlahDto, ValidateImportDto } from './import.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';
import { CurrentUser } from '../../common/decorators/current-user-decorator';

/**
 * Body dapat berupa multipart (field "file" = CSV) atau JSON `{ data: [...] }`.
 * Upload memakai @fastify/multipart (terdaftar di main.ts), bukan Multer/Express.
 */
async function readRows<T>(req: any, service: ImportService, body: any): Promise<T[]> {
  if (req.isMultipart?.()) {
    const file = await req.file();
    if (!file) throw new BadRequestException('File CSV tidak ditemukan');
    return (await service.parseCSV(await file.toBuffer())) as T[];
  }
  const data = typeof body?.data === 'string' ? JSON.parse(body.data) : body?.data;
  if (!Array.isArray(data)) throw new BadRequestException('Kirim file CSV (multipart) atau JSON { data: [...] }');
  return data as T[];
}

@Controller('import')
@UseGuards(JwtAuthGuard)
export class ImportController {
  constructor(private readonly importService: ImportService) {}

  @Post('validate')
  async validateImport(@Body() dto: ValidateImportDto) {
    return this.importService.validateImport(dto);
  }

  @Post('items-satuan')
  async importItemsSatuan(@Req() req: any, @Body() body: any, @CurrentUser() user: any) {
    return this.importService.importSatuan(await readRows<ImportItemSatuanDto>(req, this.importService, body), String(user.id));
  }

  @Post('items-level')
  async importItemsLevel(@Req() req: any, @Body() body: any, @CurrentUser() user: any) {
    return this.importService.importLevel(await readRows<ImportItemLevelDto>(req, this.importService, body), String(user.id));
  }

  @Post('items-jumlah')
  async importItemsJumlah(@Req() req: any, @Body() body: any, @CurrentUser() user: any) {
    return this.importService.importJumlah(await readRows<ImportItemJumlahDto>(req, this.importService, body), String(user.id));
  }

  @Get('progress/:importId')
  async getProgress(@Param('importId') importId: string) {
    const progress = this.importService.getProgress(importId);
    if (!progress) return { status: 'not_found', message: 'Import job not found' };
    return progress;
  }
}
