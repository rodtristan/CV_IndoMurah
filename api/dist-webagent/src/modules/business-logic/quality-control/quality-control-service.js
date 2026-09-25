"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QualityControlService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/prisma/prisma-service");
const client_1 = require("@prisma/client");
const number_1 = require("../../../common/utils/number");
const date_range_1 = require("../shared/date-range");
let QualityControlService = class QualityControlService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createQCInspection(dto, UserId) {
        const inspectionNumber = await this.generateInspectionNumber(dto.InspectionType);
        const pendingStatus = await this.prisma.transactionStatus.findFirst({
            where: { Code: 'PENDING' },
        });
        const Inspection = await this.prisma.$transaction(async (tx) => {
            const newInspection = await tx.qCInspection.create({
                data: {
                    InspectionNumber: inspectionNumber,
                    InspectionType: dto.InspectionType,
                    InspectionDate: new Date(dto.InspectionDate),
                    SupplierID: dto.SupplierId || null,
                    ProductionID: dto.ProductionId || null,
                    WarehouseID: dto.WarehouseId || null,
                    ReferenceNumber: dto.ReferenceNumber,
                    StatusID: pendingStatus?.ID || 1,
                    Notes: dto.Notes,
                    CreatedByID: UserId,
                },
            });
            await tx.qCInspectionItem.createMany({
                data: dto.Items.map((item) => ({
                    QCInspectionID: newInspection.ID,
                    ProductID: item.ProductId,
                    BatchNumber: item.BatchNumber,
                    Quantity: new client_1.Prisma.Decimal(item.Quantity),
                    UnitID: item.UnitId,
                })),
            });
            return newInspection;
        });
        return {
            success: true,
            Inspection: {
                ID: Inspection.ID,
                InspectionNumber: Inspection.InspectionNumber,
                InspectionType: Inspection.InspectionType,
                InspectionDate: Inspection.InspectionDate,
                Status: pendingStatus?.Name || 'Pending',
                itemCount: dto.Items.length,
            },
        };
    }
    async recordQCResults(InspectionId, Results, UserId) {
        const Inspection = await this.prisma.qCInspection.findUnique({
            where: { ID: InspectionId },
            include: { Items: true },
        });
        if (!Inspection) {
            throw new common_1.NotFoundException('QC Inspection not found');
        }
        const completedStatus = await this.prisma.transactionStatus.findFirst({
            where: { Code: 'COMPLETED' },
        });
        let TotalInspected = 0;
        let TotalPassed = 0;
        let TotalRejected = 0;
        const updateResults = await this.prisma.$transaction(async (tx) => {
            const itemResults = [];
            for (const Result of Results) {
                const item = Inspection.Items.find((i) => i.ID === Result.itemId);
                if (!item) {
                    throw new common_1.BadRequestException(`Inspection item ${Result.itemId} not found`);
                }
                const rejectedQty = Result.InspectedQuantity - Result.PassedQuantity;
                await tx.qCInspectionItem.update({
                    where: { ID: Result.itemId },
                    data: {
                        InspectedQuantity: new client_1.Prisma.Decimal(Result.InspectedQuantity),
                        PassedQuantity: new client_1.Prisma.Decimal(Result.PassedQuantity),
                        RejectedQuantity: new client_1.Prisma.Decimal(rejectedQty),
                        Result: Result.Result,
                        RejectionReason: Result.RejectionReason,
                        Notes: Result.Notes,
                        InspectedByID: UserId,
                        InspectedAt: new Date(),
                    },
                });
                TotalInspected += Result.InspectedQuantity;
                TotalPassed += Result.PassedQuantity;
                TotalRejected += rejectedQty;
                itemResults.push({
                    itemId: Result.itemId,
                    inspectedQuantity: Result.InspectedQuantity,
                    passedQuantity: Result.PassedQuantity,
                    rejectedQuantity: rejectedQty,
                    Result: Result.Result,
                });
                if (Result.Result === 'PASS') {
                }
                else if (Result.Result === 'FAIL') {
                }
                else if (Result.Result === 'CONDITIONAL_PASS') {
                }
            }
            const overallResult = TotalRejected === 0 ? 'PASS' : TotalPassed === 0 ? 'FAIL' : 'CONDITIONAL_PASS';
            await tx.qCInspection.update({
                where: { ID: InspectionId },
                data: {
                    StatusID: completedStatus?.ID || 2,
                    OverallResult: overallResult,
                    TotalInspected: new client_1.Prisma.Decimal(TotalInspected),
                    TotalPassed: new client_1.Prisma.Decimal(TotalPassed),
                    TotalRejected: new client_1.Prisma.Decimal(TotalRejected),
                },
            });
            return itemResults;
        });
        return {
            success: true,
            InspectionId,
            InspectionNumber: Inspection.InspectionNumber,
            Results: updateResults,
            Summary: {
                TotalInspected,
                TotalPassed,
                TotalRejected,
                passRate: TotalInspected > 0 ? (TotalPassed / TotalInspected) * 100 : 0,
                overallResult: TotalRejected === 0 ? 'PASS' : TotalPassed === 0 ? 'FAIL' : 'CONDITIONAL_PASS',
            },
        };
    }
    async getQCInspection(InspectionId) {
        const Inspection = await this.prisma.qCInspection.findUnique({
            where: { ID: InspectionId },
            include: {
                Supplier: true,
                Production: true,
                Warehouse: true,
                Status: true,
                Items: { include: { Product: true, Unit: true } },
                Inspector: true,
            },
        });
        if (!Inspection) {
            throw new common_1.NotFoundException('QC Inspection not found');
        }
        return {
            ID: Inspection.ID,
            InspectionNumber: Inspection.InspectionNumber,
            InspectionType: Inspection.InspectionType,
            InspectionDate: Inspection.InspectionDate,
            Supplier: Inspection.Supplier?.Name,
            Production: Inspection.Production?.Code,
            Warehouse: Inspection.Warehouse?.Name,
            referenceNumber: Inspection.ReferenceNumber,
            Status: Inspection.Status?.Name,
            overallResult: Inspection.OverallResult,
            TotalInspected: (0, number_1.number)(Inspection.TotalInspected),
            TotalPassed: (0, number_1.number)(Inspection.TotalPassed),
            TotalRejected: (0, number_1.number)(Inspection.TotalRejected),
            Notes: Inspection.Notes,
            inspector: Inspection.Inspector?.Name,
            inspectedAt: Inspection.InspectedAt,
            items: Inspection.Items.map((item) => ({
                ID: item.ID,
                ProductId: item.ProductID,
                ProductName: item.Product?.Name,
                batchNumber: item.BatchNumber,
                Quantity: (0, number_1.number)(item.Quantity),
                Unit: item.Unit?.Name,
                inspectedQuantity: item.InspectedQuantity ? Number(item.InspectedQuantity) : null,
                passedQuantity: item.PassedQuantity ? Number(item.PassedQuantity) : null,
                rejectedQuantity: item.RejectedQuantity ? Number(item.RejectedQuantity) : null,
                Result: item.Result,
                rejectionReason: item.RejectionReason,
                Notes: item.Notes,
            })),
        };
    }
    async listQCInspections(dto) {
        const where = {};
        if (dto.StartDate || dto.EndDate) {
            where.InspectionDate = {};
            if (dto.StartDate) {
                where.InspectionDate.gte = new Date(dto.StartDate);
            }
            if (dto.EndDate) {
                where.InspectionDate.lte = new Date(dto.EndDate);
            }
        }
        if (dto.inspectionType) {
            where.InspectionType = dto.inspectionType;
        }
        if (dto.SupplierId) {
            where.SupplierID = dto.SupplierId;
        }
        if (dto.ProductionId) {
            where.ProductionID = dto.ProductionId;
        }
        if (dto.WarehouseId) {
            where.WarehouseID = dto.WarehouseId;
        }
        if (dto.Result) {
            where.OverallResult = dto.Result;
        }
        const Inspections = await this.prisma.qCInspection.findMany({
            where,
            include: {
                Supplier: true,
                Production: true,
                Warehouse: true,
                Status: true,
                Items: true,
            },
            orderBy: { InspectionDate: 'desc' },
        });
        return Inspections.map((ins) => ({
            ID: ins.ID,
            InspectionNumber: ins.InspectionNumber,
            InspectionType: ins.InspectionType,
            InspectionDate: ins.InspectionDate,
            Supplier: ins.Supplier?.Name,
            Production: ins.Production?.Code,
            Warehouse: ins.Warehouse?.Name,
            Status: ins.Status?.Name,
            overallResult: ins.OverallResult,
            TotalInspected: ins.TotalInspected ? Number(ins.TotalInspected) : 0,
            TotalPassed: ins.TotalPassed ? Number(ins.TotalPassed) : 0,
            TotalRejected: ins.TotalRejected ? Number(ins.TotalRejected) : 0,
            itemCount: ins.Items.length,
        }));
    }
    async createDefectReport(dto, UserId) {
        const defectNumber = await this.generateDefectNumber();
        const defect = await this.prisma.defectReport.create({
            data: {
                DefectNumber: defectNumber,
                ProductID: dto.ProductId,
                Quantity: new client_1.Prisma.Decimal(dto.Quantity),
                DefectType: dto.defectType,
                Severity: dto.Severity || 'MEDIUM',
                ProductionID: dto.ProductionId || null,
                SaleID: dto.SaleId || null,
                Description: dto.Description,
                RootCause: dto.RootCause,
                CorrectiveAction: dto.CorrectiveAction,
                Status: 'OPEN',
                ReportedByID: UserId,
            },
            include: { Product: true },
        });
        return {
            success: true,
            defect: {
                ID: defect.ID,
                defectNumber: defect.DefectNumber,
                ProductName: defect.Product?.Name,
                Quantity: (0, number_1.number)(defect.Quantity),
                defectType: defect.DefectType,
                severity: defect.Severity,
                Status: defect.Status,
            },
        };
    }
    async getDefectReport(defectId) {
        const defect = await this.prisma.defectReport.findUnique({
            where: { ID: defectId },
            include: {
                Product: true,
                Production: true,
                Sale: true,
                Reporter: true,
            },
        });
        if (!defect) {
            throw new common_1.NotFoundException('Defect Report not found');
        }
        return {
            ID: defect.ID,
            defectNumber: defect.DefectNumber,
            ProductName: defect.Product?.Name,
            ProductCode: defect.Product?.Code,
            Quantity: (0, number_1.number)(defect.Quantity),
            defectType: defect.DefectType,
            severity: defect.Severity,
            ProductionNumber: defect.Production?.Code,
            SaleNumber: defect.Sale?.Code,
            Description: defect.Description,
            rootCause: defect.RootCause,
            correctiveAction: defect.CorrectiveAction,
            Status: defect.Status,
            ReportedBy: defect.Reporter?.Name,
            ReportedAt: defect.CreatedAt,
        };
    }
    async listDefectReports(dto) {
        const where = {};
        if (dto.StartDate || dto.EndDate) {
            where.CreatedAt = {};
            if (dto.StartDate) {
                where.CreatedAt.gte = new Date(dto.StartDate);
            }
            if (dto.EndDate) {
                where.CreatedAt.lte = new Date(dto.EndDate);
            }
        }
        if (dto.DefectType) {
            where.DefectType = dto.DefectType;
        }
        if (dto.Severity) {
            where.Severity = dto.Severity;
        }
        if (dto.Status) {
            where.Status = dto.Status;
        }
        if (dto.ProductId) {
            where.ProductID = dto.ProductId;
        }
        const defects = await this.prisma.defectReport.findMany({
            where,
            include: {
                Product: true,
            },
            orderBy: { CreatedAt: 'desc' },
        });
        return defects.map((d) => ({
            ID: d.ID,
            defectNumber: d.DefectNumber,
            ProductName: d.Product?.Name,
            Quantity: (0, number_1.number)(d.Quantity),
            defectType: d.DefectType,
            severity: d.Severity,
            Status: d.Status,
            ReportedAt: d.CreatedAt,
        }));
    }
    async updateDefectStatus(defectId, Status, UserId) {
        const defect = await this.prisma.defectReport.findUnique({
            where: { ID: defectId },
        });
        if (!defect) {
            throw new common_1.NotFoundException('Defect Report not found');
        }
        const updated = await this.prisma.defectReport.update({
            where: { ID: defectId },
            data: {
                Status: Status,
                ResolvedByID: Status === 'RESOLVED' ? UserId : undefined,
                ResolvedAt: Status === 'RESOLVED' ? new Date() : undefined,
            },
        });
        return {
            success: true,
            defectId,
            Status: updated.Status,
        };
    }
    async getDefectAnalytics(startDate, endDate) {
        const { start, end } = (0, date_range_1.resolveDateRange)(startDate, endDate);
        const defects = await this.prisma.defectReport.findMany({
            where: {
                CreatedAt: { gte: start, lte: end },
            },
            include: { Product: true },
        });
        const byDefectType = {};
        const bySeverity = {};
        const byProduct = {};
        const byMonth = {};
        for (const defect of defects) {
            byDefectType[defect.DefectType] = (byDefectType[defect.DefectType] || 0) + 1;
            bySeverity[defect.Severity] = (bySeverity[defect.Severity] || 0) + 1;
            const ProductName = defect.Product?.Name || 'Unknown';
            if (!byProduct[ProductName]) {
                byProduct[ProductName] = { ProductName, Count: 0, TotalQuantity: 0 };
            }
            byProduct[ProductName].Count += 1;
            byProduct[ProductName].TotalQuantity += Number(defect.Quantity);
            const month = defect.CreatedAt.toISOString().substring(0, 7);
            byMonth[month] = (byMonth[month] || 0) + 1;
        }
        const openDefects = defects.filter((d) => d.Status === 'OPEN').length;
        const resolvedDefects = defects.filter((d) => d.Status === 'RESOLVED').length;
        return {
            period: { startDate, endDate },
            Summary: {
                TotalDefects: defects.length,
                openDefects,
                resolvedDefects,
                resolutionRate: defects.length > 0 ? (resolvedDefects / defects.length) * 100 : 0,
                TotalDefectiveQuantity: defects.reduce((sum, d) => sum + Number(d.Quantity), 0),
            },
            byDefectType: Object.entries(byDefectType).map(([Type, Count]) => ({ Type, Count })),
            bySeverity: Object.entries(bySeverity).map(([severity, Count]) => ({ severity, Count })),
            topDefectiveProducts: Object.values(byProduct)
                .sort((a, b) => b.Count - a.Count)
                .slice(0, 10),
            byMonth: Object.entries(byMonth)
                .sort()
                .map(([month, Count]) => ({ month, Count })),
        };
    }
    async createQCStandard(dto, UserId) {
        const Standard = await this.prisma.qCStandard.create({
            data: {
                ProductID: dto.ProductId,
                InspectionType: dto.InspectionType,
                SampleSize: dto.SampleSize,
                AQL: dto.AcceptableQualityLevel,
                MinimumPassingScore: dto.MinimumPassingScore,
            },
        });
        if (dto.CheckPoints && dto.CheckPoints.length > 0) {
            await this.prisma.qCStandardCheckpoint.createMany({
                data: dto.CheckPoints.map((cp, index) => ({
                    QCStandardID: Standard.ID,
                    Name: cp.Name,
                    Description: cp.Description,
                    IsMandatory: cp.IsMandatory ?? true,
                    Weight: cp.Weight || 1,
                    SortOrder: index + 1,
                })),
            });
        }
        return {
            success: true,
            Standard: {
                ID: Standard.ID,
                ProductId: Standard.ProductID,
                InspectionType: Standard.InspectionType,
                sampleSize: Standard.SampleSize,
                aql: Standard.AQL,
                minimumPassingScore: Standard.MinimumPassingScore,
            },
        };
    }
    async getQCStandard(ProductId, InspectionType) {
        ProductId = (0, date_range_1.requireIntParam)(ProductId, 'productId');
        const Standard = await this.prisma.qCStandard.findFirst({
            where: { ProductID: ProductId, InspectionType: InspectionType },
            include: { Checkpoints: { orderBy: { SortOrder: 'asc' } } },
        });
        if (!Standard) {
            return {
                hasStandard: false,
                ProductId,
                InspectionType,
            };
        }
        return {
            hasStandard: true,
            ID: Standard.ID,
            ProductId: Standard.ProductID,
            InspectionType: Standard.InspectionType,
            sampleSize: Standard.SampleSize,
            aql: Standard.AQL,
            minimumPassingScore: Standard.MinimumPassingScore,
            CheckPoints: Standard.Checkpoints.map((cp) => ({
                ID: cp.ID,
                Name: cp.Name,
                Description: cp.Description,
                isMandatory: cp.IsMandatory,
                weight: cp.Weight,
            })),
        };
    }
    async createCalibration(dto, UserId) {
        const nextCalibrationDate = dto.NextCalibrationDate
            ? new Date(dto.NextCalibrationDate)
            : dto.CalibrationInterval
                ? new Date(Date.now() + dto.CalibrationInterval * 24 * 60 * 60 * 1000)
                : null;
        const Calibration = await this.prisma.calibration.create({
            data: {
                EquipmentName: dto.EquipmentName,
                EquipmentCode: dto.EquipmentCode ?? '',
                CalibrationInterval: dto.CalibrationInterval,
                LastCalibrationDate: dto.LastCalibrationDate ? new Date(dto.LastCalibrationDate) : new Date(),
                NextCalibrationDate: nextCalibrationDate,
                Status: 'OK',
                CreatedByID: UserId,
            },
        });
        return {
            success: true,
            Calibration: {
                ID: Calibration.ID,
                equipmentName: Calibration.EquipmentName,
                equipmentCode: Calibration.EquipmentCode,
                lastCalibrationDate: Calibration.LastCalibrationDate,
                nextCalibrationDate: Calibration.NextCalibrationDate,
                Status: Calibration.Status,
            },
        };
    }
    async recordCalibrationResult(CalibrationId, Result, Notes, UserId) {
        const Calibration = await this.prisma.calibration.findUnique({
            where: { ID: CalibrationId },
        });
        if (!Calibration) {
            throw new common_1.NotFoundException('Calibration Record not found');
        }
        const nextDate = Calibration.CalibrationInterval
            ? new Date(Date.now() + Calibration.CalibrationInterval * 24 * 60 * 60 * 1000)
            : null;
        const updated = await this.prisma.calibration.update({
            where: { ID: CalibrationId },
            data: {
                LastCalibrationDate: new Date(),
                NextCalibrationDate: nextDate,
                LastResult: Result,
                LastResultNotes: Notes,
                Status: nextDate && nextDate < new Date() ? 'DUE' : 'OK',
            },
        });
        return {
            success: true,
            Calibration: {
                ID: updated.ID,
                equipmentName: updated.EquipmentName,
                lastCalibrationDate: updated.LastCalibrationDate,
                nextCalibrationDate: updated.NextCalibrationDate,
                lastResult: updated.LastResult,
                Status: updated.Status,
            },
        };
    }
    async listCalibrations(dto) {
        const where = {};
        if (dto.Status === 'DUE') {
            where.NextCalibrationDate = {
                lte: new Date(),
                gte: new Date(new Date().setHours(0, 0, 0, 0)),
            };
            where.Status = { not: 'OVERDUE' };
        }
        else if (dto.Status === 'OVERDUE') {
            where.NextCalibrationDate = { lt: new Date(new Date().setHours(0, 0, 0, 0)) };
        }
        const Calibrations = await this.prisma.calibration.findMany({
            where,
            orderBy: { NextCalibrationDate: 'asc' },
        });
        return Calibrations.map((c) => ({
            ID: c.ID,
            equipmentName: c.EquipmentName,
            equipmentCode: c.EquipmentCode,
            lastCalibrationDate: c.LastCalibrationDate,
            nextCalibrationDate: c.NextCalibrationDate,
            CalibrationInterval: c.CalibrationInterval,
            lastResult: c.LastResult,
            Status: c.Status,
            isOverdue: c.NextCalibrationDate ? c.NextCalibrationDate < new Date() : false,
        }));
    }
    async getQCPerformanceReport(startDate, endDate) {
        const { start, end } = (0, date_range_1.resolveDateRange)(startDate, endDate);
        const Inspections = await this.prisma.qCInspection.findMany({
            where: {
                InspectionDate: { gte: start, lte: end },
            },
            include: { Items: true },
        });
        const TotalInspections = Inspections.length;
        const passInspections = Inspections.filter((i) => i.OverallResult === 'PASS').length;
        const failInspections = Inspections.filter((i) => i.OverallResult === 'FAIL').length;
        const conditionalInspections = Inspections.filter((i) => i.OverallResult === 'CONDITIONAL_PASS').length;
        const TotalInspected = Inspections.reduce((sum, i) => sum + Number(i.TotalInspected || 0), 0);
        const TotalPassed = Inspections.reduce((sum, i) => sum + Number(i.TotalPassed || 0), 0);
        const TotalRejected = Inspections.reduce((sum, i) => sum + Number(i.TotalRejected || 0), 0);
        const byType = {};
        for (const ins of Inspections) {
            if (!byType[ins.InspectionType]) {
                byType[ins.InspectionType] = {
                    Type: ins.InspectionType,
                    Count: 0,
                    pass: 0,
                    fail: 0,
                    TotalInspected: 0,
                    TotalPassed: 0,
                    TotalRejected: 0,
                };
            }
            byType[ins.InspectionType].Count += 1;
            if (ins.OverallResult === 'PASS')
                byType[ins.InspectionType].pass += 1;
            if (ins.OverallResult === 'FAIL')
                byType[ins.InspectionType].fail += 1;
            byType[ins.InspectionType].TotalInspected += Number(ins.TotalInspected || 0);
            byType[ins.InspectionType].TotalPassed += Number(ins.TotalPassed || 0);
            byType[ins.InspectionType].TotalRejected += Number(ins.TotalRejected || 0);
        }
        return {
            period: { startDate, endDate },
            Summary: {
                TotalInspections,
                passRate: TotalInspections > 0 ? (passInspections / TotalInspections) * 100 : 0,
                failRate: TotalInspections > 0 ? (failInspections / TotalInspections) * 100 : 0,
                TotalItemsInspected: TotalInspected,
                TotalItemsPassed: TotalPassed,
                TotalItemsRejected: TotalRejected,
                itemPassRate: TotalInspected > 0 ? (TotalPassed / TotalInspected) * 100 : 0,
            },
            byType: Object.values(byType),
        };
    }
    async generateInspectionNumber(Type) {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const TypeCode = Type === 'INCOMING' ? 'INC' : Type === 'IN_PROCESS' ? 'PR' : 'FG';
        const prefix = `QC-${TypeCode}-${year}${month}`;
        const lastInspection = await this.prisma.qCInspection.findFirst({
            where: { InspectionNumber: { startsWith: prefix } },
            orderBy: { InspectionNumber: 'desc' },
            select: { InspectionNumber: true },
        });
        let nextNumber = 1;
        if (lastInspection) {
            const lastSeq = parseInt(lastInspection.InspectionNumber.split('-').pop() || '0', 10);
            nextNumber = lastSeq + 1;
        }
        return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
    }
    async generateDefectNumber() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const prefix = `DEF-${year}${month}`;
        const lastDefect = await this.prisma.defectReport.findFirst({
            where: { DefectNumber: { startsWith: prefix } },
            orderBy: { DefectNumber: 'desc' },
            select: { DefectNumber: true },
        });
        let nextNumber = 1;
        if (lastDefect) {
            const lastSeq = parseInt(lastDefect.DefectNumber.split('-').pop() || '0', 10);
            nextNumber = lastSeq + 1;
        }
        return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
    }
};
exports.QualityControlService = QualityControlService;
exports.QualityControlService = QualityControlService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], QualityControlService);
