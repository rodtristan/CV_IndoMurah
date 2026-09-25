-- AlterTable
ALTER TABLE "PaymentMethods" ADD COLUMN     "Type" VARCHAR(50);

-- CreateTable
CREATE TABLE "Banks" (
    "ID" SERIAL NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "Name" VARCHAR(255) NOT NULL,
    "Branch" VARCHAR(255),
    "AccountNumber" VARCHAR(50),
    "AccountName" VARCHAR(255),
    "Description" VARCHAR(500),
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "SortOrder" INTEGER NOT NULL DEFAULT 0,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Banks_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "EMoneys" (
    "ID" SERIAL NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "Name" VARCHAR(255) NOT NULL,
    "AccountNumber" VARCHAR(50),
    "AccountName" VARCHAR(255),
    "Description" VARCHAR(500),
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "SortOrder" INTEGER NOT NULL DEFAULT 0,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EMoneys_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Regions" (
    "ID" SERIAL NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "Name" VARCHAR(255) NOT NULL,
    "Description" VARCHAR(500),
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "SortOrder" INTEGER NOT NULL DEFAULT 0,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Regions_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "SubRegions" (
    "ID" SERIAL NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "Name" VARCHAR(255) NOT NULL,
    "RegionID" INTEGER NOT NULL,
    "Description" VARCHAR(500),
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "SortOrder" INTEGER NOT NULL DEFAULT 0,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubRegions_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "ShippingCosts" (
    "ID" SERIAL NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "Name" VARCHAR(255) NOT NULL,
    "RegionID" INTEGER,
    "SubRegionID" INTEGER,
    "Cost" DECIMAL(15,2) NOT NULL,
    "EstimatedDays" INTEGER,
    "Description" VARCHAR(500),
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "SortOrder" INTEGER NOT NULL DEFAULT 0,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShippingCosts_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Promotions" (
    "ID" SERIAL NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "Name" VARCHAR(255) NOT NULL,
    "Type" VARCHAR(50) NOT NULL,
    "DiscountType" VARCHAR(50) NOT NULL,
    "DiscountValue" DECIMAL(15,2),
    "MinPurchase" DECIMAL(15,2),
    "MaxDiscountAmount" DECIMAL(15,2),
    "StartDate" TIMESTAMP(3) NOT NULL,
    "EndDate" TIMESTAMP(3) NOT NULL,
    "UsageLimit" INTEGER,
    "UsedCount" INTEGER NOT NULL DEFAULT 0,
    "Description" VARCHAR(1000),
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Promotions_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "ChequePayments" (
    "ID" SERIAL NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "Type" VARCHAR(50) NOT NULL,
    "ReferenceType" VARCHAR(50),
    "ReferenceID" INTEGER,
    "BankID" INTEGER,
    "ChequeNumber" VARCHAR(100) NOT NULL,
    "ChequeDate" TIMESTAMP(3) NOT NULL,
    "DueDate" TIMESTAMP(3),
    "Amount" DECIMAL(15,2) NOT NULL,
    "Status" VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    "ClearedDate" TIMESTAMP(3),
    "BouncedDate" TIMESTAMP(3),
    "Notes" VARCHAR(1000),
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChequePayments_pkey" PRIMARY KEY ("ID")
);

-- CreateIndex
CREATE UNIQUE INDEX "Banks_Code_key" ON "Banks"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "EMoneys_Code_key" ON "EMoneys"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "Regions_Code_key" ON "Regions"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "SubRegions_Code_key" ON "SubRegions"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "ShippingCosts_Code_key" ON "ShippingCosts"("Code");

-- CreateIndex
CREATE INDEX "ShippingCosts_RegionID_idx" ON "ShippingCosts"("RegionID");

-- CreateIndex
CREATE INDEX "ShippingCosts_SubRegionID_idx" ON "ShippingCosts"("SubRegionID");

-- CreateIndex
CREATE UNIQUE INDEX "Promotions_Code_key" ON "Promotions"("Code");

-- CreateIndex
CREATE INDEX "Promotions_StartDate_EndDate_idx" ON "Promotions"("StartDate", "EndDate");

-- CreateIndex
CREATE INDEX "Promotions_Type_idx" ON "Promotions"("Type");

-- CreateIndex
CREATE UNIQUE INDEX "ChequePayments_Code_key" ON "ChequePayments"("Code");

-- CreateIndex
CREATE INDEX "ChequePayments_Type_idx" ON "ChequePayments"("Type");

-- CreateIndex
CREATE INDEX "ChequePayments_Status_idx" ON "ChequePayments"("Status");

-- CreateIndex
CREATE INDEX "ChequePayments_ChequeDate_idx" ON "ChequePayments"("ChequeDate");

-- CreateIndex
CREATE INDEX "ChequePayments_DueDate_idx" ON "ChequePayments"("DueDate");

-- AddForeignKey
ALTER TABLE "SubRegions" ADD CONSTRAINT "SubRegions_RegionID_fkey" FOREIGN KEY ("RegionID") REFERENCES "Regions"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShippingCosts" ADD CONSTRAINT "ShippingCosts_RegionID_fkey" FOREIGN KEY ("RegionID") REFERENCES "Regions"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShippingCosts" ADD CONSTRAINT "ShippingCosts_SubRegionID_fkey" FOREIGN KEY ("SubRegionID") REFERENCES "SubRegions"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChequePayments" ADD CONSTRAINT "ChequePayments_BankID_fkey" FOREIGN KEY ("BankID") REFERENCES "Banks"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

