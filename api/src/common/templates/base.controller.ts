// ================================================================
// base.controller.ts — Template Controller OData untuk Semua Model
// ================================================================
//
// CARA PENGGUNAAN:
// 1. Buat controller yang extends BaseController
// 2. Konfigurasi ControllerConfig di constructor super()
//
// CONTOH:
// @ApiTags('Products')
// @ApiBearerAuth()
// @UseGuards(JwtAuthGuard)
// @Controller('products')
// export class ProductController extends BaseController<
//   Product,
//   CreateProductDto,
//   UpdateProductDto
// > {
//   constructor(productService: ProductService) {
//     super(productService, {
//       modelName: 'Product',
//       pluralName: 'Products',
//       primaryKeyType: 'number', // 'string' for UUID
//       paramId: 'id',
//     });
//   }
// }
//
// ENDPOINTS YANG DIBUAT:
// GET    /              → findAll
// GET    /count         → getCount
// GET    /:id           → findById
// GET    /by/:field/:value → findByField
// POST   /              → create
// POST   /bulk          → createBulk
// PATCH  /:id           → patchById
// PATCH  /by/:field/:value → (dinonaktifkan, 404)
// PATCH  /bulk          → (dinonaktifkan, 404)
// DELETE /:id           → deleteById
// DELETE /by/:field/:value → (dinonaktifkan, 404)
// DELETE /bulk          → (dinonaktifkan, 404)
// UPSERT /              → upsert
// UPSERT /bulk          → (dinonaktifkan, 404)
//
// ================================================================

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Put,
  Param,
  Query,
  Body,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';
import { BaseService } from './base.service';
import { ApiResponse } from '../dto/api-response-dto';
import { JwtAuthGuard } from '../guards/jwt-auth-guard';

export interface ControllerConfig {
  /** Nama model singular (untuk display) */
  modelName: string;

  /** Nama model plural (untuk display & route name) */
  pluralName?: string;

  /** Tipe data Primary Key */
  primaryKeyType?: 'number' | 'string';

  /** Nama parameter ID di route */
  paramId?: string;

  /** Route prefix */
  routePrefix?: string;

  /** Field yang boleh di-filter (untuk by/:field/:value) */
  allowedFilterFields?: string[];
}

export abstract class BaseController<
  T extends Record<string, any>,
  CreateDto extends Record<string, any>,
  UpdateDto extends Record<string, any>,
> {
  readonly modelName: string;
  readonly pluralName: string;
  readonly primaryKeyType: 'number' | 'string';
  readonly paramId: string;

  constructor(
    readonly service: BaseService<T, CreateDto, UpdateDto, any, any>,
    config: ControllerConfig,
  ) {
    this.modelName = config.modelName;
    this.pluralName = config.pluralName ?? config.modelName + 's';
    this.primaryKeyType = config.primaryKeyType ?? 'number';
    this.paramId = config.paramId ?? 'id';
  }

  // ═══════════════════════════════════════════════════════════════
  // GET ENDPOINTS
  // ═══════════════════════════════════════════════════════════════

  @Get()
  async findAll(@Query() query: any) {
    const result = await this.service.findAll(query);
    return ApiResponse.paginated(result.data, result.total, result.skip, result.take);
  }

  @Get('count')
  async getCount(@Query() query: any) {
    const result = await this.service.getCount(query);
    return ApiResponse.ok(result);
  }

  async findById(@Param('id') id: string | number, @Query() query: any) {
    const parsedId = this.parseId(id);
    const data = await this.service.findById(parsedId, query);
    if (!data) {
      return ApiResponse.error(`${this.modelName} not found`);
    }
    return ApiResponse.ok(data);
  }

  async findByField(@Param('field') field: string, @Param('value') value: string, @Query() query: any) {
    const parsedValue = this.parseValue(value);
    const data = await this.service.findByField(field, parsedValue, query);
    if (!data) {
      return ApiResponse.error(`${this.modelName} not found`);
    }
    return ApiResponse.ok(data);
  }

  // ═══════════════════════════════════════════════════════════════
  // POST ENDPOINTS
  // ═══════════════════════════════════════════════════════════════

  async create(@Body() dto: CreateDto) {
    const data = await this.service.create(dto);
    return ApiResponse.ok(data, `${this.modelName} created successfully`);
  }

  async createBulk(@Body() dtos: CreateDto[]) {
    const result = await this.service.createBulk(dtos);
    return ApiResponse.ok(result, `${result.successCount} created, ${result.failedCount} failed`);
  }

  // ═══════════════════════════════════════════════════════════════
  // PATCH ENDPOINTS
  // ═══════════════════════════════════════════════════════════════

  async patchById(@Param('id') id: string | number, @Body() dto: Partial<UpdateDto>) {
    const parsedId = this.parseId(id);
    const data = await this.service.patchById(parsedId, dto);
    return ApiResponse.ok(data, `${this.modelName} updated successfully`);
  }

  // DINONAKTIFKAN secara global: update massal by-field / bulk melewati aturan
  // bisnis per-modul (mis. proteksi jurnal ber-ReferenceType, status dokumen).
  // Route-nya masih dideklarasikan di subclass, tapi selalu 404.
  async patchByFilterReference(
    @Param('field') _field: string,
    @Param('value') _value: string,
    @Body() _dto: Partial<UpdateDto>,
  ): Promise<ApiResponse<unknown>> {
    throw this.disabled();
  }

  async patchBulk(@Body() _body: { ids: (number | string)[]; data: Partial<UpdateDto> }): Promise<ApiResponse<unknown>> {
    throw this.disabled();
  }

  // ═══════════════════════════════════════════════════════════════
  // PUT (UPSERT) ENDPOINTS
  // ═══════════════════════════════════════════════════════════════

  async upsert(@Body() body: { where: any; create: CreateDto; update: Partial<UpdateDto> }) {
    const data = await this.service.upsert(body.where, body.create, body.update);
    return ApiResponse.ok(data, `${this.modelName} upserted successfully`);
  }

  async upsertByFilterReference(
    @Param('field') field: string,
    @Body() body: { filterValue: any; create: CreateDto; update: Partial<UpdateDto> },
  ) {
    const data = await this.service.upsertByFilterReference(
      { [field]: body.filterValue },
      body.create,
      body.update,
    );
    return ApiResponse.ok(data, `${this.modelName} upserted successfully`);
  }

  // DINONAKTIFKAN (lihat patchBulk).
  async upsertBulk(@Body() _body: { items: any[] }): Promise<ApiResponse<unknown>> {
    throw this.disabled();
  }

  // ═══════════════════════════════════════════════════════════════
  // DELETE ENDPOINTS
  // ═══════════════════════════════════════════════════════════════

  async deleteById(@Param('id') id: string | number) {
    const parsedId = this.parseId(id);
    const data = await this.service.deleteById(parsedId);
    return ApiResponse.ok(data, `${this.modelName} deleted successfully`);
  }

  // DINONAKTIFKAN secara global: hard deleteMany by-field / bulk melewati aturan
  // bisnis (proteksi jurnal otomatis, dokumen yang sudah diposting, dst).
  // Hapus satu per satu lewat DELETE /:id.
  async deleteByFilterReference(@Param('field') _field: string, @Param('value') _value: string): Promise<ApiResponse<unknown>> {
    throw this.disabled();
  }

  async deleteBulk(@Body() _body: { ids: (number | string)[] }): Promise<ApiResponse<unknown>> {
    throw this.disabled();
  }

  // ═══════════════════════════════════════════════════════════════
  // HELPER METHODS
  // ═══════════════════════════════════════════════════════════════

  private disabled(): NotFoundException {
    return new NotFoundException('Endpoint ini tidak tersedia');
  }

  /**
   * Parse ID to appropriate type based on primaryKeyType
   */
  parseId(id: string | number): number | string {
    if (this.primaryKeyType === 'string') {
      return String(id);
    }
    return parseInt(String(id), 10);
  }

  /**
   * Parse value to appropriate type
   */
  parseValue(value: string): string | number | boolean {
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (/^-?\d+$/.test(value)) return parseInt(value, 10);
    if (/^-?\d+\.\d+$/.test(value)) return parseFloat(value);
    return value;
  }
}
