import { Controller, Get, Post, Patch, Delete, Body, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { AttendanceService } from './attendance-service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth-guard';
import { CurrentUser } from '../../../common/decorators/current-user-decorator';
import {
  RecordAttendanceDto,
  AttendanceFilterDto,
  AttendanceSummaryDto,
  UpdateAttendanceDto,
} from './attendance.dto';

@UseGuards(JwtAuthGuard)
@Controller('business-logic/attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  async recordAttendance(
    @Body() dto: RecordAttendanceDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.attendanceService.recordAttendance(dto, userId);
  }

  @Get()
  async listAttendances(@Query() dto: AttendanceFilterDto) {
    return this.attendanceService.listAttendances(dto);
  }

  @Get('statuses')
  async getAttendanceStatuses() {
    return this.attendanceService.getAttendanceStatuses();
  }

  @Get('summary')
  async getAttendanceSummary(@Query() dto: AttendanceSummaryDto) {
    return this.attendanceService.getAttendanceSummary(dto);
  }

  @Get(':id')
  async getAttendance(@Param('id', ParseIntPipe) id: number) {
    return this.attendanceService.getAttendance(id);
  }

  @Get('employee/:employeeId/history')
  async getEmployeeAttendanceHistory(
    @Param('employeeId', ParseIntPipe) employeeId: number,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.attendanceService.getEmployeeAttendanceHistory(employeeId, startDate, endDate);
  }

  @Patch(':id')
  async updateAttendance(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAttendanceDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.attendanceService.updateAttendance(id, dto, userId);
  }

  @Delete(':id')
  async deleteAttendance(@Param('id', ParseIntPipe) id: number) {
    return this.attendanceService.deleteAttendance(id);
  }
}
