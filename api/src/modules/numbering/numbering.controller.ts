import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Controller, Get, Post, Patch, Delete, Put, Param, Body, Query, UseGuards, Headers, BadRequestException } from '@nestjs/common';
import { NumberingService } from './numbering.service';
import { CreateNumberingDto, UpdateNumberingDto } from './dto/numbering.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';
import { PrismaService } from '../../common/prisma/prisma-service';

type HeadersRecord = Record<string, string | string[] | undefined>;

@ApiTags('Numbering')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('numbering')
export class NumberingController {
  constructor(
    private readonly numberingService: NumberingService,
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
  @ApiOperation({ summary: 'Get all Numberings with OData query support' })
  async findAll(@Query() query: any) {
    return this.numberingService.findAll(query);
  }

  @Get('count')
  @ApiOperation({ summary: 'Get count of Numberings' })
  async getCount(@Query() query: any) {
    return this.numberingService.getCount(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Numbering by ID' })
  async findById(@Param('id') id: string, @Query() query: any) {
    return this.numberingService.findById(id, query);
  }

  @Get('by/:field/:value')
  @ApiOperation({ summary: 'Get Numbering by field reference' })
  async findByField(@Param('field') field: string, @Param('value') value: string, @Query() query: any) {
    return this.numberingService.findByField(field, value, query);
  }

  // ═══════════════════════════════════════════════════════════════════
  // WRITE ENDPOINTS (With transaction by default)
  // ═══════════════════════════════════════════════════════════════════

  @Post()
  @ApiOperation({ summary: 'Create new Numbering' })
  async create(@Body() dto: CreateNumberingDto, @Headers() headers: Record<string, string>) {
    return this.withTransaction(headers, async (tx) => {
      const result = await tx.Numbering.create({ data: dto });
      await this.numberingService.invalidateCache();
      return result;
    });
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Create multiple Numberings' })
  async createBulk(@Body() dtos: CreateNumberingDto[], @Headers() headers: Record<string, string>) {
    return this.withTransaction(headers, async (tx) => {
      const result = await tx.Numbering.createMany({ data: dtos });
      await this.numberingService.invalidateCache();
      return result;
    });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update Numbering by ID' })
  async patchById(
    @Param('id') id: string,
    @Body() dto: Partial<UpdateNumberingDto>,
    @Headers() headers: Record<string, string>,
  ) {
    return this.withTransaction(headers, async (tx) => {
      const result = await tx.Numbering.update({
        where: { id: parseInt(id) },
        data: dto,
      });
      await this.numberingService.invalidateCache();
      return result;
    });
  }

  @Patch('by/:field/:value')
  @ApiOperation({ summary: 'Update Numberings by field reference' })
  async patchByFilterReference(
    @Param('field') field: string,
    @Param('value') value: string,
    @Body() dto: Partial<UpdateNumberingDto>,
    @Headers() headers: Record<string, string>,
  ) {
    return this.withTransaction(headers, async (tx) => {
      const where = { [field]: value };
      const result = await tx.Numbering.updateMany({
        where,
        data: dto,
      });
      await this.numberingService.invalidateCache();
      return result;
    });
  }

  @Patch('bulk')
  @ApiOperation({ summary: 'Update multiple Numberings' })
  async patchBulk(
    @Body() body: { ids: number[]; data: Partial<UpdateNumberingDto> },
    @Headers() headers: Record<string, string>,
  ) {
    return this.withTransaction(headers, async (tx) => {
      const result = await tx.Numbering.updateMany({
        where: { id: { in: body.ids } },
        data: body.data,
      });
      await this.numberingService.invalidateCache();
      return result;
    });
  }

  // PUT (UPSERT) endpoints
  @Put()
  @ApiOperation({ summary: 'Upsert Numbering' })
  async upsert(
    @Body() body: { where: { id: number }; create: CreateNumberingDto; update: Partial<UpdateNumberingDto> },
    @Headers() headers: Record<string, string>,
  ) {
    return this.withTransaction(headers, async (tx) => {
      const result = await tx.Numbering.upsert({
        where: body.where,
        create: body.create,
        update: body.update,
      });
      await this.numberingService.invalidateCache();
      return result;
    });
  }

  @Put('by/:field')
  @ApiOperation({ summary: 'Upsert Numbering by field reference' })
  async upsertByFilterReference(
    @Param('field') field: string,
    @Body() body: { filterValue: any; create: CreateNumberingDto; update: Partial<UpdateNumberingDto> },
    @Headers() headers: Record<string, string>,
  ) {
    return this.withTransaction(headers, async (tx) => {
      const where = { [field]: body.filterValue };
      const result = await tx.Numbering.upsert({
        where,
        create: body.create,
        update: body.update,
      });
      await this.numberingService.invalidateCache();
      return result;
    });
  }

  @Put('bulk')
  @ApiOperation({ summary: 'Bulk upsert Numberings' })
  async upsertBulk(
    @Body() body: { items: Array<{ where?: any; create: CreateNumberingDto; update?: Partial<UpdateNumberingDto> }> },
    @Headers() headers: Record<string, string>,
  ) {
    return this.withTransaction(headers, async (tx) => {
      const results = [];
      for (const item of body.items) {
        const result = await tx.Numbering.upsert({
          where: item.where || { id: 0 },
          create: item.create,
          update: item.update || {},
        });
        results.push(result);
      }
      await this.numberingService.invalidateCache();
      return results;
    });
  }

  // DELETE endpoints
  @Delete(':id')
  @ApiOperation({ summary: 'Delete Numbering by ID' })
  async deleteById(@Param('id') id: string, @Headers() headers: Record<string, string>) {
    return this.withTransaction(headers, async (tx) => {
      const result = await tx.Numbering.delete({
        where: { id: parseInt(id) },
      });
      await this.numberingService.invalidateCache();
      return result;
    });
  }

  @Delete('by/:field/:value')
  @ApiOperation({ summary: 'Delete Numberings by field reference' })
  async deleteByFilterReference(
    @Param('field') field: string,
    @Param('value') value: string,
    @Headers() headers: Record<string, string>,
  ) {
    return this.withTransaction(headers, async (tx) => {
      const result = await tx.Numbering.deleteMany({
        where: { [field]: value },
      });
      await this.numberingService.invalidateCache();
      return result;
    });
  }

  @Delete('bulk')
  @ApiOperation({ summary: 'Delete multiple Numberings' })
  async deleteBulk(
    @Body() body: { ids: number[] },
    @Headers() headers: Record<string, string>,
  ) {
    return this.withTransaction(headers, async (tx) => {
      const result = await tx.Numbering.deleteMany({
        where: { id: { in: body.ids } },
      });
      await this.numberingService.invalidateCache();
      return result;
    });
  }
}
