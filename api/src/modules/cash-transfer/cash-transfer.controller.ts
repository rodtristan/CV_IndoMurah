import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { UseGuards, Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { BaseController } from '../../common/templates/base.controller';
import { CashTransferService } from './cash-transfer.service';
import { CreateCashTransferDto, UpdateCashTransferDto } from './dto/cash-transfer.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';
import { CurrentUser } from '../../common/decorators/current-user-decorator';
import { ApiResponse } from '../../common/dto/api-response-dto';

/**
 * Kas Transfer. Writes are limited to create / patch / delete by ID because each one posts or reverses
 * the automatic journal; bulk / upsert / by-field writes of the generic template are intentionally not exposed.
 */
@ApiTags('CashTransfer')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cash-transfer')
export class CashTransferController extends BaseController<
  any,
  CreateCashTransferDto,
  UpdateCashTransferDto
> {
  constructor(private readonly svc: CashTransferService) {
    super(svc, {
      modelName: 'CashTransfer',
      pluralName: 'CashTransfers',
      primaryKeyType: 'number',
      paramId: 'id',
      routePrefix: 'cash-transfer',
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all CashTransfers with OData query support' })
  @ApiQuery({ name: '$include', required: false, description: 'Include relations: account' })
  async findAll(@Query() query: any) {
    return super.findAll(query);
  }

  @Get('count')
  async getCount(@Query() query: any) {
    return super.getCount(query);
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
  @ApiOperation({ summary: 'Create CashTransfer + jurnal otomatis' })
  async create(@Body() dto: CreateCashTransferDto, @CurrentUser() user?: any) {
    return ApiResponse.ok(await this.svc.createDoc(dto, user.id), 'Kas Transfer tersimpan');
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update CashTransfer + posting ulang jurnal' })
  async patchById(@Param('id') id: string, @Body() dto: UpdateCashTransferDto, @CurrentUser() user?: any) {
    return ApiResponse.ok(await this.svc.updateDoc(Number(id), dto, user.id), 'Kas Transfer diperbarui');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete CashTransfer + hapus jurnal otomatis' })
  async deleteById(@Param('id') id: string) {
    return ApiResponse.ok(await this.svc.deleteDoc(Number(id)), 'Kas Transfer dihapus');
  }
}
