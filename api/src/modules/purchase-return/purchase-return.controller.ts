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
import { PurchaseReturnService } from './purchase-return.service';
import { CreatePurchaseReturnDto, UpdatePurchaseReturnDto, UpdatePurchaseReturnStatusDto } from './dto/purchase-return.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';
import { CurrentUser } from '../../common/decorators/current-user-decorator';
import { ApiResponse } from '../../common/dto/api-response-dto';

@ApiTags('Purchase Returns')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('PurchaseReturns')
export class PurchaseReturnController {
  constructor(private purchaseReturnService: PurchaseReturnService) {}

  @Get()
  @ApiOperation({ summary: 'Get all purchase returns (Smart Query supported)' })
  @ApiQuery({ name: '$select', required: false, description: 'Select fields' })
  @ApiQuery({ name: '$include', required: false, description: 'Include relations: purchase,supplier,returnItems' })
  @ApiQuery({ name: '$where[status]', required: false, description: 'Filter by status' })
  @ApiQuery({ name: '$where[supplier_id]', required: false, description: 'Filter by supplier' })
  @ApiQuery({ name: '$search', required: false, description: 'Search keyword' })
  @ApiQuery({ name: '$orderBy[createdAt]', required: false, description: 'Sort: asc/desc' })
  @ApiQuery({ name: '$skip', required: false, description: 'Offset', type: Number })
  @ApiQuery({ name: '$take', required: false, description: 'Limit', type: Number })
  async findAll(@Query() query: Record<string, unknown>) {
    const { data, total, skip, take } = await this.purchaseReturnService.findAll(query);
    return ApiResponse.paginated(data, total, skip, take);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get purchase return by ID' })
  async findOne(@Param('id', ParseIntPipe) id: number, @Query() query: any) {
    const data = await this.purchaseReturnService.findOne(id, query);
    if (!data) throw new NotFoundException('Purchase return not found');
    return ApiResponse.ok(data);
  }

  @Post()
  @ApiOperation({ summary: 'Create purchase return' })
  async create(@Body() dto: CreatePurchaseReturnDto, @CurrentUser() user: any) {
    const data = await this.purchaseReturnService.create(dto, user.id);
    return ApiResponse.ok(data, 'Purchase return created successfully');
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update purchase return' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePurchaseReturnDto, @CurrentUser() user: any) {
    const data = await this.purchaseReturnService.update(id, dto, user?.id);
    return ApiResponse.ok(data, 'Purchase return updated successfully');
  }

  @Put(':id/confirm')
  @ApiOperation({ summary: 'Confirm purchase return' })
  async confirm(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    const data = await this.purchaseReturnService.updateStatus(id, { StatusCode: 'CONFIRMED' }, user?.id);
    return ApiResponse.ok(data, 'Purchase return confirmed');
  }

  @Put(':id/complete')
  @ApiOperation({ summary: 'Complete purchase return' })
  async complete(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    const data = await this.purchaseReturnService.updateStatus(id, { StatusCode: 'COMPLETED' }, user?.id);
    return ApiResponse.ok(data, 'Purchase return completed');
  }

  @Put(':id/cancel')
  @ApiOperation({ summary: 'Cancel purchase return' })
  async cancel(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    const data = await this.purchaseReturnService.updateStatus(id, { StatusCode: 'CANCELLED' }, user?.id);
    return ApiResponse.ok(data, 'Purchase return cancelled');
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update purchase return status' })
  async updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePurchaseReturnStatusDto, @CurrentUser() user: any) {
    const data = await this.purchaseReturnService.updateStatus(id, dto, user?.id);
    return ApiResponse.ok(data, 'Status updated successfully');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete draft purchase return' })
  async delete(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    await this.purchaseReturnService.delete(id, user?.id);
    return ApiResponse.ok({ id }, 'Purchase return deleted successfully');
  }
}
