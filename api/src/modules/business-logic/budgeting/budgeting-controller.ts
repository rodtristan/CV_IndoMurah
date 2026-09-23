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
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { BudgetingService } from './budgeting-service';
import {
  CreateBudgetDto,
  UpdateBudgetDto,
  BudgetFilterDto,
  CreateSalesTargetDto,
  UpdateSalesTargetDto,
  SalesTargetFilterDto,
  BudgetComparisonDto,
  SalesTargetReportDto,
  BudgetAlertDto,
  CopyBudgetDto,
} from './budgeting.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth-guard';
import { ApiResponse } from '../../../common/dto/api-response-dto';

@ApiTags('Budgeting - Penganggaran')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('business-logic/budgeting')
export class BudgetingController {
  constructor(private budgetingService: BudgetingService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // BUDGET MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────────

  @Post('budget')
  @ApiOperation({ summary: 'Create new budget' })
  async createBudget(@Body() dto: CreateBudgetDto) {
    const data = await this.budgetingService.createBudget(dto, 'system');
    return ApiResponse.ok(data, 'Budget created successfully');
  }

  @Get('budget')
  @ApiOperation({ summary: 'List budgets' })
  async listBudgets(@Query() dto: BudgetFilterDto) {
    const data = await this.budgetingService.listBudgets(dto);
    return ApiResponse.ok(data);
  }

  @Get('budget/:id')
  @ApiOperation({ summary: 'Get budget by ID' })
  async getBudget(@Param('id') id: number) {
    const data = await this.budgetingService.getBudget(id);
    return ApiResponse.ok(data);
  }

  @Put('budget/:id')
  @ApiOperation({ summary: 'Update budget' })
  async updateBudget(@Param('id') id: number, @Body() dto: UpdateBudgetDto) {
    const data = await this.budgetingService.updateBudget(id, dto, 'system');
    return ApiResponse.ok(data, 'Budget updated successfully');
  }

  @Delete('budget/:id')
  @ApiOperation({ summary: 'Delete budget' })
  async deleteBudget(@Param('id') id: number) {
    const data = await this.budgetingService.deleteBudget(id, 'system');
    return ApiResponse.ok(data, 'Budget deleted successfully');
  }

  @Post('budget/copy')
  @ApiOperation({ summary: 'Copy budget to new period' })
  async copyBudget(@Body() dto: CopyBudgetDto) {
    const data = await this.budgetingService.copyBudget(dto, 'system');
    return ApiResponse.ok(data, 'Budget copied successfully');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SALES TARGET MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────────

  @Post('target')
  @ApiOperation({ summary: 'Create new sales target' })
  async createSalesTarget(@Body() dto: CreateSalesTargetDto) {
    const data = await this.budgetingService.createSalesTarget(dto, 'system');
    return ApiResponse.ok(data, 'Sales target created successfully');
  }

  @Get('target')
  @ApiOperation({ summary: 'List sales targets' })
  async listSalesTargets(@Query() dto: SalesTargetFilterDto) {
    const data = await this.budgetingService.listSalesTargets(dto);
    return ApiResponse.ok(data);
  }

  @Get('target/:id')
  @ApiOperation({ summary: 'Get sales target by ID' })
  async getSalesTarget(@Param('id') id: number) {
    const data = await this.budgetingService.getSalesTarget(id);
    return ApiResponse.ok(data);
  }

  @Put('target/:id')
  @ApiOperation({ summary: 'Update sales target' })
  async updateSalesTarget(@Param('id') id: number, @Body() dto: UpdateSalesTargetDto) {
    const data = await this.budgetingService.updateSalesTarget(id, dto, 'system');
    return ApiResponse.ok(data, 'Sales target updated successfully');
  }

  @Post('target/:id/recalculate')
  @ApiOperation({ summary: 'Recalculate target actual values' })
  async recalculateTarget(@Param('id') id: number) {
    const data = await this.budgetingService.recalculateTargets(id);
    return ApiResponse.ok(data);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // REPORTS
  // ─────────────────────────────────────────────────────────────────────────────

  @Get('reports/comparison')
  @ApiOperation({ summary: 'Get budget vs actual comparison' })
  async getBudgetComparison(@Query() dto: BudgetComparisonDto) {
    const data = await this.budgetingService.getBudgetComparison(dto);
    return ApiResponse.ok(data);
  }

  @Get('reports/target-performance')
  @ApiOperation({ summary: 'Get sales target performance report' })
  async getSalesTargetReport(@Query() dto: SalesTargetReportDto) {
    const data = await this.budgetingService.getSalesTargetReport(dto);
    return ApiResponse.ok(data);
  }

  @Get('reports/alerts')
  @ApiOperation({ summary: 'Get budget alerts' })
  async getBudgetAlerts(@Query() dto: BudgetAlertDto) {
    const data = await this.budgetingService.getBudgetAlerts(dto);
    return ApiResponse.ok(data);
  }
}
