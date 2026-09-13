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
import { BrandService } from './brand.service';
import { CreateBrandDto, UpdateBrandDto } from './dto/brand.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';
import { ApiResponse } from '../../common/dto/api-response-dto';

@ApiTags('Brands')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('brands')
export class BrandController {
  constructor(private brandService: BrandService) {}

  @Get()
  @ApiOperation({ summary: 'Get all brands (Smart Query supported)' })
  @ApiQuery({ name: '$select', required: false, description: 'Select fields: id,code,name' })
  @ApiQuery({ name: '$include', required: false, description: 'Include relations: products' })
  @ApiQuery({ name: '$where[isActive]', required: false, description: 'Filter: true/false' })
  @ApiQuery({ name: '$search', required: false, description: 'Search keyword' })
  @ApiQuery({ name: '$orderBy[createdAt]', required: false, description: 'Sort: asc/desc' })
  @ApiQuery({ name: '$skip', required: false, description: 'Offset', type: Number })
  @ApiQuery({ name: '$take', required: false, description: 'Limit', type: Number })
  async findAll(@Query() query: Record<string, unknown>) {
    const { data, total, skip, take } = await this.brandService.findAll(query);
    return ApiResponse.paginated(data, total, skip, take);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get brand by ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.brandService.findOne(id);
    return ApiResponse.ok(data);
  }

  @Post()
  @ApiOperation({ summary: 'Create brand' })
  async create(@Body() dto: CreateBrandDto) {
    const data = await this.brandService.create(dto);
    return ApiResponse.ok(data, 'Brand created successfully');
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update brand' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBrandDto) {
    const data = await this.brandService.update(id, dto);
    return ApiResponse.ok(data, 'Brand updated successfully');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete brand' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    const data = await this.brandService.remove(id);
    return ApiResponse.ok(data, 'Brand deactivated successfully');
  }
}
