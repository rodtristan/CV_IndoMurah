-- CreateTable
CREATE TABLE "AppSettings" (
    "ID" SERIAL NOT NULL,
    "ReportDesignEnabled" BOOLEAN NOT NULL DEFAULT false,
    "ItemAddMode" VARCHAR(50) NOT NULL DEFAULT 'SEDANG',
    "DisplayMode" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE_ONLY',
    "DisplayRowMode" VARCHAR(50) NOT NULL DEFAULT 'SINGLE_ROW',
    "Timezone" VARCHAR(100) NOT NULL DEFAULT 'Asia/Jakarta',
    "MaxSearchRows" INTEGER NOT NULL DEFAULT 100,
    "AddressBinding" VARCHAR(50) NOT NULL DEFAULT 'COMPANY',
    "ShowImageOnTransaction" BOOLEAN NOT NULL DEFAULT true,
    "WarnPriceBelowCost" BOOLEAN NOT NULL DEFAULT true,
    "ShowBrandColumn" BOOLEAN NOT NULL DEFAULT false,
    "ShowInfoColumn" BOOLEAN NOT NULL DEFAULT false,
    "EditRequiresAccess" BOOLEAN NOT NULL DEFAULT false,
    "AutoShowSalesOnCustomer" BOOLEAN NOT NULL DEFAULT false,
    "DecimalPrice" INTEGER NOT NULL DEFAULT 0,
    "DecimalQty" INTEGER NOT NULL DEFAULT 0,
    "DecimalTax" INTEGER NOT NULL DEFAULT 0,
    "DecimalDiscount" INTEGER NOT NULL DEFAULT 0,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppSettings_pkey" PRIMARY KEY ("ID")
);

