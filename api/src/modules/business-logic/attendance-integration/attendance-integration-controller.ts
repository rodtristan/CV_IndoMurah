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
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AttendanceIntegrationService } from './attendance-integration-service';
import {
  DeviceConfigDto,
  UpdateDeviceConfigDto,
  SyncAttendanceDto,
  DeviceFilterDto,
  EmployeeMappingDto,
  BulkEmployeeMappingDto,
  DeviceLogDto,
  DeviceCommandDto,
  ScheduleDto,
  AssignScheduleDto,
} from './attendance-integration.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth-guard';
import { ApiResponse } from '../../../common/dto/api-response-dto';

@ApiTags('Attendance Integration - Integrasi Absensi')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('business-logic/attendance-integration')
export class AttendanceIntegrationController {
  constructor(private attendanceService: AttendanceIntegrationService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // DEVICE MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────────

  @Post('device')
  @ApiOperation({ summary: 'Register new attendance device' })
  async registerDevice(@Body() dto: DeviceConfigDto) {
    const data = await this.attendanceService.registerDevice(dto, 'system');
    return ApiResponse.ok(data, 'Device registered successfully');
  }

  @Get('device')
  @ApiOperation({ summary: 'List all attendance devices' })
  async listDevices(@Query() dto: DeviceFilterDto) {
    const data = await this.attendanceService.listDevices(dto);
    return ApiResponse.ok(data);
  }

  @Get('device/:id')
  @ApiOperation({ summary: 'Get device by ID' })
  async getDevice(@Param('id') id: number) {
    const data = await this.attendanceService.getDevice(id);
    return ApiResponse.ok(data);
  }

  @Put('device/:id')
  @ApiOperation({ summary: 'Update device configuration' })
  async updateDevice(@Param('id') id: number, @Body() dto: UpdateDeviceConfigDto) {
    const data = await this.attendanceService.updateDevice(id, dto, 'system');
    return ApiResponse.ok(data, 'Device updated successfully');
  }

  @Delete('device/:id')
  @ApiOperation({ summary: 'Delete device' })
  async deleteDevice(@Param('id') id: number) {
    const data = await this.attendanceService.deleteDevice(id, 'system');
    return ApiResponse.ok(data, 'Device deleted successfully');
  }

  @Post('device/:id/test-connection')
  @ApiOperation({ summary: 'Test device connection' })
  async testConnection(@Param('id') id: number) {
    const data = await this.attendanceService.testConnection(id);
    return ApiResponse.ok(data);
  }

  @Post('device/:id/command')
  @ApiOperation({ summary: 'Execute device command' })
  async executeCommand(@Param('id') id: number, @Body() dto: DeviceCommandDto) {
    const data = await this.attendanceService.executeCommand(id, dto, 'system');
    return ApiResponse.ok(data);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // EMPLOYEE MAPPING
  // ─────────────────────────────────────────────────────────────────────────────

  @Post('mapping')
  @ApiOperation({ summary: 'Map employee to device' })
  async mapEmployee(@Body() dto: EmployeeMappingDto) {
    const data = await this.attendanceService.mapEmployee(dto, 'system');
    return ApiResponse.ok(data, 'Employee mapped successfully');
  }

  @Post('mapping/bulk')
  @ApiOperation({ summary: 'Bulk map employees to device' })
  async bulkMapEmployees(@Body() dto: BulkEmployeeMappingDto) {
    const data = await this.attendanceService.bulkMapEmployees(dto, 'system');
    return ApiResponse.ok(data);
  }

  @Get('mapping')
  @ApiOperation({ summary: 'Get employee device mappings' })
  async getMappings(@Query('employeeId') employeeId?: number) {
    const data = await this.attendanceService.getMappings(employeeId);
    return ApiResponse.ok(data);
  }

  @Delete('mapping/:employeeId')
  @ApiOperation({ summary: 'Delete employee mapping' })
  async deleteMapping(@Param('employeeId') employeeId: number) {
    const data = await this.attendanceService.deleteMapping(employeeId, 'system');
    return ApiResponse.ok(data, 'Mapping deleted successfully');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // ATTENDANCE SYNC
  // ─────────────────────────────────────────────────────────────────────────────

  @Post('sync')
  @ApiOperation({ summary: 'Sync attendance records from device' })
  async syncAttendance(@Body() dto: SyncAttendanceDto) {
    const data = await this.attendanceService.syncAttendance(dto, 'system');
    return ApiResponse.ok(data, 'Attendance synced successfully');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SCHEDULE MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────────

  @Post('schedule')
  @ApiOperation({ summary: 'Create work schedule' })
  async createSchedule(@Body() dto: ScheduleDto) {
    const data = await this.attendanceService.createSchedule(dto, 'system');
    return ApiResponse.ok(data, 'Schedule created successfully');
  }

  @Get('schedule')
  @ApiOperation({ summary: 'List work schedules' })
  async listSchedules() {
    const data = await this.attendanceService.listSchedules();
    return ApiResponse.ok(data);
  }

  @Post('schedule/assign')
  @ApiOperation({ summary: 'Assign schedule to employees' })
  async assignSchedule(@Body() dto: AssignScheduleDto) {
    const data = await this.attendanceService.assignSchedule(dto, 'system');
    return ApiResponse.ok(data);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // DEVICE LOGS
  // ─────────────────────────────────────────────────────────────────────────────

  @Get('logs')
  @ApiOperation({ summary: 'Get device logs' })
  async getDeviceLogs(@Query() dto: DeviceLogDto) {
    const data = await this.attendanceService.getDeviceLogs(dto);
    return ApiResponse.ok(data);
  }
}
