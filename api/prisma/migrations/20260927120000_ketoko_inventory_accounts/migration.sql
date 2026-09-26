-- Ketoko Persediaan: Kode Akun Item Masuk/Keluar/Opname; Tgl Exp & Kode Produksi di Transfer Item
-- AlterTable
ALTER TABLE "StockIns" ADD COLUMN     "AccountID" INTEGER;

-- AlterTable
ALTER TABLE "StockOpnames" ADD COLUMN     "AccountID" INTEGER;

-- AlterTable
ALTER TABLE "StockOuts" ADD COLUMN     "AccountID" INTEGER;

-- AlterTable
ALTER TABLE "StockTransferItems" ADD COLUMN     "ExpDate" TIMESTAMP(3),
ADD COLUMN     "ProductionCode" VARCHAR(100);

