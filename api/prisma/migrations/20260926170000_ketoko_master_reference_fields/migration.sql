-- AlterTable
ALTER TABLE "Banks" ADD COLUMN     "CreditAccountID" INTEGER,
ADD COLUMN     "DebitAccountID" INTEGER;

-- AlterTable
ALTER TABLE "CustomerGroups" ADD COLUMN     "PriceLevel" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "EMoneys" ADD COLUMN     "AccountID" INTEGER;

-- AlterTable
ALTER TABLE "ShippingCosts" ADD COLUMN     "Cost2" DECIMAL(15,2) NOT NULL DEFAULT 0,
ADD COLUMN     "Cost3" DECIMAL(15,2) NOT NULL DEFAULT 0,
ADD COLUMN     "Country" VARCHAR(100),
ADD COLUMN     "FromCity" VARCHAR(100),
ADD COLUMN     "ToCity" VARCHAR(100);

-- AlterTable
ALTER TABLE "Warehouses" ADD COLUMN     "AccountID" INTEGER,
ADD COLUMN     "Fax" VARCHAR(50),
ADD COLUMN     "Function" VARCHAR(20) NOT NULL DEFAULT 'WAREHOUSE';

-- AddForeignKey
ALTER TABLE "Warehouses" ADD CONSTRAINT "Warehouses_AccountID_fkey" FOREIGN KEY ("AccountID") REFERENCES "Accounts"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Banks" ADD CONSTRAINT "Banks_DebitAccountID_fkey" FOREIGN KEY ("DebitAccountID") REFERENCES "Accounts"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Banks" ADD CONSTRAINT "Banks_CreditAccountID_fkey" FOREIGN KEY ("CreditAccountID") REFERENCES "Accounts"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EMoneys" ADD CONSTRAINT "EMoneys_AccountID_fkey" FOREIGN KEY ("AccountID") REFERENCES "Accounts"("ID") ON DELETE SET NULL ON UPDATE CASCADE;


-- Gudang default = kantor utama
UPDATE "Warehouses" SET "Function" = 'MAIN' WHERE "IsDefault" = true;
