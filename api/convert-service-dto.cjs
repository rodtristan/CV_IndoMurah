// Node.js script to convert all service files DTO property accesses to PascalCase
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'modules', 'business-logic');

// Pattern: dto.propertyName -> dto.PropertyName
const patterns = [
    // ID properties - dto access
    [/dto\.accountTypeId/g, 'dto.AccountTypeId'],
    [/dto\.parentId/g, 'dto.ParentId'],
    [/dto\.accountId/g, 'dto.AccountId'],
    [/dto\.productId/g, 'dto.ProductId'],
    [/dto\.customerId/g, 'dto.CustomerId'],
    [/dto\.supplierId/g, 'dto.SupplierId'],
    [/dto\.warehouseId/g, 'dto.WarehouseId'],
    [/dto\.salesPersonId/g, 'dto.SalesPersonId'],
    [/dto\.assignedToId/g, 'dto.AssignedToId'],
    [/dto\.purchaseOrderId/g, 'dto.PurchaseOrderId'],
    [/dto\.purchaseId/g, 'dto.PurchaseId'],
    [/dto\.saleId/g, 'dto.SaleId'],
    [/dto\.saleItemId/g, 'dto.SaleItemId'],
    [/dto\.categoryId/g, 'dto.CategoryId'],
    [/dto\.brandId/g, 'dto.BrandId'],
    [/dto\.unitId/g, 'dto.UnitId'],
    [/dto\.methodId/g, 'dto.MethodId'],
    [/dto\.typeId/g, 'dto.TypeId'],
    [/dto\.statusId/g, 'dto.StatusId'],
    [/dto\.roleId/g, 'dto.RoleId'],
    [/dto\.menuId/g, 'dto.MenuId'],
    [/dto\.userId/g, 'dto.UserId'],
    [/dto\.employeeId/g, 'dto.EmployeeId'],
    [/dto\.departmentId/g, 'dto.DepartmentId'],
    [/dto\.positionId/g, 'dto.PositionId'],
    [/dto\.bomId/g, 'dto.BOMId'],
    [/dto\.voucherId/g, 'dto.VoucherId'],
    // Price/Amount properties
    [/dto\.unitPrice/g, 'dto.UnitPrice'],
    [/dto\.purchasePrice/g, 'dto.PurchasePrice'],
    [/dto\.sellingPrice/g, 'dto.SellingPrice'],
    [/dto\.costPrice/g, 'dto.CostPrice'],
    [/dto\.discountPercent/g, 'dto.DiscountPercent'],
    [/dto\.discountAmount/g, 'dto.DiscountAmount'],
    [/dto\.taxPercent/g, 'dto.TaxPercent'],
    [/dto\.taxAmount/g, 'dto.TaxAmount'],
    [/dto\.taxRate/g, 'dto.TaxRate'],
    [/dto\.downPayment/g, 'dto.DownPayment'],
    [/dto\.paymentMethodId/g, 'dto.PaymentMethodId'],
    [/dto\.paymentAmount/g, 'dto.PaymentAmount'],
    [/dto\.paymentDate/g, 'dto.PaymentDate'],
    [/dto\.paymentStatus/g, 'dto.PaymentStatus'],
    [/dto\.totalAmount/g, 'dto.TotalAmount'],
    [/dto\.subTotal/g, 'dto.SubTotal'],
    [/dto\.cashAmount/g, 'dto.CashAmount'],
    [/dto\.changeAmount/g, 'dto.ChangeAmount'],
    [/dto\.remainingAmount/g, 'dto.RemainingAmount'],
    // Boolean properties
    [/dto\.isActive/g, 'dto.IsActive'],
    [/dto\.isPaid/g, 'dto.IsPaid'],
    [/dto\.isReturn/g, 'dto.IsReturn'],
    [/dto\.isExchange/g, 'dto.IsExchange'],
    // Date properties
    [/dto\.startDate/g, 'dto.StartDate'],
    [/dto\.endDate/g, 'dto.EndDate'],
    [/dto\.dueDate/g, 'dto.DueDate'],
    [/dto\.workOrderDate/g, 'dto.WorkOrderDate'],
    [/dto\.assemblyDate/g, 'dto.AssemblyDate'],
    // Other properties
    [/dto\.sortOrder/g, 'dto.SortOrder'],
    [/dto\.itemCount/g, 'dto.ItemCount'],
    [/dto\.priority/g, 'dto.Priority'],
    [/dto\.referenceNumber/g, 'dto.ReferenceNumber'],
    [/dto\.referenceType/g, 'dto.ReferenceType'],
    [/dto\.pointBalance/g, 'dto.PointBalance'],
    [/dto\.totalReceivable/g, 'dto.TotalReceivable'],
    [/dto\.quantity/g, 'dto.Quantity'],
    [/dto\.description/g, 'dto.Description'],
    [/dto\.code/g, 'dto.Code'],
    [/dto\.name/g, 'dto.Name'],
    [/dto\.notes/g, 'dto.Notes'],
    [/dto\.amount/g, 'dto.Amount'],
    [/dto\.date/g, 'dto.Date'],
    [/dto\.search/g, 'dto.Search'],
    [/dto\.items/g, 'dto.Items'],
    [/dto\.components/g, 'dto.Components'],
    [/dto\.type/g, 'dto.Type'],
    [/dto\.pendingOnly/g, 'dto.PendingOnly'],
    [/dto\.overdueOnly/g, 'dto.OverdueOnly'],
    [/dto\.unreadOnly/g, 'dto.UnreadOnly'],
    [/dto\.hasPoints/g, 'dto.HasPoints'],
    [/dto\.hasReceivable/g, 'dto.HasReceivable'],
    [/dto\.salesPersonId/g, 'dto.SalesPersonId'],
    [/dto\.minPurchaseAmount/g, 'dto.MinPurchaseAmount'],
    [/dto\.maxDiscountAmount/g, 'dto.MaxDiscountAmount'],
    [/dto\.usageLimit/g, 'dto.UsageLimit'],
    [/dto\.usedCount/g, 'dto.UsedCount'],
    [/dto\.startDate/g, 'dto.StartDate'],
    [/dto\.endDate/g, 'dto.EndDate'],
    [/dto\.defaultLaborCost/g, 'dto.DefaultLaborCost'],
    [/dto\.estimatedDuration/g, 'dto.EstimatedDuration'],
    [/dto\.estimatedCost/g, 'dto.EstimatedCost'],
    [/dto\.serviceCategoryId/g, 'dto.ServiceCategoryId'],
    [/dto\.refundMethodId/g, 'dto.RefundMethodId'],
    [/dto\.fromWarehouseId/g, 'dto.FromWarehouseId'],
    [/dto\.toWarehouseId/g, 'dto.ToWarehouseId'],
    [/dto\.revenue/g, 'dto.Revenue'],
    [/dto\.profit/g, 'dto.Profit'],
    [/dto\.cost/g, 'dto.Cost'],
    [/dto\.reason/g, 'dto.Reason'],
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
    try {
        const files = fs.readdirSync(dir);

        for (const file of files) {
            const fullPath = path.join(dir, file);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                fixedCount += walkDir(fullPath);
            } else if (file.endsWith('-service.ts')) {
                if (processFile(fullPath)) {
                    fixedCount++;
                }
            }
        }
    } catch (e) {
        console.error(`Error in ${dir}: ${e.message}`);
    }

    return fixedCount;
}

console.log('=== Converting Service DTO Property Access to PascalCase ===\n');
const totalFixed = walkDir(dir);
console.log(`\nFixed ${totalFixed} service files`);
