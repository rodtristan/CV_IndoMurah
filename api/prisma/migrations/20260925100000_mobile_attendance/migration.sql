-- AlterTable
ALTER TABLE "Attendances" ADD COLUMN     "CheckInAccuracy" DECIMAL(10,2),
ADD COLUMN     "CheckInDistance" DECIMAL(10,2),
ADD COLUMN     "CheckInOffline" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "CheckInPhoto" VARCHAR(200),
ADD COLUMN     "CheckInSyncedAt" TIMESTAMP(3),
ADD COLUMN     "CheckOutAccuracy" DECIMAL(10,2),
ADD COLUMN     "CheckOutDistance" DECIMAL(10,2),
ADD COLUMN     "CheckOutOffline" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "CheckOutPhoto" VARCHAR(200),
ADD COLUMN     "CheckOutSyncedAt" TIMESTAMP(3),
ADD COLUMN     "LocationID" INTEGER,
ADD COLUMN     "Source" VARCHAR(20) NOT NULL DEFAULT 'WEB';

-- AlterTable
ALTER TABLE "Employees" ADD COLUMN     "AttendanceLocationID" INTEGER,
ADD COLUMN     "PasswordHash" VARCHAR(255),
ADD COLUMN     "Username" VARCHAR(100);

-- CreateTable
CREATE TABLE "AttendanceLocations" (
    "ID" SERIAL NOT NULL,
    "Name" VARCHAR(150) NOT NULL,
    "Address" VARCHAR(500),
    "Latitude" DECIMAL(10,7) NOT NULL,
    "Longitude" DECIMAL(10,7) NOT NULL,
    "RadiusMeters" INTEGER NOT NULL DEFAULT 100,
    "WorkStart" VARCHAR(5) NOT NULL DEFAULT '08:00',
    "WorkEnd" VARCHAR(5) NOT NULL DEFAULT '17:00',
    "LateToleranceMinutes" INTEGER NOT NULL DEFAULT 0,
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AttendanceLocations_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "AttendancePhotos" (
    "ID" SERIAL NOT NULL,
    "MimeType" VARCHAR(50) NOT NULL,
    "Data" BYTEA NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AttendancePhotos_pkey" PRIMARY KEY ("ID")
);

-- CreateIndex
CREATE UNIQUE INDEX "Employees_Username_key" ON "Employees"("Username");

-- AddForeignKey
ALTER TABLE "Employees" ADD CONSTRAINT "Employees_AttendanceLocationID_fkey" FOREIGN KEY ("AttendanceLocationID") REFERENCES "AttendanceLocations"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendances" ADD CONSTRAINT "Attendances_LocationID_fkey" FOREIGN KEY ("LocationID") REFERENCES "AttendanceLocations"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

