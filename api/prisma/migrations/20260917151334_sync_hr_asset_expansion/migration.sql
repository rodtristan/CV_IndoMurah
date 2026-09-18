-- AlterTable
ALTER TABLE "assets" DROP COLUMN "depreciationMethod",
DROP COLUMN "status",
ADD COLUMN     "depreciationMethodId" INTEGER,
ADD COLUMN     "statusId" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "attendances" DROP COLUMN "status",
ADD COLUMN     "statusId" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "employees" DROP COLUMN "status",
ADD COLUMN     "statusId" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "loans" DROP COLUMN "loanType",
DROP COLUMN "status",
ADD COLUMN     "loanTypeId" INTEGER NOT NULL,
ADD COLUMN     "statusId" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "notifications" DROP COLUMN "type",
ADD COLUMN     "typeId" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "productions" DROP COLUMN "status",
ADD COLUMN     "statusId" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "productGroupId" INTEGER;

-- AlterTable
ALTER TABLE "services" DROP COLUMN "repairStatus",
ADD COLUMN     "repairStatusId" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "vouchers" DROP COLUMN "type",
ADD COLUMN     "typeId" INTEGER NOT NULL;

-- DropEnum
DROP TYPE "AssetStatus";

-- DropEnum
DROP TYPE "AttendanceStatus";

-- DropEnum
DROP TYPE "DepreciationMethod";

-- DropEnum
DROP TYPE "EmployeeStatus";

-- DropEnum
DROP TYPE "LoanStatus";

-- DropEnum
DROP TYPE "NotificationType";

-- DropEnum
DROP TYPE "ProductionStatus";

-- DropEnum
DROP TYPE "RepairStatus";

-- DropEnum
DROP TYPE "VoucherType";

-- CreateTable
CREATE TABLE "employee_statuses" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255),
    "color" VARCHAR(50),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_statuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_statuses" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255),
    "color" VARCHAR(50),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendance_statuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leave_types" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255),
    "isPaidLeave" BOOLEAN NOT NULL DEFAULT true,
    "defaultDays" INTEGER NOT NULL DEFAULT 0,
    "color" VARCHAR(50),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leave_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leave_statuses" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255),
    "color" VARCHAR(50),
    "requiresApproval" BOOLEAN NOT NULL DEFAULT true,
    "isTerminal" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leave_statuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loan_statuses" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255),
    "color" VARCHAR(50),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loan_statuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loan_types" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255),
    "maxTenorMonths" INTEGER NOT NULL DEFAULT 12,
    "maxAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "interestRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loan_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset_statuses" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255),
    "color" VARCHAR(50),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "asset_statuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "depreciation_methods" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255),
    "formula" VARCHAR(255),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "depreciation_methods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "repair_statuses" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255),
    "color" VARCHAR(50),
    "isTerminal" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "repair_statuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "production_statuses" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255),
    "color" VARCHAR(50),
    "isTerminal" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "production_statuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "voucher_types" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255),
    "hasMaxDiscount" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "voucher_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_types" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255),
    "icon" VARCHAR(50),
    "color" VARCHAR(50),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alert_types" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255),
    "color" VARCHAR(50),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alert_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_channels" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255),
    "icon" VARCHAR(50),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_channels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shelves" (
    "id" SERIAL NOT NULL,
    "warehouseId" INTEGER NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" VARCHAR(500),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shelves_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shelf_products" (
    "id" SERIAL NOT NULL,
    "shelfId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "quantity" DECIMAL(15,3) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shelf_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_groups" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" VARCHAR(500),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_sales_summaries" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "totalTransactions" INTEGER NOT NULL DEFAULT 0,
    "totalCost" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "totalSales" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "totalProfit" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "totalReturns" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "totalExpenses" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_sales_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monthly_sales_summaries" (
    "id" SERIAL NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "totalTransactions" INTEGER NOT NULL DEFAULT 0,
    "totalCost" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "totalSales" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "totalProfit" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "totalReturns" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "totalExpenses" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "monthly_sales_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" SERIAL NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" VARCHAR(1000),
    "referenceType" VARCHAR(100),
    "referenceId" INTEGER,
    "amount" DECIMAL(15,2),
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_alerts" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "alertTypeId" INTEGER NOT NULL,
    "threshold" DECIMAL(15,3) NOT NULL DEFAULT 0,
    "currentStock" DECIMAL(15,3) NOT NULL DEFAULT 0,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "notes" VARCHAR(1000),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stock_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_images" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "url" VARCHAR(500) NOT NULL,
    "caption" VARCHAR(255),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_barcodes" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "barcode" VARCHAR(100) NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_barcodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "brand_logos" (
    "id" SERIAL NOT NULL,
    "brandId" INTEGER,
    "name" VARCHAR(255) NOT NULL,
    "logoUrl" VARCHAR(500) NOT NULL,
    "website" VARCHAR(255),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "brand_logos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_settings" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "typeId" INTEGER NOT NULL,
    "emailEnabled" BOOLEAN NOT NULL DEFAULT false,
    "pushEnabled" BOOLEAN NOT NULL DEFAULT true,
    "inAppEnabled" BOOLEAN NOT NULL DEFAULT true,
    "threshold" DECIMAL(15,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leaves" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "typeId" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "totalDays" INTEGER NOT NULL DEFAULT 1,
    "reason" VARCHAR(1000),
    "statusId" INTEGER NOT NULL DEFAULT 1,
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectedReason" VARCHAR(500),
    "notes" VARCHAR(1000),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leaves_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leave_balances" (
    "id" SERIAL NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "typeId" INTEGER NOT NULL,
    "totalDays" INTEGER NOT NULL DEFAULT 0,
    "usedDays" INTEGER NOT NULL DEFAULT 0,
    "remainingDays" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leave_balances_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "employee_statuses_code_key" ON "employee_statuses"("code");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_statuses_code_key" ON "attendance_statuses"("code");

-- CreateIndex
CREATE UNIQUE INDEX "leave_types_code_key" ON "leave_types"("code");

-- CreateIndex
CREATE UNIQUE INDEX "leave_statuses_code_key" ON "leave_statuses"("code");

-- CreateIndex
CREATE UNIQUE INDEX "loan_statuses_code_key" ON "loan_statuses"("code");

-- CreateIndex
CREATE UNIQUE INDEX "loan_types_code_key" ON "loan_types"("code");

-- CreateIndex
CREATE UNIQUE INDEX "asset_statuses_code_key" ON "asset_statuses"("code");

-- CreateIndex
CREATE UNIQUE INDEX "depreciation_methods_code_key" ON "depreciation_methods"("code");

-- CreateIndex
CREATE UNIQUE INDEX "repair_statuses_code_key" ON "repair_statuses"("code");

-- CreateIndex
CREATE UNIQUE INDEX "production_statuses_code_key" ON "production_statuses"("code");

-- CreateIndex
CREATE UNIQUE INDEX "voucher_types_code_key" ON "voucher_types"("code");

-- CreateIndex
CREATE UNIQUE INDEX "notification_types_code_key" ON "notification_types"("code");

-- CreateIndex
CREATE UNIQUE INDEX "alert_types_code_key" ON "alert_types"("code");

-- CreateIndex
CREATE UNIQUE INDEX "notification_channels_code_key" ON "notification_channels"("code");

-- CreateIndex
CREATE UNIQUE INDEX "shelves_code_key" ON "shelves"("code");

-- CreateIndex
CREATE UNIQUE INDEX "shelf_products_shelfId_productId_key" ON "shelf_products"("shelfId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "product_groups_code_key" ON "product_groups"("code");

-- CreateIndex
CREATE UNIQUE INDEX "daily_sales_summaries_date_key" ON "daily_sales_summaries"("date");

-- CreateIndex
CREATE UNIQUE INDEX "monthly_sales_summaries_year_month_key" ON "monthly_sales_summaries"("year", "month");

-- CreateIndex
CREATE INDEX "activity_logs_createdAt_idx" ON "activity_logs"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "stock_alerts_isRead_isResolved_idx" ON "stock_alerts"("isRead", "isResolved");

-- CreateIndex
CREATE UNIQUE INDEX "product_barcodes_barcode_key" ON "product_barcodes"("barcode");

-- CreateIndex
CREATE UNIQUE INDEX "notification_settings_userId_typeId_key" ON "notification_settings"("userId", "typeId");

-- CreateIndex
CREATE UNIQUE INDEX "leaves_code_key" ON "leaves"("code");

-- CreateIndex
CREATE UNIQUE INDEX "leave_balances_employeeId_year_typeId_key" ON "leave_balances"("employeeId", "year", "typeId");

-- AddForeignKey
ALTER TABLE "shelves" ADD CONSTRAINT "shelves_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shelf_products" ADD CONSTRAINT "shelf_products_shelfId_fkey" FOREIGN KEY ("shelfId") REFERENCES "shelves"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shelf_products" ADD CONSTRAINT "shelf_products_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_productGroupId_fkey" FOREIGN KEY ("productGroupId") REFERENCES "product_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_depreciationMethodId_fkey" FOREIGN KEY ("depreciationMethodId") REFERENCES "depreciation_methods"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "asset_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_repairStatusId_fkey" FOREIGN KEY ("repairStatusId") REFERENCES "repair_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vouchers" ADD CONSTRAINT "vouchers_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "voucher_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productions" ADD CONSTRAINT "productions_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "production_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_alerts" ADD CONSTRAINT "stock_alerts_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_alerts" ADD CONSTRAINT "stock_alerts_alertTypeId_fkey" FOREIGN KEY ("alertTypeId") REFERENCES "alert_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_barcodes" ADD CONSTRAINT "product_barcodes_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brand_logos" ADD CONSTRAINT "brand_logos_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_settings" ADD CONSTRAINT "notification_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_settings" ADD CONSTRAINT "notification_settings_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "notification_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "employee_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "attendance_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loans" ADD CONSTRAINT "loans_loanTypeId_fkey" FOREIGN KEY ("loanTypeId") REFERENCES "loan_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loans" ADD CONSTRAINT "loans_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "loan_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leaves" ADD CONSTRAINT "leaves_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leaves" ADD CONSTRAINT "leaves_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "leave_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leaves" ADD CONSTRAINT "leaves_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leaves" ADD CONSTRAINT "leaves_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "leave_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_balances" ADD CONSTRAINT "leave_balances_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_balances" ADD CONSTRAINT "leave_balances_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "leave_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "notification_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

