import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ServicePackageService } from './service-package-service';
import {
  CreateServiceCategoryDto,
  UpDateServiceCategoryDto,
  CreateServicePackageDto,
  UpDateServicePackageDto,
  ServicePackageFilterDto,
  CalculatePackageQuoteDto,
  ComparePackagesDto,
} from './service-package.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth-guard';
import { ApiResponse } from '../../../common/dto/api-response-dto';

@ApiTags('Service Package - Paket Layanan')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('business-logic/service-package')
export class ServicePackageController {
  constructor(private servicePackageService: ServicePackageService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // SERVICE CATEGORY
  // ─────────────────────────────────────────────────────────────────────────────

  @Post('categories')
  @ApiOperation({ summary: 'Create service category' })
  async createServiceCategory(@Body() dto: CreateServiceCategoryDto, @Request() req: any) {
    const data = await this.servicePackageService.createServiceCategory(dto, req.user?.id || '1');
    return ApiResponse.ok(data, 'Service category created successfully');
  }

  @Get('categories')
  @ApiOperation({ summary: 'List service categories' })
  async listServiceCategories(@Query('isActive') isActive?: string) {
    const data = await this.servicePackageService.listServiceCategories(
      isActive === 'true' ? true : isActive === 'false' ? false : undefined,
    );
    return ApiResponse.ok(data);
  }

  @Get('categories/:id')
  @ApiOperation({ summary: 'Get service category by ID' })
  async getServiceCategory(@Param('id') id: string) {
    const data = await this.servicePackageService.getServiceCategory(parseInt(id));
    return ApiResponse.ok(data);
  }

  @Patch('categories/:id')
  @ApiOperation({ summary: 'Update service category' })
  async updateServiceCategory(
    @Param('id') id: string,
    @Body() dto: UpDateServiceCategoryDto,
  ) {
    const data = await this.servicePackageService.updateServiceCategory(parseInt(id), dto);
    return ApiResponse.ok(data, 'Service category updated successfully');
  }

  @Delete('categories/:id')
  @ApiOperation({ summary: 'Delete service category' })
  async deleteServiceCategory(@Param('id') id: string) {
    const data = await this.servicePackageService.deleteServiceCategory(parseInt(id));
    return ApiResponse.ok(data, 'Service category deleted successfully');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SERVICE PACKAGE
  // ─────────────────────────────────────────────────────────────────────────────

  @Post()
  @ApiOperation({ summary: 'Create service package' })
  async createServicePackage(@Body() dto: CreateServicePackageDto, @Request() req: any) {
    const data = await this.servicePackageService.createServicePackage(dto, req.user?.id || '1');
    return ApiResponse.ok(data, 'Service package created successfully');
  }

  @Get()
  @ApiOperation({ summary: 'List service packages' })
  async listServicePackages(@Query() dto: ServicePackageFilterDto) {
    const data = await this.servicePackageService.listServicePackages(dto);
    return ApiResponse.ok(data);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get service package by ID' })
  async getServicePackage(@Param('id') id: string) {
    const data = await this.servicePackageService.getServicePackage(parseInt(id));
    return ApiResponse.ok(data);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update service package' })
  async updateServicePackage(
    @Param('id') id: string,
    @Body() dto: UpDateServicePackageDto,
    @Request() req: any,
  ) {
    const data = await this.servicePackageService.updateServicePackage(parseInt(id), dto, req.user?.id || '1');
    return ApiResponse.ok(data, 'Service package updated successfully');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete service package' })
  async deleteServicePackage(@Param('id') id: string) {
    const data = await this.servicePackageService.deleteServicePackage(parseInt(id));
    return ApiResponse.ok(data, 'Service package deleted successfully');
  }

  @Post(':id/clone')
  @ApiOperation({ summary: 'Clone/duplicate service package' })
  async cloneServicePackage(
    @Param('id') id: string,
    @Body('newCode') newCode: string,
    @Body('newName') newName: string,
    @Request() req: any,
  ) {
    const data = await this.servicePackageService.cloneServicePackage(
      parseInt(id),
      newCode,
      newName,
      req.user?.id || '1',
    );
    return ApiResponse.ok(data, 'Service package cloned successfully');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // QUOTE & CALCULATION
  // ─────────────────────────────────────────────────────────────────────────────

  @Post('quote')
  @ApiOperation({ summary: 'Calculate package quote' })
  async calculatePackageQuote(@Body() dto: CalculatePackageQuoteDto) {
    const data = await this.servicePackageService.calculatePackageQuote(dto);
    return ApiResponse.ok(data);
  }

  @Post('compare')
  @ApiOperation({ summary: 'Compare multiple packages' })
  async comparePackages(@Body() dto: ComparePackagesDto) {
    const data = await this.servicePackageService.comparePackages(dto);
    return ApiResponse.ok(data);
  }

  @Get('category/:categoryId/packages')
  @ApiOperation({ summary: 'Get packages by category with quick quote' })
  async getPackagesByCategory(@Param('categoryId') categoryId: string) {
    const data = await this.servicePackageService.getPackagesByCategory(parseInt(categoryId));
    return ApiResponse.ok(data);
  }
}
