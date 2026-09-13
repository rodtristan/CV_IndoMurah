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
import { StockOpnameService } from './stock-opname.service';
import { CreateStockOpnameDto, UpdateStockOpnameDto, AddStockOpnameItemDto } from './dto/stock-opname.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';
import { CurrentUser } from '../../common/decorators/current-user-decorator';
import { ApiResponse } from '../../common/dto/api-response-dto';

@ApiTags('Stock Opname')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('stock-opnames')
export class StockOpnameController {
  constructor(private stockOpnameService: StockOpnameService) {}

  @Get()
  @ApiOperation({ summary: 'Get all stock opnames (Smart Query supported)' })
  @ApiQuery({ name: '$select', required: false })
  @ApiQuery({ name: '$include', required: false })
  @ApiQuery({ name: '$where[warehouse_id]', required: false })
  @ApiQuery({ name: '$where[status]', required: false })
  @ApiQuery({ name: '$search', required: false })
  @ApiQuery({ name: '$orderBy[createdAt]', required: false })
  @ApiQuery({ name: '$skip', required: false })
  @ApiQuery({ name: '$take', required: false })
  async findAll(@Query() query: Record<string, unknown>) {
    const { data, total, skip, take } = await this.stockOpnameService.findAll(query);
    return ApiResponse.paginated(data, total, skip, take);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get stock opname by ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.stockOpnameService.findOne(id);
    return ApiResponse.ok(data);
  }

  @Post()
  @ApiOperation({ summary: 'Create stock opname' })
  async create(@Body() dto: CreateStockOpnameDto, @CurrentUser() user: { id: string }) {
    const data = await this.stockOpnameService.create(dto, user.id);
    return ApiResponse.ok(data, 'Stock Opname created successfully');
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update stock opname (draft only)' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStockOpnameDto) {
    const data = await this.stockOpnameService.update(id, dto);
    return ApiResponse.ok(data, 'Stock Opname updated successfully');
  }

  @Post(':id/items')
  @ApiOperation({ summary: 'Add item to stock opname' })
  async addItem(@Param('id', ParseIntPipe) id: number, @Body() dto: AddStockOpnameItemDto) {
    const data = await this.stockOpnameService.addItem(id, dto);
    return ApiResponse.ok(data, 'Item added successfully');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete stock opname (draft only)' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.stockOpnameService.remove(id);
    return ApiResponse.ok(null, 'Stock Opname deleted successfully');
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Complete stock opname (adjusts stock based on differences)' })
  async complete(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: { id: string }) {
    const data = await this.stockOpnameService.complete(id, user.id);
    return ApiResponse.ok(data, 'Stock Opname completed successfully');
  }
}
