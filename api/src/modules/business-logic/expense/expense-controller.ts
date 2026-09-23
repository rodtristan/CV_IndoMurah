import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ExpenseService } from './expense-service';
import {
  CreateExpenseDto,
  BulkCreateExpenseDto,
  ApproveExpenseDto,
  ExpenseFilterDto,
  CreateExpenseCategoryDto,
} from './expense.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth-guard';
import { ApiResponse } from '../../../common/dto/api-response-dto';

@ApiTags('Expense - Pengeluaran')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('business-logic/expense')
export class ExpenseController {
  constructor(private expenseService: ExpenseService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // CATEGORY ENDPOINTS
  // ─────────────────────────────────────────────────────────────────────────────

  @Post('categories')
  @ApiOperation({ summary: 'Create expense category' })
  async createCategory(@Body() dto: CreateExpenseCategoryDto) {
    const data = await this.expenseService.createCategory(dto);
    return ApiResponse.ok(data, 'Category created successfully');
  }

  @Get('categories')
  @ApiOperation({ summary: 'List expense categories' })
  async listCategories() {
    const data = await this.expenseService.listCategories();
    return ApiResponse.ok(data);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // EXPENSE ENDPOINTS
  // ─────────────────────────────────────────────────────────────────────────────

  @Post()
  @ApiOperation({ summary: 'Create expense' })
  async createExpense(@Body() dto: CreateExpenseDto) {
    const userId = 'system';
    const data = await this.expenseService.createExpense(dto, userId);
    return ApiResponse.ok(data, 'Expense created successfully');
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Bulk create expenses' })
  async bulkCreateExpenses(@Body() dto: BulkCreateExpenseDto) {
    const userId = 'system';
    const data = await this.expenseService.bulkCreateExpenses(dto, userId);
    return ApiResponse.ok(data);
  }

  @Get()
  @ApiOperation({ summary: 'List expenses' })
  async listExpenses(@Query() dto: ExpenseFilterDto) {
    const data = await this.expenseService.listExpenses(dto);
    return ApiResponse.ok(data);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get expense summary by category' })
  async getExpenseSummary(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const data = await this.expenseService.getExpenseSummary(startDate, endDate);
    return ApiResponse.ok(data);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get expense by ID' })
  async getExpense(@Param('id') id: number) {
    const data = await this.expenseService.getExpense(id);
    return ApiResponse.ok(data);
  }

  @Put(':id/approve')
  @ApiOperation({ summary: 'Approve expense' })
  async approveExpense(
    @Param('id') id: number,
    @Body() dto: ApproveExpenseDto,
  ) {
    const userId = 'system';
    const data = await this.expenseService.approveExpense(id, dto, userId);
    return ApiResponse.ok(data, 'Expense approved');
  }

  @Put('approve-multiple')
  @ApiOperation({ summary: 'Bulk approve expenses' })
  async bulkApproveExpenses(@Body() body: { expenseIds: number[] }) {
    const userId = 'system';
    const data = await this.expenseService.bulkApproveExpenses(body.expenseIds, userId);
    return ApiResponse.ok(data);
  }
}
