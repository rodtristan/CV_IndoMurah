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
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { POSService } from './pos-service';
import {
  CreatePOSTransactionDto,
  BarcodeSearchDto,
  ProductSearchDto,
  QuickPriceCheckDto,
  OpenTransactionDto,
  UpdateCartItemDto,
  ApplyVoucherDto,
  HoldTransactionDto,
  ResumeTransactionDto,
} from './pos.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth-guard';
import { ApiResponse } from '../../../common/dto/api-response-dto';

@ApiTags('POS - Point of Sale')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('business-logic/pos')
export class POSController {
  constructor(private posService: POSService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // PRODUCT LOOKUP
  // ─────────────────────────────────────────────────────────────────────────────

  @Get('products/search')
  @ApiOperation({ summary: 'Search products for POS display' })
  @ApiHeader({ name: 'X-Session-Id', description: 'POS session ID for cart operations' })
  async searchProducts(@Query() dto: ProductSearchDto) {
    const data = await this.posService.searchProducts(dto);
    return ApiResponse.ok(data);
  }

  @Get('products/barcode')
  @ApiOperation({ summary: 'Search product by barcode (Scanner lookup)' })
  async searchByBarcode(@Query() dto: BarcodeSearchDto) {
    const data = await this.posService.searchByBarcode(dto);
    return ApiResponse.ok(data);
  }

  @Get('products/price-check')
  @ApiOperation({ summary: 'Quick price check with quantity and customer pricing' })
  async quickPriceCheck(@Query() dto: QuickPriceCheckDto) {
    const data = await this.posService.quickPriceCheck(dto);
    return ApiResponse.ok(data);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CART MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────────

  @Post('cart/open')
  @ApiOperation({ summary: 'Open new POS cart session' })
  @ApiHeader({ name: 'X-Session-Id', description: 'Unique session ID for this POS instance', required: true })
  async openCart(
    @Headers('x-session-id') sessionId: string,
    @Body() dto: OpenTransactionDto,
  ) {
    const data = await this.posService.openCart(sessionId, dto);
    return ApiResponse.ok(data, 'Cart opened successfully');
  }

  @Post('cart/add')
  @ApiOperation({ summary: 'Add product to cart' })
  async addToCart(
    @Headers('x-session-id') sessionId: string,
    @Body() dto: { productId: number; quantity: number; unitPrice?: number; notes?: string },
  ) {
    const data = await this.posService.addToCart(sessionId, dto);
    return ApiResponse.ok(data, 'Item added to cart');
  }

  @Put('cart/item/:productId')
  @ApiOperation({ summary: 'Update cart item quantity/price' })
  async updateCartItem(
    @Headers('x-session-id') sessionId: string,
    @Param('productId') productId: number,
    @Body() dto: UpdateCartItemDto,
  ) {
    const data = await this.posService.updateCartItem(sessionId, productId, dto);
    return ApiResponse.ok(data, 'Cart item updated');
  }

  @Delete('cart/item/:productId')
  @ApiOperation({ summary: 'Remove item from cart' })
  async removeFromCart(
    @Headers('x-session-id') sessionId: string,
    @Param('productId') productId: number,
  ) {
    const data = await this.posService.removeFromCart(sessionId, productId);
    return ApiResponse.ok(data, 'Item removed from cart');
  }

  @Get('cart')
  @ApiOperation({ summary: 'Get current cart summary' })
  async getCart(@Headers('x-session-id') sessionId: string) {
    const data = await this.posService.getCart(sessionId);
    return ApiResponse.ok(data);
  }

  @Delete('cart')
  @ApiOperation({ summary: 'Clear current cart' })
  async clearCart(@Headers('x-session-id') sessionId: string) {
    const data = await this.posService.clearCart(sessionId);
    return ApiResponse.ok(data);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // HOLD & RESUME
  // ─────────────────────────────────────────────────────────────────────────────

  @Post('cart/hold')
  @ApiOperation({ summary: 'Hold current transaction (Simpan transaksi sementara)' })
  async holdTransaction(
    @Headers('x-session-id') sessionId: string,
    @Body() dto: HoldTransactionDto,
  ) {
    const data = await this.posService.holdTransaction(sessionId, dto);
    return ApiResponse.ok(data, 'Transaction held');
  }

  @Post('cart/resume')
  @ApiOperation({ summary: 'Resume held transaction' })
  async resumeTransaction(
    @Headers('x-session-id') sessionId: string,
    @Body() dto: ResumeTransactionDto,
  ) {
    const data = await this.posService.resumeTransaction(sessionId, dto);
    return ApiResponse.ok(data, 'Transaction resumed');
  }

  @Get('holds')
  @ApiOperation({ summary: 'List all held transactions' })
  async listHeldTransactions() {
    const data = await this.posService.listHeldTransactions();
    return ApiResponse.ok(data);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // VOUCHER & DISCOUNT
  // ─────────────────────────────────────────────────────────────────────────────

  @Post('voucher/apply')
  @ApiOperation({ summary: 'Apply voucher code to transaction' })
  async applyVoucher(@Body() dto: ApplyVoucherDto) {
    const data = await this.posService.applyVoucher(dto);
    return ApiResponse.ok(data);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // COMPLETE TRANSACTION
  // ─────────────────────────────────────────────────────────────────────────────

  @Post('transaction/complete')
  @ApiOperation({ summary: 'Complete POS transaction (Finalize sale)' })
  async completeTransaction(
    @Headers('x-session-id') sessionId: string,
    @Body() dto: { paymentMethodId: number; cashAmount: number; notes?: string; useCustomerDeposit?: boolean },
  ) {
    const data = await this.posService.completeTransaction(sessionId, dto);
    return ApiResponse.ok(data, 'Transaction completed successfully');
  }
}
