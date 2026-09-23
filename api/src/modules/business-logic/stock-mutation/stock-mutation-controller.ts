import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Delete,
  Param,
  Body,
  Query,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { StockMutationService } from './stock-mutation-service';
import {
  CreateMutationCategoryDto,
  UpdateMutationCategoryDto,
  CreateStockMutationDto,
  UpdateStockMutationDto,
  StockMutationFilterDto,
  MutationReportDto,
  MutationSummaryDto,
} from './stock-mutation.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth-guard';
import { ApiResponse } from '../../../common/dto/api-response-dto';

@ApiTags('Stock Mutation - Mutasi Stok')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('business-logic/stock-mutation')
export class StockMutationController {
  constructor(private stockMutationService: StockMutationService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // MUTATION CATEGORY
  // ─────────────────────────────────────────────────────────────────────────────

  @Post('categories')
  @ApiOperation({ summary: 'Create mutation category' })
  async createMutationCategory(@Body() dto: CreateMutationCategoryDto, @Request() req: any) {
    const data = await this.stockMutationService.createMutationCategory(dto, req.user?.id || '1');
    return ApiResponse.ok(data, 'Mutation category created successfully');
  }

  @Get('categories')
  @ApiOperation({ summary: 'List mutation categories' })
  async listMutationCategories(@Query('isActive') isActive?: string) {
    const data = await this.stockMutationService.listMutationCategories(
      isActive === 'true' ? true : isActive === 'false' ? false : undefined,
    );
    return ApiResponse.ok(data);
  }

  @Get('categories/:id')
  @ApiOperation({ summary: 'Get mutation category by ID' })
  async getMutationCategory(@Param('id') id: string) {
    const data = await this.stockMutationService.getMutationCategory(parseInt(id));
    return ApiResponse.ok(data);
  }

  @Patch('categories/:id')
  @ApiOperation({ summary: 'Update mutation category' })
  async updateMutationCategory(
    @Param('id') id: string,
    @Body() dto: UpdateMutationCategoryDto,
  ) {
    const data = await this.stockMutationService.updateMutationCategory(parseInt(id), dto);
    return ApiResponse.ok(data, 'Mutation category updated successfully');
  }

  @Delete('categories/:id')
  @ApiOperation({ summary: 'Delete mutation category' })
  async deleteMutationCategory(@Param('id') id: string) {
    const data = await this.stockMutationService.deleteMutationCategory(parseInt(id));
    return ApiResponse.ok(data, 'Mutation category deleted successfully');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // STOCK MUTATION
  // ─────────────────────────────────────────────────────────────────────────────

  @Post()
  @ApiOperation({ summary: 'Create stock mutation' })
  async createStockMutation(@Body() dto: CreateStockMutationDto, @Request() req: any) {
    const data = await this.stockMutationService.createStockMutation(dto, req.user?.id || '1');
    return ApiResponse.ok(data, 'Stock mutation created successfully');
  }

  @Get()
  @ApiOperation({ summary: 'List stock mutations' })
  async listStockMutations(@Query() dto: StockMutationFilterDto) {
    const data = await this.stockMutationService.listStockMutations(dto);
    return ApiResponse.ok(data);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get stock mutation by ID' })
  async getStockMutation(@Param('id') id: string) {
    const data = await this.stockMutationService.getStockMutation(parseInt(id));
    return ApiResponse.ok(data);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update stock mutation' })
  async updateStockMutation(
    @Param('id') id: string,
    @Body() dto: UpdateStockMutationDto,
  ) {
    const data = await this.stockMutationService.updateStockMutation(parseInt(id), dto);
    return ApiResponse.ok(data, 'Stock mutation updated successfully');
  }

  @Post(':id/reverse')
  @ApiOperation({ summary: 'Reverse stock mutation' })
  async reverseStockMutation(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Request() req: any,
  ) {
    const data = await this.stockMutationService.reverseStockMutation(
      parseInt(id),
      reason,
      req.user?.id || '1',
    );
    return ApiResponse.ok(data, 'Stock mutation reversed successfully');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // REPORTS
  // ─────────────────────────────────────────────────────────────────────────────

  @Get('report/summary')
  @ApiOperation({ summary: 'Get mutation summary report' })
  async getMutationSummary(@Query() dto: MutationSummaryDto) {
    const data = await this.stockMutationService.getMutationSummary(dto);
    return ApiResponse.ok(data);
  }

  @Get('report/by-category')
  @ApiOperation({ summary: 'Get mutation report by category' })
  async getMutationReport(@Query() dto: MutationReportDto) {
    const data = await this.stockMutationService.getMutationReport(dto);
    return ApiResponse.ok(data);
  }

  @Get('product/:productId/history')
  @ApiOperation({ summary: 'Get product mutation history' })
  async getProductMutationHistory(
    @Param('productId') productId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const data = await this.stockMutationService.getProductMutationHistory(
      parseInt(productId),
      startDate,
      endDate,
    );
    return ApiResponse.ok(data);
  }
}
