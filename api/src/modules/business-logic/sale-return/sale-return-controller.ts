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
import { SaleReturnService } from './sale-return-service';
import {
  CreateSaleReturnDto,
  SaleReturnFilterDto,
  LookupSaleDto,
  ApproveSaleReturnDto,
  RejectSaleReturnDto,
} from './sale-return.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth-guard';
import { ApiResponse } from '../../../common/dto/api-response-dto';

@ApiTags('Sale Return - Retur Penjualan')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('business-logic/sale-return')
export class SaleReturnController {
  constructor(private saleReturnService: SaleReturnService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // LOOKUP ENDPOINTS
  // ─────────────────────────────────────────────────────────────────────────────

  @Get('lookup')
  @ApiOperation({ summary: 'Search/lookup sales eligible for return' })
  async lookupSales(@Query() dto: LookupSaleDto) {
    const data = await this.saleReturnService.lookupSales(dto);
    return ApiResponse.ok(data);
  }

  @Get('sale/:saleId/items')
  @ApiOperation({ summary: 'Get sale items for return selection' })
  async getSaleItemsForReturn(@Param('saleId') saleId: number) {
    const data = await this.saleReturnService.getSaleItemsForReturn(saleId);
    return ApiResponse.ok(data);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SALE RETURN ENDPOINTS
  // ─────────────────────────────────────────────────────────────────────────────

  @Post()
  @ApiOperation({ summary: 'Create new sale return' })
  async createSaleReturn(@Body() dto: CreateSaleReturnDto) {
    const userId = 'system';
    const data = await this.saleReturnService.createSaleReturn(dto, userId);
    return ApiResponse.ok(data, 'Sale return created successfully');
  }

  @Get()
  @ApiOperation({ summary: 'List sale returns' })
  async listSaleReturns(@Query() dto: SaleReturnFilterDto) {
    const data = await this.saleReturnService.listSaleReturns(dto);
    return ApiResponse.ok(data);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get sale return summary report' })
  async getSaleReturnSummary(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const data = await this.saleReturnService.getSaleReturnSummary(startDate, endDate);
    return ApiResponse.ok(data);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get sale return by ID' })
  async getSaleReturn(@Param('id') id: number) {
    const data = await this.saleReturnService.getSaleReturn(id);
    return ApiResponse.ok(data);
  }

  @Put(':id/approve')
  @ApiOperation({ summary: 'Approve sale return' })
  async approveSaleReturn(
    @Param('id') id: number,
    @Body() dto: ApproveSaleReturnDto,
  ) {
    const userId = 'system';
    const data = await this.saleReturnService.approveSaleReturn(id, dto, userId);
    return ApiResponse.ok(data, 'Sale return approved');
  }

  @Put(':id/reject')
  @ApiOperation({ summary: 'Reject sale return' })
  async rejectSaleReturn(
    @Param('id') id: number,
    @Body() dto: RejectSaleReturnDto,
  ) {
    const userId = 'system';
    const data = await this.saleReturnService.rejectSaleReturn(id, dto, userId);
    return ApiResponse.ok(data, 'Sale return rejected');
  }
}
