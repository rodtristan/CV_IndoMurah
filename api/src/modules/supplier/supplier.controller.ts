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
import { SupplierService } from './supplier.service';
import { CreateSupplierDto, UpdateSupplierDto } from './dto/supplier.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';
import { ApiResponse } from '../../common/dto/api-response-dto';

@ApiTags('Suppliers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('suppliers')
export class SupplierController {
  constructor(private supplierService: SupplierService) {}

  @Get()
  @ApiOperation({ summary: 'Get all suppliers (Smart Query supported)' })
  @ApiQuery({ name: '$select', required: false, description: 'Select fields: id,code,name,phone' })
  @ApiQuery({ name: '$include', required: false, description: 'Include relations: purchaseOrders,purchases,supplierDeposits' })
  @ApiQuery({ name: '$where[isActive]', required: false, description: 'Filter: true/false' })
  @ApiQuery({ name: '$search', required: false, description: 'Search keyword' })
  @ApiQuery({ name: '$orderBy[createdAt]', required: false, description: 'Sort: asc/desc' })
  @ApiQuery({ name: '$skip', required: false, description: 'Offset', type: Number })
  @ApiQuery({ name: '$take', required: false, description: 'Limit', type: Number })
  async findAll(@Query() query: Record<string, unknown>) {
    const { data, total, skip, take } = await this.supplierService.findAll(query);
    return ApiResponse.paginated(data, total, skip, take);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get supplier by ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.supplierService.findOne(id);
    return ApiResponse.ok(data);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get supplier statistics' })
  async getStats(@Param('id', ParseIntPipe) id: number) {
    const data = await this.supplierService.getStats(id);
    return ApiResponse.ok(data);
  }

  @Post()
  @ApiOperation({ summary: 'Create supplier' })
  async create(@Body() dto: CreateSupplierDto) {
    const data = await this.supplierService.create(dto);
    return ApiResponse.ok(data, 'Supplier created successfully');
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update supplier' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSupplierDto) {
    const data = await this.supplierService.update(id, dto);
    return ApiResponse.ok(data, 'Supplier updated successfully');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete supplier' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    const data = await this.supplierService.remove(id);
    return ApiResponse.ok(data, 'Supplier deactivated successfully');
  }
}
