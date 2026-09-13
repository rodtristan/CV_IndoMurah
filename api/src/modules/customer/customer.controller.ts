import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CustomerService } from './customer.service';
import { CreateCustomerDto, UpdateCustomerDto, AdjustPointsDto } from './dto/customer.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';
import { ApiResponse } from '../../common/dto/api-response-dto';

@ApiTags('Customers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('customers')
export class CustomerController {
  constructor(private customerService: CustomerService) {}

  @Get()
  @ApiOperation({ summary: 'Get all customers (Smart Query supported)' })
  @ApiQuery({ name: '$select', required: false, description: 'Select fields: id,code,name,phone' })
  @ApiQuery({ name: '$include', required: false, description: 'Include relations: sales,customerDeposits,pointRedemptions' })
  @ApiQuery({ name: '$where[isActive]', required: false, description: 'Filter: true/false' })
  @ApiQuery({ name: '$where[customerGroup]', required: false, description: 'Filter by group: RETAIL,WHOLESALE,VIP,GENERAL' })
  @ApiQuery({ name: '$search', required: false, description: 'Search keyword' })
  @ApiQuery({ name: '$orderBy[createdAt]', required: false, description: 'Sort: asc/desc' })
  @ApiQuery({ name: '$skip', required: false, description: 'Offset', type: Number })
  @ApiQuery({ name: '$take', required: false, description: 'Limit', type: Number })
  async findAll(@Query() query: Record<string, unknown>) {
    const { data, total, skip, take } = await this.customerService.findAll(query);
    return ApiResponse.paginated(data, total, skip, take);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get customer by ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.customerService.findOne(id);
    return ApiResponse.ok(data);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get customer statistics' })
  async getStats(@Param('id', ParseIntPipe) id: number) {
    const data = await this.customerService.getStats(id);
    return ApiResponse.ok(data);
  }

  @Get(':id/points')
  @ApiOperation({ summary: 'Get customer point balance and history' })
  async getPointsHistory(@Param('id', ParseIntPipe) id: number) {
    const data = await this.customerService.getPointsHistory(id);
    return ApiResponse.ok(data);
  }

  @Post()
  @ApiOperation({ summary: 'Create customer' })
  async create(@Body() dto: CreateCustomerDto) {
    const data = await this.customerService.create(dto);
    return ApiResponse.ok(data, 'Customer created successfully');
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update customer' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCustomerDto) {
    const data = await this.customerService.update(id, dto);
    return ApiResponse.ok(data, 'Customer updated successfully');
  }

  @Post(':id/points')
  @ApiOperation({ summary: 'Adjust customer point balance' })
  async adjustPoints(@Param('id', ParseIntPipe) id: number, @Body() dto: AdjustPointsDto) {
    const data = await this.customerService.adjustPoints(id, dto);
    return ApiResponse.ok(data, 'Point balance adjusted successfully');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete customer' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    const data = await this.customerService.remove(id);
    return ApiResponse.ok(data, 'Customer deactivated successfully');
  }
}
