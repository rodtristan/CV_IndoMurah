import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SupplierDepositService } from './supplier-deposit.service';
import { CreateSupplierDepositDto, UpdateSupplierDepositDto } from './dto/supplier-deposit.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';
import { ApiResponse } from '../../common/dto/api-response-dto';
import { CurrentUser } from '../../common/decorators/current-user-decorator';

interface JwtUser { id: string; }

@ApiTags('Supplier Deposits')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('supplier-deposits')
export class SupplierDepositController {
  constructor(private readonly supplierDepositService: SupplierDepositService) {}

  @Get()
  @ApiOperation({ summary: 'Get all supplier deposits' })
  async findAll(@Query() query: Record<string, unknown>) {
    const { data, total, skip, take } = await this.supplierDepositService.findAll(query);
    return ApiResponse.paginated(data, total, skip, take);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get supplier deposit by ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.supplierDepositService.findOne(id);
    return ApiResponse.ok(data);
  }

  @Post()
  @ApiOperation({ summary: 'Create supplier deposit' })
  async create(@Body() dto: CreateSupplierDepositDto, @CurrentUser() user: JwtUser) {
    const data = await this.supplierDepositService.create(dto, user.id);
    return ApiResponse.ok(data, 'Supplier Deposit created');
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update supplier deposit' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSupplierDepositDto) {
    const data = await this.supplierDepositService.update(id, dto);
    return ApiResponse.ok(data, 'Supplier Deposit updated');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete supplier deposit' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.supplierDepositService.remove(id);
    return ApiResponse.ok(null, 'Supplier Deposit deleted');
  }
}
