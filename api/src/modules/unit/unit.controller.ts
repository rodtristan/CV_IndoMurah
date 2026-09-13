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
import { UnitService } from './unit.service';
import { CreateUnitDto, UpdateUnitDto } from './dto/unit.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';
import { ApiResponse } from '../../common/dto/api-response-dto';

@ApiTags('Units')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('units')
export class UnitController {
  constructor(private unitService: UnitService) {}

  @Get()
  @ApiOperation({ summary: 'Get all units (Smart Query supported)' })
  @ApiQuery({ name: '$select', required: false, description: 'Select fields: id,code,name,abbreviation' })
  @ApiQuery({ name: '$include', required: false, description: 'Include relations: products' })
  @ApiQuery({ name: '$where[isActive]', required: false, description: 'Filter: true/false' })
  @ApiQuery({ name: '$search', required: false, description: 'Search keyword' })
  @ApiQuery({ name: '$orderBy[createdAt]', required: false, description: 'Sort: asc/desc' })
  @ApiQuery({ name: '$skip', required: false, description: 'Offset', type: Number })
  @ApiQuery({ name: '$take', required: false, description: 'Limit', type: Number })
  async findAll(@Query() query: Record<string, unknown>) {
    const { data, total, skip, take } = await this.unitService.findAll(query);
    return ApiResponse.paginated(data, total, skip, take);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get unit by ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.unitService.findOne(id);
    return ApiResponse.ok(data);
  }

  @Post()
  @ApiOperation({ summary: 'Create unit' })
  async create(@Body() dto: CreateUnitDto) {
    const data = await this.unitService.create(dto);
    return ApiResponse.ok(data, 'Unit created successfully');
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update unit' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUnitDto) {
    const data = await this.unitService.update(id, dto);
    return ApiResponse.ok(data, 'Unit updated successfully');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete unit' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    const data = await this.unitService.remove(id);
    return ApiResponse.ok(data, 'Unit deactivated successfully');
  }
}
