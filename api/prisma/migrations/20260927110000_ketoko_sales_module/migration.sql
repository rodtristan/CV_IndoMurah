-- Ketoko Penjualan: Pesanan Penjualan, Alamat Kirim/Kurir, Point Penjualan, Bayar Komisi Sales
-- AlterTable
ALTER TABLE "PointRedemptions" ADD COLUMN     "Notes" VARCHAR(500);

-- AlterTable
ALTER TABLE "Sales" ADD COLUMN     "Courier" VARCHAR(100),
ADD COLUMN     "PointEarned" DECIMAL(15,2) NOT NULL DEFAULT 0,
ADD COLUMN     "SaleOrderID" INTEGER,
ADD COLUMN     "ShipAddress" VARCHAR(1000),
ADD COLUMN     "ShipCity" VARCHAR(100),
ADD COLUMN     "ShipName" VARCHAR(255),
ADD COLUMN     "ShipPhone" VARCHAR(50);

-- CreateTable
CREATE TABLE "SaleOrders" (
    "ID" SERIAL NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "Date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "CustomerID" INTEGER NOT NULL,
    "SalesPersonID" INTEGER,
    "WarehouseID" INTEGER,
    "Subtotal" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "DiscountPercent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "DiscountAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "TaxMode" VARCHAR(10) NOT NULL DEFAULT 'NON',
    "TaxPercent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "TaxAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "OtherCost" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "OtherCostAdds" BOOLEAN NOT NULL DEFAULT true,
    "Total" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "DownPayment" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "DepositID" INTEGER,
    "DueDate" TIMESTAMP(3),
    "DeliveryDate" TIMESTAMP(3),
    "OrderStatus" VARCHAR(30) NOT NULL DEFAULT 'WAITING_PAYMENT',
    "ProcessStatus" VARCHAR(10) NOT NULL DEFAULT 'OPEN',
    "OrderedQty" DECIMAL(15,3) NOT NULL DEFAULT 0,
    "DeliveredQty" DECIMAL(15,3) NOT NULL DEFAULT 0,
    "StatusID" INTEGER NOT NULL DEFAULT 1,
    "Notes" VARCHAR(1000),
    "CreatedByID" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,
    "UpdatedBy" VARCHAR(100),
    "Device" VARCHAR(100),

    CONSTRAINT "SaleOrders_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "SaleOrderItems" (
    "ID" SERIAL NOT NULL,
    "SaleOrderID" INTEGER NOT NULL,
    "ProductID" INTEGER NOT NULL,
    "UnitID" INTEGER NOT NULL,
    "Quantity" DECIMAL(15,3) NOT NULL,
    "UnitPrice" DECIMAL(15,2) NOT NULL,
    "DiscountPercent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "DiscountAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "Subtotal" DECIMAL(15,2) NOT NULL,
    "DeliveredQuantity" DECIMAL(15,3) NOT NULL DEFAULT 0,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SaleOrderItems_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "SalesCommissionPayments" (
    "ID" SERIAL NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "Date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "SalesPersonID" INTEGER NOT NULL,
    "MethodID" INTEGER,
    "InstrumentType" VARCHAR(20) NOT NULL DEFAULT 'CASH',
    "AccountID" INTEGER,
    "Number" VARCHAR(100),
    "DueDate" TIMESTAMP(3),
    "IsCleared" BOOLEAN NOT NULL DEFAULT true,
    "ClearedAt" TIMESTAMP(3),
    "PeriodFrom" TIMESTAMP(3),
    "PeriodTo" TIMESTAMP(3),
    "Notes" VARCHAR(1000),
    "TotalCommission" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "TotalReturn" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "Total" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "CreatedByID" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,
    "UpdatedBy" VARCHAR(100),
    "Device" VARCHAR(100),

    CONSTRAINT "SalesCommissionPayments_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "SalesCommissionPaymentLines" (
    "ID" SERIAL NOT NULL,
    "PaymentID" INTEGER NOT NULL,
    "SaleID" INTEGER NOT NULL,
    "Commission" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "ReturnCommission" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "Amount" DECIMAL(15,2) NOT NULL DEFAULT 0,

    CONSTRAINT "SalesCommissionPaymentLines_pkey" PRIMARY KEY ("ID")
);

-- CreateIndex
CREATE UNIQUE INDEX "SaleOrders_Code_key" ON "SaleOrders"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "SalesCommissionPayments_Code_key" ON "SalesCommissionPayments"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "SalesCommissionPaymentLines_SaleID_key" ON "SalesCommissionPaymentLines"("SaleID");

-- CreateIndex
CREATE INDEX "Sales_SaleOrderID_idx" ON "Sales"("SaleOrderID");

-- AddForeignKey
ALTER TABLE "Sales" ADD CONSTRAINT "Sales_SaleOrderID_fkey" FOREIGN KEY ("SaleOrderID") REFERENCES "SaleOrders"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleOrders" ADD CONSTRAINT "SaleOrders_CustomerID_fkey" FOREIGN KEY ("CustomerID") REFERENCES "Customers"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleOrders" ADD CONSTRAINT "SaleOrders_SalesPersonID_fkey" FOREIGN KEY ("SalesPersonID") REFERENCES "SalesPersons"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleOrders" ADD CONSTRAINT "SaleOrders_WarehouseID_fkey" FOREIGN KEY ("WarehouseID") REFERENCES "Warehouses"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleOrders" ADD CONSTRAINT "SaleOrders_CreatedByID_fkey" FOREIGN KEY ("CreatedByID") REFERENCES "Users"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleOrders" ADD CONSTRAINT "SaleOrders_StatusID_fkey" FOREIGN KEY ("StatusID") REFERENCES "TransactionStatuses"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleOrderItems" ADD CONSTRAINT "SaleOrderItems_SaleOrderID_fkey" FOREIGN KEY ("SaleOrderID") REFERENCES "SaleOrders"("ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleOrderItems" ADD CONSTRAINT "SaleOrderItems_ProductID_fkey" FOREIGN KEY ("ProductID") REFERENCES "Products"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleOrderItems" ADD CONSTRAINT "SaleOrderItems_UnitID_fkey" FOREIGN KEY ("UnitID") REFERENCES "Units"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesCommissionPayments" ADD CONSTRAINT "SalesCommissionPayments_SalesPersonID_fkey" FOREIGN KEY ("SalesPersonID") REFERENCES "SalesPersons"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesCommissionPayments" ADD CONSTRAINT "SalesCommissionPayments_CreatedByID_fkey" FOREIGN KEY ("CreatedByID") REFERENCES "Users"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesCommissionPaymentLines" ADD CONSTRAINT "SalesCommissionPaymentLines_PaymentID_fkey" FOREIGN KEY ("PaymentID") REFERENCES "SalesCommissionPayments"("ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesCommissionPaymentLines" ADD CONSTRAINT "SalesCommissionPaymentLines_SaleID_fkey" FOREIGN KEY ("SaleID") REFERENCES "Sales"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;


-- Saldo Awal point: pertahankan saldo point lama (saldo = awal + Σ point faktur − Σ ambil point)
ALTER TABLE "Customers" ADD COLUMN "PointOpening" INTEGER NOT NULL DEFAULT 0;
UPDATE "Customers" c SET "PointOpening" = c."PointBalance" + COALESCE((SELECT SUM(r."PointsRedeemed") FROM "PointRedemptions" r WHERE r."CustomerID" = c."ID"), 0);
