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
import { SalesPersonService } from './sales-person.service';
import { CreateSalesPersonDto, UpdateSalesPersonDto } from './dto/sales-person.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';
import { ApiResponse } from '../../common/dto/api-response-dto';

@ApiTags('SalesPeople')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sales-people')
export class SalesPersonController {
  constructor(private salesPersonService: SalesPersonService) {}

  @Get()
  @ApiOperation({ summary: 'Get all sales people (Smart Query supported)' })
  @ApiQuery({ name: '$select', required: false, description: 'Select fields: id,code,name,phone' })
  @ApiQuery({ name: '$include', required: false, description: 'Include relations: sales' })
  @ApiQuery({ name: '$where[isActive]', required: false, description: 'Filter: true/false' })
  @ApiQuery({ name: '$search', required: false, description: 'Search keyword' })
  @ApiQuery({ name: '$orderBy[createdAt]', required: false, description: 'Sort: asc/desc' })
  @ApiQuery({ name: '$skip', required: false, description: 'Offset', type: Number })
  @ApiQuery({ name: '$take', required: false, description: 'Limit', type: Number })
  async findAll(@Query() query: Record<string, unknown>) {
    const { data, total, skip, take } = await this.salesPersonService.findAll(query);
    return ApiResponse.paginated(data, total, skip, take);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get sales person by ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.salesPersonService.findOne(id);
    return ApiResponse.ok(data);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get sales person statistics' })
  async getStats(
    @Param('id', ParseIntPipe) id: number,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    const data = await this.salesPersonService.getStats(
      id,
      dateFrom ? new Date(dateFrom) : undefined,
      dateTo ? new Date(dateTo) : undefined,
    );
    return ApiResponse.ok(data);
  }

  @Post()
  @ApiOperation({ summary: 'Create sales person' })
  async create(@Body() dto: CreateSalesPersonDto) {
    const data = await this.salesPersonService.create(dto);
    return ApiResponse.ok(data, 'Sales person created successfully');
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update sales person' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSalesPersonDto) {
    const data = await this.salesPersonService.update(id, dto);
    return ApiResponse.ok(data, 'Sales person updated successfully');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete sales person' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    const data = await this.salesPersonService.remove(id);
    return ApiResponse.ok(data, 'Sales person deactivated successfully');
  }
}
