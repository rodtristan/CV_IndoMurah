-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "PaymentMethods" (
    "ID" SERIAL NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "Name" VARCHAR(100) NOT NULL,
    "Description" VARCHAR(255),
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "SortOrder" INTEGER NOT NULL DEFAULT 0,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentMethods_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "PaymentStatuses" (
    "ID" SERIAL NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "Name" VARCHAR(100) NOT NULL,
    "Description" VARCHAR(255),
    "Color" VARCHAR(50),
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "SortOrder" INTEGER NOT NULL DEFAULT 0,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentStatuses_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "TransactionStatuses" (
    "ID" SERIAL NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "Name" VARCHAR(100) NOT NULL,
    "Description" VARCHAR(255),
    "Color" VARCHAR(50),
    "IsTerminal" BOOLEAN NOT NULL DEFAULT false,
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "SortOrder" INTEGER NOT NULL DEFAULT 0,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TransactionStatuses_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "StockOpnameStatuses" (
    "ID" SERIAL NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "Name" VARCHAR(100) NOT NULL,
    "Description" VARCHAR(255),
    "Color" VARCHAR(50),
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "SortOrder" INTEGER NOT NULL DEFAULT 0,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockOpnameStatuses_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "AccountTypes" (
    "ID" SERIAL NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "Name" VARCHAR(100) NOT NULL,
    "Description" VARCHAR(255),
    "IsDebitNormal" BOOLEAN NOT NULL DEFAULT true,
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "SortOrder" INTEGER NOT NULL DEFAULT 0,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccountTypes_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "ReferenceTypes" (
    "ID" SERIAL NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "Name" VARCHAR(100) NOT NULL,
    "Description" VARCHAR(255),
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "SortOrder" INTEGER NOT NULL DEFAULT 0,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReferenceTypes_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "CustomerGroups" (
    "ID" SERIAL NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "Name" VARCHAR(100) NOT NULL,
    "Description" VARCHAR(255),
    "DiscountPercent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "PointMultiplier" DECIMAL(3,2) NOT NULL DEFAULT 1,
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "SortOrder" INTEGER NOT NULL DEFAULT 0,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerGroups_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "EmployeeStatuses" (
    "ID" SERIAL NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "Name" VARCHAR(100) NOT NULL,
    "Description" VARCHAR(255),
    "Color" VARCHAR(50),
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "SortOrder" INTEGER NOT NULL DEFAULT 0,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeStatuses_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "AttendanceStatuses" (
    "ID" SERIAL NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "Name" VARCHAR(100) NOT NULL,
    "Description" VARCHAR(255),
    "Color" VARCHAR(50),
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "SortOrder" INTEGER NOT NULL DEFAULT 0,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AttendanceStatuses_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "LeaveTypes" (
    "ID" SERIAL NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "Name" VARCHAR(100) NOT NULL,
    "Description" VARCHAR(255),
    "IsPaidLeave" BOOLEAN NOT NULL DEFAULT true,
    "DefaultDays" INTEGER NOT NULL DEFAULT 0,
    "Color" VARCHAR(50),
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "SortOrder" INTEGER NOT NULL DEFAULT 0,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeaveTypes_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "LeaveStatuses" (
    "ID" SERIAL NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "Name" VARCHAR(100) NOT NULL,
    "Description" VARCHAR(255),
    "Color" VARCHAR(50),
    "RequiresApproval" BOOLEAN NOT NULL DEFAULT true,
    "IsTerminal" BOOLEAN NOT NULL DEFAULT false,
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "SortOrder" INTEGER NOT NULL DEFAULT 0,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeaveStatuses_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "LoanStatuses" (
    "ID" SERIAL NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "Name" VARCHAR(100) NOT NULL,
    "Description" VARCHAR(255),
    "Color" VARCHAR(50),
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "SortOrder" INTEGER NOT NULL DEFAULT 0,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LoanStatuses_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "LoanTypes" (
    "ID" SERIAL NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "Name" VARCHAR(100) NOT NULL,
    "Description" VARCHAR(255),
    "MaxTenorMonths" INTEGER NOT NULL DEFAULT 12,
    "MaxAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "InterestRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "SortOrder" INTEGER NOT NULL DEFAULT 0,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LoanTypes_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "AssetStatuses" (
    "ID" SERIAL NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "Name" VARCHAR(100) NOT NULL,
    "Description" VARCHAR(255),
    "Color" VARCHAR(50),
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "SortOrder" INTEGER NOT NULL DEFAULT 0,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssetStatuses_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "DepreciationMethods" (
    "ID" SERIAL NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "Name" VARCHAR(100) NOT NULL,
    "Description" VARCHAR(255),
    "Formula" VARCHAR(255),
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "SortOrder" INTEGER NOT NULL DEFAULT 0,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DepreciationMethods_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "RepairStatuses" (
    "ID" SERIAL NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "Name" VARCHAR(100) NOT NULL,
    "Description" VARCHAR(255),
    "Color" VARCHAR(50),
    "IsTerminal" BOOLEAN NOT NULL DEFAULT false,
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "SortOrder" INTEGER NOT NULL DEFAULT 0,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RepairStatuses_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "ProductionStatuses" (
    "ID" SERIAL NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "Name" VARCHAR(100) NOT NULL,
    "Description" VARCHAR(255),
    "Color" VARCHAR(50),
    "IsTerminal" BOOLEAN NOT NULL DEFAULT false,
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "SortOrder" INTEGER NOT NULL DEFAULT 0,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductionStatuses_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "VoucherTypes" (
    "ID" SERIAL NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "Name" VARCHAR(100) NOT NULL,
    "Description" VARCHAR(255),
    "HasMaxDiscount" BOOLEAN NOT NULL DEFAULT false,
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "SortOrder" INTEGER NOT NULL DEFAULT 0,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VoucherTypes_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "NotificationTypes" (
    "ID" SERIAL NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "Name" VARCHAR(100) NOT NULL,
    "Description" VARCHAR(255),
    "Icon" VARCHAR(50),
    "Color" VARCHAR(50),
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "SortOrder" INTEGER NOT NULL DEFAULT 0,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationTypes_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "AlertTypes" (
    "ID" SERIAL NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "Name" VARCHAR(100) NOT NULL,
    "Description" VARCHAR(255),
    "Color" VARCHAR(50),
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "SortOrder" INTEGER NOT NULL DEFAULT 0,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AlertTypes_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "NotificationChannels" (
    "ID" SERIAL NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "Name" VARCHAR(100) NOT NULL,
    "Description" VARCHAR(255),
    "Icon" VARCHAR(50),
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "SortOrder" INTEGER NOT NULL DEFAULT 0,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationChannels_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Users" (
    "ID" TEXT NOT NULL,
    "CompanyID" INTEGER NOT NULL,
    "Username" VARCHAR(100) NOT NULL,
    "Email" VARCHAR(255),
    "Password" VARCHAR(255) NOT NULL,
    "Name" VARCHAR(255) NOT NULL,
    "Role" VARCHAR(100) NOT NULL DEFAULT 'cashier',
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Roles" (
    "ID" SERIAL NOT NULL,
    "RoleName" VARCHAR(100) NOT NULL,
    "RoleDescription" VARCHAR(500),
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Roles_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Menus" (
    "ID" SERIAL NOT NULL,
    "MenuName" VARCHAR(255) NOT NULL,
    "MenuType" VARCHAR(50),
    "Icon" VARCHAR(100),
    "Route" VARCHAR(500),
    "ParentMenuID" INTEGER,
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "SortOrder" INTEGER NOT NULL DEFAULT 0,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Menus_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "UserRoles" (
    "ID" SERIAL NOT NULL,
    "UserID" TEXT NOT NULL,
    "RoleID" INTEGER NOT NULL,
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserRoles_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "RoleMenus" (
    "ID" SERIAL NOT NULL,
    "RoleID" INTEGER NOT NULL,
    "MenuID" INTEGER NOT NULL,
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoleMenus_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "UserMenus" (
    "ID" SERIAL NOT NULL,
    "UserID" TEXT NOT NULL,
    "MenuID" INTEGER NOT NULL,
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserMenus_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Logs" (
    "ID" SERIAL NOT NULL,
    "Method" VARCHAR(20),
    "Endpoint" VARCHAR(500),
    "Headers" JSONB,
    "Payload" JSONB,
    "ResponseStatus" INTEGER,
    "Message" VARCHAR(1000),
    "RequesterLoginID" INTEGER,
    "RequesterFullName" VARCHAR(255),
    "IpAddress" VARCHAR(100),
    "UserAgent" VARCHAR(500),
    "DurationMs" INTEGER,
    "LogDatetime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Logs_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Categories" (
    "ID" SERIAL NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "Name" VARCHAR(255) NOT NULL,
    "Icon" VARCHAR(100),
    "Image" VARCHAR(500),
    "Description" VARCHAR(1000),
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Categories_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Brands" (
    "ID" SERIAL NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "Name" VARCHAR(255) NOT NULL,
    "Description" VARCHAR(1000),
    "LogoUrl" VARCHAR(500),
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Brands_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Units" (
    "ID" SERIAL NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "Name" VARCHAR(100) NOT NULL,
    "Abbreviation" VARCHAR(20),
    "Description" VARCHAR(500),
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Units_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Warehouses" (
    "ID" SERIAL NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "Name" VARCHAR(255) NOT NULL,
    "Address" VARCHAR(500),
    "Phone" VARCHAR(50),
    "IsDefault" BOOLEAN NOT NULL DEFAULT false,
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Warehouses_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Shelves" (
    "ID" SERIAL NOT NULL,
    "WarehouseID" INTEGER NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "Name" VARCHAR(255) NOT NULL,
    "Description" VARCHAR(500),
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Shelves_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "ShelfProducts" (
    "ID" SERIAL NOT NULL,
    "ShelfID" INTEGER NOT NULL,
    "ProductID" INTEGER NOT NULL,
    "Quantity" DECIMAL(15,3) NOT NULL DEFAULT 0,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShelfProducts_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "ProductGroups" (
    "ID" SERIAL NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "Name" VARCHAR(255) NOT NULL,
    "Description" VARCHAR(500),
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductGroups_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Suppliers" (
    "ID" SERIAL NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "Name" VARCHAR(255) NOT NULL,
    "ContactPerson" VARCHAR(255),
    "Phone" VARCHAR(50),
    "Email" VARCHAR(255),
    "Address" VARCHAR(500),
    "TotalDebt" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "Notes" VARCHAR(1000),
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Suppliers_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Customers" (
    "ID" SERIAL NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "Name" VARCHAR(255) NOT NULL,
    "Phone" VARCHAR(50),
    "Email" VARCHAR(255),
    "Address" VARCHAR(500),
    "TotalReceivable" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "CustomerGroupID" INTEGER NOT NULL,
    "PointBalance" INTEGER NOT NULL DEFAULT 0,
    "Notes" VARCHAR(1000),
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customers_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "SalesPersons" (
    "ID" SERIAL NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "Name" VARCHAR(255) NOT NULL,
    "Phone" VARCHAR(50),
    "Email" VARCHAR(255),
    "Address" VARCHAR(500),
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalesPersons_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "SalePoints" (
    "ID" SERIAL NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "Name" VARCHAR(255) NOT NULL,
    "WarehouseID" INTEGER,
    "Description" VARCHAR(500),
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalePoints_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Products" (
    "ID" SERIAL NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "Barcode" VARCHAR(100),
    "Name" VARCHAR(255) NOT NULL,
    "CategoryID" INTEGER,
    "BrandID" INTEGER,
    "UnitID" INTEGER NOT NULL,
    "WarehouseID" INTEGER,
    "PurchasePrice" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "SellingPrice" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "DiscountPercent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "Stock" DECIMAL(15,3) NOT NULL DEFAULT 0,
    "MinimumStock" DECIMAL(15,3) NOT NULL DEFAULT 0,
    "Image" VARCHAR(500),
    "Description" VARCHAR(1000),
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,
    "ProductGroupID" INTEGER,

    CONSTRAINT "Products_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "ProductStocks" (
    "ID" SERIAL NOT NULL,
    "ProductID" INTEGER NOT NULL,
    "WarehouseID" INTEGER NOT NULL,
    "Quantity" DECIMAL(15,3) NOT NULL DEFAULT 0,
    "MinimumStock" DECIMAL(15,3) NOT NULL DEFAULT 0,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductStocks_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Sales" (
    "ID" SERIAL NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "Date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "CustomerID" INTEGER NOT NULL,
    "SalesPersonID" INTEGER,
    "SalePointID" INTEGER,
    "WarehouseID" INTEGER,
    "Subtotal" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "DiscountPercent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "DiscountAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "TaxPercent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "TaxAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "Total" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "CashAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "ChangeAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "PaymentStatusID" INTEGER NOT NULL,
    "IsReturn" BOOLEAN NOT NULL DEFAULT false,
    "ReturnedAt" TIMESTAMP(3),
    "PaymentMethodID" INTEGER,
    "Notes" VARCHAR(1000),
    "ShippingStatus" VARCHAR(20) DEFAULT 'PENDING',
    "ShippingDate" TIMESTAMP(3),
    "TrackingNumber" VARCHAR(100),
    "CreatedByID" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sales_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "SaleItems" (
    "ID" SERIAL NOT NULL,
    "SaleID" INTEGER NOT NULL,
    "ProductID" INTEGER NOT NULL,
    "Quantity" DECIMAL(15,3) NOT NULL,
    "UnitPrice" DECIMAL(15,2) NOT NULL,
    "DiscountPercent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "DiscountAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "Subtotal" DECIMAL(15,2) NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UnitID" INTEGER,

    CONSTRAINT "SaleItems_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "SalePayments" (
    "ID" SERIAL NOT NULL,
    "SaleID" INTEGER NOT NULL,
    "MethodID" INTEGER NOT NULL,
    "Amount" DECIMAL(15,2) NOT NULL,
    "ReferenceNumber" VARCHAR(100),
    "Date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Notes" VARCHAR(500),
    "CreatedByID" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SalePayments_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "SaleReturns" (
    "ID" SERIAL NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "Date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "SaleID" INTEGER NOT NULL,
    "CustomerID" INTEGER NOT NULL,
    "WarehouseID" INTEGER,
    "TotalReturn" DECIMAL(15,2) NOT NULL,
    "Reason" VARCHAR(1000),
    "StatusID" INTEGER NOT NULL DEFAULT 1,
    "CreatedByID" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SaleReturns_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "SaleReturnItems" (
    "ID" SERIAL NOT NULL,
    "SaleReturnID" INTEGER NOT NULL,
    "ProductID" INTEGER NOT NULL,
    "Quantity" DECIMAL(15,3) NOT NULL,
    "UnitPrice" DECIMAL(15,2) NOT NULL,
    "Subtotal" DECIMAL(15,2) NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UnitID" INTEGER,

    CONSTRAINT "SaleReturnItems_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "PurchaseOrders" (
    "ID" SERIAL NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "Date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "SupplierID" INTEGER NOT NULL,
    "WarehouseID" INTEGER,
    "Subtotal" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "DiscountPercent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "DiscountAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "TaxPercent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "TaxAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "Total" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "DownPayment" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "PaymentStatusID" INTEGER NOT NULL,
    "DueDate" TIMESTAMP(3),
    "IsInvoice" BOOLEAN NOT NULL DEFAULT false,
    "PurchaseID" INTEGER,
    "StatusID" INTEGER NOT NULL DEFAULT 1,
    "Notes" VARCHAR(1000),
    "CreatedByID" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PurchaseOrders_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "PurchaseOrderItems" (
    "ID" SERIAL NOT NULL,
    "PurchaseOrderID" INTEGER NOT NULL,
    "ProductID" INTEGER NOT NULL,
    "Quantity" DECIMAL(15,3) NOT NULL,
    "UnitID" INTEGER NOT NULL,
    "UnitPrice" DECIMAL(15,2) NOT NULL,
    "DiscountPercent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "DiscountAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "Subtotal" DECIMAL(15,2) NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PurchaseOrderItems_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Purchases" (
    "ID" SERIAL NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "Date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "SupplierID" INTEGER NOT NULL,
    "WarehouseID" INTEGER,
    "Subtotal" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "DiscountPercent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "DiscountAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "TaxPercent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "TaxAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "Total" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "Paid" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "Remaining" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "PaymentStatusID" INTEGER NOT NULL,
    "PaymentMethodID" INTEGER,
    "DueDate" TIMESTAMP(3),
    "IsReturn" BOOLEAN NOT NULL DEFAULT false,
    "StatusID" INTEGER NOT NULL DEFAULT 1,
    "Notes" VARCHAR(1000),
    "CreatedByID" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Purchases_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "PurchaseItems" (
    "ID" SERIAL NOT NULL,
    "PurchaseID" INTEGER NOT NULL,
    "ProductID" INTEGER NOT NULL,
    "Quantity" DECIMAL(15,3) NOT NULL,
    "UnitID" INTEGER NOT NULL,
    "UnitPrice" DECIMAL(15,2) NOT NULL,
    "DiscountPercent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "DiscountAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "Subtotal" DECIMAL(15,2) NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PurchaseItems_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "PurchasePayments" (
    "ID" SERIAL NOT NULL,
    "PurchaseID" INTEGER NOT NULL,
    "MethodID" INTEGER NOT NULL,
    "Amount" DECIMAL(15,2) NOT NULL,
    "ReferenceNumber" VARCHAR(100),
    "Date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Notes" VARCHAR(500),
    "CreatedByID" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PurchasePayments_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "PurchaseReturns" (
    "ID" SERIAL NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "Date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "PurchaseID" INTEGER NOT NULL,
    "SupplierID" INTEGER NOT NULL,
    "WarehouseID" INTEGER,
    "TotalReturn" DECIMAL(15,2) NOT NULL,
    "Reason" VARCHAR(1000),
    "StatusID" INTEGER NOT NULL DEFAULT 1,
    "CreatedByID" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PurchaseReturns_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "PurchaseReturnItems" (
    "ID" SERIAL NOT NULL,
    "PurchaseReturnID" INTEGER NOT NULL,
    "ProductID" INTEGER NOT NULL,
    "Quantity" DECIMAL(15,3) NOT NULL,
    "UnitID" INTEGER NOT NULL,
    "UnitPrice" DECIMAL(15,2) NOT NULL,
    "Subtotal" DECIMAL(15,2) NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PurchaseReturnItems_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "StockIns" (
    "ID" SERIAL NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "Date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "WarehouseID" INTEGER NOT NULL,
    "SupplierID" INTEGER,
    "ReferenceTypeID" INTEGER,
    "ReferenceID" INTEGER,
    "TotalItems" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "Description" VARCHAR(1000),
    "StatusID" INTEGER NOT NULL DEFAULT 1,
    "CreatedByID" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockIns_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "StockInItems" (
    "ID" SERIAL NOT NULL,
    "StockInID" INTEGER NOT NULL,
    "ProductID" INTEGER NOT NULL,
    "Quantity" DECIMAL(15,3) NOT NULL,
    "UnitID" INTEGER NOT NULL,
    "UnitPrice" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "Subtotal" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockInItems_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "StockOuts" (
    "ID" SERIAL NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "Date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "WarehouseID" INTEGER NOT NULL,
    "ReferenceTypeID" INTEGER,
    "ReferenceID" INTEGER,
    "TotalItems" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "Description" VARCHAR(1000),
    "StatusID" INTEGER NOT NULL DEFAULT 1,
    "CreatedByID" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockOuts_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "StockOutItems" (
    "ID" SERIAL NOT NULL,
    "StockOutID" INTEGER NOT NULL,
    "ProductID" INTEGER NOT NULL,
    "Quantity" DECIMAL(15,3) NOT NULL,
    "UnitID" INTEGER NOT NULL,
    "UnitPrice" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "Subtotal" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockOutItems_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "StockTransfers" (
    "ID" SERIAL NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "Date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "FromWarehouseID" INTEGER NOT NULL,
    "ToWarehouseID" INTEGER NOT NULL,
    "TotalItems" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "StatusID" INTEGER NOT NULL DEFAULT 1,
    "Notes" VARCHAR(1000),
    "CreatedByID" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockTransfers_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "StockTransferItems" (
    "ID" SERIAL NOT NULL,
    "StockTransferID" INTEGER NOT NULL,
    "ProductID" INTEGER NOT NULL,
    "Quantity" DECIMAL(15,3) NOT NULL,
    "UnitID" INTEGER NOT NULL,
    "UnitPrice" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "Subtotal" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockTransferItems_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "StockOpnames" (
    "ID" SERIAL NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "Date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "WarehouseID" INTEGER NOT NULL,
    "TotalItems" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "StatusID" INTEGER NOT NULL DEFAULT 1,
    "Notes" VARCHAR(1000),
    "CreatedByID" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockOpnames_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "StockOpnameItems" (
    "ID" SERIAL NOT NULL,
    "StockOpnameID" INTEGER NOT NULL,
    "ProductID" INTEGER NOT NULL,
    "SystemStock" DECIMAL(15,3) NOT NULL,
    "CountedStock" DECIMAL(15,3) NOT NULL,
    "Difference" DECIMAL(15,3) NOT NULL,
    "UnitID" INTEGER NOT NULL,
    "UnitPrice" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "Note" VARCHAR(500),
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockOpnameItems_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Accounts" (
    "ID" SERIAL NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "Name" VARCHAR(255) NOT NULL,
    "TypeID" INTEGER NOT NULL,
    "ParentID" INTEGER,
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Accounts_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Journals" (
    "ID" SERIAL NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "Date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Description" VARCHAR(1000),
    "ReferenceType" VARCHAR(100),
    "ReferenceID" INTEGER,
    "IsPosted" BOOLEAN NOT NULL DEFAULT false,
    "PostedAt" TIMESTAMP(3),
    "CreatedByID" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Journals_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "JournalEntries" (
    "ID" SERIAL NOT NULL,
    "JournalID" INTEGER NOT NULL,
    "AccountID" INTEGER NOT NULL,
    "Debit" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "Credit" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "Memo" VARCHAR(500),
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UserID" TEXT,

    CONSTRAINT "JournalEntries_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "CashIns" (
    "ID" SERIAL NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "Date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "AccountID" INTEGER NOT NULL,
    "Amount" DECIMAL(15,2) NOT NULL,
    "Description" VARCHAR(1000),
    "ReferenceType" VARCHAR(100),
    "ReferenceID" INTEGER,
    "CreatedByID" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CashIns_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "CashOuts" (
    "ID" SERIAL NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "Date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "AccountID" INTEGER NOT NULL,
    "Amount" DECIMAL(15,2) NOT NULL,
    "Description" VARCHAR(1000),
    "ReferenceType" VARCHAR(100),
    "ReferenceID" INTEGER,
    "CreatedByID" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CashOuts_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "CashTransfers" (
    "ID" SERIAL NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "Date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "FromAccountID" INTEGER NOT NULL,
    "ToAccountID" INTEGER NOT NULL,
    "Amount" DECIMAL(15,2) NOT NULL,
    "Description" VARCHAR(1000),
    "CreatedByID" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CashTransfers_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "CustomerDeposits" (
    "ID" SERIAL NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "Date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "CustomerID" INTEGER NOT NULL,
    "Amount" DECIMAL(15,2) NOT NULL,
    "RemainingAmount" DECIMAL(15,2) NOT NULL,
    "Description" VARCHAR(1000),
    "CreatedByID" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerDeposits_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "SupplierDeposits" (
    "ID" SERIAL NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "Date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "SupplierID" INTEGER NOT NULL,
    "Amount" DECIMAL(15,2) NOT NULL,
    "RemainingAmount" DECIMAL(15,2) NOT NULL,
    "Description" VARCHAR(1000),
    "CreatedByID" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupplierDeposits_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "PointSettings" (
    "ID" SERIAL NOT NULL,
    "Name" VARCHAR(255) NOT NULL,
    "PointsPerRupiah" DECIMAL(10,4) NOT NULL,
    "MinimumTransaction" DECIMAL(15,2) NOT NULL,
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PointSettings_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "PointRedemptions" (
    "ID" SERIAL NOT NULL,
    "CustomerID" INTEGER NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "PointsRedeemed" INTEGER NOT NULL,
    "RewardName" VARCHAR(255) NOT NULL,
    "RewardValue" DECIMAL(15,2) NOT NULL,
    "Date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "CreatedByID" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PointRedemptions_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Companies" (
    "ID" SERIAL NOT NULL,
    "CompanyCode" VARCHAR(50) NOT NULL,
    "Name" VARCHAR(255) NOT NULL,
    "Address" VARCHAR(500),
    "Phone" VARCHAR(50),
    "Email" VARCHAR(255),
    "City" VARCHAR(100),
    "Province" VARCHAR(100),
    "PostalCode" VARCHAR(20),
    "TaxID" VARCHAR(50),
    "LogoUrl" VARCHAR(500),
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Companies_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Numberings" (
    "ID" SERIAL NOT NULL,
    "Type" VARCHAR(100) NOT NULL,
    "Prefix" VARCHAR(20) NOT NULL DEFAULT '',
    "LastNumber" INTEGER NOT NULL DEFAULT 0,
    "Suffix" VARCHAR(20) NOT NULL DEFAULT '',
    "DigitCount" INTEGER NOT NULL DEFAULT 4,
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Numberings_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Testings" (
    "ID" SERIAL NOT NULL,
    "Type" VARCHAR(100) NOT NULL,
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Testings_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "ExpenseCategories" (
    "ID" SERIAL NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "Name" VARCHAR(255) NOT NULL,
    "Description" VARCHAR(1000),
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExpenseCategories_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Expenses" (
    "ID" SERIAL NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "Date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ExpenseCategoryID" INTEGER NOT NULL,
    "Amount" DECIMAL(15,2) NOT NULL,
    "Description" VARCHAR(1000),
    "ReferenceNumber" VARCHAR(100),
    "IsApproved" BOOLEAN NOT NULL DEFAULT false,
    "ApprovedByID" TEXT,
    "ApprovedAt" TIMESTAMP(3),
    "Notes" VARCHAR(1000),
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Expenses_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Transfers" (
    "ID" SERIAL NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "Date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "FromAccountID" INTEGER,
    "ToAccountID" INTEGER,
    "FromWarehouseID" INTEGER,
    "ToWarehouseID" INTEGER,
    "Amount" DECIMAL(15,2) NOT NULL,
    "Description" VARCHAR(1000),
    "StatusID" INTEGER NOT NULL DEFAULT 1,
    "Notes" VARCHAR(1000),
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transfers_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "AssetCategories" (
    "ID" SERIAL NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "Name" VARCHAR(255) NOT NULL,
    "Description" VARCHAR(1000),
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssetCategories_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Assets" (
    "ID" SERIAL NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "Name" VARCHAR(255) NOT NULL,
    "AssetCategoryID" INTEGER,
    "PurchaseDate" TIMESTAMP(3),
    "PurchasePrice" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "CurrentValue" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "DepreciationMethodID" INTEGER,
    "UsefulLifeYears" INTEGER NOT NULL DEFAULT 0,
    "Location" VARCHAR(255),
    "AssignedTo" VARCHAR(255),
    "SerialNumber" VARCHAR(100),
    "Description" VARCHAR(1000),
    "StatusID" INTEGER NOT NULL DEFAULT 1,
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Assets_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Services" (
    "ID" SERIAL NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "Date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "CustomerID" INTEGER,
    "CustomerName" VARCHAR(255),
    "CustomerPhone" VARCHAR(50),
    "CustomerAddress" VARCHAR(500),
    "ProductName" VARCHAR(255),
    "SerialNumber" VARCHAR(100),
    "Problem" VARCHAR(1000),
    "Diagnosis" VARCHAR(1000),
    "RepairStatusID" INTEGER NOT NULL DEFAULT 1,
    "Technician" VARCHAR(255),
    "WarrantyUntil" TIMESTAMP(3),
    "Subtotal" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "LaborCost" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "TotalAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "Notes" VARCHAR(1000),
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Services_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "ServiceItems" (
    "ID" SERIAL NOT NULL,
    "ServiceID" INTEGER NOT NULL,
    "ProductID" INTEGER,
    "ProductName" VARCHAR(255) NOT NULL,
    "Quantity" DECIMAL(15,3) NOT NULL,
    "UnitPrice" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "Subtotal" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ServiceItems_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "PriceHistories" (
    "ID" SERIAL NOT NULL,
    "ProductID" INTEGER NOT NULL,
    "Type" VARCHAR(20) NOT NULL,
    "OldPrice" DECIMAL(15,2) NOT NULL,
    "NewPrice" DECIMAL(15,2) NOT NULL,
    "ChangedBy" VARCHAR(255),
    "ChangedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PriceHistories_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Vouchers" (
    "ID" SERIAL NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "Name" VARCHAR(255) NOT NULL,
    "TypeID" INTEGER NOT NULL,
    "Value" DECIMAL(15,2) NOT NULL,
    "MinPurchaseAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "MaxDiscountAmount" DECIMAL(15,2),
    "StartDate" TIMESTAMP(3) NOT NULL,
    "EndDate" TIMESTAMP(3) NOT NULL,
    "UsageLimit" INTEGER,
    "UsedCount" INTEGER NOT NULL DEFAULT 0,
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vouchers_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Taxes" (
    "ID" SERIAL NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "Name" VARCHAR(255) NOT NULL,
    "Rate" DECIMAL(5,2) NOT NULL,
    "Description" VARCHAR(1000),
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Taxes_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Productions" (
    "ID" SERIAL NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "Date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ProductID" INTEGER,
    "ProductName" VARCHAR(255),
    "Quantity" DECIMAL(15,3) NOT NULL DEFAULT 0,
    "WarehouseID" INTEGER,
    "RawMaterialCost" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "LaborCost" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "OverheadCost" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "TotalCost" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "StatusID" INTEGER NOT NULL DEFAULT 1,
    "Notes" VARCHAR(1000),
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Productions_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "ProductionItems" (
    "ID" SERIAL NOT NULL,
    "ProductionID" INTEGER NOT NULL,
    "ProductID" INTEGER NOT NULL,
    "ProductName" VARCHAR(255) NOT NULL,
    "Quantity" DECIMAL(15,3) NOT NULL,
    "UnitID" INTEGER,
    "UnitPrice" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "Subtotal" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductionItems_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "DailySalesSummaries" (
    "ID" SERIAL NOT NULL,
    "Date" DATE NOT NULL,
    "TotalTransactions" INTEGER NOT NULL DEFAULT 0,
    "TotalCost" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "TotalSales" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "TotalProfit" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "TotalReturns" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "TotalExpenses" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailySalesSummaries_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "MonthlySalesSummaries" (
    "ID" SERIAL NOT NULL,
    "Year" INTEGER NOT NULL,
    "Month" INTEGER NOT NULL,
    "TotalTransactions" INTEGER NOT NULL DEFAULT 0,
    "TotalCost" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "TotalSales" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "TotalProfit" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "TotalReturns" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "TotalExpenses" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonthlySalesSummaries_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "ActivityLogs" (
    "ID" SERIAL NOT NULL,
    "Type" VARCHAR(50) NOT NULL,
    "Title" VARCHAR(255) NOT NULL,
    "Description" VARCHAR(1000),
    "ReferenceType" VARCHAR(100),
    "ReferenceID" INTEGER,
    "Amount" DECIMAL(15,2),
    "CreatedByID" TEXT,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLogs_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "StockAlerts" (
    "ID" SERIAL NOT NULL,
    "ProductID" INTEGER NOT NULL,
    "AlertTypeID" INTEGER NOT NULL,
    "Threshold" DECIMAL(15,3) NOT NULL DEFAULT 0,
    "CurrentStock" DECIMAL(15,3) NOT NULL DEFAULT 0,
    "IsRead" BOOLEAN NOT NULL DEFAULT false,
    "IsResolved" BOOLEAN NOT NULL DEFAULT false,
    "ResolvedAt" TIMESTAMP(3),
    "Notes" VARCHAR(1000),
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockAlerts_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "ProductImages" (
    "ID" SERIAL NOT NULL,
    "ProductID" INTEGER NOT NULL,
    "Url" VARCHAR(500) NOT NULL,
    "Caption" VARCHAR(255),
    "SortOrder" INTEGER NOT NULL DEFAULT 0,
    "IsPrimary" BOOLEAN NOT NULL DEFAULT false,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductImages_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "ProductBarcodes" (
    "ID" SERIAL NOT NULL,
    "ProductID" INTEGER NOT NULL,
    "Barcode" VARCHAR(100) NOT NULL,
    "IsDefault" BOOLEAN NOT NULL DEFAULT false,
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductBarcodes_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "BrandLogos" (
    "ID" SERIAL NOT NULL,
    "BrandID" INTEGER,
    "Name" VARCHAR(255) NOT NULL,
    "LogoUrl" VARCHAR(500) NOT NULL,
    "Website" VARCHAR(255),
    "SortOrder" INTEGER NOT NULL DEFAULT 0,
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrandLogos_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "NotificationSettings" (
    "ID" SERIAL NOT NULL,
    "UserID" TEXT NOT NULL,
    "TypeID" INTEGER NOT NULL,
    "EmailEnabled" BOOLEAN NOT NULL DEFAULT false,
    "PushEnabled" BOOLEAN NOT NULL DEFAULT true,
    "InAppEnabled" BOOLEAN NOT NULL DEFAULT true,
    "Threshold" DECIMAL(15,2),
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationSettings_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Departments" (
    "ID" SERIAL NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "Name" VARCHAR(255) NOT NULL,
    "Description" VARCHAR(1000),
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Departments_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Positions" (
    "ID" SERIAL NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "Name" VARCHAR(255) NOT NULL,
    "Description" VARCHAR(1000),
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Positions_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Employees" (
    "ID" SERIAL NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "Name" VARCHAR(255) NOT NULL,
    "DepartmentID" INTEGER,
    "PositionID" INTEGER,
    "JoinDate" TIMESTAMP(3),
    "EndDate" TIMESTAMP(3),
    "BirthDate" TIMESTAMP(3),
    "Gender" VARCHAR(20),
    "Phone" VARCHAR(50),
    "Email" VARCHAR(255),
    "Address" VARCHAR(500),
    "EmergencyContact" VARCHAR(255),
    "EmergencyPhone" VARCHAR(50),
    "BasicSalary" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "StatusID" INTEGER NOT NULL DEFAULT 1,
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Employees_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Attendances" (
    "ID" SERIAL NOT NULL,
    "EmployeeID" INTEGER NOT NULL,
    "Date" TIMESTAMP(3) NOT NULL,
    "CheckIn" TIMESTAMP(3),
    "CheckOut" TIMESTAMP(3),
    "StatusID" INTEGER NOT NULL DEFAULT 1,
    "Notes" VARCHAR(1000),
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Attendances_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Payrolls" (
    "ID" SERIAL NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "EmployeeID" INTEGER NOT NULL,
    "Period" VARCHAR(20) NOT NULL,
    "BasicSalary" DECIMAL(15,2) NOT NULL,
    "Allowances" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "Deductions" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "OvertimePay" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "TotalSalary" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "PaymentDate" TIMESTAMP(3),
    "Notes" VARCHAR(1000),
    "IsPaid" BOOLEAN NOT NULL DEFAULT false,
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payrolls_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Loans" (
    "ID" SERIAL NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "EmployeeID" INTEGER NOT NULL,
    "LoanTypeID" INTEGER NOT NULL,
    "PrincipalAmount" DECIMAL(15,2) NOT NULL,
    "InterestRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "TenorMonths" INTEGER NOT NULL DEFAULT 1,
    "InstallmentAmount" DECIMAL(15,2) NOT NULL,
    "TotalAmount" DECIMAL(15,2) NOT NULL,
    "RemainingAmount" DECIMAL(15,2) NOT NULL,
    "StartDate" TIMESTAMP(3),
    "StatusID" INTEGER NOT NULL DEFAULT 1,
    "Notes" VARCHAR(1000),
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Loans_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "LoanInstallments" (
    "ID" SERIAL NOT NULL,
    "LoanID" INTEGER NOT NULL,
    "Period" VARCHAR(20) NOT NULL,
    "Amount" DECIMAL(15,2) NOT NULL,
    "Principal" DECIMAL(15,2) NOT NULL,
    "Interest" DECIMAL(15,2) NOT NULL,
    "RemainingBefore" DECIMAL(15,2) NOT NULL,
    "RemainingAfter" DECIMAL(15,2) NOT NULL,
    "PaymentDate" TIMESTAMP(3),
    "Status" VARCHAR(20) NOT NULL DEFAULT 'UNPAID',
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoanInstallments_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Leaves" (
    "ID" SERIAL NOT NULL,
    "Code" VARCHAR(50) NOT NULL,
    "EmployeeID" INTEGER NOT NULL,
    "TypeID" INTEGER NOT NULL,
    "StartDate" TIMESTAMP(3) NOT NULL,
    "EndDate" TIMESTAMP(3) NOT NULL,
    "TotalDays" INTEGER NOT NULL DEFAULT 1,
    "Reason" VARCHAR(1000),
    "StatusID" INTEGER NOT NULL DEFAULT 1,
    "ApprovedByID" TEXT,
    "ApprovedAt" TIMESTAMP(3),
    "RejectedReason" VARCHAR(500),
    "Notes" VARCHAR(1000),
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Leaves_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "LeaveBalances" (
    "ID" SERIAL NOT NULL,
    "EmployeeID" INTEGER NOT NULL,
    "Year" INTEGER NOT NULL,
    "TypeID" INTEGER NOT NULL,
    "TotalDays" INTEGER NOT NULL DEFAULT 0,
    "UsedDays" INTEGER NOT NULL DEFAULT 0,
    "RemainingDays" INTEGER NOT NULL DEFAULT 0,
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeaveBalances_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Notifications" (
    "ID" SERIAL NOT NULL,
    "UserID" TEXT,
    "Title" VARCHAR(255) NOT NULL,
    "Message" VARCHAR(1000) NOT NULL,
    "TypeID" INTEGER NOT NULL DEFAULT 1,
    "IsRead" BOOLEAN NOT NULL DEFAULT false,
    "ReferenceType" VARCHAR(100),
    "ReferenceID" INTEGER,
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notifications_pkey" PRIMARY KEY ("ID")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentMethods_Code_key" ON "PaymentMethods"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentStatuses_Code_key" ON "PaymentStatuses"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "TransactionStatuses_Code_key" ON "TransactionStatuses"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "StockOpnameStatuses_Code_key" ON "StockOpnameStatuses"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "AccountTypes_Code_key" ON "AccountTypes"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "ReferenceTypes_Code_key" ON "ReferenceTypes"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerGroups_Code_key" ON "CustomerGroups"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeStatuses_Code_key" ON "EmployeeStatuses"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "AttendanceStatuses_Code_key" ON "AttendanceStatuses"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "LeaveTypes_Code_key" ON "LeaveTypes"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "LeaveStatuses_Code_key" ON "LeaveStatuses"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "LoanStatuses_Code_key" ON "LoanStatuses"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "LoanTypes_Code_key" ON "LoanTypes"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "AssetStatuses_Code_key" ON "AssetStatuses"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "DepreciationMethods_Code_key" ON "DepreciationMethods"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "RepairStatuses_Code_key" ON "RepairStatuses"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "ProductionStatuses_Code_key" ON "ProductionStatuses"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "VoucherTypes_Code_key" ON "VoucherTypes"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationTypes_Code_key" ON "NotificationTypes"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "AlertTypes_Code_key" ON "AlertTypes"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationChannels_Code_key" ON "NotificationChannels"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "Users_Email_key" ON "Users"("Email");

-- CreateIndex
CREATE INDEX "Users_CompanyID_idx" ON "Users"("CompanyID");

-- CreateIndex
CREATE UNIQUE INDEX "Users_CompanyID_Username_key" ON "Users"("CompanyID", "Username");

-- CreateIndex
CREATE UNIQUE INDEX "Roles_RoleName_key" ON "Roles"("RoleName");

-- CreateIndex
CREATE UNIQUE INDEX "UserRoles_UserID_RoleID_key" ON "UserRoles"("UserID", "RoleID");

-- CreateIndex
CREATE UNIQUE INDEX "RoleMenus_RoleID_MenuID_key" ON "RoleMenus"("RoleID", "MenuID");

-- CreateIndex
CREATE UNIQUE INDEX "UserMenus_UserID_MenuID_key" ON "UserMenus"("UserID", "MenuID");

-- CreateIndex
CREATE UNIQUE INDEX "Categories_Code_key" ON "Categories"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "Brands_Code_key" ON "Brands"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "Units_Code_key" ON "Units"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "Warehouses_Code_key" ON "Warehouses"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "Shelves_Code_key" ON "Shelves"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "ShelfProducts_ShelfID_ProductID_key" ON "ShelfProducts"("ShelfID", "ProductID");

-- CreateIndex
CREATE UNIQUE INDEX "ProductGroups_Code_key" ON "ProductGroups"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "Suppliers_Code_key" ON "Suppliers"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "Customers_Code_key" ON "Customers"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "SalesPersons_Code_key" ON "SalesPersons"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "SalePoints_Code_key" ON "SalePoints"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "Products_Code_key" ON "Products"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "ProductStocks_ProductID_WarehouseID_key" ON "ProductStocks"("ProductID", "WarehouseID");

-- CreateIndex
CREATE UNIQUE INDEX "Sales_Code_key" ON "Sales"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "SaleReturns_Code_key" ON "SaleReturns"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "PurchaseOrders_Code_key" ON "PurchaseOrders"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "Purchases_Code_key" ON "Purchases"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "PurchaseReturns_Code_key" ON "PurchaseReturns"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "StockIns_Code_key" ON "StockIns"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "StockOuts_Code_key" ON "StockOuts"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "StockTransfers_Code_key" ON "StockTransfers"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "StockOpnames_Code_key" ON "StockOpnames"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "Accounts_Code_key" ON "Accounts"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "Journals_Code_key" ON "Journals"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "CashIns_Code_key" ON "CashIns"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "CashOuts_Code_key" ON "CashOuts"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "CashTransfers_Code_key" ON "CashTransfers"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerDeposits_Code_key" ON "CustomerDeposits"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "SupplierDeposits_Code_key" ON "SupplierDeposits"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "PointRedemptions_Code_key" ON "PointRedemptions"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "Companies_CompanyCode_key" ON "Companies"("CompanyCode");

-- CreateIndex
CREATE UNIQUE INDEX "Numberings_Type_key" ON "Numberings"("Type");

-- CreateIndex
CREATE UNIQUE INDEX "Testings_Type_key" ON "Testings"("Type");

-- CreateIndex
CREATE UNIQUE INDEX "ExpenseCategories_Code_key" ON "ExpenseCategories"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "Expenses_Code_key" ON "Expenses"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "Transfers_Code_key" ON "Transfers"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "AssetCategories_Code_key" ON "AssetCategories"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "Assets_Code_key" ON "Assets"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "Services_Code_key" ON "Services"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "Vouchers_Code_key" ON "Vouchers"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "Taxes_Code_key" ON "Taxes"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "Productions_Code_key" ON "Productions"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "DailySalesSummaries_Date_key" ON "DailySalesSummaries"("Date");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlySalesSummaries_Year_Month_key" ON "MonthlySalesSummaries"("Year", "Month");

-- CreateIndex
CREATE INDEX "ActivityLogs_CreatedAt_idx" ON "ActivityLogs"("CreatedAt" DESC);

-- CreateIndex
CREATE INDEX "StockAlerts_IsRead_IsResolved_idx" ON "StockAlerts"("IsRead", "IsResolved");

-- CreateIndex
CREATE UNIQUE INDEX "ProductBarcodes_Barcode_key" ON "ProductBarcodes"("Barcode");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationSettings_UserID_TypeID_key" ON "NotificationSettings"("UserID", "TypeID");

-- CreateIndex
CREATE UNIQUE INDEX "Departments_Code_key" ON "Departments"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "Positions_Code_key" ON "Positions"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "Employees_Code_key" ON "Employees"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "Attendances_EmployeeID_Date_key" ON "Attendances"("EmployeeID", "Date");

-- CreateIndex
CREATE UNIQUE INDEX "Payrolls_Code_key" ON "Payrolls"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "Loans_Code_key" ON "Loans"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "Leaves_Code_key" ON "Leaves"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "LeaveBalances_EmployeeID_Year_TypeID_key" ON "LeaveBalances"("EmployeeID", "Year", "TypeID");

-- AddForeignKey
ALTER TABLE "Users" ADD CONSTRAINT "Users_CompanyID_fkey" FOREIGN KEY ("CompanyID") REFERENCES "Companies"("ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Menus" ADD CONSTRAINT "Menus_ParentMenuID_fkey" FOREIGN KEY ("ParentMenuID") REFERENCES "Menus"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRoles" ADD CONSTRAINT "UserRoles_UserID_fkey" FOREIGN KEY ("UserID") REFERENCES "Users"("ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRoles" ADD CONSTRAINT "UserRoles_RoleID_fkey" FOREIGN KEY ("RoleID") REFERENCES "Roles"("ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleMenus" ADD CONSTRAINT "RoleMenus_RoleID_fkey" FOREIGN KEY ("RoleID") REFERENCES "Roles"("ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleMenus" ADD CONSTRAINT "RoleMenus_MenuID_fkey" FOREIGN KEY ("MenuID") REFERENCES "Menus"("ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMenus" ADD CONSTRAINT "UserMenus_UserID_fkey" FOREIGN KEY ("UserID") REFERENCES "Users"("ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMenus" ADD CONSTRAINT "UserMenus_MenuID_fkey" FOREIGN KEY ("MenuID") REFERENCES "Menus"("ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shelves" ADD CONSTRAINT "Shelves_WarehouseID_fkey" FOREIGN KEY ("WarehouseID") REFERENCES "Warehouses"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShelfProducts" ADD CONSTRAINT "ShelfProducts_ShelfID_fkey" FOREIGN KEY ("ShelfID") REFERENCES "Shelves"("ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShelfProducts" ADD CONSTRAINT "ShelfProducts_ProductID_fkey" FOREIGN KEY ("ProductID") REFERENCES "Products"("ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customers" ADD CONSTRAINT "Customers_CustomerGroupID_fkey" FOREIGN KEY ("CustomerGroupID") REFERENCES "CustomerGroups"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalePoints" ADD CONSTRAINT "SalePoints_WarehouseID_fkey" FOREIGN KEY ("WarehouseID") REFERENCES "Warehouses"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Products" ADD CONSTRAINT "Products_CategoryID_fkey" FOREIGN KEY ("CategoryID") REFERENCES "Categories"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Products" ADD CONSTRAINT "Products_BrandID_fkey" FOREIGN KEY ("BrandID") REFERENCES "Brands"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Products" ADD CONSTRAINT "Products_UnitID_fkey" FOREIGN KEY ("UnitID") REFERENCES "Units"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Products" ADD CONSTRAINT "Products_WarehouseID_fkey" FOREIGN KEY ("WarehouseID") REFERENCES "Warehouses"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Products" ADD CONSTRAINT "Products_ProductGroupID_fkey" FOREIGN KEY ("ProductGroupID") REFERENCES "ProductGroups"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductStocks" ADD CONSTRAINT "ProductStocks_ProductID_fkey" FOREIGN KEY ("ProductID") REFERENCES "Products"("ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductStocks" ADD CONSTRAINT "ProductStocks_WarehouseID_fkey" FOREIGN KEY ("WarehouseID") REFERENCES "Warehouses"("ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sales" ADD CONSTRAINT "Sales_CustomerID_fkey" FOREIGN KEY ("CustomerID") REFERENCES "Customers"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sales" ADD CONSTRAINT "Sales_SalesPersonID_fkey" FOREIGN KEY ("SalesPersonID") REFERENCES "SalesPersons"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sales" ADD CONSTRAINT "Sales_SalePointID_fkey" FOREIGN KEY ("SalePointID") REFERENCES "SalePoints"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sales" ADD CONSTRAINT "Sales_WarehouseID_fkey" FOREIGN KEY ("WarehouseID") REFERENCES "Warehouses"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sales" ADD CONSTRAINT "Sales_CreatedByID_fkey" FOREIGN KEY ("CreatedByID") REFERENCES "Users"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sales" ADD CONSTRAINT "Sales_PaymentStatusID_fkey" FOREIGN KEY ("PaymentStatusID") REFERENCES "PaymentStatuses"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sales" ADD CONSTRAINT "Sales_PaymentMethodID_fkey" FOREIGN KEY ("PaymentMethodID") REFERENCES "PaymentMethods"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleItems" ADD CONSTRAINT "SaleItems_SaleID_fkey" FOREIGN KEY ("SaleID") REFERENCES "Sales"("ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleItems" ADD CONSTRAINT "SaleItems_ProductID_fkey" FOREIGN KEY ("ProductID") REFERENCES "Products"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleItems" ADD CONSTRAINT "SaleItems_UnitID_fkey" FOREIGN KEY ("UnitID") REFERENCES "Units"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalePayments" ADD CONSTRAINT "SalePayments_SaleID_fkey" FOREIGN KEY ("SaleID") REFERENCES "Sales"("ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalePayments" ADD CONSTRAINT "SalePayments_MethodID_fkey" FOREIGN KEY ("MethodID") REFERENCES "PaymentMethods"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalePayments" ADD CONSTRAINT "SalePayments_CreatedByID_fkey" FOREIGN KEY ("CreatedByID") REFERENCES "Users"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleReturns" ADD CONSTRAINT "SaleReturns_SaleID_fkey" FOREIGN KEY ("SaleID") REFERENCES "Sales"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleReturns" ADD CONSTRAINT "SaleReturns_CustomerID_fkey" FOREIGN KEY ("CustomerID") REFERENCES "Customers"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleReturns" ADD CONSTRAINT "SaleReturns_WarehouseID_fkey" FOREIGN KEY ("WarehouseID") REFERENCES "Warehouses"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleReturns" ADD CONSTRAINT "SaleReturns_CreatedByID_fkey" FOREIGN KEY ("CreatedByID") REFERENCES "Users"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleReturns" ADD CONSTRAINT "SaleReturns_StatusID_fkey" FOREIGN KEY ("StatusID") REFERENCES "TransactionStatuses"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleReturnItems" ADD CONSTRAINT "SaleReturnItems_SaleReturnID_fkey" FOREIGN KEY ("SaleReturnID") REFERENCES "SaleReturns"("ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleReturnItems" ADD CONSTRAINT "SaleReturnItems_ProductID_fkey" FOREIGN KEY ("ProductID") REFERENCES "Products"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleReturnItems" ADD CONSTRAINT "SaleReturnItems_UnitID_fkey" FOREIGN KEY ("UnitID") REFERENCES "Units"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrders" ADD CONSTRAINT "PurchaseOrders_SupplierID_fkey" FOREIGN KEY ("SupplierID") REFERENCES "Suppliers"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrders" ADD CONSTRAINT "PurchaseOrders_WarehouseID_fkey" FOREIGN KEY ("WarehouseID") REFERENCES "Warehouses"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrders" ADD CONSTRAINT "PurchaseOrders_CreatedByID_fkey" FOREIGN KEY ("CreatedByID") REFERENCES "Users"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrders" ADD CONSTRAINT "PurchaseOrders_PaymentStatusID_fkey" FOREIGN KEY ("PaymentStatusID") REFERENCES "PaymentStatuses"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrders" ADD CONSTRAINT "PurchaseOrders_StatusID_fkey" FOREIGN KEY ("StatusID") REFERENCES "TransactionStatuses"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrderItems" ADD CONSTRAINT "PurchaseOrderItems_PurchaseOrderID_fkey" FOREIGN KEY ("PurchaseOrderID") REFERENCES "PurchaseOrders"("ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrderItems" ADD CONSTRAINT "PurchaseOrderItems_ProductID_fkey" FOREIGN KEY ("ProductID") REFERENCES "Products"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrderItems" ADD CONSTRAINT "PurchaseOrderItems_UnitID_fkey" FOREIGN KEY ("UnitID") REFERENCES "Units"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchases" ADD CONSTRAINT "Purchases_SupplierID_fkey" FOREIGN KEY ("SupplierID") REFERENCES "Suppliers"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchases" ADD CONSTRAINT "Purchases_WarehouseID_fkey" FOREIGN KEY ("WarehouseID") REFERENCES "Warehouses"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchases" ADD CONSTRAINT "Purchases_CreatedByID_fkey" FOREIGN KEY ("CreatedByID") REFERENCES "Users"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchases" ADD CONSTRAINT "Purchases_PaymentStatusID_fkey" FOREIGN KEY ("PaymentStatusID") REFERENCES "PaymentStatuses"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchases" ADD CONSTRAINT "Purchases_PaymentMethodID_fkey" FOREIGN KEY ("PaymentMethodID") REFERENCES "PaymentMethods"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchases" ADD CONSTRAINT "Purchases_StatusID_fkey" FOREIGN KEY ("StatusID") REFERENCES "TransactionStatuses"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseItems" ADD CONSTRAINT "PurchaseItems_PurchaseID_fkey" FOREIGN KEY ("PurchaseID") REFERENCES "Purchases"("ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseItems" ADD CONSTRAINT "PurchaseItems_ProductID_fkey" FOREIGN KEY ("ProductID") REFERENCES "Products"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseItems" ADD CONSTRAINT "PurchaseItems_UnitID_fkey" FOREIGN KEY ("UnitID") REFERENCES "Units"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchasePayments" ADD CONSTRAINT "PurchasePayments_PurchaseID_fkey" FOREIGN KEY ("PurchaseID") REFERENCES "Purchases"("ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchasePayments" ADD CONSTRAINT "PurchasePayments_MethodID_fkey" FOREIGN KEY ("MethodID") REFERENCES "PaymentMethods"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchasePayments" ADD CONSTRAINT "PurchasePayments_CreatedByID_fkey" FOREIGN KEY ("CreatedByID") REFERENCES "Users"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseReturns" ADD CONSTRAINT "PurchaseReturns_PurchaseID_fkey" FOREIGN KEY ("PurchaseID") REFERENCES "Purchases"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseReturns" ADD CONSTRAINT "PurchaseReturns_SupplierID_fkey" FOREIGN KEY ("SupplierID") REFERENCES "Suppliers"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseReturns" ADD CONSTRAINT "PurchaseReturns_WarehouseID_fkey" FOREIGN KEY ("WarehouseID") REFERENCES "Warehouses"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseReturns" ADD CONSTRAINT "PurchaseReturns_CreatedByID_fkey" FOREIGN KEY ("CreatedByID") REFERENCES "Users"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseReturns" ADD CONSTRAINT "PurchaseReturns_StatusID_fkey" FOREIGN KEY ("StatusID") REFERENCES "TransactionStatuses"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseReturnItems" ADD CONSTRAINT "PurchaseReturnItems_PurchaseReturnID_fkey" FOREIGN KEY ("PurchaseReturnID") REFERENCES "PurchaseReturns"("ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseReturnItems" ADD CONSTRAINT "PurchaseReturnItems_ProductID_fkey" FOREIGN KEY ("ProductID") REFERENCES "Products"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseReturnItems" ADD CONSTRAINT "PurchaseReturnItems_UnitID_fkey" FOREIGN KEY ("UnitID") REFERENCES "Units"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockIns" ADD CONSTRAINT "StockIns_WarehouseID_fkey" FOREIGN KEY ("WarehouseID") REFERENCES "Warehouses"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockIns" ADD CONSTRAINT "StockIns_SupplierID_fkey" FOREIGN KEY ("SupplierID") REFERENCES "Suppliers"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockIns" ADD CONSTRAINT "StockIns_ReferenceTypeID_fkey" FOREIGN KEY ("ReferenceTypeID") REFERENCES "ReferenceTypes"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockIns" ADD CONSTRAINT "StockIns_CreatedByID_fkey" FOREIGN KEY ("CreatedByID") REFERENCES "Users"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockIns" ADD CONSTRAINT "StockIns_StatusID_fkey" FOREIGN KEY ("StatusID") REFERENCES "TransactionStatuses"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockInItems" ADD CONSTRAINT "StockInItems_StockInID_fkey" FOREIGN KEY ("StockInID") REFERENCES "StockIns"("ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockInItems" ADD CONSTRAINT "StockInItems_ProductID_fkey" FOREIGN KEY ("ProductID") REFERENCES "Products"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockInItems" ADD CONSTRAINT "StockInItems_UnitID_fkey" FOREIGN KEY ("UnitID") REFERENCES "Units"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockOuts" ADD CONSTRAINT "StockOuts_WarehouseID_fkey" FOREIGN KEY ("WarehouseID") REFERENCES "Warehouses"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockOuts" ADD CONSTRAINT "StockOuts_ReferenceTypeID_fkey" FOREIGN KEY ("ReferenceTypeID") REFERENCES "ReferenceTypes"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockOuts" ADD CONSTRAINT "StockOuts_CreatedByID_fkey" FOREIGN KEY ("CreatedByID") REFERENCES "Users"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockOuts" ADD CONSTRAINT "StockOuts_StatusID_fkey" FOREIGN KEY ("StatusID") REFERENCES "TransactionStatuses"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockOutItems" ADD CONSTRAINT "StockOutItems_StockOutID_fkey" FOREIGN KEY ("StockOutID") REFERENCES "StockOuts"("ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockOutItems" ADD CONSTRAINT "StockOutItems_ProductID_fkey" FOREIGN KEY ("ProductID") REFERENCES "Products"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockOutItems" ADD CONSTRAINT "StockOutItems_UnitID_fkey" FOREIGN KEY ("UnitID") REFERENCES "Units"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockTransfers" ADD CONSTRAINT "StockTransfers_FromWarehouseID_fkey" FOREIGN KEY ("FromWarehouseID") REFERENCES "Warehouses"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockTransfers" ADD CONSTRAINT "StockTransfers_ToWarehouseID_fkey" FOREIGN KEY ("ToWarehouseID") REFERENCES "Warehouses"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockTransfers" ADD CONSTRAINT "StockTransfers_CreatedByID_fkey" FOREIGN KEY ("CreatedByID") REFERENCES "Users"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockTransfers" ADD CONSTRAINT "StockTransfers_StatusID_fkey" FOREIGN KEY ("StatusID") REFERENCES "TransactionStatuses"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockTransferItems" ADD CONSTRAINT "StockTransferItems_StockTransferID_fkey" FOREIGN KEY ("StockTransferID") REFERENCES "StockTransfers"("ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockTransferItems" ADD CONSTRAINT "StockTransferItems_ProductID_fkey" FOREIGN KEY ("ProductID") REFERENCES "Products"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockTransferItems" ADD CONSTRAINT "StockTransferItems_UnitID_fkey" FOREIGN KEY ("UnitID") REFERENCES "Units"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockOpnames" ADD CONSTRAINT "StockOpnames_WarehouseID_fkey" FOREIGN KEY ("WarehouseID") REFERENCES "Warehouses"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockOpnames" ADD CONSTRAINT "StockOpnames_CreatedByID_fkey" FOREIGN KEY ("CreatedByID") REFERENCES "Users"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockOpnames" ADD CONSTRAINT "StockOpnames_StatusID_fkey" FOREIGN KEY ("StatusID") REFERENCES "StockOpnameStatuses"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockOpnameItems" ADD CONSTRAINT "StockOpnameItems_StockOpnameID_fkey" FOREIGN KEY ("StockOpnameID") REFERENCES "StockOpnames"("ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockOpnameItems" ADD CONSTRAINT "StockOpnameItems_ProductID_fkey" FOREIGN KEY ("ProductID") REFERENCES "Products"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockOpnameItems" ADD CONSTRAINT "StockOpnameItems_UnitID_fkey" FOREIGN KEY ("UnitID") REFERENCES "Units"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Accounts" ADD CONSTRAINT "Accounts_ParentID_fkey" FOREIGN KEY ("ParentID") REFERENCES "Accounts"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Accounts" ADD CONSTRAINT "Accounts_TypeID_fkey" FOREIGN KEY ("TypeID") REFERENCES "AccountTypes"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Journals" ADD CONSTRAINT "Journals_CreatedByID_fkey" FOREIGN KEY ("CreatedByID") REFERENCES "Users"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntries" ADD CONSTRAINT "JournalEntries_JournalID_fkey" FOREIGN KEY ("JournalID") REFERENCES "Journals"("ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntries" ADD CONSTRAINT "JournalEntries_AccountID_fkey" FOREIGN KEY ("AccountID") REFERENCES "Accounts"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntries" ADD CONSTRAINT "JournalEntries_UserID_fkey" FOREIGN KEY ("UserID") REFERENCES "Users"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashIns" ADD CONSTRAINT "CashIns_AccountID_fkey" FOREIGN KEY ("AccountID") REFERENCES "Accounts"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashIns" ADD CONSTRAINT "CashIns_CreatedByID_fkey" FOREIGN KEY ("CreatedByID") REFERENCES "Users"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashOuts" ADD CONSTRAINT "CashOuts_AccountID_fkey" FOREIGN KEY ("AccountID") REFERENCES "Accounts"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashOuts" ADD CONSTRAINT "CashOuts_CreatedByID_fkey" FOREIGN KEY ("CreatedByID") REFERENCES "Users"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashTransfers" ADD CONSTRAINT "CashTransfers_FromAccountID_fkey" FOREIGN KEY ("FromAccountID") REFERENCES "Accounts"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashTransfers" ADD CONSTRAINT "CashTransfers_ToAccountID_fkey" FOREIGN KEY ("ToAccountID") REFERENCES "Accounts"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashTransfers" ADD CONSTRAINT "CashTransfers_CreatedByID_fkey" FOREIGN KEY ("CreatedByID") REFERENCES "Users"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerDeposits" ADD CONSTRAINT "CustomerDeposits_CustomerID_fkey" FOREIGN KEY ("CustomerID") REFERENCES "Customers"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerDeposits" ADD CONSTRAINT "CustomerDeposits_CreatedByID_fkey" FOREIGN KEY ("CreatedByID") REFERENCES "Users"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierDeposits" ADD CONSTRAINT "SupplierDeposits_SupplierID_fkey" FOREIGN KEY ("SupplierID") REFERENCES "Suppliers"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierDeposits" ADD CONSTRAINT "SupplierDeposits_CreatedByID_fkey" FOREIGN KEY ("CreatedByID") REFERENCES "Users"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PointRedemptions" ADD CONSTRAINT "PointRedemptions_CustomerID_fkey" FOREIGN KEY ("CustomerID") REFERENCES "Customers"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PointRedemptions" ADD CONSTRAINT "PointRedemptions_CreatedByID_fkey" FOREIGN KEY ("CreatedByID") REFERENCES "Users"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expenses" ADD CONSTRAINT "Expenses_ExpenseCategoryID_fkey" FOREIGN KEY ("ExpenseCategoryID") REFERENCES "ExpenseCategories"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expenses" ADD CONSTRAINT "Expenses_ApprovedByID_fkey" FOREIGN KEY ("ApprovedByID") REFERENCES "Users"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transfers" ADD CONSTRAINT "Transfers_FromAccountID_fkey" FOREIGN KEY ("FromAccountID") REFERENCES "Accounts"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transfers" ADD CONSTRAINT "Transfers_ToAccountID_fkey" FOREIGN KEY ("ToAccountID") REFERENCES "Accounts"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transfers" ADD CONSTRAINT "Transfers_FromWarehouseID_fkey" FOREIGN KEY ("FromWarehouseID") REFERENCES "Warehouses"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transfers" ADD CONSTRAINT "Transfers_ToWarehouseID_fkey" FOREIGN KEY ("ToWarehouseID") REFERENCES "Warehouses"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transfers" ADD CONSTRAINT "Transfers_StatusID_fkey" FOREIGN KEY ("StatusID") REFERENCES "TransactionStatuses"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assets" ADD CONSTRAINT "Assets_AssetCategoryID_fkey" FOREIGN KEY ("AssetCategoryID") REFERENCES "AssetCategories"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assets" ADD CONSTRAINT "Assets_DepreciationMethodID_fkey" FOREIGN KEY ("DepreciationMethodID") REFERENCES "DepreciationMethods"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assets" ADD CONSTRAINT "Assets_StatusID_fkey" FOREIGN KEY ("StatusID") REFERENCES "AssetStatuses"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Services" ADD CONSTRAINT "Services_CustomerID_fkey" FOREIGN KEY ("CustomerID") REFERENCES "Customers"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Services" ADD CONSTRAINT "Services_RepairStatusID_fkey" FOREIGN KEY ("RepairStatusID") REFERENCES "RepairStatuses"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceItems" ADD CONSTRAINT "ServiceItems_ServiceID_fkey" FOREIGN KEY ("ServiceID") REFERENCES "Services"("ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceItems" ADD CONSTRAINT "ServiceItems_ProductID_fkey" FOREIGN KEY ("ProductID") REFERENCES "Products"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceHistories" ADD CONSTRAINT "PriceHistories_ProductID_fkey" FOREIGN KEY ("ProductID") REFERENCES "Products"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vouchers" ADD CONSTRAINT "Vouchers_TypeID_fkey" FOREIGN KEY ("TypeID") REFERENCES "VoucherTypes"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Productions" ADD CONSTRAINT "Productions_WarehouseID_fkey" FOREIGN KEY ("WarehouseID") REFERENCES "Warehouses"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Productions" ADD CONSTRAINT "Productions_ProductID_fkey" FOREIGN KEY ("ProductID") REFERENCES "Products"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Productions" ADD CONSTRAINT "Productions_StatusID_fkey" FOREIGN KEY ("StatusID") REFERENCES "ProductionStatuses"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionItems" ADD CONSTRAINT "ProductionItems_ProductionID_fkey" FOREIGN KEY ("ProductionID") REFERENCES "Productions"("ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionItems" ADD CONSTRAINT "ProductionItems_ProductID_fkey" FOREIGN KEY ("ProductID") REFERENCES "Products"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionItems" ADD CONSTRAINT "ProductionItems_UnitID_fkey" FOREIGN KEY ("UnitID") REFERENCES "Units"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockAlerts" ADD CONSTRAINT "StockAlerts_ProductID_fkey" FOREIGN KEY ("ProductID") REFERENCES "Products"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockAlerts" ADD CONSTRAINT "StockAlerts_AlertTypeID_fkey" FOREIGN KEY ("AlertTypeID") REFERENCES "AlertTypes"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductImages" ADD CONSTRAINT "ProductImages_ProductID_fkey" FOREIGN KEY ("ProductID") REFERENCES "Products"("ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductBarcodes" ADD CONSTRAINT "ProductBarcodes_ProductID_fkey" FOREIGN KEY ("ProductID") REFERENCES "Products"("ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandLogos" ADD CONSTRAINT "BrandLogos_BrandID_fkey" FOREIGN KEY ("BrandID") REFERENCES "Brands"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationSettings" ADD CONSTRAINT "NotificationSettings_UserID_fkey" FOREIGN KEY ("UserID") REFERENCES "Users"("ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationSettings" ADD CONSTRAINT "NotificationSettings_TypeID_fkey" FOREIGN KEY ("TypeID") REFERENCES "NotificationTypes"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employees" ADD CONSTRAINT "Employees_DepartmentID_fkey" FOREIGN KEY ("DepartmentID") REFERENCES "Departments"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employees" ADD CONSTRAINT "Employees_PositionID_fkey" FOREIGN KEY ("PositionID") REFERENCES "Positions"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employees" ADD CONSTRAINT "Employees_StatusID_fkey" FOREIGN KEY ("StatusID") REFERENCES "EmployeeStatuses"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendances" ADD CONSTRAINT "Attendances_EmployeeID_fkey" FOREIGN KEY ("EmployeeID") REFERENCES "Employees"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendances" ADD CONSTRAINT "Attendances_StatusID_fkey" FOREIGN KEY ("StatusID") REFERENCES "AttendanceStatuses"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payrolls" ADD CONSTRAINT "Payrolls_EmployeeID_fkey" FOREIGN KEY ("EmployeeID") REFERENCES "Employees"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Loans" ADD CONSTRAINT "Loans_EmployeeID_fkey" FOREIGN KEY ("EmployeeID") REFERENCES "Employees"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Loans" ADD CONSTRAINT "Loans_LoanTypeID_fkey" FOREIGN KEY ("LoanTypeID") REFERENCES "LoanTypes"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Loans" ADD CONSTRAINT "Loans_StatusID_fkey" FOREIGN KEY ("StatusID") REFERENCES "LoanStatuses"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoanInstallments" ADD CONSTRAINT "LoanInstallments_LoanID_fkey" FOREIGN KEY ("LoanID") REFERENCES "Loans"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Leaves" ADD CONSTRAINT "Leaves_EmployeeID_fkey" FOREIGN KEY ("EmployeeID") REFERENCES "Employees"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Leaves" ADD CONSTRAINT "Leaves_TypeID_fkey" FOREIGN KEY ("TypeID") REFERENCES "LeaveTypes"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Leaves" ADD CONSTRAINT "Leaves_ApprovedByID_fkey" FOREIGN KEY ("ApprovedByID") REFERENCES "Users"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Leaves" ADD CONSTRAINT "Leaves_StatusID_fkey" FOREIGN KEY ("StatusID") REFERENCES "LeaveStatuses"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveBalances" ADD CONSTRAINT "LeaveBalances_EmployeeID_fkey" FOREIGN KEY ("EmployeeID") REFERENCES "Employees"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveBalances" ADD CONSTRAINT "LeaveBalances_TypeID_fkey" FOREIGN KEY ("TypeID") REFERENCES "LeaveTypes"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notifications" ADD CONSTRAINT "Notifications_UserID_fkey" FOREIGN KEY ("UserID") REFERENCES "Users"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notifications" ADD CONSTRAINT "Notifications_TypeID_fkey" FOREIGN KEY ("TypeID") REFERENCES "NotificationTypes"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

