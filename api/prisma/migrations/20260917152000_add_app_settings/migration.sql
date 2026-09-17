-- CreateTable
CREATE TABLE "app_settings" (
    "id" SERIAL NOT NULL,
    "reportDesignEnabled" BOOLEAN NOT NULL DEFAULT false,
    "itemAddMode" VARCHAR(20) NOT NULL DEFAULT 'SEDANG',
    "displayMode" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE_ONLY',
    "displayRowMode" VARCHAR(20) NOT NULL DEFAULT 'SINGLE_ROW',
    "timezone" VARCHAR(50) NOT NULL DEFAULT 'Asia/Jakarta',
    "maxSearchRows" INTEGER NOT NULL DEFAULT 100,
    "addressBinding" VARCHAR(20) NOT NULL DEFAULT 'COMPANY',
    "showImageOnTransaction" BOOLEAN NOT NULL DEFAULT true,
    "warnPriceBelowCost" BOOLEAN NOT NULL DEFAULT true,
    "showBrandColumn" BOOLEAN NOT NULL DEFAULT false,
    "showInfoColumn" BOOLEAN NOT NULL DEFAULT false,
    "editRequiresAccess" BOOLEAN NOT NULL DEFAULT false,
    "autoShowSalesOnCustomer" BOOLEAN NOT NULL DEFAULT false,
    "decimalPrice" INTEGER NOT NULL DEFAULT 0,
    "decimalQty" INTEGER NOT NULL DEFAULT 0,
    "decimalTax" INTEGER NOT NULL DEFAULT 0,
    "decimalDiscount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_settings_pkey" PRIMARY KEY ("id")
);

