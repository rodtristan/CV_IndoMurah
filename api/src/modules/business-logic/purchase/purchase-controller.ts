import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PurchaseService } from './purchase-service';
import {
  CreatePurchaseOrderDto,
  UpdatePurchaseOrderDto,
  PurchaseOrderFilterDto,
  CreatePurchaseDto,
  PurchaseFilterDto,
  RecordPurchasePaymentDto,
  RecordBulkPurchasePaymentDto,
  CreatePurchaseReturnDto,
  AddSupplierDepositDto,
} from './purchase.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth-guard';
import { ApiResponse } from '../../../common/dto/api-response-dto';

@ApiTags('Purchase - Pembelian')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('business-logic/purchase')
export class PurchaseController {
  constructor(private purchaseService: PurchaseService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // PURCHASE ORDER ENDPOINTS
  // ─────────────────────────────────────────────────────────────────────────────

  @Post('orders')
  @ApiOperation({ summary: 'Create new Purchase Order' })
  async createPurchaseOrder(
    @Body() dto: CreatePurchaseOrderDto,
  ) {
    // Note: userId should come from JWT token in real implementation
    const userId = 'system';
    const data = await this.purchaseService.createPurchaseOrder(dto, userId);
    return ApiResponse.ok(data, 'Purchase order created successfully');
  }

  @Get('orders')
  @ApiOperation({ summary: 'List Purchase Orders' })
  async listPurchaseOrders(@Query() dto: PurchaseOrderFilterDto) {
    const data = await this.purchaseService.listPurchaseOrders(dto);
    return ApiResponse.ok(data);
  }

  @Get('orders/:id')
  @ApiOperation({ summary: 'Get Purchase Order by ID' })
  async getPurchaseOrder(@Param('id') id: number) {
    const data = await this.purchaseService.getPurchaseOrder(id);
    return ApiResponse.ok(data);
  }

  @Put('orders/:id')
  @ApiOperation({ summary: 'Update Purchase Order' })
  async updatePurchaseOrder(
    @Param('id') id: number,
    @Body() dto: UpdatePurchaseOrderDto,
  ) {
    const userId = 'system';
    const data = await this.purchaseService.updatePurchaseOrder(id, dto, userId);
    return ApiResponse.ok(data, 'Purchase order updated');
  }

  @Put('orders/:id/status/:statusCode')
  @ApiOperation({ summary: 'Update Purchase Order Status (APPROVED/CANCELLED)' })
  async updatePurchaseOrderStatus(
    @Param('id') id: number,
    @Param('statusCode') statusCode: string,
  ) {
    const userId = 'system';
    const data = await this.purchaseService.updatePurchaseOrderStatus(id, statusCode, userId);
    return ApiResponse.ok(data);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PURCHASE (PENERIMAAN BARANG) ENDPOINTS
  // ─────────────────────────────────────────────────────────────────────────────

  @Post()
  @ApiOperation({ summary: 'Create Purchase (Goods Receipt)' })
  async createPurchase(@Body() dto: CreatePurchaseDto) {
    const userId = 'system';
    const data = await this.purchaseService.createPurchase(dto, userId);
    return ApiResponse.ok(data, 'Purchase created successfully');
  }

  @Get()
  @ApiOperation({ summary: 'List Purchases' })
  async listPurchases(@Query() dto: PurchaseFilterDto) {
    const data = await this.purchaseService.listPurchases(dto);
    return ApiResponse.ok(data);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Purchase by ID' })
  async getPurchase(@Param('id') id: number) {
    const data = await this.purchaseService.getPurchase(id);
    return ApiResponse.ok(data);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PURCHASE PAYMENT ENDPOINTS
  // ─────────────────────────────────────────────────────────────────────────────

  @Post(':id/payment')
  @ApiOperation({ summary: 'Record payment for purchase' })
  async recordPurchasePayment(
    @Param('id') id: number,
    @Body() dto: RecordPurchasePaymentDto,
  ) {
    const userId = 'system';
    const data = await this.purchaseService.RecordPurchasePayment(id, dto, userId);
    return ApiResponse.ok(data, 'Payment recorded successfully');
  }

  @Post('bulk-payment')
  @ApiOperation({ summary: 'Record bulk payment for multiple purchases' })
  async recordBulkPurchasePayment(@Body() dto: RecordBulkPurchasePaymentDto) {
    const userId = 'system';
    const data = await this.purchaseService.RecordBulkPurchasePayment(dto, userId);
    return ApiResponse.ok(data, 'Bulk payment recorded successfully');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PURCHASE RETURN ENDPOINTS
  // ─────────────────────────────────────────────────────────────────────────────

  @Post('returns')
  @ApiOperation({ summary: 'Create Purchase Return' })
  async createPurchaseReturn(@Body() dto: CreatePurchaseReturnDto) {
    const userId = 'system';
    const data = await this.purchaseService.createPurchaseReturn(dto, userId);
    return ApiResponse.ok(data, 'Purchase return created successfully');
  }

  @Put('returns/:id/approve')
  @ApiOperation({ summary: 'Approve Purchase Return' })
  async approvePurchaseReturn(@Param('id') id: number) {
    const userId = 'system';
    const data = await this.purchaseService.approvePurchaseReturn(id, userId);
    return ApiResponse.ok(data, 'Purchase return approved');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SUPPLIER DEBT MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────────

  @Get('supplier/:supplierId/debt-summary')
  @ApiOperation({ summary: 'Get supplier debt summary' })
  async getSupplierDebtSummary(@Param('supplierId') supplierId: number) {
    const data = await this.purchaseService.getSupplierDebtSummary(supplierId);
    return ApiResponse.ok(data);
  }

  @Post('supplier/:supplierId/deposit')
  @ApiOperation({ summary: 'Add supplier deposit (uang muka)' })
  async addSupplierDeposit(
    @Param('supplierId') supplierId: number,
    @Body() dto: AddSupplierDepositDto,
  ) {
    const userId = 'system';
    const data = await this.purchaseService.addSupplierDeposit(supplierId, dto, userId);
    return ApiResponse.ok(data, 'Supplier deposit added');
  }

  @Post('supplier/:supplierId/use-deposit/:purchaseId')
  @ApiOperation({ summary: 'Use supplier deposit for purchase payment' })
  async useSupplierDeposit(
    @Param('supplierId') supplierId: number,
    @Param('purchaseId') purchaseId: number,
    @Body() body: { amount: number },
  ) {
    const userId = 'system';
    const data = await this.purchaseService.useSupplierDeposit(
      supplierId,
      purchaseId,
      body.amount,
      userId,
    );
    return ApiResponse.ok(data);
  }
}
