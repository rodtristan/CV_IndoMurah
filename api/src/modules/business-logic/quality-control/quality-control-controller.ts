import { Controller, Get, Post, Put, Param, Body, Query, Request, UseGuards } from '@nestjs/common';
import { QualityControlService } from './quality-control-service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth-guard';
import {
  CreateQCInspectionDto,
  RecordQCResultDto,
  QCInspectionFilterDto,
  CreateDefectReportDto,
  DefectFilterDto,
  CreateQCStandardDto,
  CreateCalibrationDto,
  CalibrationFilterDto,
} from './quality-control.dto';

@UseGuards(JwtAuthGuard)
@Controller('business-logic/quality-control')
export class QualityControlController {
  constructor(private readonly qualityControlService: QualityControlService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // QC INSPECTION
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Create QC inspection
   * POST /api/business-logic/quality-control/inspection
   */
  @Post('inspection')
  async createQCInspection(@Body() dto: CreateQCInspectionDto, @Request() req: any) {
    return this.qualityControlService.createQCInspection(dto, req.user?.id || '1');
  }

  /**
   * Get QC inspection by ID
   * GET /api/business-logic/quality-control/inspection/:id
   */
  @Get('inspection/:id')
  async getQCInspection(@Param('id') id: string) {
    return this.qualityControlService.getQCInspection(parseInt(id));
  }

  /**
   * List QC inspections
   * GET /api/business-logic/quality-control/inspection
   */
  @Get('inspection')
  async listQCInspections(@Query() dto: QCInspectionFilterDto) {
    return this.qualityControlService.listQCInspections(dto);
  }

  /**
   * Record QC inspection results
   * POST /api/business-logic/quality-control/inspection/:id/results
   */
  @Post('inspection/:id/results')
  async recordQCResults(
    @Param('id') id: string,
    @Body() results: RecordQCResultDto[],
    @Request() req: any,
  ) {
    return this.qualityControlService.recordQCResults(parseInt(id), results, req.user?.id || '1');
  }

  /**
   * Get QC performance report
   * GET /api/business-logic/quality-control/performance
   */
  @Get('performance')
  async getQCPerformanceReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.qualityControlService.getQCPerformanceReport(startDate, endDate);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // DEFECT TRACKING
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Create defect report
   * POST /api/business-logic/quality-control/defect
   */
  @Post('defect')
  async createDefectReport(@Body() dto: CreateDefectReportDto, @Request() req: any) {
    return this.qualityControlService.createDefectReport(dto, req.user?.id || '1');
  }

  /**
   * Get defect report by ID
   * GET /api/business-logic/quality-control/defect/:id
   */
  @Get('defect/:id')
  async getDefectReport(@Param('id') id: string) {
    return this.qualityControlService.getDefectReport(parseInt(id));
  }

  /**
   * List defect reports
   * GET /api/business-logic/quality-control/defect
   */
  @Get('defect')
  async listDefectReports(@Query() dto: DefectFilterDto) {
    return this.qualityControlService.listDefectReports(dto);
  }

  /**
   * Update defect status
   * PUT /api/business-logic/quality-control/defect/:id/status
   */
  @Put('defect/:id/status')
  async updateDefectStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Request() req: any,
  ) {
    return this.qualityControlService.updateDefectStatus(parseInt(id), status, req.user?.id || '1');
  }

  /**
   * Get defect analytics
   * GET /api/business-logic/quality-control/defect/analytics
   */
  @Get('defect/analytics')
  async getDefectAnalytics(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.qualityControlService.getDefectAnalytics(startDate, endDate);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // QC STANDARDS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Create QC standard
   * POST /api/business-logic/quality-control/standard
   */
  @Post('standard')
  async createQCStandard(@Body() dto: CreateQCStandardDto, @Request() req: any) {
    return this.qualityControlService.createQCStandard(dto, req.user?.id || '1');
  }

  /**
   * Get QC standard for product
   * GET /api/business-logic/quality-control/standard
   */
  @Get('standard')
  async getQCStandard(
    @Query('productId') productId: string,
    @Query('inspectionType') inspectionType: string,
  ) {
    return this.qualityControlService.getQCStandard(parseInt(productId), inspectionType);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CALIBRATION
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Create calibration record
   * POST /api/business-logic/quality-control/calibration
   */
  @Post('calibration')
  async createCalibration(@Body() dto: CreateCalibrationDto, @Request() req: any) {
    return this.qualityControlService.createCalibration(dto, req.user?.id || '1');
  }

  /**
   * List calibrations
   * GET /api/business-logic/quality-control/calibration
   */
  @Get('calibration')
  async listCalibrations(@Query() dto: CalibrationFilterDto) {
    return this.qualityControlService.listCalibrations(dto);
  }

  /**
   * Record calibration result
   * POST /api/business-logic/quality-control/calibration/:id/result
   */
  @Post('calibration/:id/result')
  async recordCalibrationResult(
    @Param('id') id: string,
    @Body('result') result: 'PASS' | 'FAIL',
    @Body('notes') notes: string,
    @Request() req: any,
  ) {
    return this.qualityControlService.recordCalibrationResult(
      parseInt(id),
      result,
      notes,
      req.user?.id || '1',
    );
  }
}
