import { IsOptional, IsInt, IsDateString, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ─── Filter DTOs ─────────────────────────────────────────────────────────────

export class DateRangeFilterDto {
  @ApiPropertyOptional({ description: 'Start date (ISO 8601)', example: '2024-01-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date (ISO 8601)', example: '2024-12-31' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class SalesReportFilterDto extends DateRangeFilterDto {
  @ApiPropertyOptional({ description: 'Warehouse ID filter' })
  @IsOptional()
  @IsInt()
  warehouseId?: number;

  @ApiPropertyOptional({ description: 'Customer ID filter' })
  @IsOptional()
  @IsInt()
  customerId?: number;
}

export class PurchaseReportFilterDto extends DateRangeFilterDto {
  @ApiPropertyOptional({ description: 'Warehouse ID filter' })
  @IsOptional()
  @IsInt()
  warehouseId?: number;

  @ApiPropertyOptional({ description: 'Supplier ID filter' })
  @IsOptional()
  @IsInt()
  supplierId?: number;
}

export class InventoryReportFilterDto {
  @ApiPropertyOptional({ description: 'Warehouse ID filter' })
  @IsOptional()
  @IsInt()
  warehouseId?: number;

  @ApiPropertyOptional({ description: 'Category ID filter' })
  @IsOptional()
  @IsInt()
  categoryId?: number;
}

export class StockMutationFilterDto extends DateRangeFilterDto {
  @ApiProperty({ description: 'Product ID' })
  @IsInt()
  productId: number;

  @ApiPropertyOptional({ description: 'Warehouse ID filter' })
  @IsOptional()
  @IsInt()
  warehouseId?: number;
}

// ─── Response DTOs ──────────────────────────────────────────────────────────

export class SalesReportItemDto {
  date: string;
  totalSales: number;
  totalTransactions: number;
  totalItems: number;
  averageTransaction: number;
}

export class SalesReportResponseDto {
  summary: {
    totalSales: number;
    totalTransactions: number;
    totalItems: number;
    averageTransaction: number;
  };
  byDate: SalesReportItemDto[];
  byCustomer?: Array<{
    customerId: number;
    customerName: string;
    totalSales: number;
    totalTransactions: number;
  }>;
  byProduct?: Array<{
    productId: number;
    productName: string;
    quantity: number;
    totalSales: number;
  }>;
}

export class PurchaseReportItemDto {
  date: string;
  totalPurchases: number;
  totalTransactions: number;
  totalItems: number;
  averageTransaction: number;
}

export class PurchaseReportResponseDto {
  summary: {
    totalPurchases: number;
    totalTransactions: number;
    totalItems: number;
    averageTransaction: number;
  };
  byDate: PurchaseReportItemDto[];
  bySupplier?: Array<{
    supplierId: number;
    supplierName: string;
    totalPurchases: number;
    totalTransactions: number;
  }>;
  byProduct?: Array<{
    productId: number;
    productName: string;
    quantity: number;
    totalPurchases: number;
  }>;
}

export class InventoryReportResponseDto {
  summary: {
    totalProducts: number;
    totalValue: number;
    lowStockCount: number;
    outOfStockCount: number;
  };
  items: Array<{
    productId: number;
    productCode: string;
    productName: string;
    categoryName?: string;
    warehouseName?: string;
    quantity: number;
    minStock: number;
    purchasePrice: number;
    sellPrice: number;
    stockValue: number;
    isLowStock: boolean;
    isOutOfStock: boolean;
  }>;
}

export class CashReportResponseDto {
  summary: {
    beginningBalance: number;
    totalCashIn: number;
    totalCashOut: number;
    endingBalance: number;
  };
  cashIns: Array<{
    date: string;
    description: string;
    amount: number;
    reference?: string;
  }>;
  cashOuts: Array<{
    date: string;
    description: string;
    amount: number;
    reference?: string;
  }>;
  salePayments: Array<{
    date: string;
    amount: number;
    paymentMethod?: string;
  }>;
  purchasePayments: Array<{
    date: string;
    amount: number;
    paymentMethod?: string;
  }>;
}

export class FinancialReportResponseDto {
  summary: {
    totalRevenue: number;
    totalCostOfGoodsSold: number;
    grossProfit: number;
    totalExpenses: number;
    netProfit: number;
  };
  revenue: Array<{
    date: string;
    amount: number;
  }>;
  costOfGoodsSold: Array<{
    date: string;
    amount: number;
  }>;
  expenses: Array<{
    accountName: string;
    total: number;
  }>;
}

export class ProfitLossReportResponseDto {
  period: {
    startDate: string;
    endDate: string;
  };
  income: {
    total: number;
    items: Array<{
      description: string;
      amount: number;
    }>;
  };
  expenses: {
    total: number;
    items: Array<{
      accountName: string;
      amount: number;
    }>;
  };
  grossProfit: number;
  netProfit: number;
  profitMargin: number;
}

export interface AgingBucket {
  label: string;
  count: number;
  amount: number;
}

export class DebtReportResponseDto {
  summary: {
    totalDebt: number;
    totalPaid: number;
    remainingDebt: number;
    overdueCount: number;
  };
  aging: AgingBucket[];
  debts: Array<{
    purchaseId: number;
    code: string;
    supplierName: string;
    date: string;
    total: number;
    paid: number;
    remaining: number;
    ageDays: number;
    agingBucket: string;
  }>;
}

export class ReceivableReportResponseDto {
  summary: {
    totalReceivable: number;
    totalPaid: number;
    remainingReceivable: number;
    overdueCount: number;
  };
  aging: AgingBucket[];
  receivables: Array<{
    saleId: number;
    code: string;
    customerName: string;
    date: string;
    total: number;
    paid: number;
    remaining: number;
    ageDays: number;
    agingBucket: string;
  }>;
}

export class StockMutationResponseDto {
  productId: number;
  productCode: string;
  productName: string;
  openingBalance: number;
  closingBalance: number;
  totalIn: number;
  totalOut: number;
  mutations: Array<{
    date: string;
    type: string;
    typeLabel: string;
    code: string;
    refId: number | null;
    warehouseId: number;
    warehouseName: string;
    description: string | null;
    qtyIn: number;
    qtyOut: number;
    unitCost: number;
    balance: number;
    warehouseBalanceAfter: number;
  }>;
}

export interface SalesSummaryPoint {
  label: string;
  sales: number;
  purchases: number;
  profit: number;
}

export interface StockOpnameReportResponseDto {
  summary: {
    totalOpnames: number;
    completedOpnames: number;
    totalVarianceValue: number;
  };
  opnames: Array<{
    id: number;
    code: string;
    date: string;
    warehouseName: string;
    status: string;
    systemQty: number;
    actualQty: number;
    variance: number;
    totalValue: number;
  }>;
}
