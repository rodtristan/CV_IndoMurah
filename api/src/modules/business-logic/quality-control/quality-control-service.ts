import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma-service';
import { Prisma } from '@prisma/client'
import { number } from '../../../common/utils/number';
import { resolveDateRange, requireIntParam } from '../shared/date-range';
import {
  CreateQCInspectionDto,
  RecordQCResultDto,
  QCInspectionFilterDto,
  CreateDefectReportDto,
  DefectFilterDto,
  CreateQCStandardDto,
  CreateCalibrationDto,
  CalibrationFilterDto,
} from './quality-control.dto';

@Injectable()
export class QualityControlService {
  constructor(private prisma: PrismaService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // QC INSPECTION MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Create new QC Inspection
   * Flow: QC Staff membuat Inspection → inspect barang masuk/proses/hasil produksi
   */
  async createQCInspection(dto: CreateQCInspectionDto, UserId: string) {
    // generate Inspection Number
    const inspectionNumber = await this.generateInspectionNumber(dto.InspectionType);

    // Get pending Status
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

      // Create Inspection items
      await tx.qCInspectionItem.createMany({
        data: dto.Items.map((item) => ({
          QCInspectionID: newInspection.ID,
          ProductID: item.ProductId,
          BatchNumber: item.BatchNumber,
          Quantity: new Prisma.Decimal(item.Quantity),
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

  /**
   * Record QC Inspection Results
   * Flow: QC Staff input hasil Inspection → sistem update Status & stok
   */
  async recordQCResults(InspectionId: number, Results: RecordQCResultDto[], UserId: string) {
    const Inspection = await this.prisma.qCInspection.findUnique({
      where: { ID: InspectionId },
      include: { Items: true },
    });

    if (!Inspection) {
      throw new NotFoundException('QC Inspection not found');
    }

    // Get completed Status
    const completedStatus = await this.prisma.transactionStatus.findFirst({
      where: { Code: 'COMPLETED' },
    });

    // Calculate overall Result
    let TotalInspected = 0;
    let TotalPassed = 0;
    let TotalRejected = 0;

    const updateResults = await this.prisma.$transaction(async (tx) => {
      const itemResults: {
        itemId: number;
        inspectedQuantity: number;
        passedQuantity: number;
        rejectedQuantity: number;
        Result: string;
      }[] = [];

      for (const Result of Results) {
        const item = Inspection.Items.find((i) => i.ID === Result.itemId);
        if (!item) {
          throw new BadRequestException(`Inspection item ${Result.itemId} not found`);
        }

        const rejectedQty = Result.InspectedQuantity - Result.PassedQuantity;

        await tx.qCInspectionItem.update({
          where: { ID: Result.itemId },
          data: {
            InspectedQuantity: new Prisma.Decimal(Result.InspectedQuantity),
            PassedQuantity: new Prisma.Decimal(Result.PassedQuantity),
            RejectedQuantity: new Prisma.Decimal(rejectedQty),
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

        // Handle Stock adjustments
        if (Result.Result === 'PASS') {
          // Product already in Stock, no adjustment needed
        } else if (Result.Result === 'FAIL') {
          // Move rejected items to quarantine/hold Warehouse
          // This would involve creating a Stock Transfer
        } else if (Result.Result === 'CONDITIONAL_PASS') {
          // Conditional pass - proceed with reduced Quantity
        }
      }

      // UpDate overall Inspection Status
      const overallResult = TotalRejected === 0 ? 'PASS' : TotalPassed === 0 ? 'FAIL' : 'CONDITIONAL_PASS';

      await tx.qCInspection.update({
        where: { ID: InspectionId },
        data: {
          StatusID: completedStatus?.ID || 2,
          OverallResult: overallResult,
          TotalInspected: new Prisma.Decimal(TotalInspected),
          TotalPassed: new Prisma.Decimal(TotalPassed),
          TotalRejected: new Prisma.Decimal(TotalRejected),
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

  /**
   * Get QC Inspection by ID
   */
  async getQCInspection(InspectionId: number) {
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
      throw new NotFoundException('QC Inspection not found');
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
      TotalInspected: number(Inspection.TotalInspected),
      TotalPassed: number(Inspection.TotalPassed),
      TotalRejected: number(Inspection.TotalRejected),
      Notes: Inspection.Notes,
      inspector: (Inspection.Inspector as any)?.Name,
      inspectedAt: Inspection.InspectedAt,
      items: Inspection.Items.map((item) => ({
        ID: item.ID,
        ProductId: item.ProductID,
        ProductName: item.Product?.Name,
        batchNumber: item.BatchNumber,
        Quantity: number(item.Quantity),
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

  /**
   * List QC Inspections
   */
  async listQCInspections(dto: QCInspectionFilterDto) {
    const where: any = {};

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

  // ─────────────────────────────────────────────────────────────────────────────
  // DEFECT TRACKING
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Create defect Report
   * Flow: Staff menemukan cacat → buat laporan → tracking ke root cause
   */
  async createDefectReport(dto: CreateDefectReportDto, UserId: string) {
    const defectNumber = await this.generateDefectNumber();

    const defect = await this.prisma.defectReport.create({
      data: {
        DefectNumber: defectNumber,
        ProductID: dto.ProductId,
        Quantity: new Prisma.Decimal(dto.Quantity),
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
        Quantity: number(defect.Quantity),
        defectType: defect.DefectType,
        severity: defect.Severity,
        Status: defect.Status,
      },
    };
  }

  /**
   * Get defect Report by ID
   */
  async getDefectReport(defectId: number) {
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
      throw new NotFoundException('Defect Report not found');
    }

    return {
      ID: defect.ID,
      defectNumber: defect.DefectNumber,
      ProductName: defect.Product?.Name,
      ProductCode: defect.Product?.Code,
      Quantity: number(defect.Quantity),
      defectType: defect.DefectType,
      severity: defect.Severity,
      ProductionNumber: defect.Production?.Code,
      SaleNumber: defect.Sale?.Code,
      Description: defect.Description,
      rootCause: defect.RootCause,
      correctiveAction: defect.CorrectiveAction,
      Status: defect.Status,
      ReportedBy: (defect.Reporter as any)?.Name,
      ReportedAt: defect.CreatedAt,
    };
  }

  /**
   * List defect Reports
   */
  async listDefectReports(dto: DefectFilterDto) {
    const where: any = {};

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
      Quantity: number(d.Quantity),
      defectType: d.DefectType,
      severity: d.Severity,
      Status: d.Status,
      ReportedAt: d.CreatedAt,
    }));
  }

  /**
   * UpDate defect Report Status
   */
  async updateDefectStatus(defectId: number, Status: string, UserId: string) {
    const defect = await this.prisma.defectReport.findUnique({
      where: { ID: defectId },
    });

    if (!defect) {
      throw new NotFoundException('Defect Report not found');
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

  /**
   * Get defect analytics
   */
  async getDefectAnalytics(startDate?: string, endDate?: string) {
    const { start, end } = resolveDateRange(startDate, endDate);

    const defects = await this.prisma.defectReport.findMany({
      where: {
        CreatedAt: { gte: start, lte: end },
      },
      include: { Product: true },
    });

    // Group by defect Type
    const byDefectType: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};
    const byProduct: Record<string, { ProductName: string; Count: number; TotalQuantity: number }> = {};
    const byMonth: Record<string, number> = {};

    for (const defect of defects) {
      // By Type
      byDefectType[defect.DefectType] = (byDefectType[defect.DefectType] || 0) + 1;

      // By severity
      bySeverity[defect.Severity] = (bySeverity[defect.Severity] || 0) + 1;

      // By Product
      const ProductName = defect.Product?.Name || 'Unknown';
      if (!byProduct[ProductName]) {
        byProduct[ProductName] = { ProductName, Count: 0, TotalQuantity: 0 };
      }
      byProduct[ProductName].Count += 1;
      byProduct[ProductName].TotalQuantity += Number(defect.Quantity);

      // By month
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

  // ─────────────────────────────────────────────────────────────────────────────
  // QC STANDARDS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Create QC Standard for Product
   */
  async createQCStandard(dto: CreateQCStandardDto, UserId: string) {
    const Standard = await this.prisma.qCStandard.create({
      data: {
        ProductID: dto.ProductId,
        InspectionType: dto.InspectionType,
        SampleSize: dto.SampleSize,
        AQL: dto.AcceptableQualityLevel,
        MinimumPassingScore: dto.MinimumPassingScore,
      },
    });

    // Create CheckPoints if provided
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

  /**
   * Get QC Standard for Product
   */
  async getQCStandard(ProductId: number, InspectionType?: string) {
    ProductId = requireIntParam(ProductId, 'productId');
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

  // ─────────────────────────────────────────────────────────────────────────────
  // CALIBRATION MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Create Calibration Record
   */
  async createCalibration(dto: CreateCalibrationDto, UserId: string) {
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

  /**
   * Record Calibration Result
   */
  async recordCalibrationResult(CalibrationId: number, Result: 'PASS' | 'FAIL', Notes: string, UserId: string) {
    const Calibration = await this.prisma.calibration.findUnique({
      where: { ID: CalibrationId },
    });

    if (!Calibration) {
      throw new NotFoundException('Calibration Record not found');
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

  /**
   * List Calibrations due/overdue
   */
  async listCalibrations(dto: CalibrationFilterDto) {
    const where: any = {};

    if (dto.Status === 'DUE') {
      where.NextCalibrationDate = {
        lte: new Date(),
        gte: new Date(new Date().setHours(0, 0, 0, 0)),
      };
      where.Status = { not: 'OVERDUE' };
    } else if (dto.Status === 'OVERDUE') {
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

  // ─────────────────────────────────────────────────────────────────────────────
  // QC STATISTICS & REPORTS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Get QC performance Report
   */
  async getQCPerformanceReport(startDate?: string, endDate?: string) {
    const { start, end } = resolveDateRange(startDate, endDate);

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

    // By Type
    const byType: Record<string, any> = {};
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
      if (ins.OverallResult === 'PASS') byType[ins.InspectionType].pass += 1;
      if (ins.OverallResult === 'FAIL') byType[ins.InspectionType].fail += 1;
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

  // ─────────────────────────────────────────────────────────────────────────────
  // HELPER METHODS
  // ─────────────────────────────────────────────────────────────────────────────

  private async generateInspectionNumber(Type: string): Promise<string> {
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

  private async generateDefectNumber(): Promise<string> {
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
}
