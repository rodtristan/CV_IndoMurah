-- DropForeignKey
ALTER TABLE "CustomerDeposits" DROP CONSTRAINT "CustomerDeposits_CreatedByID_fkey";

-- DropForeignKey
ALTER TABLE "JournalEntries" DROP CONSTRAINT "JournalEntries_AccountID_fkey";

-- DropForeignKey
ALTER TABLE "JournalEntries" DROP CONSTRAINT "JournalEntries_JournalID_fkey";

-- DropForeignKey
ALTER TABLE "JournalEntries" DROP CONSTRAINT "JournalEntries_UserID_fkey";

-- AlterTable
ALTER TABLE "Accounts" ADD COLUMN     "Balance" DECIMAL(15,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "CustomerDeposits" ADD COLUMN     "PaymentMethodID" INTEGER,
ADD COLUMN     "ReferenceNumber" VARCHAR(100),
ADD COLUMN     "Type" VARCHAR(50) NOT NULL DEFAULT 'DEPOSIT',
ALTER COLUMN "CreatedByID" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Customers" ADD COLUMN     "DepositBalance" DECIMAL(15,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Employees" ADD COLUMN     "Notes" VARCHAR(1000);

-- AlterTable (safe half: add new header columns as nullable; old line-level
-- columns AccountID/Credit/Debit/Memo/UserID are kept for now and only dropped
-- at the very end of this migration, after their data has been copied into the
-- new JournalEntryLines table)
ALTER TABLE "JournalEntries"
ADD COLUMN     "CreatedByID" TEXT,
ADD COLUMN     "Date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "Description" VARCHAR(1000),
ADD COLUMN     "JournalNumber" VARCHAR(50),
ADD COLUMN     "Notes" VARCHAR(1000),
ADD COLUMN     "Reference" VARCHAR(100),
ADD COLUMN     "ReferenceID" INTEGER,
ADD COLUMN     "ReferenceNumber" VARCHAR(100),
ADD COLUMN     "ReferenceType" VARCHAR(100),
ADD COLUMN     "ReversedEntryID" INTEGER,
ADD COLUMN     "SourceDocumentID" INTEGER,
ADD COLUMN     "SourceDocumentType" VARCHAR(100),
ADD COLUMN     "Status" VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "TotalCredit" DECIMAL(15,2) NOT NULL DEFAULT 0,
ADD COLUMN     "TotalDebit" DECIMAL(15,2) NOT NULL DEFAULT 0,
ADD COLUMN     "Type" VARCHAR(50) NOT NULL DEFAULT 'GENERAL',
ADD COLUMN     "UpdatedAt" TIMESTAMP(3),
ALTER COLUMN "JournalID" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Products" ADD COLUMN     "ProductTypeID" INTEGER;

-- AlterTable
ALTER TABLE "Purchases" ADD COLUMN     "PurchaseOrderId" INTEGER;

-- CreateTable
CREATE TABLE "ProductTypes" (
    "ID" SERIAL NOT NULL,
    "Name" VARCHAR(255) NOT NULL,
    "Description" VARCHAR(500),
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductTypes_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "MemberCardStatuses" (
    "ID" SERIAL NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "Name" VARCHAR(100) NOT NULL,
    "Description" VARCHAR(500),
    "Color" VARCHAR(50),
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "SortOrder" INTEGER NOT NULL DEFAULT 0,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MemberCardStatuses_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "MemberCards" (
    "ID" SERIAL NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "CardNumber" VARCHAR(50) NOT NULL,
    "CustomerID" INTEGER NOT NULL,
    "CardType" VARCHAR(50) NOT NULL DEFAULT 'STANDARD',
    "Balance" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "MinimumBalance" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "StatusID" INTEGER NOT NULL DEFAULT 1,
    "ReplacedFromID" INTEGER,
    "Notes" VARCHAR(1000),
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MemberCards_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "MemberCardTransactions" (
    "ID" SERIAL NOT NULL,
    "MemberCardID" INTEGER NOT NULL,
    "TransactionType" VARCHAR(50) NOT NULL,
    "Amount" DECIMAL(15,2) NOT NULL,
    "BalanceBefore" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "BalanceAfter" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "ReferenceNumber" VARCHAR(100),
    "Notes" VARCHAR(1000),
    "CreatedByID" TEXT,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MemberCardTransactions_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "ProductUnits" (
    "ID" SERIAL NOT NULL,
    "ProductID" INTEGER NOT NULL,
    "UnitID" INTEGER NOT NULL,
    "IsBase" BOOLEAN NOT NULL DEFAULT false,
    "ConversionValue" DECIMAL(15,6) NOT NULL DEFAULT 1,
    "IsPrimary" BOOLEAN NOT NULL DEFAULT false,
    "IsSell" BOOLEAN NOT NULL DEFAULT true,
    "IsPurchase" BOOLEAN NOT NULL DEFAULT true,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductUnits_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "ProductPrices" (
    "ID" SERIAL NOT NULL,
    "ProductID" INTEGER NOT NULL,
    "UnitID" INTEGER NOT NULL,
    "PriceType" VARCHAR(50) NOT NULL DEFAULT 'STANDARD',
    "Price" DECIMAL(15,2) NOT NULL,
    "MinQuantity" DECIMAL(15,3),
    "MaxQuantity" DECIMAL(15,3),
    "StartDate" TIMESTAMP(3),
    "EndDate" TIMESTAMP(3),
    "IsActive" INTEGER NOT NULL DEFAULT 1,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductPrices_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Budgets" (
    "ID" SERIAL NOT NULL,
    "Name" VARCHAR(255) NOT NULL,
    "Type" VARCHAR(50) NOT NULL,
    "CategoryID" INTEGER,
    "WarehouseID" INTEGER,
    "DepartmentID" INTEGER,
    "StartDate" TIMESTAMP(3) NOT NULL,
    "EndDate" TIMESTAMP(3) NOT NULL,
    "BudgetedAmount" DECIMAL(15,2) NOT NULL,
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Budgets_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "SalesTargets" (
    "ID" SERIAL NOT NULL,
    "Name" VARCHAR(255) NOT NULL,
    "Type" VARCHAR(50) NOT NULL,
    "EmployeeID" INTEGER,
    "WarehouseID" INTEGER,
    "CategoryID" INTEGER,
    "StartDate" TIMESTAMP(3) NOT NULL,
    "EndDate" TIMESTAMP(3) NOT NULL,
    "TargetRevenue" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "TargetQuantity" DECIMAL(15,3) NOT NULL DEFAULT 0,
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalesTargets_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "NotificationGateways" (
    "ID" SERIAL NOT NULL,
    "Name" VARCHAR(255) NOT NULL,
    "Type" VARCHAR(50) NOT NULL,
    "GatewayType" VARCHAR(100),
    "ApiUrl" VARCHAR(500),
    "ApiKey" VARCHAR(500),
    "SenderId" VARCHAR(100),
    "PhoneNumberId" VARCHAR(100),
    "IsDefault" BOOLEAN NOT NULL DEFAULT false,
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationGateways_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "NotificationTemplates" (
    "ID" SERIAL NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "Name" VARCHAR(255) NOT NULL,
    "Content" TEXT NOT NULL,
    "Description" VARCHAR(500),
    "Channel" VARCHAR(50) NOT NULL,
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationTemplates_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "NotificationLogs" (
    "ID" SERIAL NOT NULL,
    "Channel" VARCHAR(50) NOT NULL,
    "Recipient" VARCHAR(100) NOT NULL,
    "Message" TEXT NOT NULL,
    "Status" VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    "MediaUrl" VARCHAR(500),
    "MediaType" VARCHAR(50),
    "ScheduledAt" TIMESTAMP(3),
    "SentAt" TIMESTAMP(3),
    "DeliveredAt" TIMESTAMP(3),
    "ExternalId" VARCHAR(100),
    "ErrorMessage" VARCHAR(1000),
    "GatewayID" INTEGER,
    "CreatedByID" TEXT,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationLogs_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "MutationCategories" (
    "ID" SERIAL NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "Name" VARCHAR(255) NOT NULL,
    "Description" VARCHAR(1000),
    "Color" VARCHAR(50),
    "MutationType" VARCHAR(20),
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MutationCategories_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "StockMutations" (
    "ID" SERIAL NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "Date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "MutationCategoryID" INTEGER NOT NULL,
    "WarehouseID" INTEGER NOT NULL,
    "MutationType" VARCHAR(20) NOT NULL,
    "ReferenceNumber" VARCHAR(100),
    "TotalAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "Notes" VARCHAR(1000),
    "CreatedByID" TEXT,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockMutations_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "StockMutationItems" (
    "ID" SERIAL NOT NULL,
    "StockMutationID" INTEGER NOT NULL,
    "ProductID" INTEGER NOT NULL,
    "ProductName" VARCHAR(255) NOT NULL,
    "Quantity" DECIMAL(15,3) NOT NULL,
    "UnitID" INTEGER NOT NULL,
    "UnitPrice" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "Subtotal" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "Notes" VARCHAR(500),
    "SortOrder" INTEGER NOT NULL DEFAULT 0,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockMutationItems_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "CashFlowCategories" (
    "ID" SERIAL NOT NULL,
    "Name" VARCHAR(255) NOT NULL,
    "Type" VARCHAR(50) NOT NULL,
    "Description" VARCHAR(1000),
    "Color" VARCHAR(50),
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CashFlowCategories_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "CashFlowTransactions" (
    "ID" SERIAL NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "CashFlowCategoryID" INTEGER NOT NULL,
    "AccountID" INTEGER NOT NULL,
    "Amount" DECIMAL(15,2) NOT NULL,
    "Date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Description" VARCHAR(1000),
    "ReferenceNumber" VARCHAR(100),
    "SaleId" INTEGER,
    "CreatedByID" TEXT,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CashFlowTransactions_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "ServiceCategories" (
    "ID" SERIAL NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "Name" VARCHAR(255) NOT NULL,
    "Description" VARCHAR(1000),
    "DefaultLaborCost" DECIMAL(15,2),
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceCategories_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "ServicePackages" (
    "ID" SERIAL NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "Name" VARCHAR(255) NOT NULL,
    "ServiceCategoryID" INTEGER NOT NULL,
    "EstimatedDuration" INTEGER NOT NULL DEFAULT 0,
    "SellingPrice" DECIMAL(15,2) NOT NULL,
    "CostPrice" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "Description" VARCHAR(1000),
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServicePackages_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "PackageItems" (
    "ID" SERIAL NOT NULL,
    "ServicePackageID" INTEGER NOT NULL,
    "ProductID" INTEGER,
    "ItemName" VARCHAR(255) NOT NULL,
    "Quantity" DECIMAL(15,3) NOT NULL,
    "UnitPrice" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "Subtotal" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PackageItems_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "ProductionCategories" (
    "ID" SERIAL NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "Name" VARCHAR(255) NOT NULL,
    "Description" VARCHAR(1000),
    "IsRawMaterial" BOOLEAN NOT NULL DEFAULT false,
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductionCategories_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "ProductionMaterials" (
    "ID" SERIAL NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "Name" VARCHAR(255) NOT NULL,
    "ProductionCategoryID" INTEGER NOT NULL,
    "UnitID" INTEGER NOT NULL,
    "PurchasePrice" DECIMAL(15,2),
    "MinimumStock" DECIMAL(15,3),
    "CurrentStock" DECIMAL(15,3) NOT NULL DEFAULT 0,
    "Description" VARCHAR(1000),
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductionMaterials_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "QCCategories" (
    "ID" SERIAL NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "Name" VARCHAR(255) NOT NULL,
    "Description" VARCHAR(1000),
    "QCType" VARCHAR(50),
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QCCategories_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "QCCheckpoints" (
    "ID" SERIAL NOT NULL,
    "Name" VARCHAR(255) NOT NULL,
    "QCCategoryID" INTEGER NOT NULL,
    "Description" VARCHAR(1000),
    "IsRequired" BOOLEAN NOT NULL DEFAULT true,
    "PassCriteria" VARCHAR(500),
    "SortOrder" INTEGER NOT NULL DEFAULT 0,
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QCCheckpoints_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "QCChecks" (
    "ID" SERIAL NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "QCCategoryID" INTEGER NOT NULL,
    "ReferenceType" VARCHAR(100) NOT NULL,
    "ReferenceID" INTEGER NOT NULL,
    "Date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "InspectorName" VARCHAR(255),
    "Result" VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    "Notes" VARCHAR(1000),
    "CreatedByID" TEXT,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QCChecks_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "QCCheckResults" (
    "ID" SERIAL NOT NULL,
    "QCCheckID" INTEGER NOT NULL,
    "QCCheckpointID" INTEGER NOT NULL,
    "Result" VARCHAR(50) NOT NULL,
    "ActualValue" VARCHAR(255),
    "Notes" VARCHAR(1000),
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QCCheckResults_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "WorkOrders" (
    "ID" SERIAL NOT NULL,
    "WorkOrderNumber" VARCHAR(50) NOT NULL,
    "WorkOrderDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "DueDate" TIMESTAMP(3),
    "ProductionID" INTEGER,
    "WarehouseID" INTEGER,
    "AssignedToID" INTEGER,
    "StatusID" INTEGER NOT NULL DEFAULT 1,
    "Priority" VARCHAR(20) NOT NULL DEFAULT 'NORMAL',
    "EstimatedCost" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "Notes" VARCHAR(1000),
    "ScheduledStartDate" TIMESTAMP(3),
    "ScheduledEndDate" TIMESTAMP(3),
    "CancelledByID" TEXT,
    "CancelledAt" TIMESTAMP(3),
    "CreatedByID" TEXT,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkOrders_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "WorkOrderItems" (
    "ID" SERIAL NOT NULL,
    "WorkOrderID" INTEGER NOT NULL,
    "ProductID" INTEGER NOT NULL,
    "ProductName" VARCHAR(255) NOT NULL,
    "Quantity" DECIMAL(15,3) NOT NULL,
    "UnitID" INTEGER,
    "UnitPrice" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "Subtotal" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "BOMID" INTEGER,
    "SortOrder" INTEGER NOT NULL DEFAULT 0,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkOrderItems_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "ProgressRecords" (
    "ID" SERIAL NOT NULL,
    "WorkOrderID" INTEGER NOT NULL,
    "ProductID" INTEGER,
    "CompletedQuantity" DECIMAL(15,3) NOT NULL,
    "WorkStationID" INTEGER,
    "EmployeeID" INTEGER,
    "Notes" VARCHAR(1000),
    "RecordedByID" TEXT,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProgressRecords_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "MaterialAllocations" (
    "ID" SERIAL NOT NULL,
    "WorkOrderID" INTEGER NOT NULL,
    "ProductID" INTEGER NOT NULL,
    "AllocatedQuantity" DECIMAL(15,3) NOT NULL,
    "UsedQuantity" DECIMAL(15,3) NOT NULL DEFAULT 0,
    "Status" VARCHAR(20) NOT NULL DEFAULT 'ALLOCATED',
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaterialAllocations_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "WorkOrderSchedules" (
    "ID" SERIAL NOT NULL,
    "WorkOrderID" INTEGER NOT NULL,
    "ResourceType" VARCHAR(50) NOT NULL,
    "ResourceID" INTEGER NOT NULL,
    "AllocatedHours" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkOrderSchedules_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "WorkStations" (
    "ID" SERIAL NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "Name" VARCHAR(255) NOT NULL,
    "Description" VARCHAR(1000),
    "Capacity" INTEGER NOT NULL DEFAULT 1,
    "WarehouseID" INTEGER,
    "Capabilities" VARCHAR(500),
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkStations_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Assemblies" (
    "ID" SERIAL NOT NULL,
    "AssemblyNumber" VARCHAR(50) NOT NULL,
    "AssemblyDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "WarehouseID" INTEGER,
    "Description" VARCHAR(1000),
    "ReferenceNumber" VARCHAR(100),
    "TotalComponentCost" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "StatusID" INTEGER NOT NULL DEFAULT 1,
    "Notes" VARCHAR(1000),
    "BOMID" INTEGER,
    "CreatedByID" TEXT,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Assemblies_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "AssemblyComponents" (
    "ID" SERIAL NOT NULL,
    "AssemblyID" INTEGER NOT NULL,
    "ProductID" INTEGER NOT NULL,
    "ProductName" VARCHAR(255) NOT NULL,
    "Quantity" DECIMAL(15,3) NOT NULL,
    "UnitID" INTEGER,
    "UnitPrice" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "Subtotal" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "SortOrder" INTEGER NOT NULL DEFAULT 0,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssemblyComponents_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "BOMs" (
    "ID" SERIAL NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "Name" VARCHAR(255) NOT NULL,
    "ProductID" INTEGER,
    "QuantityProduced" DECIMAL(15,3) NOT NULL DEFAULT 1,
    "WarehouseID" INTEGER,
    "Description" VARCHAR(1000),
    "TotalCost" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "UnitCost" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "DefaultCost" DECIMAL(15,2),
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedByID" TEXT,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BOMs_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "BOMItems" (
    "ID" SERIAL NOT NULL,
    "BOMID" INTEGER NOT NULL,
    "ProductID" INTEGER NOT NULL,
    "ProductName" VARCHAR(255) NOT NULL,
    "Quantity" DECIMAL(15,3) NOT NULL,
    "UnitID" INTEGER,
    "UnitPrice" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "Subtotal" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "WastePercent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "SortOrder" INTEGER NOT NULL DEFAULT 0,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BOMItems_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "ProductionRecipes" (
    "ID" SERIAL NOT NULL,
    "ProductID" INTEGER NOT NULL,
    "Name" VARCHAR(255) NOT NULL,
    "Description" VARCHAR(1000),
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedByID" TEXT,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductionRecipes_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "ProductionRecipeItems" (
    "ID" SERIAL NOT NULL,
    "ProductionRecipeID" INTEGER NOT NULL,
    "ProductID" INTEGER NOT NULL,
    "WarehouseID" INTEGER,
    "UnitID" INTEGER,
    "Quantity" DECIMAL(15,3) NOT NULL,
    "Price" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductionRecipeItems_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "ProductionRequests" (
    "ID" SERIAL NOT NULL,
    "RequestNumber" VARCHAR(50) NOT NULL,
    "RequestDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ProductID" INTEGER,
    "SupplierID" INTEGER,
    "WarehouseID" INTEGER,
    "Status" VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    "Notes" VARCHAR(1000),
    "CreatedBy" TEXT,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductionRequests_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "ProductionRequestItems" (
    "ID" SERIAL NOT NULL,
    "ProductionRequestID" INTEGER NOT NULL,
    "ProductID" INTEGER NOT NULL,
    "WarehouseID" INTEGER,
    "UnitID" INTEGER,
    "Quantity" DECIMAL(15,3) NOT NULL,
    "Price" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductionRequestItems_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "ProductionSchedules" (
    "ID" SERIAL NOT NULL,
    "ProductionScheduleNumber" VARCHAR(50) NOT NULL,
    "ProductID" INTEGER NOT NULL,
    "WarehouseID" INTEGER,
    "ScheduledDate" TIMESTAMP(3) NOT NULL,
    "Quantity" DECIMAL(15,3) NOT NULL,
    "Status" VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED',
    "Notes" VARCHAR(1000),
    "CreatedBy" TEXT,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductionSchedules_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "JournalEntryLines" (
    "ID" SERIAL NOT NULL,
    "JournalEntryID" INTEGER NOT NULL,
    "AccountID" INTEGER NOT NULL,
    "DebitCredit" VARCHAR(10),
    "Amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "Debit" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "Credit" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "Description" VARCHAR(500),
    "LineNumber" INTEGER NOT NULL DEFAULT 1,
    "CreatedByID" TEXT,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JournalEntryLines_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "ClosingEntries" (
    "ID" SERIAL NOT NULL,
    "PeriodEndDate" TIMESTAMP(3) NOT NULL,
    "JournalEntryID" INTEGER NOT NULL,
    "TotalIncome" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "TotalExpense" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "NetIncome" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "CreatedByID" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClosingEntries_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "AccountExtensions" (
    "ID" SERIAL NOT NULL,
    "AccountID" INTEGER NOT NULL,
    "TaxRate" DECIMAL(5,2),
    "DepreciationMethod" VARCHAR(50),
    "UsefulLife" INTEGER,
    "SalvageValue" DECIMAL(15,2),
    "CurrentDebit" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "CurrentCredit" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "CurrentBalance" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccountExtensions_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "QCInspections" (
    "ID" SERIAL NOT NULL,
    "InspectionNumber" VARCHAR(50) NOT NULL,
    "InspectionType" VARCHAR(50) NOT NULL,
    "InspectionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "SupplierID" INTEGER,
    "ProductionID" INTEGER,
    "WarehouseID" INTEGER,
    "ReferenceNumber" VARCHAR(100),
    "StatusID" INTEGER NOT NULL DEFAULT 1,
    "OverallResult" VARCHAR(50),
    "TotalInspected" DECIMAL(15,3),
    "TotalPassed" DECIMAL(15,3),
    "TotalRejected" DECIMAL(15,3),
    "Notes" VARCHAR(1000),
    "InspectedByID" TEXT,
    "InspectedAt" TIMESTAMP(3),
    "CreatedByID" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QCInspections_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "QCInspectionItems" (
    "ID" SERIAL NOT NULL,
    "QCInspectionID" INTEGER NOT NULL,
    "ProductID" INTEGER NOT NULL,
    "BatchNumber" VARCHAR(100),
    "Quantity" DECIMAL(15,3) NOT NULL,
    "UnitID" INTEGER,
    "InspectedQuantity" DECIMAL(15,3),
    "PassedQuantity" DECIMAL(15,3),
    "RejectedQuantity" DECIMAL(15,3),
    "Result" VARCHAR(50),
    "RejectionReason" VARCHAR(500),
    "Notes" VARCHAR(1000),
    "InspectedByID" TEXT,
    "InspectedAt" TIMESTAMP(3),
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QCInspectionItems_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "QCStandards" (
    "ID" SERIAL NOT NULL,
    "ProductID" INTEGER NOT NULL,
    "InspectionType" VARCHAR(50) NOT NULL,
    "SampleSize" INTEGER NOT NULL DEFAULT 1,
    "AQL" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "MinimumPassingScore" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QCStandards_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "QCStandardCheckpoints" (
    "ID" SERIAL NOT NULL,
    "QCStandardID" INTEGER NOT NULL,
    "Name" VARCHAR(255) NOT NULL,
    "Description" VARCHAR(1000),
    "IsMandatory" BOOLEAN NOT NULL DEFAULT true,
    "Weight" INTEGER NOT NULL DEFAULT 1,
    "SortOrder" INTEGER NOT NULL DEFAULT 0,
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QCStandardCheckpoints_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "DefectReports" (
    "ID" SERIAL NOT NULL,
    "DefectNumber" VARCHAR(50) NOT NULL,
    "ProductID" INTEGER NOT NULL,
    "Quantity" DECIMAL(15,3) NOT NULL,
    "DefectType" VARCHAR(100) NOT NULL,
    "Severity" VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    "ProductionID" INTEGER,
    "SaleID" INTEGER,
    "Description" VARCHAR(1000),
    "RootCause" VARCHAR(1000),
    "CorrectiveAction" VARCHAR(1000),
    "Status" VARCHAR(50) NOT NULL DEFAULT 'OPEN',
    "ReportedByID" TEXT NOT NULL,
    "ResolvedByID" TEXT,
    "ResolvedAt" TIMESTAMP(3),
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DefectReports_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Calibrations" (
    "ID" SERIAL NOT NULL,
    "EquipmentName" VARCHAR(255) NOT NULL,
    "EquipmentCode" VARCHAR(50) NOT NULL,
    "CalibrationInterval" INTEGER,
    "LastCalibrationDate" TIMESTAMP(3),
    "NextCalibrationDate" TIMESTAMP(3),
    "Status" VARCHAR(50) NOT NULL DEFAULT 'OK',
    "LastResult" VARCHAR(50),
    "LastResultNotes" VARCHAR(1000),
    "CreatedByID" TEXT,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Calibrations_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "AttendanceDeviceStatuses" (
    "ID" SERIAL NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "Name" VARCHAR(100) NOT NULL,
    "Description" VARCHAR(255),
    "Color" VARCHAR(50),
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "SortOrder" INTEGER NOT NULL DEFAULT 0,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AttendanceDeviceStatuses_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "AttendanceDevices" (
    "ID" SERIAL NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "Name" VARCHAR(255) NOT NULL,
    "Host" VARCHAR(100) NOT NULL,
    "Port" INTEGER NOT NULL DEFAULT 4370,
    "CommKey" VARCHAR(100),
    "DeviceType" VARCHAR(50) NOT NULL DEFAULT 'FINGERPRINT',
    "Location" VARCHAR(255),
    "Notes" VARCHAR(1000),
    "StatusID" INTEGER NOT NULL DEFAULT 1,
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "LastSyncAt" TIMESTAMP(3),
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AttendanceDevices_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "EmployeeDeviceMappings" (
    "ID" SERIAL NOT NULL,
    "EmployeeID" INTEGER NOT NULL,
    "DeviceCode" VARCHAR(50) NOT NULL,
    "FingerprintTemplate" TEXT,
    "FaceTemplate" TEXT,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,
    "DeviceID" INTEGER,

    CONSTRAINT "EmployeeDeviceMappings_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "AttendanceDeviceLogs" (
    "ID" SERIAL NOT NULL,
    "DeviceID" INTEGER NOT NULL,
    "LogType" VARCHAR(50) NOT NULL,
    "Message" VARCHAR(500) NOT NULL,
    "Details" TEXT,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AttendanceDeviceLogs_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "WorkSchedules" (
    "ID" SERIAL NOT NULL,
    "Name" VARCHAR(255) NOT NULL,
    "MonIn" VARCHAR(10),
    "MonOut" VARCHAR(10),
    "TueIn" VARCHAR(10),
    "TueOut" VARCHAR(10),
    "WedIn" VARCHAR(10),
    "WedOut" VARCHAR(10),
    "ThuIn" VARCHAR(10),
    "ThuOut" VARCHAR(10),
    "FriIn" VARCHAR(10),
    "FriOut" VARCHAR(10),
    "SatIn" VARCHAR(10),
    "SatOut" VARCHAR(10),
    "SunIn" VARCHAR(10),
    "SunOut" VARCHAR(10),
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkSchedules_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "ScheduleAssignments" (
    "ID" SERIAL NOT NULL,
    "EmployeeID" INTEGER NOT NULL,
    "ScheduleID" INTEGER NOT NULL,
    "EffectiveFrom" TIMESTAMP(3) NOT NULL,
    "EffectiveUntil" TIMESTAMP(3),
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduleAssignments_pkey" PRIMARY KEY ("ID")
);

-- CreateIndex
CREATE UNIQUE INDEX "MemberCardStatuses_Code_key" ON "MemberCardStatuses"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "MemberCards_Code_key" ON "MemberCards"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "MemberCards_CardNumber_key" ON "MemberCards"("CardNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ProductUnits_ProductID_UnitID_key" ON "ProductUnits"("ProductID", "UnitID");

-- CreateIndex
CREATE UNIQUE INDEX "ProductPrices_ProductID_UnitID_PriceType_key" ON "ProductPrices"("ProductID", "UnitID", "PriceType");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationTemplates_Code_key" ON "NotificationTemplates"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "MutationCategories_Code_key" ON "MutationCategories"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "StockMutations_Code_key" ON "StockMutations"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "CashFlowTransactions_Code_key" ON "CashFlowTransactions"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceCategories_Code_key" ON "ServiceCategories"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "ServicePackages_Code_key" ON "ServicePackages"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "ProductionCategories_Code_key" ON "ProductionCategories"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "ProductionMaterials_Code_key" ON "ProductionMaterials"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "QCCategories_Code_key" ON "QCCategories"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "QCChecks_Code_key" ON "QCChecks"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "WorkOrders_WorkOrderNumber_key" ON "WorkOrders"("WorkOrderNumber");

-- CreateIndex
CREATE UNIQUE INDEX "WorkStations_Code_key" ON "WorkStations"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "Assemblies_AssemblyNumber_key" ON "Assemblies"("AssemblyNumber");

-- CreateIndex
CREATE UNIQUE INDEX "BOMs_Code_key" ON "BOMs"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "ProductionRecipes_ProductID_key" ON "ProductionRecipes"("ProductID");

-- CreateIndex
CREATE UNIQUE INDEX "ProductionRequests_RequestNumber_key" ON "ProductionRequests"("RequestNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ProductionSchedules_ProductionScheduleNumber_key" ON "ProductionSchedules"("ProductionScheduleNumber");

-- CreateIndex
CREATE UNIQUE INDEX "AccountExtensions_AccountID_key" ON "AccountExtensions"("AccountID");

-- CreateIndex
CREATE UNIQUE INDEX "QCInspections_InspectionNumber_key" ON "QCInspections"("InspectionNumber");

-- CreateIndex
CREATE UNIQUE INDEX "QCStandards_ProductID_InspectionType_key" ON "QCStandards"("ProductID", "InspectionType");

-- CreateIndex
CREATE UNIQUE INDEX "DefectReports_DefectNumber_key" ON "DefectReports"("DefectNumber");

-- CreateIndex
CREATE UNIQUE INDEX "AttendanceDeviceStatuses_Code_key" ON "AttendanceDeviceStatuses"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "AttendanceDevices_Code_key" ON "AttendanceDevices"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeDeviceMappings_EmployeeID_DeviceCode_key" ON "EmployeeDeviceMappings"("EmployeeID", "DeviceCode");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduleAssignments_EmployeeID_ScheduleID_key" ON "ScheduleAssignments"("EmployeeID", "ScheduleID");

-- CreateIndex
CREATE UNIQUE INDEX "JournalEntries_JournalNumber_key" ON "JournalEntries"("JournalNumber");

-- AddForeignKey
ALTER TABLE "MemberCards" ADD CONSTRAINT "MemberCards_CustomerID_fkey" FOREIGN KEY ("CustomerID") REFERENCES "Customers"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberCards" ADD CONSTRAINT "MemberCards_StatusID_fkey" FOREIGN KEY ("StatusID") REFERENCES "MemberCardStatuses"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberCards" ADD CONSTRAINT "MemberCards_ReplacedFromID_fkey" FOREIGN KEY ("ReplacedFromID") REFERENCES "MemberCards"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberCardTransactions" ADD CONSTRAINT "MemberCardTransactions_MemberCardID_fkey" FOREIGN KEY ("MemberCardID") REFERENCES "MemberCards"("ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberCardTransactions" ADD CONSTRAINT "MemberCardTransactions_CreatedByID_fkey" FOREIGN KEY ("CreatedByID") REFERENCES "Users"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Products" ADD CONSTRAINT "Products_ProductTypeID_fkey" FOREIGN KEY ("ProductTypeID") REFERENCES "ProductTypes"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductUnits" ADD CONSTRAINT "ProductUnits_ProductID_fkey" FOREIGN KEY ("ProductID") REFERENCES "Products"("ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductUnits" ADD CONSTRAINT "ProductUnits_UnitID_fkey" FOREIGN KEY ("UnitID") REFERENCES "Units"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchases" ADD CONSTRAINT "Purchases_PurchaseOrderId_fkey" FOREIGN KEY ("PurchaseOrderId") REFERENCES "PurchaseOrders"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntries" ADD CONSTRAINT "JournalEntries_JournalID_fkey" FOREIGN KEY ("JournalID") REFERENCES "Journals"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntries" ADD CONSTRAINT "JournalEntries_ReversedEntryID_fkey" FOREIGN KEY ("ReversedEntryID") REFERENCES "JournalEntries"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntries" ADD CONSTRAINT "JournalEntries_CreatedByID_fkey" FOREIGN KEY ("CreatedByID") REFERENCES "Users"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerDeposits" ADD CONSTRAINT "CustomerDeposits_CreatedByID_fkey" FOREIGN KEY ("CreatedByID") REFERENCES "Users"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerDeposits" ADD CONSTRAINT "CustomerDeposits_PaymentMethodID_fkey" FOREIGN KEY ("PaymentMethodID") REFERENCES "PaymentMethods"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductPrices" ADD CONSTRAINT "ProductPrices_ProductID_fkey" FOREIGN KEY ("ProductID") REFERENCES "Products"("ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductPrices" ADD CONSTRAINT "ProductPrices_UnitID_fkey" FOREIGN KEY ("UnitID") REFERENCES "Units"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationLogs" ADD CONSTRAINT "NotificationLogs_GatewayID_fkey" FOREIGN KEY ("GatewayID") REFERENCES "NotificationGateways"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationLogs" ADD CONSTRAINT "NotificationLogs_CreatedByID_fkey" FOREIGN KEY ("CreatedByID") REFERENCES "Users"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMutations" ADD CONSTRAINT "StockMutations_MutationCategoryID_fkey" FOREIGN KEY ("MutationCategoryID") REFERENCES "MutationCategories"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMutations" ADD CONSTRAINT "StockMutations_WarehouseID_fkey" FOREIGN KEY ("WarehouseID") REFERENCES "Warehouses"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMutations" ADD CONSTRAINT "StockMutations_CreatedByID_fkey" FOREIGN KEY ("CreatedByID") REFERENCES "Users"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMutationItems" ADD CONSTRAINT "StockMutationItems_StockMutationID_fkey" FOREIGN KEY ("StockMutationID") REFERENCES "StockMutations"("ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMutationItems" ADD CONSTRAINT "StockMutationItems_ProductID_fkey" FOREIGN KEY ("ProductID") REFERENCES "Products"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMutationItems" ADD CONSTRAINT "StockMutationItems_UnitID_fkey" FOREIGN KEY ("UnitID") REFERENCES "Units"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashFlowTransactions" ADD CONSTRAINT "CashFlowTransactions_CashFlowCategoryID_fkey" FOREIGN KEY ("CashFlowCategoryID") REFERENCES "CashFlowCategories"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashFlowTransactions" ADD CONSTRAINT "CashFlowTransactions_AccountID_fkey" FOREIGN KEY ("AccountID") REFERENCES "Accounts"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashFlowTransactions" ADD CONSTRAINT "CashFlowTransactions_SaleId_fkey" FOREIGN KEY ("SaleId") REFERENCES "Sales"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashFlowTransactions" ADD CONSTRAINT "CashFlowTransactions_CreatedByID_fkey" FOREIGN KEY ("CreatedByID") REFERENCES "Users"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServicePackages" ADD CONSTRAINT "ServicePackages_ServiceCategoryID_fkey" FOREIGN KEY ("ServiceCategoryID") REFERENCES "ServiceCategories"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageItems" ADD CONSTRAINT "PackageItems_ServicePackageID_fkey" FOREIGN KEY ("ServicePackageID") REFERENCES "ServicePackages"("ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageItems" ADD CONSTRAINT "PackageItems_ProductID_fkey" FOREIGN KEY ("ProductID") REFERENCES "Products"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionMaterials" ADD CONSTRAINT "ProductionMaterials_ProductionCategoryID_fkey" FOREIGN KEY ("ProductionCategoryID") REFERENCES "ProductionCategories"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionMaterials" ADD CONSTRAINT "ProductionMaterials_UnitID_fkey" FOREIGN KEY ("UnitID") REFERENCES "Units"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QCCheckpoints" ADD CONSTRAINT "QCCheckpoints_QCCategoryID_fkey" FOREIGN KEY ("QCCategoryID") REFERENCES "QCCategories"("ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QCChecks" ADD CONSTRAINT "QCChecks_QCCategoryID_fkey" FOREIGN KEY ("QCCategoryID") REFERENCES "QCCategories"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QCChecks" ADD CONSTRAINT "QCChecks_CreatedByID_fkey" FOREIGN KEY ("CreatedByID") REFERENCES "Users"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QCCheckResults" ADD CONSTRAINT "QCCheckResults_QCCheckID_fkey" FOREIGN KEY ("QCCheckID") REFERENCES "QCChecks"("ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QCCheckResults" ADD CONSTRAINT "QCCheckResults_QCCheckpointID_fkey" FOREIGN KEY ("QCCheckpointID") REFERENCES "QCCheckpoints"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrders" ADD CONSTRAINT "WorkOrders_ProductionID_fkey" FOREIGN KEY ("ProductionID") REFERENCES "Productions"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrders" ADD CONSTRAINT "WorkOrders_WarehouseID_fkey" FOREIGN KEY ("WarehouseID") REFERENCES "Warehouses"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrders" ADD CONSTRAINT "WorkOrders_StatusID_fkey" FOREIGN KEY ("StatusID") REFERENCES "TransactionStatuses"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrderItems" ADD CONSTRAINT "WorkOrderItems_WorkOrderID_fkey" FOREIGN KEY ("WorkOrderID") REFERENCES "WorkOrders"("ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrderItems" ADD CONSTRAINT "WorkOrderItems_ProductID_fkey" FOREIGN KEY ("ProductID") REFERENCES "Products"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrderItems" ADD CONSTRAINT "WorkOrderItems_UnitID_fkey" FOREIGN KEY ("UnitID") REFERENCES "Units"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrderItems" ADD CONSTRAINT "WorkOrderItems_BOMID_fkey" FOREIGN KEY ("BOMID") REFERENCES "BOMs"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgressRecords" ADD CONSTRAINT "ProgressRecords_WorkOrderID_fkey" FOREIGN KEY ("WorkOrderID") REFERENCES "WorkOrders"("ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgressRecords" ADD CONSTRAINT "ProgressRecords_ProductID_fkey" FOREIGN KEY ("ProductID") REFERENCES "Products"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgressRecords" ADD CONSTRAINT "ProgressRecords_WorkStationID_fkey" FOREIGN KEY ("WorkStationID") REFERENCES "WorkStations"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgressRecords" ADD CONSTRAINT "ProgressRecords_EmployeeID_fkey" FOREIGN KEY ("EmployeeID") REFERENCES "Employees"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialAllocations" ADD CONSTRAINT "MaterialAllocations_WorkOrderID_fkey" FOREIGN KEY ("WorkOrderID") REFERENCES "WorkOrders"("ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialAllocations" ADD CONSTRAINT "MaterialAllocations_ProductID_fkey" FOREIGN KEY ("ProductID") REFERENCES "Products"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrderSchedules" ADD CONSTRAINT "WorkOrderSchedules_WorkOrderID_fkey" FOREIGN KEY ("WorkOrderID") REFERENCES "WorkOrders"("ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkStations" ADD CONSTRAINT "WorkStations_WarehouseID_fkey" FOREIGN KEY ("WarehouseID") REFERENCES "Warehouses"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assemblies" ADD CONSTRAINT "Assemblies_WarehouseID_fkey" FOREIGN KEY ("WarehouseID") REFERENCES "Warehouses"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assemblies" ADD CONSTRAINT "Assemblies_StatusID_fkey" FOREIGN KEY ("StatusID") REFERENCES "TransactionStatuses"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assemblies" ADD CONSTRAINT "Assemblies_BOMID_fkey" FOREIGN KEY ("BOMID") REFERENCES "BOMs"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssemblyComponents" ADD CONSTRAINT "AssemblyComponents_AssemblyID_fkey" FOREIGN KEY ("AssemblyID") REFERENCES "Assemblies"("ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssemblyComponents" ADD CONSTRAINT "AssemblyComponents_ProductID_fkey" FOREIGN KEY ("ProductID") REFERENCES "Products"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssemblyComponents" ADD CONSTRAINT "AssemblyComponents_UnitID_fkey" FOREIGN KEY ("UnitID") REFERENCES "Units"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BOMs" ADD CONSTRAINT "BOMs_ProductID_fkey" FOREIGN KEY ("ProductID") REFERENCES "Products"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BOMs" ADD CONSTRAINT "BOMs_WarehouseID_fkey" FOREIGN KEY ("WarehouseID") REFERENCES "Warehouses"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BOMItems" ADD CONSTRAINT "BOMItems_BOMID_fkey" FOREIGN KEY ("BOMID") REFERENCES "BOMs"("ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BOMItems" ADD CONSTRAINT "BOMItems_ProductID_fkey" FOREIGN KEY ("ProductID") REFERENCES "Products"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BOMItems" ADD CONSTRAINT "BOMItems_UnitID_fkey" FOREIGN KEY ("UnitID") REFERENCES "Units"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionRecipes" ADD CONSTRAINT "ProductionRecipes_ProductID_fkey" FOREIGN KEY ("ProductID") REFERENCES "Products"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionRecipeItems" ADD CONSTRAINT "ProductionRecipeItems_ProductionRecipeID_fkey" FOREIGN KEY ("ProductionRecipeID") REFERENCES "ProductionRecipes"("ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionRecipeItems" ADD CONSTRAINT "ProductionRecipeItems_ProductID_fkey" FOREIGN KEY ("ProductID") REFERENCES "Products"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionRecipeItems" ADD CONSTRAINT "ProductionRecipeItems_WarehouseID_fkey" FOREIGN KEY ("WarehouseID") REFERENCES "Warehouses"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionRecipeItems" ADD CONSTRAINT "ProductionRecipeItems_UnitID_fkey" FOREIGN KEY ("UnitID") REFERENCES "Units"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionRequests" ADD CONSTRAINT "ProductionRequests_SupplierID_fkey" FOREIGN KEY ("SupplierID") REFERENCES "Suppliers"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionRequests" ADD CONSTRAINT "ProductionRequests_WarehouseID_fkey" FOREIGN KEY ("WarehouseID") REFERENCES "Warehouses"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionRequests" ADD CONSTRAINT "ProductionRequests_ProductID_fkey" FOREIGN KEY ("ProductID") REFERENCES "Products"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionRequestItems" ADD CONSTRAINT "ProductionRequestItems_ProductionRequestID_fkey" FOREIGN KEY ("ProductionRequestID") REFERENCES "ProductionRequests"("ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionRequestItems" ADD CONSTRAINT "ProductionRequestItems_ProductID_fkey" FOREIGN KEY ("ProductID") REFERENCES "Products"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionRequestItems" ADD CONSTRAINT "ProductionRequestItems_WarehouseID_fkey" FOREIGN KEY ("WarehouseID") REFERENCES "Warehouses"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionRequestItems" ADD CONSTRAINT "ProductionRequestItems_UnitID_fkey" FOREIGN KEY ("UnitID") REFERENCES "Units"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionSchedules" ADD CONSTRAINT "ProductionSchedules_ProductID_fkey" FOREIGN KEY ("ProductID") REFERENCES "Products"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionSchedules" ADD CONSTRAINT "ProductionSchedules_WarehouseID_fkey" FOREIGN KEY ("WarehouseID") REFERENCES "Warehouses"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntryLines" ADD CONSTRAINT "JournalEntryLines_JournalEntryID_fkey" FOREIGN KEY ("JournalEntryID") REFERENCES "JournalEntries"("ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntryLines" ADD CONSTRAINT "JournalEntryLines_AccountID_fkey" FOREIGN KEY ("AccountID") REFERENCES "Accounts"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntryLines" ADD CONSTRAINT "JournalEntryLines_CreatedByID_fkey" FOREIGN KEY ("CreatedByID") REFERENCES "Users"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClosingEntries" ADD CONSTRAINT "ClosingEntries_JournalEntryID_fkey" FOREIGN KEY ("JournalEntryID") REFERENCES "JournalEntries"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClosingEntries" ADD CONSTRAINT "ClosingEntries_CreatedByID_fkey" FOREIGN KEY ("CreatedByID") REFERENCES "Users"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountExtensions" ADD CONSTRAINT "AccountExtensions_AccountID_fkey" FOREIGN KEY ("AccountID") REFERENCES "Accounts"("ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QCInspections" ADD CONSTRAINT "QCInspections_SupplierID_fkey" FOREIGN KEY ("SupplierID") REFERENCES "Suppliers"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QCInspections" ADD CONSTRAINT "QCInspections_ProductionID_fkey" FOREIGN KEY ("ProductionID") REFERENCES "Productions"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QCInspections" ADD CONSTRAINT "QCInspections_WarehouseID_fkey" FOREIGN KEY ("WarehouseID") REFERENCES "Warehouses"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QCInspections" ADD CONSTRAINT "QCInspections_StatusID_fkey" FOREIGN KEY ("StatusID") REFERENCES "TransactionStatuses"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QCInspections" ADD CONSTRAINT "QCInspections_InspectedByID_fkey" FOREIGN KEY ("InspectedByID") REFERENCES "Users"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QCInspections" ADD CONSTRAINT "QCInspections_CreatedByID_fkey" FOREIGN KEY ("CreatedByID") REFERENCES "Users"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QCInspectionItems" ADD CONSTRAINT "QCInspectionItems_QCInspectionID_fkey" FOREIGN KEY ("QCInspectionID") REFERENCES "QCInspections"("ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QCInspectionItems" ADD CONSTRAINT "QCInspectionItems_ProductID_fkey" FOREIGN KEY ("ProductID") REFERENCES "Products"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QCInspectionItems" ADD CONSTRAINT "QCInspectionItems_UnitID_fkey" FOREIGN KEY ("UnitID") REFERENCES "Units"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QCInspectionItems" ADD CONSTRAINT "QCInspectionItems_InspectedByID_fkey" FOREIGN KEY ("InspectedByID") REFERENCES "Users"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QCStandards" ADD CONSTRAINT "QCStandards_ProductID_fkey" FOREIGN KEY ("ProductID") REFERENCES "Products"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QCStandardCheckpoints" ADD CONSTRAINT "QCStandardCheckpoints_QCStandardID_fkey" FOREIGN KEY ("QCStandardID") REFERENCES "QCStandards"("ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DefectReports" ADD CONSTRAINT "DefectReports_ProductID_fkey" FOREIGN KEY ("ProductID") REFERENCES "Products"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DefectReports" ADD CONSTRAINT "DefectReports_ProductionID_fkey" FOREIGN KEY ("ProductionID") REFERENCES "Productions"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DefectReports" ADD CONSTRAINT "DefectReports_SaleID_fkey" FOREIGN KEY ("SaleID") REFERENCES "Sales"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DefectReports" ADD CONSTRAINT "DefectReports_ReportedByID_fkey" FOREIGN KEY ("ReportedByID") REFERENCES "Users"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DefectReports" ADD CONSTRAINT "DefectReports_ResolvedByID_fkey" FOREIGN KEY ("ResolvedByID") REFERENCES "Users"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Calibrations" ADD CONSTRAINT "Calibrations_CreatedByID_fkey" FOREIGN KEY ("CreatedByID") REFERENCES "Users"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceDevices" ADD CONSTRAINT "AttendanceDevices_StatusID_fkey" FOREIGN KEY ("StatusID") REFERENCES "AttendanceDeviceStatuses"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeDeviceMappings" ADD CONSTRAINT "EmployeeDeviceMappings_EmployeeID_fkey" FOREIGN KEY ("EmployeeID") REFERENCES "Employees"("ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeDeviceMappings" ADD CONSTRAINT "EmployeeDeviceMappings_DeviceID_fkey" FOREIGN KEY ("DeviceID") REFERENCES "AttendanceDevices"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceDeviceLogs" ADD CONSTRAINT "AttendanceDeviceLogs_DeviceID_fkey" FOREIGN KEY ("DeviceID") REFERENCES "AttendanceDevices"("ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleAssignments" ADD CONSTRAINT "ScheduleAssignments_EmployeeID_fkey" FOREIGN KEY ("EmployeeID") REFERENCES "Employees"("ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleAssignments" ADD CONSTRAINT "ScheduleAssignments_ScheduleID_fkey" FOREIGN KEY ("ScheduleID") REFERENCES "WorkSchedules"("ID") ON DELETE CASCADE ON UPDATE CASCADE;


-- ════════════════════════════════════════════════════════════════════════
-- Data migration: JournalEntry is repurposed from a flat debit/credit LINE
-- row into a header row (JournalNumber/TotalDebit/TotalCredit/Status), with
-- the actual per-account debit/credit rows moving to the new
-- JournalEntryLines table. The existing rows in "JournalEntries" are old
-- line-level data — this block converts each one in place into a valid
-- header row and spins off its line data into JournalEntryLines with the
-- SAME ID as the parent, before the now-unused line-level columns are
-- dropped. Safe to run even if "JournalEntries" is empty.
-- ════════════════════════════════════════════════════════════════════════

INSERT INTO "JournalEntryLines" ("JournalEntryID", "AccountID", "Debit", "Credit", "Description", "LineNumber", "CreatedByID", "CreatedAt")
SELECT je."ID", je."AccountID", je."Debit", je."Credit", je."Memo", 1,
       COALESCE(je."UserID", j."CreatedByID"),
       je."CreatedAt"
FROM "JournalEntries" je
LEFT JOIN "Journals" j ON j."ID" = je."JournalID";

UPDATE "JournalEntries" je
SET "JournalNumber" = 'JE-LEGACY-' || je."ID",
    "CreatedByID" = COALESCE(je."UserID", j."CreatedByID"),
    "UpdatedAt" = je."CreatedAt",
    "Status" = 'POSTED',
    "TotalDebit" = je."Debit",
    "TotalCredit" = je."Credit",
    "Date" = je."CreatedAt"
FROM "Journals" j
WHERE j."ID" = je."JournalID";

-- Every existing JournalEntries row is linked to a Journal (JournalID was
-- NOT NULL before this migration), so the UPDATE above covers all of them
-- and CreatedByID/JournalNumber/UpdatedAt are now populated everywhere.
ALTER TABLE "JournalEntries"
ALTER COLUMN "CreatedByID" SET NOT NULL,
ALTER COLUMN "JournalNumber" SET NOT NULL,
ALTER COLUMN "UpdatedAt" SET NOT NULL;

ALTER TABLE "JournalEntries"
DROP COLUMN "AccountID",
DROP COLUMN "Credit",
DROP COLUMN "Debit",
DROP COLUMN "Memo",
DROP COLUMN "UserID";
