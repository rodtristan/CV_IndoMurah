-- CreateTable
CREATE TABLE "ReportTemplates" (
    "ID" SERIAL NOT NULL,
    "ReportKey" VARCHAR(100) NOT NULL,
    "Name" VARCHAR(255) NOT NULL,
    "Definition" JSONB NOT NULL,
    "IsDefault" BOOLEAN NOT NULL DEFAULT false,
    "CompanyID" INTEGER,
    "CreatedByID" TEXT,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReportTemplates_pkey" PRIMARY KEY ("ID")
);

-- CreateIndex
CREATE INDEX "ReportTemplates_ReportKey_idx" ON "ReportTemplates"("ReportKey");
