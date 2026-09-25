import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { UseGuards, Controller, Get, Post, Patch, Delete, Param, Body, Query, ParseIntPipe } from '@nestjs/common';
import { BaseController } from '../../common/templates/base.controller';
import { CashOutService } from './cash-out.service';
import { CreateCashOutDto, UpdateCashOutDto } from './dto/cash-out.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';
import { CurrentUser } from '../../common/decorators/current-user-decorator';
import { ApiResponse } from '../../common/dto/api-response-dto';

/**
 * Kas Keluar. Writes are limited to create / patch / delete by ID because each one posts or reverses
 * the automatic journal; bulk / upsert / by-field writes of the generic template are intentionally not exposed.
 */
@ApiTags('CashOut')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cash-out')
export class CashOutController extends BaseController<
  any,
  CreateCashOutDto,
  UpdateCashOutDto
> {
  constructor(private readonly svc: CashOutService) {
    super(svc, {
      modelName: 'CashOut',
      pluralName: 'CashOuts',
      primaryKeyType: 'number',
      paramId: 'id',
      routePrefix: 'cash-out',
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all CashOuts with OData query support' })
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
  @ApiOperation({ summary: 'Create CashOut + jurnal otomatis' })
  async create(@Body() dto: CreateCashOutDto, @CurrentUser() user?: any) {
    return ApiResponse.ok(await this.svc.createDoc(dto, user.id), 'Kas Keluar tersimpan');
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update CashOut + posting ulang jurnal' })
  async patchById(@Param('id') id: string, @Body() dto: UpdateCashOutDto, @CurrentUser() user?: any) {
    return ApiResponse.ok(await this.svc.updateDoc(Number(id), dto, user.id), 'Kas Keluar diperbarui');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete CashOut + hapus jurnal otomatis' })
  async deleteById(@Param('id') id: string) {
    return ApiResponse.ok(await this.svc.deleteDoc(Number(id)), 'Kas Keluar dihapus');
  }
}
