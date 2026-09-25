import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { UseGuards, Controller, Get, Post, Patch, Delete, Param, Body, Query, ParseIntPipe } from '@nestjs/common';
import { BaseController } from '../../common/templates/base.controller';
import { CustomerDepositService } from './customer-deposit.service';
import { CreateCustomerDepositDto, UpdateCustomerDepositDto } from './dto/customer-deposit.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';
import { CurrentUser } from '../../common/decorators/current-user-decorator';
import { ApiResponse } from '../../common/dto/api-response-dto';

/**
 * Deposit Pelanggan. Writes are limited to create / patch / delete by ID because each one posts or reverses
 * the automatic journal; bulk / upsert / by-field writes of the generic template are intentionally not exposed.
 */
@ApiTags('CustomerDeposit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('customer-deposit')
export class CustomerDepositController extends BaseController<
  any,
  CreateCustomerDepositDto,
  UpdateCustomerDepositDto
> {
  constructor(private readonly svc: CustomerDepositService) {
    super(svc, {
      modelName: 'CustomerDeposit',
      pluralName: 'CustomerDeposits',
      primaryKeyType: 'number',
      paramId: 'id',
      routePrefix: 'customer-deposit',
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all CustomerDeposits with OData query support' })
  @ApiQuery({ name: '$include', required: false, description: 'Include relations: account' })
  async findAll(@Query() query: any) {
    return super.findAll(query);
  }

  @Get('count')
  async getCount(@Query() query: any) {
    return super.getCount(query);
  }

  @Get('balance/:partyId')
  @ApiOperation({ summary: 'Saldo deposit customer' })
  async balance(@Param('partyId', ParseIntPipe) partyId: number) {
    return ApiResponse.ok({ balance: await this.svc.balance(partyId) });
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
  @ApiOperation({ summary: 'Create CustomerDeposit + jurnal otomatis' })
  async create(@Body() dto: CreateCustomerDepositDto, @CurrentUser() user?: any) {
    return ApiResponse.ok(await this.svc.createDoc(dto, user.id), 'Deposit Pelanggan tersimpan');
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update CustomerDeposit + posting ulang jurnal' })
  async patchById(@Param('id') id: string, @Body() dto: UpdateCustomerDepositDto, @CurrentUser() user?: any) {
    return ApiResponse.ok(await this.svc.updateDoc(Number(id), dto, user.id), 'Deposit Pelanggan diperbarui');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete CustomerDeposit + hapus jurnal otomatis' })
  async deleteById(@Param('id') id: string) {
    return ApiResponse.ok(await this.svc.deleteDoc(Number(id)), 'Deposit Pelanggan dihapus');
  }
}
