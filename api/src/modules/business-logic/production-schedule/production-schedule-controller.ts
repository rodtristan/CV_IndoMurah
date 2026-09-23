import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ProductionScheduleService } from './production-schedule-service';
import { CreateProductionScheduleDto, UpDateProductionScheduleDto, ProductionScheduleFilterDto } from './production-schedule.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth-guard';
import { ApiResponse } from '../../../common/dto/api-response-dto';

@ApiTags('Business Logic - Production Schedule')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('business-logic/production-schedule')
export class ProductionScheduleController {
  constructor(private scheduleService: ProductionScheduleService) {}

  @Post()
  @ApiOperation({ summary: 'Create production schedule' })
  async createSchedule(@Body() dto: CreateProductionScheduleDto) {
    const userId = 'system';
    const data = await this.scheduleService.createSchedule(dto, userId);
    return ApiResponse.ok(data, 'Schedule created successfully');
  }

  @Get()
  @ApiOperation({ summary: 'List production schedules' })
  async listSchedules(@Query() dto: ProductionScheduleFilterDto) {
    const data = await this.scheduleService.listSchedules(dto);
    return ApiResponse.ok(data);
  }

  @Get('calendar')
  @ApiOperation({ summary: 'Get calendar view of schedules' })
  async getCalendarView(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('warehouseId') warehouseId?: number,
  ) {
    const data = await this.scheduleService.getCalendarView(startDate, endDate, warehouseId);
    return ApiResponse.ok(data);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get schedule by ID' })
  async getSchedule(@Param('id') id: number) {
    const data = await this.scheduleService.getSchedule(id);
    return ApiResponse.ok(data);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update schedule' })
  async updateSchedule(@Param('id') id: number, @Body() dto: UpDateProductionScheduleDto) {
    const userId = 'system';
    const data = await this.scheduleService.updateSchedule(id, dto, userId);
    return ApiResponse.ok(data, 'Schedule updated successfully');
  }
}
