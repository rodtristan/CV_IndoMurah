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
import { WarehouseService } from './warehouse.service';
import { CreateWarehouseDto, UpdateWarehouseDto } from './dto/warehouse.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';
import { ApiResponse } from '../../common/dto/api-response-dto';

@ApiTags('Warehouses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('warehouses')
export class WarehouseController {
  constructor(private warehouseService: WarehouseService) {}

  @Get()
  @ApiOperation({ summary: 'Get all warehouses (Smart Query supported)' })
  @ApiQuery({ name: '$select', required: false, description: 'Select fields: id,code,name' })
  @ApiQuery({ name: '$include', required: false, description: 'Include relations: productStocks,stockIns,stockOuts' })
  @ApiQuery({ name: '$where[isActive]', required: false, description: 'Filter: true/false' })
  @ApiQuery({ name: '$where[isDefault]', required: false, description: 'Filter: true/false' })
  @ApiQuery({ name: '$search', required: false, description: 'Search keyword' })
  @ApiQuery({ name: '$orderBy[createdAt]', required: false, description: 'Sort: asc/desc' })
  @ApiQuery({ name: '$skip', required: false, description: 'Offset', type: Number })
  @ApiQuery({ name: '$take', required: false, description: 'Limit', type: Number })
  async findAll(@Query() query: Record<string, unknown>) {
    const { data, total, skip, take } = await this.warehouseService.findAll(query);
    return ApiResponse.paginated(data, total, skip, take);
  }

  @Get('default')
  @ApiOperation({ summary: 'Get default warehouse' })
  async getDefault() {
    const data = await this.warehouseService.getDefaultWarehouse();
    return ApiResponse.ok(data);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get warehouse by ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.warehouseService.findOne(id);
    return ApiResponse.ok(data);
  }

  @Get(':id/stocks')
  @ApiOperation({ summary: 'Get all product stocks in a warehouse' })
  async getProductStocks(@Param('id', ParseIntPipe) id: number) {
    const data = await this.warehouseService.getProductStocks(id);
    return ApiResponse.ok(data);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get warehouse statistics' })
  async getStats(@Param('id', ParseIntPipe) id: number) {
    const data = await this.warehouseService.getStats(id);
    return ApiResponse.ok(data);
  }

  @Post()
  @ApiOperation({ summary: 'Create warehouse' })
  async create(@Body() dto: CreateWarehouseDto) {
    const data = await this.warehouseService.create(dto);
    return ApiResponse.ok(data, 'Warehouse created successfully');
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update warehouse' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateWarehouseDto) {
    const data = await this.warehouseService.update(id, dto);
    return ApiResponse.ok(data, 'Warehouse updated successfully');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete warehouse' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    const data = await this.warehouseService.remove(id);
    return ApiResponse.ok(data, 'Warehouse deactivated successfully');
  }
}
