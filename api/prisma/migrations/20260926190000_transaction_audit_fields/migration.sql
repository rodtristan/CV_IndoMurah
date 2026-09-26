-- AlterTable
ALTER TABLE "CashFlowTransactions" ADD COLUMN     "Device" VARCHAR(100),
ADD COLUMN     "UpdatedBy" VARCHAR(100);

-- AlterTable
ALTER TABLE "CashIns" ADD COLUMN     "Device" VARCHAR(100),
ADD COLUMN     "UpdatedBy" VARCHAR(100);

-- AlterTable
ALTER TABLE "CashOuts" ADD COLUMN     "Device" VARCHAR(100),
ADD COLUMN     "UpdatedBy" VARCHAR(100);

-- AlterTable
ALTER TABLE "CashTransfers" ADD COLUMN     "Device" VARCHAR(100),
ADD COLUMN     "UpdatedBy" VARCHAR(100);

-- AlterTable
ALTER TABLE "CustomerDeposits" ADD COLUMN     "Device" VARCHAR(100),
ADD COLUMN     "UpdatedBy" VARCHAR(100);

-- AlterTable
ALTER TABLE "Journals" ADD COLUMN     "Device" VARCHAR(100),
ADD COLUMN     "UpdatedBy" VARCHAR(100);

-- AlterTable
ALTER TABLE "PointRedemptions" ADD COLUMN     "Device" VARCHAR(100),
ADD COLUMN     "UpdatedBy" VARCHAR(100);

-- AlterTable
ALTER TABLE "PurchaseOrders" ADD COLUMN     "Device" VARCHAR(100),
ADD COLUMN     "UpdatedBy" VARCHAR(100);

-- AlterTable
ALTER TABLE "PurchaseReturns" ADD COLUMN     "Device" VARCHAR(100),
ADD COLUMN     "UpdatedBy" VARCHAR(100);

-- AlterTable
ALTER TABLE "Purchases" ADD COLUMN     "Device" VARCHAR(100),
ADD COLUMN     "UpdatedBy" VARCHAR(100);

-- AlterTable
ALTER TABLE "QCChecks" ADD COLUMN     "Device" VARCHAR(100),
ADD COLUMN     "UpdatedBy" VARCHAR(100);

-- AlterTable
ALTER TABLE "SaleReturns" ADD COLUMN     "Device" VARCHAR(100),
ADD COLUMN     "UpdatedBy" VARCHAR(100);

-- AlterTable
ALTER TABLE "Sales" ADD COLUMN     "Device" VARCHAR(100),
ADD COLUMN     "UpdatedBy" VARCHAR(100);

-- AlterTable
ALTER TABLE "StockIns" ADD COLUMN     "Device" VARCHAR(100),
ADD COLUMN     "UpdatedBy" VARCHAR(100);

-- AlterTable
ALTER TABLE "StockMutations" ADD COLUMN     "Device" VARCHAR(100),
ADD COLUMN     "UpdatedBy" VARCHAR(100);

-- AlterTable
ALTER TABLE "StockOpnames" ADD COLUMN     "Device" VARCHAR(100),
ADD COLUMN     "UpdatedBy" VARCHAR(100);

-- AlterTable
ALTER TABLE "StockOuts" ADD COLUMN     "Device" VARCHAR(100),
ADD COLUMN     "UpdatedBy" VARCHAR(100);

-- AlterTable
ALTER TABLE "StockTransfers" ADD COLUMN     "Device" VARCHAR(100),
ADD COLUMN     "UpdatedBy" VARCHAR(100);

-- AlterTable
ALTER TABLE "SupplierDeposits" ADD COLUMN     "Device" VARCHAR(100),
ADD COLUMN     "UpdatedBy" VARCHAR(100);

