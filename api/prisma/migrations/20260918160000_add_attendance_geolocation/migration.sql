-- AlterTable
ALTER TABLE "Attendances" ADD COLUMN     "CheckInLatitude" DECIMAL(10,7),
ADD COLUMN     "CheckInLongitude" DECIMAL(10,7),
ADD COLUMN     "CheckOutLatitude" DECIMAL(10,7),
ADD COLUMN     "CheckOutLongitude" DECIMAL(10,7);

