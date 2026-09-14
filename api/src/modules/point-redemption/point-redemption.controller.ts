import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Controller, Get, Post, Patch, Delete, Put, Param, Body, Query, UseGuards, Headers, BadRequestException } from '@nestjs/common';
import { PointRedemptionService } from './point-redemption.service';
import { CreatePointRedemptionDto, UpdatePointRedemptionDto } from './dto/point-redemption.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';
import { PrismaService } from '../../common/prisma/prisma-service';

type HeadersRecord = Record<string, string | string[] | undefined>;

@ApiTags('PointRedemption')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('point-redemption')
export class PointRedemptionController {
  constructor(
    private readonly pointRedemptionService: PointRedemptionService,
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
  @ApiOperation({ summary: 'Get all PointRedemptions with OData query support' })
  async findAll(@Query() query: any) {
    return this.pointRedemptionService.findAll(query);
  }

  @Get('count')
  @ApiOperation({ summary: 'Get count of PointRedemptions' })
  async getCount(@Query() query: any) {
    return this.pointRedemptionService.getCount(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get PointRedemption by ID' })
  async findById(@Param('id') id: string, @Query() query: any) {
    return this.pointRedemptionService.findById(id, query);
  }

  @Get('by/:field/:value')
  @ApiOperation({ summary: 'Get PointRedemption by field reference' })
  async findByField(@Param('field') field: string, @Param('value') value: string, @Query() query: any) {
    return this.pointRedemptionService.findByField(field, value, query);
  }

  // ═══════════════════════════════════════════════════════════════════
  // WRITE ENDPOINTS (With transaction by default)
  // ═══════════════════════════════════════════════════════════════════

  @Post()
  @ApiOperation({ summary: 'Create new PointRedemption' })
  async create(@Body() dto: CreatePointRedemptionDto, @Headers() headers: Record<string, string>) {
    return this.withTransaction(headers, async (tx) => {
      const result = await tx.PointRedemption.create({ data: dto });
      await this.pointRedemptionService.invalidateCache();
      return result;
    });
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Create multiple PointRedemptions' })
  async createBulk(@Body() dtos: CreatePointRedemptionDto[], @Headers() headers: Record<string, string>) {
    return this.withTransaction(headers, async (tx) => {
      const result = await tx.PointRedemption.createMany({ data: dtos });
      await this.pointRedemptionService.invalidateCache();
      return result;
    });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update PointRedemption by ID' })
  async patchById(
    @Param('id') id: string,
    @Body() dto: Partial<UpdatePointRedemptionDto>,
    @Headers() headers: Record<string, string>,
  ) {
    return this.withTransaction(headers, async (tx) => {
      const result = await tx.PointRedemption.update({
        where: { id: parseInt(id) },
        data: dto,
      });
      await this.pointRedemptionService.invalidateCache();
      return result;
    });
  }

  @Patch('by/:field/:value')
  @ApiOperation({ summary: 'Update PointRedemptions by field reference' })
  async patchByFilterReference(
    @Param('field') field: string,
    @Param('value') value: string,
    @Body() dto: Partial<UpdatePointRedemptionDto>,
    @Headers() headers: Record<string, string>,
  ) {
    return this.withTransaction(headers, async (tx) => {
      const where = { [field]: value };
      const result = await tx.PointRedemption.updateMany({
        where,
        data: dto,
      });
      await this.pointRedemptionService.invalidateCache();
      return result;
    });
  }

  @Patch('bulk')
  @ApiOperation({ summary: 'Update multiple PointRedemptions' })
  async patchBulk(
    @Body() body: { ids: number[]; data: Partial<UpdatePointRedemptionDto> },
    @Headers() headers: Record<string, string>,
  ) {
    return this.withTransaction(headers, async (tx) => {
      const result = await tx.PointRedemption.updateMany({
        where: { id: { in: body.ids } },
        data: body.data,
      });
      await this.pointRedemptionService.invalidateCache();
      return result;
    });
  }

  // PUT (UPSERT) endpoints
  @Put()
  @ApiOperation({ summary: 'Upsert PointRedemption' })
  async upsert(
    @Body() body: { where: { id: number }; create: CreatePointRedemptionDto; update: Partial<UpdatePointRedemptionDto> },
    @Headers() headers: Record<string, string>,
  ) {
    return this.withTransaction(headers, async (tx) => {
      const result = await tx.PointRedemption.upsert({
        where: body.where,
        create: body.create,
        update: body.update,
      });
      await this.pointRedemptionService.invalidateCache();
      return result;
    });
  }

  @Put('by/:field')
  @ApiOperation({ summary: 'Upsert PointRedemption by field reference' })
  async upsertByFilterReference(
    @Param('field') field: string,
    @Body() body: { filterValue: any; create: CreatePointRedemptionDto; update: Partial<UpdatePointRedemptionDto> },
    @Headers() headers: Record<string, string>,
  ) {
    return this.withTransaction(headers, async (tx) => {
      const where = { [field]: body.filterValue };
      const result = await tx.PointRedemption.upsert({
        where,
        create: body.create,
        update: body.update,
      });
      await this.pointRedemptionService.invalidateCache();
      return result;
    });
  }

  @Put('bulk')
  @ApiOperation({ summary: 'Bulk upsert PointRedemptions' })
  async upsertBulk(
    @Body() body: { items: Array<{ where?: any; create: CreatePointRedemptionDto; update?: Partial<UpdatePointRedemptionDto> }> },
    @Headers() headers: Record<string, string>,
  ) {
    return this.withTransaction(headers, async (tx) => {
      const results: any[] = [];
      for (const item of body.items) {
        const result = await tx.PointRedemption.upsert({
          where: item.where || { id: 0 },
          create: item.create,
          update: item.update || {},
        });
        results.push(result);
      }
      await this.pointRedemptionService.invalidateCache();
      return results;
    });
  }

  // DELETE endpoints
  @Delete(':id')
  @ApiOperation({ summary: 'Delete PointRedemption by ID' })
  async deleteById(@Param('id') id: string, @Headers() headers: Record<string, string>) {
    return this.withTransaction(headers, async (tx) => {
      const result = await tx.PointRedemption.delete({
        where: { id: parseInt(id) },
      });
      await this.pointRedemptionService.invalidateCache();
      return result;
    });
  }

  @Delete('by/:field/:value')
  @ApiOperation({ summary: 'Delete PointRedemptions by field reference' })
  async deleteByFilterReference(
    @Param('field') field: string,
    @Param('value') value: string,
    @Headers() headers: Record<string, string>,
  ) {
    return this.withTransaction(headers, async (tx) => {
      const result = await tx.PointRedemption.deleteMany({
        where: { [field]: value },
      });
      await this.pointRedemptionService.invalidateCache();
      return result;
    });
  }

  @Delete('bulk')
  @ApiOperation({ summary: 'Delete multiple PointRedemptions' })
  async deleteBulk(
    @Body() body: { ids: number[] },
    @Headers() headers: Record<string, string>,
  ) {
    return this.withTransaction(headers, async (tx) => {
      const result = await tx.PointRedemption.deleteMany({
        where: { id: { in: body.ids } },
      });
      await this.pointRedemptionService.invalidateCache();
      return result;
    });
  }
}
