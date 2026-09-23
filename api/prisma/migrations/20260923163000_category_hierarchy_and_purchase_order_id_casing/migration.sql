-- DropForeignKey
ALTER TABLE "Purchases" DROP CONSTRAINT "Purchases_PurchaseOrderId_fkey";

-- AlterTable
ALTER TABLE "Categories" ADD COLUMN     "ParentID" INTEGER;

-- AlterTable
ALTER TABLE "Purchases" DROP COLUMN "PurchaseOrderId",
ADD COLUMN     "PurchaseOrderID" INTEGER;

-- AddForeignKey
ALTER TABLE "Categories" ADD CONSTRAINT "Categories_ParentID_fkey" FOREIGN KEY ("ParentID") REFERENCES "Categories"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchases" ADD CONSTRAINT "Purchases_PurchaseOrderID_fkey" FOREIGN KEY ("PurchaseOrderID") REFERENCES "PurchaseOrders"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

