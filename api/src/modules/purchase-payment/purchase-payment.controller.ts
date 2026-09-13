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
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PurchasePaymentService } from './purchase-payment.service';
import { CreatePurchasePaymentDto, UpdatePurchasePaymentDto } from './dto/purchase-payment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';
import { CurrentUser } from '../../common/decorators/current-user-decorator';
import { ApiResponse } from '../../common/dto/api-response-dto';

@ApiTags('Purchase Payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('purchase-payments')
export class PurchasePaymentController {
  constructor(private purchasePaymentService: PurchasePaymentService) {}

  @Get()
  @ApiOperation({ summary: 'Get all purchase payments (Smart Query supported)' })
  @ApiQuery({ name: '$select', required: false, description: 'Select fields' })
  @ApiQuery({ name: '$include', required: false, description: 'Include relations: purchase,creator' })
  @ApiQuery({ name: '$where[purchase_id]', required: false, description: 'Filter by purchase ID' })
  @ApiQuery({ name: '$search', required: false, description: 'Search keyword' })
  @ApiQuery({ name: '$orderBy[createdAt]', required: false, description: 'Sort: asc/desc' })
  @ApiQuery({ name: '$skip', required: false, description: 'Offset', type: Number })
  @ApiQuery({ name: '$take', required: false, description: 'Limit', type: Number })
  async findAll(@Query() query: Record<string, unknown>) {
    const { data, total, skip, take } = await this.purchasePaymentService.findAll(query);
    return ApiResponse.paginated(data, total, skip, take);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get purchase payment by ID' })
  async findOne(@Param('id', ParseIntPipe) id: number, @Query() query: any) {
    const data = await this.purchasePaymentService.findOne(id, query);
    if (!data) throw new NotFoundException('Purchase payment not found');
    return ApiResponse.ok(data);
  }

  @Get('purchase/:purchaseId')
  @ApiOperation({ summary: 'Get payments for a purchase' })
  async findByPurchase(@Param('purchaseId', ParseIntPipe) purchaseId: number, @Query() query: any) {
    const { data, total, skip, take } = await this.purchasePaymentService.findByPurchase(purchaseId, query);
    return ApiResponse.paginated(data, total, skip, take);
  }

  @Post()
  @ApiOperation({ summary: 'Create purchase payment' })
  async create(@Body() dto: CreatePurchasePaymentDto, @CurrentUser() user: any) {
    const data = await this.purchasePaymentService.create(dto, user.id);
    return ApiResponse.ok(data, 'Purchase payment created successfully');
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update purchase payment' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePurchasePaymentDto) {
    const data = await this.purchasePaymentService.update(id, dto);
    return ApiResponse.ok(data, 'Purchase payment updated successfully');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete purchase payment' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.purchasePaymentService.delete(id);
    return ApiResponse.ok({ id }, 'Purchase payment deleted successfully');
  }
}
