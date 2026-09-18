import { ApiProperty } from '@nestjs/swagger';

export class DashboardSummaryDto {
  @ApiProperty({ description: 'Total sales amount' })
  totalSales: number;

  @ApiProperty({ description: 'Total purchase amount' })
  totalPurchases: number;

  @ApiProperty({ description: 'Gross profit (revenue - COGS)' })
  grossProfit: number;

  @ApiProperty({ description: 'Net profit (gross profit - expenses)' })
  netProfit: number;

  @ApiProperty({ description: 'Total sales transactions count' })
  salesCount: number;

  @ApiProperty({ description: 'Total purchase transactions count' })
  purchasesCount: number;
}

export class TopProductDto {
  productId: number;
  productCode: string;
  productName: string;
  totalQuantity: number;
  totalRevenue: number;
}

export class TopCustomerDto {
  customerId: number;
  customerName: string;
  totalTransactions: number;
  totalAmount: number;
}

export class TopSupplierDto {
  supplierId: number;
  supplierName: string;
  totalTransactions: number;
  totalAmount: number;
}

export class LowStockItemDto {
  productId: number;
  productCode: string;
  productName: string;
  currentStock: number;
  minStock: number;
  warehouseName?: string;
}

export class RecentTransactionDto {
  id: number;
  code: string;
  type: 'sale' | 'purchase';
  date: string;
  amount: number;
  counterpartyName: string;
}

export class SalesByBranchDto {
  salePointId: number;
  salePointName: string;
  totalSales: number;
  transactionCount: number;
}

export class DashboardResponseDto {
  summary: DashboardSummaryDto;
  topProducts: TopProductDto[];
  topCustomers: TopCustomerDto[];
  topSuppliers: TopSupplierDto[];
  lowStockItems: LowStockItemDto[];
  outOfStockItems: LowStockItemDto[];
  recentTransactions: RecentTransactionDto[];
  salesByBranch: SalesByBranchDto[];
}
