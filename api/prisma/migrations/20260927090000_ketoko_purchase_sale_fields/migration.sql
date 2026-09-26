-- AlterTable
ALTER TABLE "PurchaseOrders" ADD COLUMN     "DeliveryDate" TIMESTAMP(3),
ADD COLUMN     "OrderStatus" VARCHAR(30) NOT NULL DEFAULT 'WAITING_PAYMENT',
ADD COLUMN     "OtherCost" DECIMAL(15,2) NOT NULL DEFAULT 0,
ADD COLUMN     "OtherCostAdds" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "TaxMode" VARCHAR(10) NOT NULL DEFAULT 'NON';

-- AlterTable
ALTER TABLE "Purchases" ADD COLUMN     "OtherCost" DECIMAL(15,2) NOT NULL DEFAULT 0,
ADD COLUMN     "OtherCostAdds" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "ReferenceNo" VARCHAR(100),
ADD COLUMN     "TaxMode" VARCHAR(10) NOT NULL DEFAULT 'NON';

-- AlterTable
ALTER TABLE "Sales" ADD COLUMN     "OtherCost" DECIMAL(15,2) NOT NULL DEFAULT 0,
ADD COLUMN     "OtherCostAdds" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "ReferenceNo" VARCHAR(100),
ADD COLUMN     "TaxMode" VARCHAR(10) NOT NULL DEFAULT 'NON';


-- Dokumen lama: pajak > 0 berarti Exclude (perilaku sebelumnya)
UPDATE "Purchases" SET "TaxMode" = 'EXCLUDE' WHERE "TaxPercent" > 0;
UPDATE "Sales" SET "TaxMode" = 'EXCLUDE' WHERE "TaxPercent" > 0;
UPDATE "PurchaseOrders" SET "TaxMode" = 'EXCLUDE' WHERE "TaxPercent" > 0;
