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
import { SaleReturnService } from './sale-return.service';
import { CreateSaleReturnDto, UpdateSaleReturnDto, UpdateStatusDto } from './dto/sale-return.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';
import { CurrentUser } from '../../common/decorators/current-user-decorator';
import { ApiResponse } from '../../common/dto/api-response-dto';

@ApiTags('Sale Returns')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sale-returns')
export class SaleReturnController {
  constructor(private saleReturnService: SaleReturnService) {}

  @Get()
  @ApiOperation({ summary: 'Get all sale returns (Smart Query supported)' })
  @ApiQuery({ name: '$select', required: false, description: 'Select fields' })
  @ApiQuery({ name: '$include', required: false, description: 'Include relations: sale,customer,returnItems' })
  @ApiQuery({ name: '$where[status]', required: false, description: 'Filter by status' })
  @ApiQuery({ name: '$where[customer_id]', required: false, description: 'Filter by customer' })
  @ApiQuery({ name: '$search', required: false, description: 'Search keyword' })
  @ApiQuery({ name: '$orderBy[createdAt]', required: false, description: 'Sort: asc/desc' })
  @ApiQuery({ name: '$skip', required: false, description: 'Offset', type: Number })
  @ApiQuery({ name: '$take', required: false, description: 'Limit', type: Number })
  async findAll(@Query() query: Record<string, unknown>) {
    const { data, total, skip, take } = await this.saleReturnService.findAll(query);
    return ApiResponse.paginated(data, total, skip, take);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get sale return by ID' })
  async findOne(@Param('id', ParseIntPipe) id: number, @Query() query: any) {
    const data = await this.saleReturnService.findOne(id, query);
    if (!data) throw new NotFoundException('Sale return not found');
    return ApiResponse.ok(data);
  }

  @Post()
  @ApiOperation({ summary: 'Create sale return' })
  async create(@Body() dto: CreateSaleReturnDto, @CurrentUser() user: any) {
    const data = await this.saleReturnService.create(dto, user.id);
    return ApiResponse.ok(data, 'Sale return created successfully');
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update sale return' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSaleReturnDto) {
    const data = await this.saleReturnService.update(id, dto);
    return ApiResponse.ok(data, 'Sale return updated successfully');
  }

  @Put(':id/confirm')
  @ApiOperation({ summary: 'Confirm sale return' })
  async confirm(@Param('id', ParseIntPipe) id: number) {
    const data = await this.saleReturnService.updateStatus(id, { status: 'CONFIRMED' });
    return ApiResponse.ok(data, 'Sale return confirmed');
  }

  @Put(':id/complete')
  @ApiOperation({ summary: 'Complete sale return' })
  async complete(@Param('id', ParseIntPipe) id: number) {
    const data = await this.saleReturnService.updateStatus(id, { status: 'COMPLETED' });
    return ApiResponse.ok(data, 'Sale return completed');
  }

  @Put(':id/cancel')
  @ApiOperation({ summary: 'Cancel sale return' })
  async cancel(@Param('id', ParseIntPipe) id: number) {
    const data = await this.saleReturnService.updateStatus(id, { status: 'CANCELLED' });
    return ApiResponse.ok(data, 'Sale return cancelled');
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update sale return status' })
  async updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStatusDto) {
    const data = await this.saleReturnService.updateStatus(id, dto);
    return ApiResponse.ok(data, 'Status updated successfully');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete draft sale return' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.saleReturnService.delete(id);
    return ApiResponse.ok({ id }, 'Sale return deleted successfully');
  }
}
