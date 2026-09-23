import { Controller, Get, Post, Patch, Delete, Body, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AssetService } from './asset-service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth-guard';
import {
  CreateAssetDto,
  UpDateAssetDto,
  AssetFilterDto,
  CalculateDepreciationDto,
  DisposeAssetDto,
  TransferAssetDto,
  AssetDepreciationReportDto,
  AssetValuationDto,
} from './asset.dto';

@ApiTags('Business Logic - Asset Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('business-logic/asset')
export class AssetController {
  constructor(private assetService: AssetService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // ASSET CRUD
  // ─────────────────────────────────────────────────────────────────────────────

  @Post()
  @ApiOperation({ summary: 'Create new asset' })
  async createAsset(@Body() dto: CreateAssetDto) {
    return this.assetService.createAsset(dto, 'system');
  }

  @Get()
  @ApiOperation({ summary: 'List all assets' })
  async listAssets(@Query() dto: AssetFilterDto) {
    return this.assetService.listAssets(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get asset by ID' })
  async getAsset(@Param('id', ParseIntPipe) id: number) {
    return this.assetService.getAsset(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update asset' })
  async updateAsset(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpDateAssetDto,
  ) {
    return this.assetService.updateAsset(id, dto, 'system');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete asset (soft delete)' })
  async deleteAsset(@Param('id', ParseIntPipe) id: number) {
    return this.assetService.deleteAsset(id, 'system');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // DEPRECIATION
  // ─────────────────────────────────────────────────────────────────────────────

  @Get('depreciation/calculate')
  @ApiOperation({ summary: 'Calculate depreciation for assets' })
  async calculateDepreciation(@Query() dto: CalculateDepreciationDto) {
    return this.assetService.calculateDepreciation(dto);
  }

  @Get('reports/depreciation')
  @ApiOperation({ summary: 'Get depreciation report' })
  async getDepreciationReport(@Query() dto: AssetDepreciationReportDto) {
    return this.assetService.getDepreciationReport(dto);
  }

  @Get('reports/valuation')
  @ApiOperation({ summary: 'Get asset valuation report' })
  async getAssetValuation(@Query() dto: AssetValuationDto) {
    return this.assetService.getAssetValuation(dto);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // ASSET OPERATIONS
  // ─────────────────────────────────────────────────────────────────────────────

  @Post(':id/dispose')
  @ApiOperation({ summary: 'Dispose/sell asset' })
  async disposeAsset(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: DisposeAssetDto,
  ) {
    return this.assetService.disposeAsset(id, dto, 'system');
  }

  @Post(':id/transfer')
  @ApiOperation({ summary: 'Transfer asset to new location/person' })
  async transferAsset(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: TransferAssetDto,
  ) {
    return this.assetService.TransferAsset(id, dto, 'system');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CATEGORIES
  // ─────────────────────────────────────────────────────────────────────────────

  @Post('categories')
  @ApiOperation({ summary: 'Create asset category' })
  async createCategory(@Body() dto: { Code: string; Name: string; Description?: string }) {
    return this.assetService.createCategory(dto);
  }

  @Get('categories/list')
  @ApiOperation({ summary: 'List asset categories' })
  async listCategories() {
    return this.assetService.listCategories();
  }
}
