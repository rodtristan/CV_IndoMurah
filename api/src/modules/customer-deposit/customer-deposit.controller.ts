import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CustomerDepositService } from './customer-deposit.service';
import { CreateCustomerDepositDto, UpdateCustomerDepositDto } from './dto/customer-deposit.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';
import { ApiResponse } from '../../common/dto/api-response-dto';
import { CurrentUser } from '../../common/decorators/current-user-decorator';

interface JwtUser { id: string; }

@ApiTags('Customer Deposits')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('customer-deposits')
export class CustomerDepositController {
  constructor(private readonly customerDepositService: CustomerDepositService) {}

  @Get()
  @ApiOperation({ summary: 'Get all customer deposits' })
  async findAll(@Query() query: Record<string, unknown>) {
    const { data, total, skip, take } = await this.customerDepositService.findAll(query);
    return ApiResponse.paginated(data, total, skip, take);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get customer deposit by ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.customerDepositService.findOne(id);
    return ApiResponse.ok(data);
  }

  @Post()
  @ApiOperation({ summary: 'Create customer deposit' })
  async create(@Body() dto: CreateCustomerDepositDto, @CurrentUser() user: JwtUser) {
    const data = await this.customerDepositService.create(dto, user.id);
    return ApiResponse.ok(data, 'Customer Deposit created');
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update customer deposit' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCustomerDepositDto) {
    const data = await this.customerDepositService.update(id, dto);
    return ApiResponse.ok(data, 'Customer Deposit updated');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete customer deposit' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.customerDepositService.remove(id);
    return ApiResponse.ok(null, 'Customer Deposit deleted');
  }
}
