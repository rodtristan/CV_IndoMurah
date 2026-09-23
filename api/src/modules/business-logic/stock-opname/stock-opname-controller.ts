import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { StockOpnameService } from './stock-opname-service';
import {
  CreateStockOpnameDto,
  UpdateStockOpnameDto,
  StockOpnameQueryDto,
  ApproveStockOpnameDto,
  CancelStockOpnameDto,
  GenerateOpnameListDto,
} from './stock-opname.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth-guard';
import { ApiResponse } from '../../../common/dto/api-response-dto';

@ApiTags('Stock Opname - Stock Taking')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('business-logic/stock-opname')
export class StockOpnameController {
  constructor(private stockOpnameService: StockOpnameService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // GENERATE
  // ─────────────────────────────────────────────────────────────────────────────

  @Get('generate')
  @ApiOperation({ summary: 'Generate stock opname list with current system stock' })
  async generateOpnameList(@Query() dto: GenerateOpnameListDto) {
    const data = await this.stockOpnameService.generateOpnameList(dto);
    return ApiResponse.ok(data);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CREATE
  // ─────────────────────────────────────────────────────────────────────────────

  @Post()
  @ApiOperation({ summary: 'Create new stock opname' })
  async create(@Body() dto: CreateStockOpnameDto) {
    const data = await this.stockOpnameService.create(dto);
    return ApiResponse.ok(data, 'Stock opname created successfully');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // QUERY
  // ─────────────────────────────────────────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'List all stock opnames' })
  async findAll(@Query() dto: StockOpnameQueryDto) {
    const data = await this.stockOpnameService.findAll(dto);
    return ApiResponse.ok(data);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get stock opname by ID' })
  async findById(@Param('id', ParseIntPipe) id: number) {
    const data = await this.stockOpnameService.findById(id);
    return ApiResponse.ok(data);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // UPDATE
  // ─────────────────────────────────────────────────────────────────────────────

  @Patch(':id')
  @ApiOperation({ summary: 'Update stock opname' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStockOpnameDto,
  ) {
    const data = await this.stockOpnameService.update(id, dto);
    return ApiResponse.ok(data, 'Stock opname updated');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // ACTIONS
  // ─────────────────────────────────────────────────────────────────────────────

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve stock opname (with optional stock adjustment)' })
  async approve(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ApproveStockOpnameDto,
  ) {
    const data = await this.stockOpnameService.approve(id, dto);
    return ApiResponse.ok(data, 'Stock opname approved');
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel stock opname' })
  async cancel(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CancelStockOpnameDto,
  ) {
    const data = await this.stockOpnameService.cancel(id, dto);
    return ApiResponse.ok(data, 'Stock opname cancelled');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete draft stock opname' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.stockOpnameService.delete(id);
    return ApiResponse.ok(null, 'Stock opname deleted');
  }
}
