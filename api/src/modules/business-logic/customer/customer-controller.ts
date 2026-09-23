import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { CustomerService } from './customer-service';
import {
  CreateCustomerDto,
  UpdateCustomerDto,
  CustomerFilterDto,
  CustomerTopDto,
  CustomerSummaryDto,
  CustomerStatementDto,
  CreateCustomerGroupDto,
  UpdateCustomerGroupDto,
  AddReceivableDto,
  PaymentReceivableDto,
  AdjustPointsDto,
} from './customer.dto';

@Controller('business-logic/customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // CUSTOMER ENDPOINTS
  // ─────────────────────────────────────────────────────────────────────────────

  @Post()
  async createCustomer(
    @Body() dto: CreateCustomerDto,
    @Query('userId') userId: string = 'system',
  ) {
    return this.customerService.createCustomer(dto, userId);
  }

  @Get()
  async listCustomers(@Query() dto: CustomerFilterDto) {
    return this.customerService.listCustomers(dto);
  }

  @Get('summary')
  async getCustomerSummary() {
    return this.customerService.getCustomerSummary();
  }

  @Get('top-revenue')
  async getTopCustomersByRevenue(@Query() dto: CustomerTopDto) {
    return this.customerService.getTopCustomersByRevenue(dto);
  }

  @Get(':id')
  async getCustomer(@Param('id', ParseIntPipe) id: number) {
    return this.customerService.getCustomer(id);
  }

  @Patch(':id')
  async updateCustomer(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCustomerDto,
    @Query('userId') userId: string = 'system',
  ) {
    return this.customerService.updateCustomer(id, dto, userId);
  }

  @Delete(':id')
  async deleteCustomer(
    @Param('id', ParseIntPipe) id: number,
    @Query('userId') userId: string = 'system',
  ) {
    return this.customerService.deleteCustomer(id, userId);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // RECEIVABLE MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────────

  @Post('receivable/add')
  async addReceivable(
    @Body() dto: AddReceivableDto,
    @Query('userId') userId: string = 'system',
  ) {
    return this.customerService.addReceivable(dto, userId);
  }

  @Post('receivable/payment')
  async paymentReceivable(
    @Body() dto: PaymentReceivableDto,
    @Query('userId') userId: string = 'system',
  ) {
    return this.customerService.paymentReceivable(dto, userId);
  }

  @Get(':id/receivable')
  async getCustomerReceivable(@Param('id', ParseIntPipe) id: number) {
    return this.customerService.getCustomerReceivable(id);
  }

  @Get(':id/statement')
  async getCustomerStatement(@Param('id', ParseIntPipe) id: number, @Query() dto: CustomerStatementDto) {
    return this.customerService.getCustomerStatement({ ...dto, CustomerId: id });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // LOYALTY POINTS MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────────

  @Post('points/adjust')
  async adjustPoints(
    @Body() dto: AdjustPointsDto,
    @Query('userId') userId: string = 'system',
  ) {
    return this.customerService.adjustPoints(dto, userId);
  }

  @Get(':id/loyalty')
  async getCustomerLoyaltyHistory(@Param('id', ParseIntPipe) id: number) {
    return this.customerService.getCustomerLoyaltyHistory(id);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CUSTOMER GROUP ENDPOINTS
  // ─────────────────────────────────────────────────────────────────────────────

  @Post('groups')
  async createCustomerGroup(@Body() dto: CreateCustomerGroupDto) {
    return this.customerService.createCustomerGroup(dto);
  }

  @Get('groups')
  async listCustomerGroups() {
    return this.customerService.listCustomerGroups();
  }

  @Put('groups/:id')
  async updateCustomerGroup(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCustomerGroupDto,
  ) {
    return this.customerService.updateCustomerGroup(id, dto);
  }

  @Delete('groups/:id')
  async deleteCustomerGroup(@Param('id', ParseIntPipe) id: number) {
    return this.customerService.deleteCustomerGroup(id);
  }
}
