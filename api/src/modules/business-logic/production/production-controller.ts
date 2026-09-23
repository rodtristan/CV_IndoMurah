import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  Body,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ProductionService } from './production-service';
import {
  CreateProductionDto,
  ProductionFilterDto,
} from './production.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth-guard';
import { ApiResponse } from '../../../common/dto/api-response-dto';

@ApiTags('Production - Produksi')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('business-logic/production')
export class ProductionController {
  constructor(private productionService: ProductionService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // PRODUCTION ENDPOINTS
  // ─────────────────────────────────────────────────────────────────────────────

  @Post()
  @ApiOperation({ summary: 'Create new production' })
  async createProduction(@Body() dto: CreateProductionDto) {
    const userId = 'system';
    const data = await this.productionService.createProduction(dto, userId);
    return ApiResponse.ok(data, 'Production created successfully');
  }

  @Get()
  @ApiOperation({ summary: 'List productions' })
  async listProductions(@Query() dto: ProductionFilterDto) {
    const data = await this.productionService.listProductions(dto);
    return ApiResponse.ok(data);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get production by ID' })
  async getProduction(@Param('id') id: number) {
    const data = await this.productionService.getProduction(id);
    return ApiResponse.ok(data);
  }

  @Get('reports/cost')
  @ApiOperation({ summary: 'Get production cost report' })
  async getProductionCostReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('warehouseId') warehouseId?: number,
  ) {
    const data = await this.productionService.getProductionCostReport(startDate, endDate, warehouseId);
    return ApiResponse.ok(data);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // BOM ENDPOINTS
  // ─────────────────────────────────────────────────────────────────────────────

  @Get('bom/:productId')
  @ApiOperation({ summary: 'Get Bill of Materials for product' })
  async getBOM(@Param('productId') productId: number) {
    const data = await this.productionService.getBOM(productId);
    return ApiResponse.ok(data);
  }

  @Get('bom/:productId/calculate')
  @ApiOperation({ summary: 'Calculate production cost from BOM' })
  async calculateProductionCost(
    @Param('productId') productId: number,
    @Query('quantity') quantity: number,
    @Query('warehouseId') warehouseId?: number,
  ) {
    const data = await this.productionService.calculateProductionCost(productId, quantity, warehouseId);
    return ApiResponse.ok(data);
  }
}
