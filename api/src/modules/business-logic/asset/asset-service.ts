import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma-service';
import { Prisma } from '@prisma/client'
import { number } from '../../../common/utils/number';
import {
  CreateAssetDto,
  UpDateAssetDto,
  AssetFilterDto,
  CalculateDepreciationDto,
  DisposeAssetDto,
  TransferAssetDto,
  AssetDepreciationReportDto,
  AssetValuationDto,
} from './asset.dto';

interface DepreciationResult {
  assetId: number;
  assetCode: string;
  assetName: string;
  Category: string | null;
  location: string | null;
  PurchaseDate: Date;
  PurchasePrice: number;
  usefulLifeYears: number;
  depreciationMethod: string;
  accumulatedDepreciation: number;
  bookValue: number;
  monthlyDepreciation: number;
  remainingLifeMonths: number;
}

@Injectable()
export class AssetService {
  constructor(private prisma: PrismaService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // ASSET CRUD
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Create new fixed asset
   * Flow: Owner/catat aset baru → sistem buat data aset dengan penyusutan
   */
  async createAsset(dto: CreateAssetDto, UserId: string) {
    // Check for duplicate Code
    const existing = await this.prisma.asset.findUnique({
      where: { Code: dto.Code },
    });

    if (existing) {
      throw new ConflictException('Asset Code already exists');
    }

    // Validate Category if provided
    if (dto.CategoryId) {
      const Category = await this.prisma.assetCategory.findUnique({
        where: { ID: dto.CategoryId },
      });
      if (!Category) {
        throw new NotFoundException('Asset Category not found');
      }
    }

    // Get Default Status
    const ActiveStatus = await this.prisma.assetStatus.findFirst({
      where: { Code: 'ACTIVE' },
    });

    // Get depreciation Method
    let depreciationMethod = 'STRAIGHT_LINE';
    if (dto.DepreciationMethodId) {
      const Method = await this.prisma.depreciationMethod.findUnique({
        where: { ID: dto.DepreciationMethodId },
      });
      if (Method) {
        depreciationMethod = Method.Code;
      }
    }

    const asset = await this.prisma.asset.create({
      data: {
        Code: dto.Code,
        Name: dto.Name,
        AssetCategoryID: dto.CategoryId || null,
        PurchaseDate: dto.PurchaseDate ? new Date(dto.PurchaseDate) : new Date(),
        PurchasePrice: new Prisma.Decimal(dto.PurchasePrice),
        CurrentValue: new Prisma.Decimal(dto.PurchasePrice),
        DepreciationMethodID: dto.DepreciationMethodId || null,
        UsefulLifeYears: dto.UsefulLifeYears || 0,
        Location: dto.Location,
        AssignedTo: dto.AssignedTo,
        SerialNumber: dto.SerialNumber,
        Description: dto.Description,
        StatusID: ActiveStatus?.ID || 1,
      },
      include: {
        Category: true,
        Status: true,
        DepreciationMethod: true,
      },
    });

    return {
      success: true,
      asset: this.formatAsset(asset),
    };
  }

  /**
   * Get asset by ID
   */
  async getAsset(assetId: number) {
    const asset = await this.prisma.asset.findUnique({
      where: { ID: assetId },
      include: {
        Category: true,
        Status: true,
        DepreciationMethod: true,
      },
    });

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    // Calculate current depreciation
    const depreciation = await this.calculateSingleAssetDepreciation(assetId);

    return {
      ...this.formatAsset(asset),
      depreciation,
    };
  }

  /**
   * List assets with filters
   */
  async listAssets(dto: AssetFilterDto) {
    const where: any = {};

    if (dto.CategoryId) {
      where.AssetCategoryID = dto.CategoryId;
    }

    if (dto.StatusId) {
      where.StatusID = dto.StatusId;
    }

    if (dto.Location) {
      where.Location = { contains: dto.Location, mode: 'insensitive' };
    }

    if (dto.Search) {
      where.OR = [
        { Name: { contains: dto.Search, mode: 'insensitive' } },
        { Code: { contains: dto.Search, mode: 'insensitive' } },
        { SerialNumber: { contains: dto.Search, mode: 'insensitive' } },
      ];
    }

    if (dto.ActiveOnly !== false) {
      where.IsActive = true;
    }

    const assets = await this.prisma.asset.findMany({
      where,
      include: {
        Category: true,
        Status: true,
        DepreciationMethod: true,
      },
      orderBy: { Name: 'asc' },
    });

    const assetsWithDepreciation = await Promise.all(
      assets.map(async (asset) => {
        const depreciation = await this.calculateSingleAssetDepreciation(asset.ID);
        return {
          ...this.formatAsset(asset),
          depreciation,
        };
      }),
    );

    return assetsWithDepreciation;
  }

  /**
   * UpDate asset
   */
  async updateAsset(assetId: number, dto: UpDateAssetDto, UserId: string) {
    const asset = await this.prisma.asset.findUnique({
      where: { ID: assetId },
    });

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    const updated = await this.prisma.asset.update({
      where: { ID: assetId },
      data: {
        Name: dto.Name,
        AssetCategoryID: dto.CategoryId,
        UsefulLifeYears: dto.UsefulLifeYears,
        CurrentValue: dto.CurrentValue !== undefined ? new Prisma.Decimal(dto.CurrentValue) : undefined,
        Location: dto.Location,
        AssignedTo: dto.AssignedTo,
        SerialNumber: dto.SerialNumber,
        Description: dto.Description,
        StatusID: dto.StatusId,
      },
      include: {
        Category: true,
        Status: true,
        DepreciationMethod: true,
      },
    });

    return {
      success: true,
      asset: this.formatAsset(updated),
    };
  }

  /**
   * Delete asset (soft delete)
   */
  async deleteAsset(assetId: number, UserId: string) {
    const asset = await this.prisma.asset.findUnique({
      where: { ID: assetId },
    });

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    await this.prisma.asset.update({
      where: { ID: assetId },
      data: { IsActive: false },
    });

    return {
      success: true,
      message: 'Asset deleted successfully',
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // ASSET DEPRECIATION
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Calculate depreciation for assets
   * Flow: Sistem calculate penyusutan aset per bulan
   */
  async calculateDepreciation(dto: CalculateDepreciationDto) {
    const asOfDate = dto.AsOfDate ? new Date(dto.AsOfDate) : new Date();

    const where: any = { IsActive: true };
    if (dto.AssetId) {
      where.ID = dto.AssetId;
    }

    const assets = await this.prisma.asset.findMany({
      where,
      include: {
        Category: true,
        DepreciationMethod: true,
      },
    });

    const depreciationResults: DepreciationResult[] = [];

    for (const asset of assets) {
      const Result = await this.calculateSingleAssetDepreciation(asset.ID, asOfDate);
      if (Result) {
        depreciationResults.push(Result);
      }
    }

    const Summary = {
      TotalAssets: depreciationResults.length,
      TotalPurchaseValue: depreciationResults.reduce((sum, a) => sum + a.PurchasePrice, 0),
      TotalAccumulatedDepreciation: depreciationResults.reduce((sum, a) => sum + a.accumulatedDepreciation, 0),
      TotalBookValue: depreciationResults.reduce((sum, a) => sum + a.bookValue, 0),
      TotalMonthlyDepreciation: depreciationResults.reduce((sum, a) => sum + a.monthlyDepreciation, 0),
    };

    return {
      asOfDate: asOfDate.toISOString(),
      assets: depreciationResults,
      Summary,
    };
  }

  /**
   * Get depreciation Report
   * Flow: Owner ingin laporan penyusutan aset
   */
  async getDepreciationReport(dto: AssetDepreciationReportDto) {
    const asOfDate = dto.AsOfDate ? new Date(dto.AsOfDate) : new Date();

    // Calculate depreciation for all assets (or filter by Category in the caller)
    return this.calculateDepreciation({
      AsOfDate: asOfDate.toISOString(),
    });
  }

  /**
   * Get asset valuation Report
   * Flow: Owner ingin laporan nilai aset saat ini
   */
  async getAssetValuation(dto: AssetValuationDto) {
    const asOfDate = dto.AsOfDate ? new Date(dto.AsOfDate) : new Date();

    const where: any = { IsActive: true };
    if (dto.CategoryId) {
      where.AssetCategoryID = dto.CategoryId;
    }

    const assets = await this.prisma.asset.findMany({
      where,
      include: {
        Category: true,
      },
    });

    const valuationResults: any[] = [];

    for (const asset of assets) {
      const depreciation = await this.calculateSingleAssetDepreciation(asset.ID, asOfDate);

      valuationResults.push({
        ID: asset.ID,
        Code: asset.Code,
        Name: asset.Name,
        Category: asset.Category?.Name || 'Uncategorized',
        location: asset.Location,
        PurchaseDate: asset.PurchaseDate,
        PurchasePrice: number(asset.PurchasePrice),
        currentValue: depreciation?.bookValue ?? Number(asset.CurrentValue),
        accumulatedDepreciation: depreciation?.accumulatedDepreciation || 0,
        depreciationStatus: (depreciation?.bookValue ?? Number(asset.CurrentValue)) <= 0 ? 'FULLY_DEPRECIATED' : 'ACTIVE',
      });
    }

    const Summary = {
      TotalAssets: valuationResults.length,
      TotalPurchaseValue: valuationResults.reduce((sum, a) => sum + a.PurchasePrice, 0),
      TotalCurrentValue: valuationResults.reduce((sum, a) => sum + a.currentValue, 0),
      TotalDepreciation: valuationResults.reduce((sum, a) => sum + a.accumulatedDepreciation, 0),
      fullyDepreciatedCount: valuationResults.filter((a) => a.depreciationStatus === 'FULLY_DEPRECIATED').length,
      ActiveCount: valuationResults.filter((a) => a.depreciationStatus === 'ACTIVE').length,
    };

    return {
      asOfDate: asOfDate.toISOString(),
      assets: valuationResults,
      Summary,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // ASSET DISPOSAL
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Dispose/sell asset
   * Flow: Aset dijual/dibuang → sistem catat disposal dan untung/rugi
   */
  async disposeAsset(assetId: number, dto: DisposeAssetDto, UserId: string) {
    const asset = await this.prisma.asset.findUnique({
      where: { ID: assetId },
      include: { Category: true },
    });

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    // Calculate current book Value
    const depreciation = await this.calculateSingleAssetDepreciation(assetId, new Date(dto.Date));
    const bookValue = depreciation?.bookValue || Number(asset.CurrentValue);

    // Calculate gain/loss
    const gainLoss = dto.DisposalValue - bookValue;

    // Get disposed Status
    const disposedStatus = await this.prisma.assetStatus.findFirst({
      where: { Code: 'DISPOSED' },
    });

    // UpDate asset
    const updated = await this.prisma.asset.update({
      where: { ID: assetId },
      data: {
        StatusID: disposedStatus?.ID || asset.StatusID,
        CurrentValue: new Prisma.Decimal(0),
        Description: `Disposed on ${dto.Date}: ${dto.Reason}. Proceeds: ${dto.DisposalValue}`,
      },
    });

    return {
      success: true,
      asset: {
        ID: updated.ID,
        Code: updated.Code,
        Name: updated.Name,
        disposalDate: dto.Date,
        disposalValue: dto.DisposalValue,
        bookValueAtDisposal: bookValue,
        gainLoss: gainLoss,
        gainLossType: gainLoss >= 0 ? 'GAIN' : 'LOSS',
        reason: dto.Reason,
      },
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // ASSET TRANSFER
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Transfer asset to new location/person
   * Flow: Aset dipindahkan lokasi → sistem catat perpindahan
   */
  async TransferAsset(assetId: number, dto: TransferAssetDto, UserId: string) {
    const asset = await this.prisma.asset.findUnique({
      where: { ID: assetId },
    });

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    const oldLocation = asset.Location;
    const oldAssignedTo = asset.AssignedTo;

    const updated = await this.prisma.asset.update({
      where: { ID: assetId },
      data: {
        Location: dto.NewLocation,
        AssignedTo: dto.NewAssignedTo,
      },
    });

    return {
      success: true,
      asset: {
        ID: updated.ID,
        Code: updated.Code,
        Name: updated.Name,
        TransferDate: dto.Date || new Date().toISOString(),
        previousLocation: oldLocation,
        newLocation: updated.Location,
        previousAssignedTo: oldAssignedTo,
        newAssignedTo: updated.AssignedTo,
        Notes: dto.Notes,
      },
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // ASSET CATEGORIES
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Create asset Category
   */
  async createCategory(dto: { Code: string; Name: string; Description?: string }) {
    const existing = await this.prisma.assetCategory.findUnique({
      where: { Code: dto.Code },
    });

    if (existing) {
      throw new ConflictException('Category Code already exists');
    }

    const Category = await this.prisma.assetCategory.create({
      data: {
        Code: dto.Code,
        Name: dto.Name,
        Description: dto.Description,
      },
    });

    return {
      success: true,
      Category: {
        ID: Category.ID,
        Code: Category.Code,
        Name: Category.Name,
        Description: Category.Description,
      },
    };
  }

  /**
   * List asset Categories
   */
  async listCategories() {
    const Categories = await this.prisma.assetCategory.findMany({
      where: { IsActive: true },
      orderBy: { Name: 'asc' },
    });

    return Categories.map((c) => ({
      ID: c.ID,
      Code: c.Code,
      Name: c.Name,
      Description: c.Description,
    }));
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // HELPER METHODS
  // ─────────────────────────────────────────────────────────────────────────────

  private async calculateSingleAssetDepreciation(
    assetId: number,
    asOfDate?: Date,
  ): Promise<DepreciationResult | null> {
    const asset = await this.prisma.asset.findUnique({
      where: { ID: assetId },
      include: {
        Category: true,
        DepreciationMethod: true,
      },
    });

    if (!asset || !asset.PurchaseDate || Number(asset.PurchasePrice) === 0) {
      return null;
    }

    const PurchaseDate = new Date(asset.PurchaseDate);
    const endDate = asOfDate || new Date();
    const usefulLifeYears = asset.UsefulLifeYears || 5;
    const usefulLifeMonths = usefulLifeYears * 12;

    // Calculate months elapsed since Purchase
    const monthsElapsed =
      (endDate.getFullYear() - PurchaseDate.getFullYear()) * 12 +
      (endDate.getMonth() - PurchaseDate.getMonth());

    const cappedMonths = Math.min(monthsElapsed, usefulLifeMonths);
    const PurchasePrice = Number(asset.PurchasePrice);
    const monthlyDepreciation = PurchasePrice / usefulLifeMonths;
    const accumulatedDepreciation = monthlyDepreciation * cappedMonths;
    const bookValue = Math.max(0, PurchasePrice - accumulatedDepreciation);
    const remainingLifeMonths = Math.max(0, usefulLifeMonths - cappedMonths);

    return {
      assetId: asset.ID,
      assetCode: asset.Code,
      assetName: asset.Name,
      Category: asset.Category?.Name || null,
      location: asset.Location,
      PurchaseDate: asset.PurchaseDate,
      PurchasePrice,
      usefulLifeYears,
      depreciationMethod: asset.DepreciationMethod?.Name || 'Straight Line',
      accumulatedDepreciation: Math.round(accumulatedDepreciation * 100) / 100,
      bookValue: Math.round(bookValue * 100) / 100,
      monthlyDepreciation: Math.round(monthlyDepreciation * 100) / 100,
      remainingLifeMonths,
    };
  }

  private formatAsset(asset: any) {
    return {
      ID: asset.ID,
      Code: asset.Code,
      Name: asset.Name,
      Category: asset.Category ? { ID: asset.Category.ID, Name: asset.Category.Name } : null,
      PurchaseDate: asset.PurchaseDate,
      PurchasePrice: number(asset.PurchasePrice),
      currentValue: number(asset.CurrentValue),
      depreciationMethod: asset.DepreciationMethod
        ? { ID: asset.DepreciationMethod.ID, Name: asset.DepreciationMethod.Name }
        : null,
      usefulLifeYears: asset.UsefulLifeYears,
      location: asset.Location,
      assignedTo: asset.AssignedTo,
      serialNumber: asset.SerialNumber,
      Description: asset.Description,
      Status: asset.Status ? { ID: asset.Status.ID, Name: asset.Status.Name, Code: asset.Status.Code } : null,
      IsActive: asset.IsActive,
    };
  }
}
