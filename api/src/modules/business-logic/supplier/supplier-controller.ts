import { Controller, Get, Post, Patch, Delete, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { SupplierService } from './supplier-service';
import {
  CreateSupplierDto,
  UpdateSupplierDto,
  SupplierFilterDto,
  SupplierStatementDto,
  AddSupplierDebtDto,
  PaymentSupplierDebtDto,
} from './supplier.dto';

@Controller('business-logic/suppliers')
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @Post()
  async createSupplier(
    @Body() dto: CreateSupplierDto,
    @Query('userId') userId: string = 'system',
  ) {
    return this.supplierService.createSupplier(dto, userId);
  }

  @Get()
  async listSuppliers(@Query() dto: SupplierFilterDto) {
    return this.supplierService.listSuppliers(dto);
  }

  @Get('summary')
  async getSupplierSummary() {
    return this.supplierService.getSupplierSummary();
  }

  @Get('top')
  async getTopSuppliers(@Query('limit') limit?: number) {
    return this.supplierService.getTopSuppliers(limit);
  }

  @Get(':id')
  async getSupplier(@Param('id', ParseIntPipe) id: number) {
    return this.supplierService.getSupplier(id);
  }

  @Patch(':id')
  async updateSupplier(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSupplierDto,
    @Query('userId') userId: string = 'system',
  ) {
    return this.supplierService.updateSupplier(id, dto, userId);
  }

  @Delete(':id')
  async deleteSupplier(
    @Param('id', ParseIntPipe) id: number,
    @Query('userId') userId: string = 'system',
  ) {
    return this.supplierService.deleteSupplier(id, userId);
  }

  // Debt Management
  @Post('debt/add')
  async addDebt(
    @Body() dto: AddSupplierDebtDto,
    @Query('userId') userId: string = 'system',
  ) {
    return this.supplierService.addDebt(dto, userId);
  }

  @Post('debt/payment')
  async paymentDebt(
    @Body() dto: PaymentSupplierDebtDto,
    @Query('userId') userId: string = 'system',
  ) {
    return this.supplierService.paymentDebt(dto, userId);
  }

  @Get(':id/debt')
  async getSupplierDebt(@Param('id', ParseIntPipe) id: number) {
    return this.supplierService.getSupplierDebt(id);
  }

  @Get(':id/statement')
  async getSupplierStatement(@Param('id', ParseIntPipe) id: number, @Query() dto: SupplierStatementDto) {
    return this.supplierService.getSupplierStatement({ ...dto, supplierId: id });
  }
}
