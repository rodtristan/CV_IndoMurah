import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Controller, Get, Post, Patch, Delete, Put, Param, Body, Query, UseGuards, Headers, BadRequestException } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CreateCompanyDto, UpdateCompanyDto } from './dto/company.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';
import { PrismaService } from '../../common/prisma/prisma-service';

type HeadersRecord = Record<string, string | string[] | undefined>;

@ApiTags('Company')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('company')
export class CompanyController {
  constructor(
    private readonly companyService: CompanyService,
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
  @ApiOperation({ summary: 'Get all Companies with OData query support' })
  async findAll(@Query() query: any) {
    return this.companyService.findAll(query);
  }

  @Get('count')
  @ApiOperation({ summary: 'Get count of Companys' })
  async getCount(@Query() query: any) {
    return this.companyService.getCount(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Company by ID' })
  async findById(@Param('id') id: string, @Query() query: any) {
    return this.companyService.findById(id, query);
  }

  @Get('by/:field/:value')
  @ApiOperation({ summary: 'Get Company by field reference' })
  async findByField(@Param('field') field: string, @Param('value') value: string, @Query() query: any) {
    return this.companyService.findByField(field, value, query);
  }

  // ═══════════════════════════════════════════════════════════════════
  // WRITE ENDPOINTS (With transaction by default)
  // ═══════════════════════════════════════════════════════════════════

  @Post()
  @ApiOperation({ summary: 'Create new Company' })
  async create(@Body() dto: CreateCompanyDto, @Headers() headers: Record<string, string>) {
    return this.withTransaction(headers, async (tx) => {
      const result = await tx.Company.create({ data: dto });
      await this.companyService.invalidateCache();
      return result;
    });
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Create multiple Companys' })
  async createBulk(@Body() dtos: CreateCompanyDto[], @Headers() headers: Record<string, string>) {
    return this.withTransaction(headers, async (tx) => {
      const result = await tx.Company.createMany({ data: dtos });
      await this.companyService.invalidateCache();
      return result;
    });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update Company by ID' })
  async patchById(
    @Param('id') id: string,
    @Body() dto: Partial<UpdateCompanyDto>,
    @Headers() headers: Record<string, string>,
  ) {
    return this.withTransaction(headers, async (tx) => {
      const result = await tx.Company.update({
        where: { id: parseInt(id) },
        data: dto,
      });
      await this.companyService.invalidateCache();
      return result;
    });
  }

  @Patch('by/:field/:value')
  @ApiOperation({ summary: 'Update Companys by field reference' })
  async patchByFilterReference(
    @Param('field') field: string,
    @Param('value') value: string,
    @Body() dto: Partial<UpdateCompanyDto>,
    @Headers() headers: Record<string, string>,
  ) {
    return this.withTransaction(headers, async (tx) => {
      const where = { [field]: value };
      const result = await tx.Company.updateMany({
        where,
        data: dto,
      });
      await this.companyService.invalidateCache();
      return result;
    });
  }

  @Patch('bulk')
  @ApiOperation({ summary: 'Update multiple Companys' })
  async patchBulk(
    @Body() body: { ids: number[]; data: Partial<UpdateCompanyDto> },
    @Headers() headers: Record<string, string>,
  ) {
    return this.withTransaction(headers, async (tx) => {
      const result = await tx.Company.updateMany({
        where: { id: { in: body.ids } },
        data: body.data,
      });
      await this.companyService.invalidateCache();
      return result;
    });
  }

  // PUT (UPSERT) endpoints
  @Put()
  @ApiOperation({ summary: 'Upsert Company' })
  async upsert(
    @Body() body: { where: { id: number }; create: CreateCompanyDto; update: Partial<UpdateCompanyDto> },
    @Headers() headers: Record<string, string>,
  ) {
    return this.withTransaction(headers, async (tx) => {
      const result = await tx.Company.upsert({
        where: body.where,
        create: body.create,
        update: body.update,
      });
      await this.companyService.invalidateCache();
      return result;
    });
  }

  @Put('by/:field')
  @ApiOperation({ summary: 'Upsert Company by field reference' })
  async upsertByFilterReference(
    @Param('field') field: string,
    @Body() body: { filterValue: any; create: CreateCompanyDto; update: Partial<UpdateCompanyDto> },
    @Headers() headers: Record<string, string>,
  ) {
    return this.withTransaction(headers, async (tx) => {
      const where = { [field]: body.filterValue };
      const result = await tx.Company.upsert({
        where,
        create: body.create,
        update: body.update,
      });
      await this.companyService.invalidateCache();
      return result;
    });
  }

  @Put('bulk')
  @ApiOperation({ summary: 'Bulk upsert Companys' })
  async upsertBulk(
    @Body() body: { items: Array<{ where?: any; create: CreateCompanyDto; update?: Partial<UpdateCompanyDto> }> },
    @Headers() headers: Record<string, string>,
  ) {
    return this.withTransaction(headers, async (tx) => {
      const results = [];
      for (const item of body.items) {
        const result = await tx.Company.upsert({
          where: item.where || { id: 0 },
          create: item.create,
          update: item.update || {},
        });
        results.push(result);
      }
      await this.companyService.invalidateCache();
      return results;
    });
  }

  // DELETE endpoints
  @Delete(':id')
  @ApiOperation({ summary: 'Delete Company by ID' })
  async deleteById(@Param('id') id: string, @Headers() headers: Record<string, string>) {
    return this.withTransaction(headers, async (tx) => {
      const result = await tx.Company.delete({
        where: { id: parseInt(id) },
      });
      await this.companyService.invalidateCache();
      return result;
    });
  }

  @Delete('by/:field/:value')
  @ApiOperation({ summary: 'Delete Companys by field reference' })
  async deleteByFilterReference(
    @Param('field') field: string,
    @Param('value') value: string,
    @Headers() headers: Record<string, string>,
  ) {
    return this.withTransaction(headers, async (tx) => {
      const result = await tx.Company.deleteMany({
        where: { [field]: value },
      });
      await this.companyService.invalidateCache();
      return result;
    });
  }

  @Delete('bulk')
  @ApiOperation({ summary: 'Delete multiple Companys' })
  async deleteBulk(
    @Body() body: { ids: number[] },
    @Headers() headers: Record<string, string>,
  ) {
    return this.withTransaction(headers, async (tx) => {
      const result = await tx.Company.deleteMany({
        where: { id: { in: body.ids } },
      });
      await this.companyService.invalidateCache();
      return result;
    });
  }
}
