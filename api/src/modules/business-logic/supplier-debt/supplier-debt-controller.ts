import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SupplierDebtService } from './supplier-debt-service';
import {
  SupplierDebtOverviewDto,
  SupplierDebtDetailDto,
  RecordSupplierPaymentDto,
  BulkSupplierPaymentDto,
  AddSupplierDepositDto,
  UseSupplierDepositDto,
  SupplierDebtAgingDto,
  SupplierDebtReportDto,
} from './supplier-debt.dto';

@ApiTags('Business Logic - Supplier Debt')
@ApiBearerAuth()
@Controller('business-logic/supplier-debt')
export class SupplierDebtController {
  constructor(private supplierDebtService: SupplierDebtService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // DEBT OVERVIEW
  // ─────────────────────────────────────────────────────────────────────────────

  @Get('overview')
  @ApiOperation({ summary: 'Get supplier debt overview' })
  async getDebtOverview(@Query() dto: SupplierDebtOverviewDto) {
    return this.supplierDebtService.getDebtOverview(dto);
  }

  @Get('supplier/:supplierId')
  @ApiOperation({ summary: 'Get supplier debt details' })
  async getSupplierDebt(
    @Param('supplierId', ParseIntPipe) supplierId: number,
    @Query() dto: SupplierDebtDetailDto,
  ) {
    dto.SupplierId = supplierId;
    return this.supplierDebtService.getSupplierDebt(dto);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PAYMENT
  // ─────────────────────────────────────────────────────────────────────────────

  @Post('payment')
  @ApiOperation({ summary: 'Record payment for supplier debt' })
  async recordPayment(@Body() dto: RecordSupplierPaymentDto) {
    return this.supplierDebtService.recordPayment(dto, 'system');
  }

  @Post('bulk-payment')
  @ApiOperation({ summary: 'Bulk payment for supplier' })
  async bulkPayment(@Body() dto: BulkSupplierPaymentDto) {
    return this.supplierDebtService.bulkPayment(dto, 'system');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // DEPOSIT
  // ─────────────────────────────────────────────────────────────────────────────

  @Post('deposit')
  @ApiOperation({ summary: 'Add supplier deposit' })
  async addDeposit(@Body() dto: AddSupplierDepositDto) {
    return this.supplierDebtService.addDeposit(dto, 'system');
  }

  @Post('deposit/use')
  @ApiOperation({ summary: 'Use supplier deposit for purchase' })
  async useDeposit(@Body() dto: UseSupplierDepositDto) {
    return this.supplierDebtService.useDeposit(dto, 'system');
  }

  @Get('deposit/:supplierId')
  @ApiOperation({ summary: 'Get supplier deposits' })
  async getDeposits(@Param('supplierId', ParseIntPipe) supplierId: number) {
    return this.supplierDebtService.getDeposits(supplierId);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // REPORTS
  // ─────────────────────────────────────────────────────────────────────────────

  @Get('reports/aging')
  @ApiOperation({ summary: 'Get debt aging report' })
  async getDebtAging(@Query() dto: SupplierDebtAgingDto) {
    return this.supplierDebtService.getDebtAging(dto);
  }

  @Get('reports/debt')
  @ApiOperation({ summary: 'Get supplier debt report' })
  async getDebtReport(@Query() dto: SupplierDebtReportDto) {
    return this.supplierDebtService.getDebtReport(dto);
  }
}
