import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma-service';
import { Prisma } from '@prisma/client';
import {
  CreateQCCategoryDto,
  UpDateQCCategoryDto,
  CreateQCCheckPointDto,
  UpDateQCCheckPointDto,
  RecordQCCheckDto,
  QCCheckFilterDto,
} from './quality-control-Category.dto';

@Injectable()
export class QualityControlCategoryService {
  constructor(private prisma: PrismaService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // QC CATEGORY MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Create QC Category
   */
  async createQCCategory(dto: CreateQCCategoryDto) {
    const existing = await this.prisma.qCCategory.findUnique({
      where: { Code: dto.Code },
    });

    if (existing) {
      throw new BadRequestException('Category Code already exists');
    }

    const Category = await this.prisma.qCCategory.create({
      data: {
        Code: dto.Code,
        Name: dto.Name,
        Description: dto.Description,
        QCType: dto.qcType,
        IsActive: true,
      },
    });

    return { success: true, Category: this.formatCategory(Category) };
  }

  /**
   * List QC Categories
   */
  async listQCCategories(includeInActive = false) {
    const where = includeInActive ? {} : { IsActive: true };

    const Categories = await this.prisma.qCCategory.findMany({
      where,
      include: { _Count: { select: { CheckPoints: true } } },
      orderBy: { Name: 'asc' },
    });

    return Categories.map((c) => ({
      ...this.formatCategory(c),
      CheckPointCount: c._Count.CheckPoints,
    }));
  }

  /**
   * Get QC Category by ID
   */
  async getQCCategory(ID: number) {
    const Category = await this.prisma.qCCategory.findUnique({
      where: { ID: ID },
      include: { CheckPoints: { where: { IsActive: true }, orderBy: { SortOrder: 'asc' } } },
    });

    if (!Category) throw new NotFoundException('Category not found');
    return {
      ...this.formatCategory(Category),
      CheckPoints: Category.CheckPoints.map((cp) => this.formatCheckPoint(cp)),
    };
  }

  /**
   * UpDate QC Category (PATCH)
   */
  async updateQCCategory(ID: number, dto: UpDateQCCategoryDto) {
    const Category = await this.prisma.qCCategory.findUnique({ where: { ID: ID } });
    if (!Category) throw new NotFoundException('Category not found');

    const updated = await this.prisma.qCCategory.update({
      where: { ID: ID },
      data: {
        Name: dto.Name ?? Category.Name,
        Description: dto.Description ?? Category.Description,
        QCType: dto.qcType ?? Category.QCType,
        IsActive: dto.IsActive ?? Category.IsActive,
      },
    });

    return { success: true, Category: this.formatCategory(updated) };
  }

  /**
   * Delete QC Category
   */
  async deleteQCCategory(ID: number) {
    const Category = await this.prisma.qCCategory.findUnique({
      where: { ID: ID },
      include: { _Count: { select: { CheckPoints: true } } },
    });
    if (!Category) throw new NotFoundException('Category not found');
    if (Category._Count.CheckPoints > 0) {
      throw new BadRequestException('Cannot delete Category with existing CheckPoints');
    }

    await this.prisma.qCCategory.delete({ where: { ID: ID } });
    return { success: true, message: 'Category deleted' };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // QC CHECKPOINT MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Create QC CheckPoint
   */
  async createQCCheckPoint(dto: CreateQCCheckPointDto) {
    const Category = await this.prisma.qCCategory.findUnique({ where: { ID: dto.CategoryId } });
    if (!Category) throw new NotFoundException('Category not found');

    const CheckPointCount = await this.prisma.qCCheckpoint.Count({
      where: { QCCategoryID: dto.CategoryId },
    });

    const CheckPoint = await this.prisma.qCCheckpoint.create({
      data: {
        Name: dto.Name,
        QCCategoryID: dto.CategoryId,
        Description: dto.Description,
        IsRequired: dto.isRequired ?? true,
        PassCriteria: dto.passCriteria,
        SortOrder: CheckPointCount + 1,
        IsActive: true,
      },
    });

    return { success: true, CheckPoint: this.formatCheckPoint(CheckPoint) };
  }

  /**
   * UpDate QC CheckPoint (PATCH)
   */
  async updateQCCheckPoint(ID: number, dto: UpDateQCCheckPointDto) {
    const CheckPoint = await this.prisma.qCCheckpoint.findUnique({ where: { ID: ID } });
    if (!CheckPoint) throw new NotFoundException('CheckPoint not found');

    const updated = await this.prisma.qCCheckpoint.update({
      where: { ID: ID },
      data: {
        Name: dto.Name ?? CheckPoint.Name,
        Description: dto.Description ?? CheckPoint.Description,
        IsRequired: dto.isRequired ?? CheckPoint.IsRequired,
        PassCriteria: dto.passCriteria ?? CheckPoint.PassCriteria,
        IsActive: dto.IsActive ?? CheckPoint.IsActive,
      },
    });

    return { success: true, CheckPoint: this.formatCheckPoint(updated) };
  }

  /**
   * Delete QC CheckPoint
   */
  async deleteQCCheckPoint(ID: number) {
    const CheckPoint = await this.prisma.qCCheckpoint.findUnique({ where: { ID: ID } });
    if (!CheckPoint) throw new NotFoundException('CheckPoint not found');

    await this.prisma.qCCheckpoint.delete({ where: { ID: ID } });
    return { success: true, message: 'CheckPoint deleted' };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // QC CHECK RECORDING
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Record QC Check
   */
  async RecordQCCheck(dto: RecordQCCheckDto, UserId: string) {
    const Category = await this.prisma.qCCategory.findUnique({
      where: { ID: dto.CategoryId },
      include: { CheckPoints: { where: { IsActive: true } } },
    });

    if (!Category) throw new NotFoundException('QC Category not found');

    // generate QC Code
    const Code = await this.generateQCCode();

    const qcCheck = await this.prisma.$transaction(async (tx) => {
      const newCheck = await tx.qCCheck.create({
        data: {
          Code: Code,
          QCCategoryID: dto.CategoryId,
          ReferenceType: dto.ReferenceType,
          ReferenceID: dto.referenceId,
          Date: new Date(dto.Date),
          InspectorName: dto.inspectorName,
          Result: dto.Result || 'PENDING',
          Notes: dto.Notes,
          CreatedByID: UserId,
        },
      });

      // Create CheckPoint Results if provided
      if (dto.CheckPointResults && dto.CheckPointResults.length > 0) {
        await tx.qCCheckResult.createMany({
          data: dto.CheckPointResults.map((cr) => ({
            QCCheckID: newCheck.ID,
            QCCheckPointID: cr.CheckPointId,
            Result: cr.Result,
            ActualValue: cr.actualValue,
            Notes: cr.Notes,
          })),
        });
      }

      return newCheck;
    });

    return {
      success: true,
      qcCheck: {
        ID: qcCheck.ID,
        Code: qcCheck.Code,
        Category: Category.Name,
        referenceType: qcCheck.ReferenceType,
        referenceId: qcCheck.ReferenceID,
        Result: qcCheck.Result,
        Date: qcCheck.Date,
        inspectorName: qcCheck.InspectorName,
      },
    };
  }

  /**
   * List QC Checks
   */
  async listQCChecks(dto: QCCheckFilterDto) {
    const where: any = {};

    if (dto.StartDate || dto.EndDate) {
      where.Date = {};
      if (dto.StartDate) where.Date.gte = new Date(dto.StartDate);
      if (dto.EndDate) where.Date.lte = new Date(dto.EndDate);
    }

    if (dto.CategoryId) where.QCCategoryID = dto.CategoryId;
    if (dto.Result) where.Result = dto.Result;

    const Checks = await this.prisma.qCCheck.findMany({
      where,
      include: { QCCategory: true },
      orderBy: { Date: 'desc' },
    });

    return Checks.map((c) => ({
      ID: c.ID,
      Code: c.Code,
      Category: c.QCCategory?.Name,
      referenceType: c.ReferenceType,
      referenceId: c.ReferenceID,
      Result: c.Result,
      Date: c.Date,
      inspectorName: c.InspectorName,
    }));
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // HELPER METHODS
  // ─────────────────────────────────────────────────────────────────────────────

  private async generateQCCode(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const prefix = `QC-${year}${month}`;

    const lastCheck = await this.prisma.qCCheck.findFirst({
      where: { Code: { startsWith: prefix } },
      orderBy: { Code: 'desc' },
      select: { Code: true },
    });

    let nextNumber = 1;
    if (lastCheck) {
      const lastSeq = parseInt(lastCheck.Code.split('-').pop() || '0', 10);
      nextNumber = lastSeq + 1;
    }

    return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
  }

  private formatCategory(Category: any) {
    return {
      ID: Category.ID,
      Code: Category.Code,
      Name: Category.Name,
      Description: Category.Description,
      qcType: Category.QCType,
      IsActive: Category.IsActive,
    };
  }

  private formatCheckPoint(CheckPoint: any) {
    return {
      ID: CheckPoint.ID,
      Name: CheckPoint.Name,
      Description: CheckPoint.Description,
      isRequired: CheckPoint.IsRequired,
      passCriteria: CheckPoint.PassCriteria,
      sortOrder: CheckPoint.SortOrder,
      IsActive: CheckPoint.IsActive,
    };
  }
}
