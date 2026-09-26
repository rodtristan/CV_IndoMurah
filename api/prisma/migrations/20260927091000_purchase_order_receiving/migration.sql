-- AlterTable
ALTER TABLE "PurchaseOrderItems" ADD COLUMN     "ReceivedQuantity" DECIMAL(15,3) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "PurchaseOrders" ADD COLUMN     "OrderedQty" DECIMAL(15,3) NOT NULL DEFAULT 0,
ADD COLUMN     "ProcessStatus" VARCHAR(10) NOT NULL DEFAULT 'OPEN',
ADD COLUMN     "ReceivedQty" DECIMAL(15,3) NOT NULL DEFAULT 0;


-- Isi jumlah pesan untuk dokumen lama
UPDATE "PurchaseOrders" po SET "OrderedQty" = COALESCE((SELECT SUM(i."Quantity") FROM "PurchaseOrderItems" i WHERE i."PurchaseOrderID" = po."ID"), 0);
