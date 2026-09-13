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
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { SalePointService } from './sale-point.service';
import { CreateSalePointDto, UpdateSalePointDto } from './dto/sale-point.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';
import { ApiResponse } from '../../common/dto/api-response-dto';

@ApiTags('SalePoints')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sale-points')
export class SalePointController {
  constructor(private salePointService: SalePointService) {}

  @Get()
  @ApiOperation({ summary: 'Get all sale points (Smart Query supported)' })
  @ApiQuery({ name: '$select', required: false, description: 'Select fields: id,code,name' })
  @ApiQuery({ name: '$include', required: false, description: 'Include relations: warehouse,sales' })
  @ApiQuery({ name: '$where[isActive]', required: false, description: 'Filter: true/false' })
  @ApiQuery({ name: '$search', required: false, description: 'Search keyword' })
  @ApiQuery({ name: '$orderBy[createdAt]', required: false, description: 'Sort: asc/desc' })
  @ApiQuery({ name: '$skip', required: false, description: 'Offset', type: Number })
  @ApiQuery({ name: '$take', required: false, description: 'Limit', type: Number })
  async findAll(@Query() query: Record<string, unknown>) {
    const { data, total, skip, take } = await this.salePointService.findAll(query);
    return ApiResponse.paginated(data, total, skip, take);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get sale point by ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.salePointService.findOne(id);
    return ApiResponse.ok(data);
  }

  @Get(':id/sales')
  @ApiOperation({ summary: 'Get all sales for a sale point' })
  async getSales(@Param('id', ParseIntPipe) id: number) {
    const data = await this.salePointService.getSales(id);
    return ApiResponse.ok(data);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get sale point statistics' })
  async getStats(
    @Param('id', ParseIntPipe) id: number,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    const data = await this.salePointService.getStats(
      id,
      dateFrom ? new Date(dateFrom) : undefined,
      dateTo ? new Date(dateTo) : undefined,
    );
    return ApiResponse.ok(data);
  }

  @Post()
  @ApiOperation({ summary: 'Create sale point' })
  async create(@Body() dto: CreateSalePointDto) {
    const data = await this.salePointService.create(dto);
    return ApiResponse.ok(data, 'Sale point created successfully');
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update sale point' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSalePointDto) {
    const data = await this.salePointService.update(id, dto);
    return ApiResponse.ok(data, 'Sale point updated successfully');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete sale point' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    const data = await this.salePointService.remove(id);
    return ApiResponse.ok(data, 'Sale point deactivated successfully');
  }
}
