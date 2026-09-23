import { Controller, Get, Post, Patch, Param, Body, Query, Request } from '@nestjs/common';
import { WorkOrderService } from './work-order-service';
import {
  CreateWorkOrderDto,
  UpdateWorkOrderDto,
  WorkOrderFilterDto,
  ScheduleWorkOrderDto,
  WorkOrderSchedulingDto,
  RecordProgressDto,
  MaterialAllocationDto,
  CreateWorkStationDto,
  WorkStationFilterDto,
} from './work-order.dto';

@Controller('business-logic/work-order')
export class WorkOrderController {
  constructor(private readonly workOrderService: WorkOrderService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // WORK ORDER MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Create work order
   * POST /api/business-logic/work-order
   */
  @Post()
  async createWorkOrder(@Body() dto: CreateWorkOrderDto, @Request() req: any) {
    return this.workOrderService.createWorkOrder(dto, req.user?.id || '1');
  }

  /**
   * Get work order by ID
   * GET /api/business-logic/work-order/:id
   */
  @Get(':id')
  async getWorkOrder(@Param('id') id: string) {
    return this.workOrderService.getWorkOrder(parseInt(id));
  }

  /**
   * List work orders
   * GET /api/business-logic/work-order
   */
  @Get()
  async listWorkOrders(@Query() dto: WorkOrderFilterDto) {
    return this.workOrderService.listWorkOrders(dto);
  }

  /**
   * Update work order
   * PUT /api/business-logic/work-order/:id
   */
  @Patch(':id')
  async updateWorkOrder(
    @Param('id') id: string,
    @Body() dto: UpdateWorkOrderDto,
    @Request() req: any,
  ) {
    return this.workOrderService.updateWorkOrder(parseInt(id), dto, req.user?.id || '1');
  }

  /**
   * Cancel work order
   * POST /api/business-logic/work-order/:id/cancel
   */
  @Post(':id/cancel')
  async cancelWorkOrder(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Request() req: any,
  ) {
    return this.workOrderService.cancelWorkOrder(parseInt(id), reason, req.user?.id || '1');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SCHEDULING
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Schedule work order
   * POST /api/business-logic/work-order/schedule
   */
  @Post('schedule')
  async scheduleWorkOrder(@Body() dto: ScheduleWorkOrderDto, @Request() req: any) {
    return this.workOrderService.scheduleWorkOrder(dto, req.user?.id || '1');
  }

  /**
   * Get work order schedule
   * GET /api/business-logic/work-order/schedule
   */
  @Get('schedule/calendar')
  async getWorkOrderSchedule(@Query() dto: WorkOrderSchedulingDto) {
    return this.workOrderService.getWorkOrderSchedule(dto);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PROGRESS TRACKING
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Record progress
   * POST /api/business-logic/work-order/progress
   */
  @Post('progress')
  async recordProgress(@Body() dto: RecordProgressDto, @Request() req: any) {
    return this.workOrderService.recordProgress(dto, req.user?.id || '1');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // MATERIAL ALLOCATION
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Allocate materials
   * POST /api/business-logic/work-order/materials
   */
  @Post('materials')
  async allocateMaterials(@Body() dto: MaterialAllocationDto, @Request() req: any) {
    return this.workOrderService.allocateMaterials(dto, req.user?.id || '1');
  }

  /**
   * Release materials
   * POST /api/business-logic/work-order/:id/release-materials
   */
  @Post(':id/release-materials')
  async releaseMaterials(@Param('id') id: string, @Request() req: any) {
    return this.workOrderService.releaseMaterials(parseInt(id), req.user?.id || '1');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // WORK STATIONS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Create work station
   * POST /api/business-logic/work-order/workstation
   */
  @Post('workstation')
  async createWorkStation(@Body() dto: CreateWorkStationDto, @Request() req: any) {
    return this.workOrderService.createWorkStation(dto, req.user?.id || '1');
  }

  /**
   * List work stations
   * GET /api/business-logic/work-order/workstation
   */
  @Get('workstation/list')
  async listWorkStations(@Query() dto: WorkStationFilterDto) {
    return this.workOrderService.listWorkStations(dto);
  }

  /**
   * Get work station utilization
   * GET /api/business-logic/work-order/workstation/utilization
   */
  @Get('workstation/utilization')
  async getWorkStationUtilization(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('workStationId') workStationId?: string,
  ) {
    return this.workOrderService.getWorkStationUtilization(
      startDate,
      endDate,
      workStationId ? parseInt(workStationId) : undefined,
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // ANALYTICS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Get work order analytics
   * GET /api/business-logic/work-order/analytics
   */
  @Get('analytics')
  async getWorkOrderAnalytics(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.workOrderService.getWorkOrderAnalytics(startDate, endDate);
  }
}
