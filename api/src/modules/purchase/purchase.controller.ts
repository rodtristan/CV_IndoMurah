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
import { PurchaseService } from './purchase.service';
import { CreatePurchaseDto, UpdatePurchaseDto, UpdateStatusDto } from './dto/purchase.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';
import { CurrentUser } from '../../common/decorators/current-user-decorator';
import { ApiResponse } from '../../common/dto/api-response-dto';

@ApiTags('Purchases')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('purchases')
export class PurchaseController {
  constructor(private purchaseService: PurchaseService) {}

  @Get()
  @ApiOperation({ summary: 'Get all purchases (Smart Query supported)' })
  @ApiQuery({ name: '$select', required: false, description: 'Select fields' })
  @ApiQuery({ name: '$include', required: false, description: 'Include relations: supplier,warehouse,items' })
  @ApiQuery({ name: '$where[status]', required: false, description: 'Filter by status' })
  @ApiQuery({ name: '$where[paymentStatus]', required: false, description: 'Filter by payment status' })
  @ApiQuery({ name: '$where[supplier_id]', required: false, description: 'Filter by supplier' })
  @ApiQuery({ name: '$search', required: false, description: 'Search keyword' })
  @ApiQuery({ name: '$orderBy[createdAt]', required: false, description: 'Sort: asc/desc' })
  @ApiQuery({ name: '$skip', required: false, description: 'Offset', type: Number })
  @ApiQuery({ name: '$take', required: false, description: 'Limit', type: Number })
  async findAll(@Query() query: Record<string, unknown>) {
    const { data, total, skip, take } = await this.purchaseService.findAll(query);
    return ApiResponse.paginated(data, total, skip, take);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get purchase by ID' })
  async findOne(@Param('id', ParseIntPipe) id: number, @Query() query: any) {
    const data = await this.purchaseService.findOne(id, query);
    if (!data) throw new NotFoundException('Purchase not found');
    return ApiResponse.ok(data);
  }

  @Get('report/summary')
  @ApiOperation({ summary: 'Get purchase summary report' })
  async getReport(@Query() query: any) {
    const result = await this.purchaseService.getReport(query);
    return ApiResponse.ok(result);
  }

  @Post()
  @ApiOperation({ summary: 'Create purchase' })
  async create(@Body() dto: CreatePurchaseDto, @CurrentUser() user: any) {
    const data = await this.purchaseService.create(dto, user.id);
    return ApiResponse.ok(data, 'Purchase created successfully');
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update purchase' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePurchaseDto, @CurrentUser() user: any) {
    const data = await this.purchaseService.update(id, dto, user?.id);
    return ApiResponse.ok(data, 'Purchase updated successfully');
  }

  @Put(':id/confirm')
  @ApiOperation({ summary: 'Confirm purchase' })
  async confirm(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    const data = await this.purchaseService.updateStatus(id, { StatusCode: 'CONFIRMED' }, user?.id);
    return ApiResponse.ok(data, 'Purchase confirmed');
  }

  @Put(':id/complete')
  @ApiOperation({ summary: 'Complete purchase' })
  async complete(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    const data = await this.purchaseService.updateStatus(id, { StatusCode: 'COMPLETED' }, user?.id);
    return ApiResponse.ok(data, 'Purchase completed');
  }

  @Put(':id/cancel')
  @ApiOperation({ summary: 'Cancel purchase' })
  async cancel(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    const data = await this.purchaseService.updateStatus(id, { StatusCode: 'CANCELLED' }, user?.id);
    return ApiResponse.ok(data, 'Purchase cancelled');
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update purchase status' })
  async updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStatusDto, @CurrentUser() user: any) {
    const data = await this.purchaseService.updateStatus(id, dto, user?.id);
    return ApiResponse.ok(data, 'Status updated successfully');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete draft purchase' })
  async delete(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    await this.purchaseService.delete(id, user?.id);
    return ApiResponse.ok({ id }, 'Purchase deleted successfully');
  }
}
