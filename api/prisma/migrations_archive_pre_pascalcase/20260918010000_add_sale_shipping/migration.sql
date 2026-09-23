-- AlterTable
ALTER TABLE "sales" ADD COLUMN     "shippingDate" TIMESTAMP(3),
ADD COLUMN     "shippingStatus" VARCHAR(20) DEFAULT 'PENDING',
ADD COLUMN     "trackingNumber" VARCHAR(100);

