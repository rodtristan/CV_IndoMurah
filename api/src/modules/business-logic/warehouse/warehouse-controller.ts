import { Controller, Get, Post, Patch, Put, Delete, Body, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { WarehouseService } from './warehouse-service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth-guard';
import {
  CreateWarehouseDto,
  UpdateWarehouseDto,
  WarehouseFilterDto,
  WarehouseStockDto,
  CreateShelfDto,
  UpdateShelfDto,
} from './warehouse.dto';

@UseGuards(JwtAuthGuard)
@Controller('business-logic/warehouses')
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  @Post()
  async createWarehouse(
    @Body() dto: CreateWarehouseDto,
    @Query('userId') userId: string = 'system',
  ) {
    return this.warehouseService.createWarehouse(dto, userId);
  }

  @Get()
  async listWarehouses(@Query() dto: WarehouseFilterDto) {
    return this.warehouseService.listWarehouses(dto);
  }

  @Get('summary')
  async getWarehouseSummary() {
    return this.warehouseService.getWarehouseSummary();
  }

  @Get(':id')
  async getWarehouse(@Param('id', ParseIntPipe) id: number) {
    return this.warehouseService.getWarehouse(id);
  }

  @Get(':id/stock')
  async getWarehouseStock(@Param('id', ParseIntPipe) id: number, @Query() dto: WarehouseStockDto) {
    return this.warehouseService.getWarehouseStock(id, dto);
  }

  @Patch(':id')
  async updateWarehouse(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateWarehouseDto,
    @Query('userId') userId: string = 'system',
  ) {
    return this.warehouseService.updateWarehouse(id, dto, userId);
  }

  @Delete(':id')
  async deleteWarehouse(@Param('id', ParseIntPipe) id: number) {
    return this.warehouseService.deleteWarehouse(id);
  }

  // Shelf Management
  @Post('shelves')
  async createShelf(
    @Body() dto: CreateShelfDto,
    @Query('userId') userId: string = 'system',
  ) {
    return this.warehouseService.createShelf(dto, userId);
  }

  @Get('shelves/:warehouseId')
  async listShelves(@Param('warehouseId', ParseIntPipe) warehouseId: number) {
    return this.warehouseService.listShelves(warehouseId);
  }

  @Put('shelves/:id')
  async updateShelf(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateShelfDto) {
    return this.warehouseService.updateShelf(id, dto);
  }
}
