import { Controller, Get, Post, Patch, Delete, Body, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { SalesPersonService } from './salesperson-service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth-guard';
import {
  CreateSalesPersonDto,
  UpDateSalesPersonDto,
  SalesPersonFilterDto,
  SalesPersonPerformanceDto,
} from './salesperson.dto';

@UseGuards(JwtAuthGuard)
@Controller('business-logic/salespersons')
export class SalesPersonController {
  constructor(private readonly salesPersonService: SalesPersonService) {}

  @Post()
  async createSalesPerson(
    @Body() dto: CreateSalesPersonDto,
    @Query('userId') userId: string = 'system',
  ) {
    return this.salesPersonService.createSalesPerson(dto, userId);
  }

  @Get()
  async listSalesPersons(@Query() dto: SalesPersonFilterDto) {
    return this.salesPersonService.listSalesPersons(dto);
  }

  @Get('performance')
  async getSalesPersonPerformance(@Query() dto: SalesPersonPerformanceDto) {
    return this.salesPersonService.getSalesPersonPerformance(dto);
  }

  @Get(':id')
  async getSalesPerson(@Param('id', ParseIntPipe) id: number) {
    return this.salesPersonService.getSalesPerson(id);
  }

  @Patch(':id')
  async updateSalesPerson(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpDateSalesPersonDto,
    @Query('userId') userId: string = 'system',
  ) {
    return this.salesPersonService.updateSalesPerson(id, dto, userId);
  }

  @Delete(':id')
  async deleteSalesPerson(@Param('id', ParseIntPipe) id: number) {
    return this.salesPersonService.deleteSalesPerson(id);
  }
}
