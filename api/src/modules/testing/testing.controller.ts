import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Controller, Get, Post, Patch, Delete, Put, Param, Body, Query, UseGuards, Headers, BadRequestException } from '@nestjs/common';
import { TestingService } from './testing.service';
import { CreateTestingDto, UpdateTestingDto } from './dto/testing.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';
import { PrismaService } from '../../common/prisma/prisma-service';

type HeadersRecord = Record<string, string | string[] | undefined>;

@ApiTags('Testing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('testing')
export class TestingController {
  constructor(
    private readonly testingService: TestingService,
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
  @ApiOperation({ summary: 'Get all Testings with OData query support' })
  @ApiQuery({ name: '$select', required: false, description: 'Select fields (comma separated)' })
  @ApiQuery({ name: '$include', required: false, description: 'Include relations (e.g., relation1,relation2)' })
  @ApiQuery({ name: '$where', required: false, description: 'Filter by field (JSON)' })
  @ApiQuery({ name: '$orderBy', required: false, description: 'Sort by field (JSON: {"field": "asc"})' })
  @ApiQuery({ name: '$skip', required: false, type: Number, description: 'Offset' })
  @ApiQuery({ name: '$take', required: false, type: Number, description: 'Limit (max 100)' })
  @ApiQuery({ name: '$search', required: false, description: 'Search keyword' })
  async findAll(@Query() query: any) {
    return this.testingService.findAll(query);
  }

  @Get('count')
  @ApiOperation({ summary: 'Get count of Testings' })
  async getCount(@Query() query: any) {
    return this.testingService.getCount(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Testing by ID' })
  async findById(@Param('id') id: string, @Query() query: any) {
    return this.testingService.findById(id, query);
  }

  @Get('by/:field/:value')
  @ApiOperation({ summary: 'Get Testing by field reference' })
  async findByField(@Param('field') field: string, @Param('value') value: string, @Query() query: any) {
    return this.testingService.findByField(field, value, query);
  }

  // ═══════════════════════════════════════════════════════════════════
  // WRITE ENDPOINTS (With transaction by default)
  // ═══════════════════════════════════════════════════════════════════

  @Post()
  @ApiOperation({ summary: 'Create new Testing' })
  async create(@Body() dto: CreateTestingDto, @Headers() headers: Record<string, string>) {
    return this.withTransaction(headers, async (tx) => {
      const result = await tx.Testing.create({ data: dto });
      await this.testingService.invalidateCache();
      return result;
    });
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Create multiple Testings' })
  async createBulk(@Body() dtos: CreateTestingDto[], @Headers() headers: Record<string, string>) {
    return this.withTransaction(headers, async (tx) => {
      const result = await tx.Testing.createMany({ data: dtos });
      await this.testingService.invalidateCache();
      return result;
    });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update Testing by ID' })
  async patchById(
    @Param('id') id: string,
    @Body() dto: Partial<UpdateTestingDto>,
    @Headers() headers: Record<string, string>,
  ) {
    return this.withTransaction(headers, async (tx) => {
      const result = await tx.Testing.update({
        where: { id: parseInt(id) },
        data: dto,
      });
      await this.testingService.invalidateCache();
      return result;
    });
  }

  @Patch('by/:field/:value')
  @ApiOperation({ summary: 'Update Testings by field reference' })
  async patchByFilterReference(
    @Param('field') field: string,
    @Param('value') value: string,
    @Body() dto: Partial<UpdateTestingDto>,
    @Headers() headers: Record<string, string>,
  ) {
    return this.withTransaction(headers, async (tx) => {
      const where = { [field]: value };
      const result = await tx.Testing.updateMany({
        where,
        data: dto,
      });
      await this.testingService.invalidateCache();
      return result;
    });
  }

  @Patch('bulk')
  @ApiOperation({ summary: 'Update multiple Testings' })
  async patchBulk(
    @Body() body: { ids: number[]; data: Partial<UpdateTestingDto> },
    @Headers() headers: Record<string, string>,
  ) {
    return this.withTransaction(headers, async (tx) => {
      const result = await tx.Testing.updateMany({
        where: { id: { in: body.ids } },
        data: body.data,
      });
      await this.testingService.invalidateCache();
      return result;
    });
  }

  // PUT (UPSERT) endpoints
  @Put()
  @ApiOperation({ summary: 'Upsert Testing' })
  async upsert(
    @Body() body: { where: { id: number }; create: CreateTestingDto; update: Partial<UpdateTestingDto> },
    @Headers() headers: Record<string, string>,
  ) {
    return this.withTransaction(headers, async (tx) => {
      const result = await tx.Testing.upsert({
        where: body.where,
        create: body.create,
        update: body.update,
      });
      await this.testingService.invalidateCache();
      return result;
    });
  }

  @Put('by/:field')
  @ApiOperation({ summary: 'Upsert Testing by field reference' })
  async upsertByFilterReference(
    @Param('field') field: string,
    @Body() body: { filterValue: any; create: CreateTestingDto; update: Partial<UpdateTestingDto> },
    @Headers() headers: Record<string, string>,
  ) {
    return this.withTransaction(headers, async (tx) => {
      const where = { [field]: body.filterValue };
      const result = await tx.Testing.upsert({
        where,
        create: body.create,
        update: body.update,
      });
      await this.testingService.invalidateCache();
      return result;
    });
  }

  @Put('bulk')
  @ApiOperation({ summary: 'Bulk upsert Testings' })
  async upsertBulk(
    @Body() body: { items: Array<{ where?: any; create: CreateTestingDto; update?: Partial<UpdateTestingDto> }> },
    @Headers() headers: HeadersRecord,
  ) {
    return this.withTransaction(headers, async (tx) => {
      const results: any[] = [];
      for (const item of body.items) {
        const result = await tx.Testing.upsert({
          where: item.where || { id: 0 },
          create: item.create,
          update: item.update || {},
        });
        results.push(result);
      }
      await this.testingService.invalidateCache();
      return results;
    });
  }

  // DELETE endpoints
  @Delete(':id')
  @ApiOperation({ summary: 'Delete Testing by ID' })
  async deleteById(@Param('id') id: string, @Headers() headers: HeadersRecord) {
    return this.withTransaction(headers, async (tx) => {
      const result = await tx.Testing.delete({
        where: { id: parseInt(id) },
      });
      await this.testingService.invalidateCache();
      return result;
    });
  }

  @Delete('by/:field/:value')
  @ApiOperation({ summary: 'Delete Testings by field reference' })
  async deleteByFilterReference(
    @Param('field') field: string,
    @Param('value') value: string,
    @Headers() headers: HeadersRecord,
  ) {
    return this.withTransaction(headers, async (tx) => {
      const result = await tx.Testing.deleteMany({
        where: { [field]: value },
      });
      await this.testingService.invalidateCache();
      return result;
    });
  }

  @Delete('bulk')
  @ApiOperation({ summary: 'Delete multiple Testings' })
  async deleteBulk(
    @Body() body: { ids: number[] },
    @Headers() headers: HeadersRecord,
  ) {
    return this.withTransaction(headers, async (tx) => {
      const result = await tx.Testing.deleteMany({
        where: { id: { in: body.ids } },
      });
      await this.testingService.invalidateCache();
      return result;
    });
  }
}
