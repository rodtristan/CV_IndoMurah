-- AlterTable
ALTER TABLE "Customers" ADD COLUMN     "City" VARCHAR(100),
ADD COLUMN     "CreditLimit" DECIMAL(15,2) NOT NULL DEFAULT 0,
ADD COLUMN     "DueDays" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "RegionID" INTEGER,
ADD COLUMN     "SubRegionID" INTEGER,
ADD COLUMN     "TaxID" VARCHAR(50);

-- AlterTable
ALTER TABLE "PurchaseItems" ADD COLUMN     "BaseQuantity" DECIMAL(15,3) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "PurchaseReturnItems" ADD COLUMN     "BaseQuantity" DECIMAL(15,3) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "SaleItems" ADD COLUMN     "BaseQuantity" DECIMAL(15,3) NOT NULL DEFAULT 0,
ADD COLUMN     "CostPrice" DECIMAL(15,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "SaleReturnItems" ADD COLUMN     "BaseQuantity" DECIMAL(15,3) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Sales" ADD COLUMN     "DueDate" TIMESTAMP(3),
ADD COLUMN     "VoucherDiscount" DECIMAL(15,2) NOT NULL DEFAULT 0,
ADD COLUMN     "VoucherID" INTEGER;

-- AlterTable
ALTER TABLE "Suppliers" ADD COLUMN     "BankAccountName" VARCHAR(150),
ADD COLUMN     "BankAccountNumber" VARCHAR(50),
ADD COLUMN     "BankName" VARCHAR(100),
ADD COLUMN     "City" VARCHAR(100),
ADD COLUMN     "DueDays" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "Province" VARCHAR(100),
ADD COLUMN     "TaxID" VARCHAR(50);

-- CreateTable
CREATE TABLE "StockLedgers" (
    "ID" SERIAL NOT NULL,
    "Date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ProductID" INTEGER NOT NULL,
    "WarehouseID" INTEGER NOT NULL,
    "RefType" VARCHAR(30) NOT NULL,
    "RefID" INTEGER,
    "RefCode" VARCHAR(50),
    "QtyIn" DECIMAL(15,3) NOT NULL DEFAULT 0,
    "QtyOut" DECIMAL(15,3) NOT NULL DEFAULT 0,
    "BalanceAfter" DECIMAL(15,3) NOT NULL DEFAULT 0,
    "UnitCost" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "Notes" VARCHAR(500),
    "CreatedByID" TEXT,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockLedgers_pkey" PRIMARY KEY ("ID")
);

-- CreateIndex
CREATE INDEX "StockLedgers_ProductID_WarehouseID_Date_idx" ON "StockLedgers"("ProductID", "WarehouseID", "Date");

-- CreateIndex
CREATE INDEX "StockLedgers_RefType_RefID_idx" ON "StockLedgers"("RefType", "RefID");

-- AddForeignKey
ALTER TABLE "Customers" ADD CONSTRAINT "Customers_RegionID_fkey" FOREIGN KEY ("RegionID") REFERENCES "Regions"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customers" ADD CONSTRAINT "Customers_SubRegionID_fkey" FOREIGN KEY ("SubRegionID") REFERENCES "SubRegions"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockLedgers" ADD CONSTRAINT "StockLedgers_ProductID_fkey" FOREIGN KEY ("ProductID") REFERENCES "Products"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockLedgers" ADD CONSTRAINT "StockLedgers_WarehouseID_fkey" FOREIGN KEY ("WarehouseID") REFERENCES "Warehouses"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;


-- Backfill: kuantitas satuan dasar untuk baris lama (konversi dari ProductUnits bila ada, selain itu 1)
UPDATE "SaleItems" t SET "BaseQuantity" = t."Quantity" * COALESCE((SELECT pu."ConversionValue" FROM "ProductUnits" pu WHERE pu."ProductID" = t."ProductID" AND pu."UnitID" = t."UnitID" LIMIT 1), 1);
UPDATE "PurchaseItems" t SET "BaseQuantity" = t."Quantity" * COALESCE((SELECT pu."ConversionValue" FROM "ProductUnits" pu WHERE pu."ProductID" = t."ProductID" AND pu."UnitID" = t."UnitID" LIMIT 1), 1);
UPDATE "SaleReturnItems" t SET "BaseQuantity" = t."Quantity" * COALESCE((SELECT pu."ConversionValue" FROM "ProductUnits" pu WHERE pu."ProductID" = t."ProductID" AND pu."UnitID" = t."UnitID" LIMIT 1), 1);
UPDATE "PurchaseReturnItems" t SET "BaseQuantity" = t."Quantity" * COALESCE((SELECT pu."ConversionValue" FROM "ProductUnits" pu WHERE pu."ProductID" = t."ProductID" AND pu."UnitID" = t."UnitID" LIMIT 1), 1);
-- HPP baris penjualan lama: harga beli barang saat ini (data historis tidak tersedia)
UPDATE "SaleItems" t SET "CostPrice" = p."PurchasePrice" FROM "Products" p WHERE p."ID" = t."ProductID";
