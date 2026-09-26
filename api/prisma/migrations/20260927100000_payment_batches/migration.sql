-- AlterTable
ALTER TABLE "PurchasePayments" ADD COLUMN     "AccountID" INTEGER,
ADD COLUMN     "BatchCode" VARCHAR(50);

-- AlterTable
ALTER TABLE "SalePayments" ADD COLUMN     "AccountID" INTEGER,
ADD COLUMN     "BatchCode" VARCHAR(50);

-- CreateIndex
CREATE INDEX "PurchasePayments_BatchCode_idx" ON "PurchasePayments"("BatchCode");

-- CreateIndex
CREATE INDEX "SalePayments_BatchCode_idx" ON "SalePayments"("BatchCode");

