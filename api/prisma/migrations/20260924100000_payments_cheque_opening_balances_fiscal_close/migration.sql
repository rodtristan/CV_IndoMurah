-- Bg/Cek columns on payments (existing rows stay CASH / cleared)
ALTER TABLE "PurchasePayments" ADD COLUMN "InstrumentType" VARCHAR(20) NOT NULL DEFAULT 'CASH',
ADD COLUMN "DueDate" TIMESTAMP(3),
ADD COLUMN "IsCleared" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "ClearedAt" TIMESTAMP(3);

ALTER TABLE "SalePayments" ADD COLUMN "InstrumentType" VARCHAR(20) NOT NULL DEFAULT 'CASH',
ADD COLUMN "DueDate" TIMESTAMP(3),
ADD COLUMN "IsCleared" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "ClearedAt" TIMESTAMP(3);

CREATE TABLE "OpeningBalances" (
    "ID" SERIAL NOT NULL,
    "Type" VARCHAR(20) NOT NULL,
    "Date" TIMESTAMP(3) NOT NULL,
    "AccountID" INTEGER,
    "SupplierID" INTEGER,
    "CustomerID" INTEGER,
    "Debit" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "Credit" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "DueDate" TIMESTAMP(3),
    "Reference" VARCHAR(100),
    "Notes" VARCHAR(500),
    "CreatedByID" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "OpeningBalances_pkey" PRIMARY KEY ("ID")
);
CREATE INDEX "OpeningBalances_Type_idx" ON "OpeningBalances"("Type");

CREATE TABLE "AccountSettings" (
    "ID" SERIAL NOT NULL,
    "Key" VARCHAR(100) NOT NULL,
    "AccountID" INTEGER,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AccountSettings_pkey" PRIMARY KEY ("ID")
);
CREATE UNIQUE INDEX "AccountSettings_Key_key" ON "AccountSettings"("Key");

CREATE TABLE "FiscalYearCloses" (
    "ID" SERIAL NOT NULL,
    "Year" INTEGER NOT NULL,
    "ClosedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ClosedByID" TEXT NOT NULL,
    "JournalCode" VARCHAR(50),
    "NetIncome" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "Notes" VARCHAR(500),
    CONSTRAINT "FiscalYearCloses_pkey" PRIMARY KEY ("ID")
);
CREATE UNIQUE INDEX "FiscalYearCloses_Year_key" ON "FiscalYearCloses"("Year");

ALTER TABLE "OpeningBalances" ADD CONSTRAINT "OpeningBalances_AccountID_fkey" FOREIGN KEY ("AccountID") REFERENCES "Accounts"("ID") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "OpeningBalances" ADD CONSTRAINT "OpeningBalances_SupplierID_fkey" FOREIGN KEY ("SupplierID") REFERENCES "Suppliers"("ID") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "OpeningBalances" ADD CONSTRAINT "OpeningBalances_CustomerID_fkey" FOREIGN KEY ("CustomerID") REFERENCES "Customers"("ID") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "OpeningBalances" ADD CONSTRAINT "OpeningBalances_CreatedByID_fkey" FOREIGN KEY ("CreatedByID") REFERENCES "Users"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AccountSettings" ADD CONSTRAINT "AccountSettings_AccountID_fkey" FOREIGN KEY ("AccountID") REFERENCES "Accounts"("ID") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "FiscalYearCloses" ADD CONSTRAINT "FiscalYearCloses_ClosedByID_fkey" FOREIGN KEY ("ClosedByID") REFERENCES "Users"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;
