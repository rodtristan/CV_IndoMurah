import { Controller, Get, Post, Patch, Delete, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { LeaveService } from './leave-service';
import {
  CreateLeaveDto,
  UpdateLeaveDto,
  ApproveLeaveDto,
  RejectLeaveDto,
  LeaveFilterDto,
  LeaveBalanceDto,
  InitializeLeaveBalanceDto,
} from './leave.dto';

@Controller('business-logic/leaves')
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  @Post()
  async createLeave(
    @Body() dto: CreateLeaveDto,
    @Query('userId') userId: string = 'system',
  ) {
    return this.leaveService.createLeave(dto, userId);
  }

  @Get()
  async listLeaves(@Query() dto: LeaveFilterDto) {
    return this.leaveService.listLeaves(dto);
  }

  @Get('types')
  async getLeaveTypes() {
    return this.leaveService.getLeaveTypes();
  }

  @Get('statuses')
  async getLeaveStatuses() {
    return this.leaveService.getLeaveStatuses();
  }

  @Get(':id')
  async getLeave(@Param('id', ParseIntPipe) id: number) {
    return this.leaveService.getLeave(id);
  }

  @Patch(':id')
  async updateLeave(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLeaveDto,
    @Query('userId') userId: string = 'system',
  ) {
    return this.leaveService.updateLeave(id, dto, userId);
  }

  @Post(':id/approve')
  async approveLeave(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ApproveLeaveDto,
    @Query('userId') userId: string = 'system',
  ) {
    return this.leaveService.approveLeave(id, dto, userId);
  }

  @Post(':id/reject')
  async rejectLeave(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RejectLeaveDto,
    @Query('userId') userId: string = 'system',
  ) {
    return this.leaveService.rejectLeave(id, dto, userId);
  }

  @Get('employee/:employeeId/balances')
  async getLeaveBalances(@Param('employeeId', ParseIntPipe) employeeId: number, @Query('year') year: number) {
    return this.leaveService.getLeaveBalances({ EmployeeId: employeeId, Year: year });
  }

  @Post('balances/initialize')
  async initializeLeaveBalances(
    @Body() dto: InitializeLeaveBalanceDto,
    @Query('userId') userId: string = 'system',
  ) {
    return this.leaveService.initializeLeaveBalances(dto, userId);
  }
}
