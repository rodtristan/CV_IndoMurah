// Node.js script to convert all DTO files from camelCase to PascalCase
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'modules', 'business-logic');

// Common camelCase patterns that should become PascalCase
const patterns = [
    // ID properties
    [/accountTypeId/g, 'AccountTypeId'],
    [/parentId/g, 'ParentId'],
    [/accountId/g, 'AccountId'],
    [/productId/g, 'ProductId'],
    [/customerId/g, 'CustomerId'],
    [/supplierId/g, 'SupplierId'],
    [/warehouseId/g, 'WarehouseId'],
    [/salesPersonId/g, 'SalesPersonId'],
    [/salespersonId/g, 'SalespersonId'],
    [/assignedToId/g, 'AssignedToId'],
    [/purchaseOrderId/g, 'PurchaseOrderId'],
    [/purchaseId/g, 'PurchaseId'],
    [/saleId/g, 'SaleId'],
    [/saleItemId/g, 'SaleItemId'],
    [/categoryId/g, 'CategoryId'],
    [/brandId/g, 'BrandId'],
    [/unitId/g, 'UnitId'],
    [/methodId/g, 'MethodId'],
    [/typeId/g, 'TypeId'],
    [/statusId/g, 'StatusId'],
    [/roleId/g, 'RoleId'],
    [/menuId/g, 'MenuId'],
    [/userId/g, 'UserId'],
    [/orderId/g, 'OrderId'],
    [/employeeId/g, 'EmployeeId'],
    [/departmentId/g, 'DepartmentId'],
    [/positionId/g, 'PositionId'],
    [/voucherId/g, 'VoucherId'],
    [/bomId/g, 'BOMId'],
    [/loanTypeId/g, 'LoanTypeId'],
    [/assetCategoryId/g, 'AssetCategoryId'],
    [/expenseCategoryId/g, 'ExpenseCategoryId'],
    [/serviceCategoryId/g, 'ServiceCategoryId'],
    [/leaveTypeId/g, 'LeaveTypeId'],
    [/productionId/g, 'ProductionId'],
    [/customerGroupId/g, 'CustomerGroupId'],
    [/refundMethodId/g, 'RefundMethodId'],
    [/fromWarehouseId/g, 'FromWarehouseId'],
    [/toWarehouseId/g, 'ToWarehouseId'],
    [/purchaseOrderId/g, 'PurchaseOrderId'],
    // Price/Amount properties
    [/unitPrice/g, 'UnitPrice'],
    [/purchasePrice/g, 'PurchasePrice'],
    [/sellingPrice/g, 'SellingPrice'],
    [/costPrice/g, 'CostPrice'],
    [/discountPercent/g, 'DiscountPercent'],
    [/discountAmount/g, 'DiscountAmount'],
    [/taxPercent/g, 'TaxPercent'],
    [/taxAmount/g, 'TaxAmount'],
    [/taxRate/g, 'TaxRate'],
    [/downPayment/g, 'DownPayment'],
    [/paymentMethodId/g, 'PaymentMethodId'],
    [/paymentAmount/g, 'PaymentAmount'],
    [/paymentDate/g, 'PaymentDate'],
    [/paymentStatus/g, 'PaymentStatus'],
    [/totalAmount/g, 'TotalAmount'],
    [/totalItems/g, 'TotalItems'],
    [/totalCost/g, 'TotalCost'],
    [/unitCost/g, 'UnitCost'],
    [/defaultCost/g, 'DefaultCost'],
    [/currentValue/g, 'CurrentValue'],
    [/totalDebt/g, 'TotalDebt'],
    [/totalPurchase/g, 'TotalPurchase'],
    [/totalPaid/g, 'TotalPaid'],
    [/subTotal/g, 'SubTotal'],
    [/cashAmount/g, 'CashAmount'],
    [/changeAmount/g, 'ChangeAmount'],
    [/remainingAmount/g, 'RemainingAmount'],
    [/paidAmount/g, 'PaidAmount'],
    [/remainingBalance/g, 'RemainingBalance'],
    [/overdueAmount/g, 'OverdueAmount'],
    [/totalReturn/g, 'TotalReturn'],
    [/allocatedQuantity/g, 'AllocatedQuantity'],
    [/usedQuantity/g, 'UsedQuantity'],
    [/minimumStock/g, 'MinimumStock'],
    [/currentStock/g, 'CurrentStock'],
    [/systemStock/g, 'SystemStock'],
    [/countedStock/g, 'CountedStock'],
    [/availableStock/g, 'AvailableStock'],
    [/maxDiscountAmount/g, 'MaxDiscountAmount'],
    [/minPurchaseAmount/g, 'MinPurchaseAmount'],
    [/defaultLaborCost/g, 'DefaultLaborCost'],
    [/estimatedCost/g, 'EstimatedCost'],
    [/estimatedDuration/g, 'EstimatedDuration'],
    [/totalComponentCost/g, 'TotalComponentCost'],
    // Boolean properties
    [/isActive/g, 'IsActive'],
    [/isPaid/g, 'IsPaid'],
    [/isReturn/g, 'IsReturn'],
    [/isExchange/g, 'IsExchange'],
    [/isPosted/g, 'IsPosted'],
    [/isOverdue/g, 'IsOverdue'],
    // Date properties
    [/startDate/g, 'StartDate'],
    [/endDate/g, 'EndDate'],
    [/dueDate/g, 'DueDate'],
    [/workOrderDate/g, 'WorkOrderDate'],
    [/assemblyDate/g, 'AssemblyDate'],
    [/postedAt/g, 'PostedAt'],
    [/periodEndDate/g, 'PeriodEndDate'],
    // Other properties
    [/sortOrder/g, 'SortOrder'],
    [/itemCount/g, 'ItemCount'],
    [/priority/g, 'Priority'],
    [/referenceNumber/g, 'ReferenceNumber'],
    [/referenceType/g, 'ReferenceType'],
    [/referenceId/g, 'ReferenceId'],
    [/pointBalance/g, 'PointBalance'],
    [/totalReceivable/g, 'TotalReceivable'],
    [/pointMultiplier/g, 'PointMultiplier'],
    [/maxReturnable/g, 'MaxReturnable'],
    [/originalQuantity/g, 'OriginalQuantity'],
    [/alreadyReturned/g, 'AlreadyReturned'],
    [/quantity/g, 'Quantity'],
    [/overdueOnly/g, 'OverdueOnly'],
    [/pendingOnly/g, 'PendingOnly'],
    [/unreadOnly/g, 'UnreadOnly'],
    [/hasPoints/g, 'HasPoints'],
    [/hasReceivable/g, 'HasReceivable'],
    [/usageLimit/g, 'UsageLimit'],
    [/usedCount/g, 'UsedCount'],
    [/wastePercent/g, 'WastePercent'],
    [/depreciationMethodId/g, 'DepreciationMethodId'],
    [/usefulLife/g, 'UsefulLife'],
    [/salvageValue/g, 'SalvageValue'],
    [/currentDebit/g, 'CurrentDebit'],
    [/currentCredit/g, 'CurrentCredit'],
    [/currentBalance/g, 'CurrentBalance'],
    [/journalId/g, 'JournalId'],
    [/journalNumber/g, 'JournalNumber'],
    [/totalDebit/g, 'TotalDebit'],
    [/totalCredit/g, 'TotalCredit'],
    [/reversedEntryId/g, 'ReversedEntryId'],
    [/sourceDocumentId/g, 'SourceDocumentId'],
    [/sourceDocumentType/g, 'SourceDocumentType'],
    [/debitCredit/g, 'DebitCredit'],
    [/lineNumber/g, 'LineNumber'],
    [/totalPages/g, 'TotalPages'],
    [/currentPage/g, 'CurrentPage'],
    [/pageSize/g, 'PageSize'],
    [/searchQuery/g, 'SearchQuery'],
    [/sortBy/g, 'SortBy'],
    [/transactionCount/g, 'TransactionCount'],
    [/salesCount/g, 'SalesCount'],
    [/daysOverdue/g, 'DaysOverdue'],
    [/ageBucket/g, 'AgeBucket'],
    [/overdueCount/g, 'OverdueCount'],
    [/oldestDueDate/g, 'OldestDueDate'],
    [/previousBalance/g, 'PreviousBalance'],
    [/newBalance/g, 'NewBalance'],
    [/adjustment/g, 'Adjustment'],
    [/completedQuantity/g, 'CompletedQuantity'],
    [/allocatedHours/g, 'AllocatedHours'],
    [/search/g, 'Search'],
    [/reference/g, 'Reference'],
    [/date/g, 'Date'],
    [/amount/g, 'Amount'],
    [/description/g, 'Description'],
    [/code/g, 'Code'],
    [/name/g, 'Name'],
    [/notes/g, 'Notes'],
    [/items/g, 'Items'],
    [/type/g, 'Type'],
    [/components/g, 'Components'],
    [/defaultCost/g, 'DefaultCost'],
];

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    for (const [pattern, replacement] of patterns) {
        content = content.replace(pattern, replacement);
    }

    if (content !== original) {
        fs.writeFileSync(filePath, content);
        console.log(`Fixed: ${path.relative(dir, filePath)}`);
        return true;
    }
    return false;
}

function walkDir(dir) {
    let fixedCount = 0;
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            fixedCount += walkDir(fullPath);
        } else if (file.endsWith('.dto.ts')) {
            if (processFile(fullPath)) {
                fixedCount++;
            }
        }
    }

    return fixedCount;
}

console.log('=== Converting ALL DTO Properties to PascalCase ===\n');
const totalFixed = walkDir(dir);
console.log(`\nFixed ${totalFixed} DTO files`);
