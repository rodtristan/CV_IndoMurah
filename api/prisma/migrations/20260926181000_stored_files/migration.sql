-- CreateTable
CREATE TABLE "StoredFiles" (
    "ID" TEXT NOT NULL,
    "Name" VARCHAR(255) NOT NULL,
    "MimeType" VARCHAR(100) NOT NULL,
    "SizeBytes" INTEGER NOT NULL,
    "Data" BYTEA NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoredFiles_pkey" PRIMARY KEY ("ID")
);

