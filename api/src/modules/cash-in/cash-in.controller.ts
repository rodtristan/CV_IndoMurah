import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { UseGuards, Controller, Get, Post, Patch, Delete, Param, Body, Query, ParseIntPipe } from '@nestjs/common';
import { BaseController } from '../../common/templates/base.controller';
import { CashInService } from './cash-in.service';
import { CreateCashInDto, UpdateCashInDto } from './dto/cash-in.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';
import { CurrentUser } from '../../common/decorators/current-user-decorator';
import { ApiResponse } from '../../common/dto/api-response-dto';

/**
 * Kas Masuk. Writes are limited to create / patch / delete by ID because each one posts or reverses
 * the automatic journal; bulk / upsert / by-field writes of the generic template are intentionally not exposed.
 */
@ApiTags('CashIn')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cash-in')
export class CashInController extends BaseController<
  any,
  CreateCashInDto,
  UpdateCashInDto
> {
  constructor(private readonly svc: CashInService) {
    super(svc, {
      modelName: 'CashIn',
      pluralName: 'CashIns',
      primaryKeyType: 'number',
      paramId: 'id',
      routePrefix: 'cash-in',
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all CashIns with OData query support' })
  @ApiQuery({ name: '$include', required: false, description: 'Include relations: account' })
  async findAll(@Query() query: any) {
    return super.findAll(query);
  }

  @Get('count')
  async getCount(@Query() query: any) {
    return super.getCount(query);
  }

  @Get(':id/lines')
  @ApiOperation({ summary: 'Rincian akun lawan (dari jurnal otomatis)' })
  async lines(@Param('id', ParseIntPipe) id: number) {
    return ApiResponse.ok(await this.svc.lines(id));
  }

  @Get(':id')
  async findById(@Param('id') id: string, @Query() query: any) {
    return super.findById(id, query);
  }

  @Get('by/:field/:value')
  async findByField(@Param('field') field: string, @Param('value') value: string, @Query() query: any) {
    return super.findByField(field, value, query);
  }

  @Post()
  @ApiOperation({ summary: 'Create CashIn + jurnal otomatis' })
  async create(@Body() dto: CreateCashInDto, @CurrentUser() user?: any) {
    return ApiResponse.ok(await this.svc.createDoc(dto, user.id), 'Kas Masuk tersimpan');
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update CashIn + posting ulang jurnal' })
  async patchById(@Param('id') id: string, @Body() dto: UpdateCashInDto, @CurrentUser() user?: any) {
    return ApiResponse.ok(await this.svc.updateDoc(Number(id), dto, user.id), 'Kas Masuk diperbarui');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete CashIn + hapus jurnal otomatis' })
  async deleteById(@Param('id') id: string) {
    return ApiResponse.ok(await this.svc.deleteDoc(Number(id)), 'Kas Masuk dihapus');
  }
}
