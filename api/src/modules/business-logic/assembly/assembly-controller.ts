import { Controller, Get, Post, Patch, Put, Delete, Param, Body, Query, Request } from '@nestjs/common';
import { AssemblyService } from './assembly-service';
import {
  CreateAssemblyDto,
  UpdateAssemblyDto,
  AssemblyFilterDto,
  CreateBOMDto,
  UpdateBOMDto,
  BOMFilterDto,
  AssembleFromBOMDto,
  CalculateBOMCostDto,
} from './assembly.dto';

@Controller('business-logic/assembly')
export class AssemblyController {
  constructor(private readonly assemblyService: AssemblyService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // ASSEMBLY / RAKITAN
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Create new assembly
   * POST /api/business-logic/assembly
   */
  @Post()
  async createAssembly(@Body() dto: CreateAssemblyDto, @Request() req: any) {
    return this.assemblyService.createAssembly(dto, req.user?.id || '1');
  }

  /**
   * Get assembly by ID
   * GET /api/business-logic/assembly/:id
   */
  @Get(':id')
  async getAssembly(@Param('id') id: string) {
    return this.assemblyService.getAssembly(parseInt(id));
  }

  /**
   * List assemblies
   * GET /api/business-logic/assembly
   */
  @Get()
  async listAssemblies(@Query() dto: AssemblyFilterDto) {
    return this.assemblyService.listAssemblies(dto);
  }

  /**
   * Update assembly
   * PUT /api/business-logic/assembly/:id
   */
  @Patch(':id')
  async updateAssembly(
    @Param('id') id: string,
    @Body() dto: UpdateAssemblyDto,
    @Request() req: any,
  ) {
    return this.assemblyService.updateAssembly(parseInt(id), dto, req.user?.id || '1');
  }

  /**
   * Cancel assembly
   * POST /api/business-logic/assembly/:id/cancel
   */
  @Post(':id/cancel')
  async cancelAssembly(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Request() req: any,
  ) {
    return this.assemblyService.cancelAssembly(parseInt(id), reason, req.user?.id || '1');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // BILL OF MATERIALS / KOMPOSISI
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Create BOM
   * POST /api/business-logic/assembly/bom
   */
  @Post('bom')
  async createBOM(@Body() dto: CreateBOMDto, @Request() req: any) {
    return this.assemblyService.createBOM(dto, req.user?.id || '1');
  }

  /**
   * Get BOM by ID
   * GET /api/business-logic/assembly/bom/:id
   */
  @Get('bom/:id')
  async getBOM(@Param('id') id: string) {
    return this.assemblyService.getBOM(parseInt(id));
  }

  /**
   * List BOMs
   * GET /api/business-logic/assembly/bom
   */
  @Get('bom/list')
  async listBOMs(@Query() dto: BOMFilterDto) {
    return this.assemblyService.listBOMs(dto);
  }

  /**
   * Update BOM
   * PUT /api/business-logic/assembly/bom/:id
   */
  @Put('bom/:id')
  async updateBOM(
    @Param('id') id: string,
    @Body() dto: UpdateBOMDto,
    @Request() req: any,
  ) {
    return this.assemblyService.updateBOM(parseInt(id), dto, req.user?.id || '1');
  }

  /**
   * Delete BOM
   * DELETE /api/business-logic/assembly/bom/:id
   */
  @Delete('bom/:id')
  async deleteBOM(@Param('id') id: string) {
    return this.assemblyService.deleteBOM(parseInt(id));
  }

  /**
   * Clone/Copy BOM
   * POST /api/business-logic/assembly/bom/:id/clone
   */
  @Post('bom/:id/clone')
  async cloneBOM(
    @Param('id') id: string,
    @Body('newName') newName: string,
    @Request() req: any,
  ) {
    return this.assemblyService.cloneBOM(parseInt(id), newName, req.user?.id || '1');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // ASSEMBLY FROM BOM
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Assemble from BOM
   * POST /api/business-logic/assembly/from-bom
   */
  @Post('from-bom')
  async assembleFromBOM(@Body() dto: AssembleFromBOMDto, @Request() req: any) {
    return this.assemblyService.assembleFromBOM(dto, req.user?.id || '1');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // BOM COSTING
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Calculate BOM cost
   * GET /api/business-logic/assembly/bom-cost
   */
  @Get('cost/bom')
  async calculateBOMCost(@Query() dto: CalculateBOMCostDto) {
    return this.assemblyService.calculateBOMCost(dto);
  }

  /**
   * Compare two BOMs
   * GET /api/business-logic/assembly/bom/compare
   */
  @Get('bom/compare')
  async compareBOMs(
    @Query('bomId1') bomId1: string,
    @Query('bomId2') bomId2: string,
  ) {
    return this.assemblyService.compareBOMs(parseInt(bomId1), parseInt(bomId2));
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // ANALYTICS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Get assembly analytics
   * GET /api/business-logic/assembly/analytics
   */
  @Get('analytics')
  async getAssemblyAnalytics(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.assemblyService.getAssemblyAnalytics(startDate, endDate);
  }
}
