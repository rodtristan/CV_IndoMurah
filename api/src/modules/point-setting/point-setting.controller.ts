import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Controller, Get, Post, Patch, Delete, Put, Param, Body, Query, UseGuards, Headers, BadRequestException } from '@nestjs/common';
import { PointSettingService } from './point-setting.service';
import { CreatePointSettingDto, UpdatePointSettingDto } from './dto/point-setting.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';
import { PrismaService } from '../../common/prisma/prisma-service';

type HeadersRecord = Record<string, string | string[] | undefined>;

@ApiTags('PointSetting')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('point-setting')
export class PointSettingController {
  constructor(
    private readonly pointSettingService: PointSettingService,
    private readonly prisma: PrismaService,
  ) {}

  // ═══════════════════════════════════════════════════════════════════
  // TRANSACTION BLOCK HELPER
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Execute callback dalam transaction block
   * By default semua endpoint menggunakan transaction
   */
  private async withTransaction<T>(
    headers: HeadersRecord,
    callback: (tx: any) => Promise<T>,
  ): Promise<T> {
    const useTransaction = headers['x-use-transaction'] !== 'false';

    if (useTransaction) {
      return this.prisma.$transaction(async (tx) => {
        return callback(tx);
      });
    }

    return callback(this.prisma);
  }

  // ═══════════════════════════════════════════════════════════════════
  // READ ENDPOINTS (No transaction needed)
  // ═══════════════════════════════════════════════════════════════════

  @Get()
  @ApiOperation({ summary: 'Get all PointSettings with OData query support' })
  async findAll(@Query() query: any) {
    return this.pointSettingService.findAll(query);
  }

  @Get('count')
  @ApiOperation({ summary: 'Get count of PointSettings' })
  async getCount(@Query() query: any) {
    return this.pointSettingService.getCount(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get PointSetting by ID' })
  async findById(@Param('id') id: string, @Query() query: any) {
    return this.pointSettingService.findById(id, query);
  }

  @Get('by/:field/:value')
  @ApiOperation({ summary: 'Get PointSetting by field reference' })
  async findByField(@Param('field') field: string, @Param('value') value: string, @Query() query: any) {
    return this.pointSettingService.findByField(field, value, query);
  }

  // ═══════════════════════════════════════════════════════════════════
  // WRITE ENDPOINTS (With transaction by default)
  // ═══════════════════════════════════════════════════════════════════

  @Post()
  @ApiOperation({ summary: 'Create new PointSetting' })
  async create(@Body() dto: CreatePointSettingDto, @Headers() headers: Record<string, string>) {
    return this.withTransaction(headers, async (tx) => {
      const result = await tx.PointSetting.create({ data: dto });
      await this.pointSettingService.invalidateCache();
      return result;
    });
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Create multiple PointSettings' })
  async createBulk(@Body() dtos: CreatePointSettingDto[], @Headers() headers: Record<string, string>) {
    return this.withTransaction(headers, async (tx) => {
      const result = await tx.PointSetting.createMany({ data: dtos });
      await this.pointSettingService.invalidateCache();
      return result;
    });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update PointSetting by ID' })
  async patchById(
    @Param('id') id: string,
    @Body() dto: Partial<UpdatePointSettingDto>,
    @Headers() headers: Record<string, string>,
  ) {
    return this.withTransaction(headers, async (tx) => {
      const result = await tx.PointSetting.update({
        where: { id: parseInt(id) },
        data: dto,
      });
      await this.pointSettingService.invalidateCache();
      return result;
    });
  }

  @Patch('by/:field/:value')
  @ApiOperation({ summary: 'Update PointSettings by field reference' })
  async patchByFilterReference(
    @Param('field') field: string,
    @Param('value') value: string,
    @Body() dto: Partial<UpdatePointSettingDto>,
    @Headers() headers: Record<string, string>,
  ) {
    return this.withTransaction(headers, async (tx) => {
      const where = { [field]: value };
      const result = await tx.PointSetting.updateMany({
        where,
        data: dto,
      });
      await this.pointSettingService.invalidateCache();
      return result;
    });
  }

  @Patch('bulk')
  @ApiOperation({ summary: 'Update multiple PointSettings' })
  async patchBulk(
    @Body() body: { ids: number[]; data: Partial<UpdatePointSettingDto> },
    @Headers() headers: Record<string, string>,
  ) {
    return this.withTransaction(headers, async (tx) => {
      const result = await tx.PointSetting.updateMany({
        where: { id: { in: body.ids } },
        data: body.data,
      });
      await this.pointSettingService.invalidateCache();
      return result;
    });
  }

  // PUT (UPSERT) endpoints
  @Put()
  @ApiOperation({ summary: 'Upsert PointSetting' })
  async upsert(
    @Body() body: { where: { id: number }; create: CreatePointSettingDto; update: Partial<UpdatePointSettingDto> },
    @Headers() headers: Record<string, string>,
  ) {
    return this.withTransaction(headers, async (tx) => {
      const result = await tx.PointSetting.upsert({
        where: body.where,
        create: body.create,
        update: body.update,
      });
      await this.pointSettingService.invalidateCache();
      return result;
    });
  }

  @Put('by/:field')
  @ApiOperation({ summary: 'Upsert PointSetting by field reference' })
  async upsertByFilterReference(
    @Param('field') field: string,
    @Body() body: { filterValue: any; create: CreatePointSettingDto; update: Partial<UpdatePointSettingDto> },
    @Headers() headers: Record<string, string>,
  ) {
    return this.withTransaction(headers, async (tx) => {
      const where = { [field]: body.filterValue };
      const result = await tx.PointSetting.upsert({
        where,
        create: body.create,
        update: body.update,
      });
      await this.pointSettingService.invalidateCache();
      return result;
    });
  }

  @Put('bulk')
  @ApiOperation({ summary: 'Bulk upsert PointSettings' })
  async upsertBulk(
    @Body() body: { items: Array<{ where?: any; create: CreatePointSettingDto; update?: Partial<UpdatePointSettingDto> }> },
    @Headers() headers: Record<string, string>,
  ) {
    return this.withTransaction(headers, async (tx) => {
      const results = [];
      for (const item of body.items) {
        const result = await tx.PointSetting.upsert({
          where: item.where || { id: 0 },
          create: item.create,
          update: item.update || {},
        });
        results.push(result);
      }
      await this.pointSettingService.invalidateCache();
      return results;
    });
  }

  // DELETE endpoints
  @Delete(':id')
  @ApiOperation({ summary: 'Delete PointSetting by ID' })
  async deleteById(@Param('id') id: string, @Headers() headers: Record<string, string>) {
    return this.withTransaction(headers, async (tx) => {
      const result = await tx.PointSetting.delete({
        where: { id: parseInt(id) },
      });
      await this.pointSettingService.invalidateCache();
      return result;
    });
  }

  @Delete('by/:field/:value')
  @ApiOperation({ summary: 'Delete PointSettings by field reference' })
  async deleteByFilterReference(
    @Param('field') field: string,
    @Param('value') value: string,
    @Headers() headers: Record<string, string>,
  ) {
    return this.withTransaction(headers, async (tx) => {
      const result = await tx.PointSetting.deleteMany({
        where: { [field]: value },
      });
      await this.pointSettingService.invalidateCache();
      return result;
    });
  }

  @Delete('bulk')
  @ApiOperation({ summary: 'Delete multiple PointSettings' })
  async deleteBulk(
    @Body() body: { ids: number[] },
    @Headers() headers: Record<string, string>,
  ) {
    return this.withTransaction(headers, async (tx) => {
      const result = await tx.PointSetting.deleteMany({
        where: { id: { in: body.ids } },
      });
      await this.pointSettingService.invalidateCache();
      return result;
    });
  }
}
