// ================================================================
// base.service.ts — Template Service OData untuk Semua Model
// ================================================================
//
// CARA PENGGUNAAN:
// 1. Buat DTO untuk Create dan Update
// 2. Buat service yang extends BaseService
// 3. Konfigurasi ModelConfig di constructor super()
//
// CONTOH:
// @Injectable()
// export class ProductService extends BaseService<
//   Product,
//   CreateProductDto,
//   UpdateProductDto
// > {
//   constructor(
//     prisma: PrismaService,
//     redis: RedisService,
//     queryService: QueryService,
//   ) {
//     super(prisma, redis, queryService, {
//       modelName: 'product',
//       primaryKey: 'id',
//       searchableFields: ['name', 'code'],
//       allowedIncludes: ['category', 'brand', 'unit'],
//       allowedSortFields: ['id', 'name', 'code', 'createdAt'],
//       allowedSelectFields: ['id', 'code', 'name', 'purchasePrice', 'sellingPrice'],
//       defaultOrderBy: { createdAt: 'desc' },
//       maxTake: 100,
//       defaultTake: 20,
//       cacheTtl: 60,
//       softDelete: true,
//       softDeleteField: 'isActive',
//     });
//   }
// }
//
// ================================================================

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma-service';
import { RedisService } from '../redis/redis-service';
import { QueryService } from '../query/query-service';
import {
  ModelConfig,
  ODataQuery,
  PaginatedResult,
  FilterReference,
  BulkOperationResult,
  UpsertReference,
} from './model-metadata';

// ================================================================
// DTO → Prisma field-name mapping
// ================================================================
// Generated DTOs (Create*/Update*) were never renamed when the schema
// moved to PascalCase (Code, Name, IsActive, CategoryID, ...). Rather
// than hand-rename every generated DTO, translate keys generically at
// the point they cross into Prisma: capitalize the first letter, and
// normalize a trailing "Id" (from camelCase FK fields like categoryId)
// to "ID" to match the schema's `XxxID` foreign-key convention.
function toPascalKey(key: string): string {
  if (!key) return key;
  const capitalized = key.charAt(0).toUpperCase() + key.slice(1);
  return capitalized.replace(/Id\b/g, 'ID');
}

function toPrismaData<TIn extends Record<string, any> | undefined | null>(obj: TIn): any {
  if (!obj || typeof obj !== 'object') return obj;
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[toPascalKey(key)] = value;
  }
  return result;
}

@Injectable()
export class BaseService<
  T extends Record<string, any>,
  CreateDto extends Record<string, any> = any,
  UpdateDto extends Record<string, any> = any,
  WhereUnique extends Record<string, any> = any,
  WhereInput extends Record<string, any> = any,
> {
  CACHE_PREFIX: string;
  CACHE_TTL: number;
  config: ModelConfig<T, CreateDto, UpdateDto, WhereUnique, WhereInput>;

  constructor(
    readonly prisma: PrismaService,
    readonly redis: RedisService,
    readonly queryService: QueryService,
    config: ModelConfig<T, CreateDto, UpdateDto, WhereUnique, WhereInput>,
  ) {
    this.config = {
      maxTake: 100,
      defaultTake: 20,
      cacheTtl: 60,
      softDelete: false,
      softDeleteField: 'IsActive',
      defaultOrderBy: { CreatedAt: 'desc' as const },
      ...config,
    };
    this.CACHE_PREFIX = config.modelName;
    this.CACHE_TTL = config.cacheTtl ?? 60;
  }

  // ═══════════════════════════════════════════════════════════════
  // GET OPERATIONS
  // ═══════════════════════════════════════════════════════════════

  /**
   * GET / — Ambil semua data dengan OData query
   * Endpoint: GET
   */
  async findAll(query: ODataQuery = {}): Promise<PaginatedResult<T>> {
    const cacheKey = this.queryService.generateCacheKey(this.CACHE_PREFIX, query);

    return this.redis.getOrSet(
      cacheKey,
      async () => {
        const prismaQuery = this.queryService.buildPrismaQuery(query, {
          searchableFields: this.config.searchableFields,
          allowedIncludes: this.config.allowedIncludes,
          allowedSortFields: this.config.allowedSortFields,
          allowedFields: this.config.allowedSelectFields,
          defaultOrderBy: this.config.defaultOrderBy,
          maxTake: this.config.maxTake,
          defaultTake: this.config.defaultTake,
        });

        // Add soft delete filter if enabled
        if (this.config.softDelete && this.config.softDeleteField) {
          prismaQuery.where[this.config.softDeleteField] = true;
        }

        const findArgs: any = {
          where: prismaQuery.where,
          orderBy: prismaQuery.orderBy,
          skip: prismaQuery.skip,
          take: prismaQuery.take,
        };

        if (prismaQuery.select) {
          findArgs.select = prismaQuery.select;
        } else if (prismaQuery.include) {
          findArgs.include = prismaQuery.include;
        }

        const model = this.getModel();
        const [data, total] = await Promise.all([
          model.findMany(findArgs),
          model.count({ where: prismaQuery.where }),
        ]);

        return { data, total, skip: prismaQuery.skip, take: prismaQuery.take };
      },
      this.CACHE_TTL,
    );
  }

  /**
   * GET /count — Hitung total data dengan filter
   * Endpoint: GET /count
   */
  async getCount(query: ODataQuery = {}): Promise<{ count: number }> {
    const prismaQuery = this.queryService.buildPrismaQuery(query, {
      searchableFields: this.config.searchableFields,
    });

    // Add soft delete filter if enabled
    if (this.config.softDelete && this.config.softDeleteField) {
      prismaQuery.where[this.config.softDeleteField] = true;
    }

    const model = this.getModel();
    const count = await model.count({ where: prismaQuery.where });
    return { count };
  }

  /**
   * GET /:id — Ambil satu data berdasarkan Primary Key
   * Endpoint: GET /:id
   */
  async findById(id: any, query: ODataQuery = {}): Promise<T | null> {
    const cacheKey = `${this.CACHE_PREFIX}:${id}:${this.queryService.generateCacheKey('q', query)}`;

    return this.redis.getOrSet(
      cacheKey,
      async () => {
        const prismaQuery = this.queryService.buildPrismaQuery(query, {
          allowedIncludes: this.config.allowedIncludes,
        });

        const findArgs: any = {
          where: { [this.config.primaryKey]: id } as any,
        };

        if (prismaQuery.select) {
          findArgs.select = prismaQuery.select;
        } else if (prismaQuery.include) {
          findArgs.include = prismaQuery.include;
        }

        const model = this.getModel();
        return model.findUnique(findArgs);
      },
      this.CACHE_TTL,
    );
  }

  /**
   * GET /by/:field/:value — Ambil satu data berdasarkan field non-PK
   * Endpoint: GET /by/:field/:value
   */
  async findByField(field: string, value: any, query: ODataQuery = {}): Promise<T | null> {
    const cacheKey = `${this.CACHE_PREFIX}:by:${field}:${value}:${this.queryService.generateCacheKey('q', query)}`;

    return this.redis.getOrSet(
      cacheKey,
      async () => {
        const prismaQuery = this.queryService.buildPrismaQuery(query, {
          allowedIncludes: this.config.allowedIncludes,
        });

        const findArgs: any = {
          where: { [field]: value } as any,
        };

        if (prismaQuery.select) {
          findArgs.select = prismaQuery.select;
        } else if (prismaQuery.include) {
          findArgs.include = prismaQuery.include;
        }

        const model = this.getModel();
        return model.findFirst(findArgs);
      },
      this.CACHE_TTL,
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // POST OPERATIONS
  // ═══════════════════════════════════════════════════════════════

  /**
   * POST / — Buat satu data baru
   * Endpoint: POST
   */
  async create(dto: CreateDto): Promise<T> {
    // Generate code if configured
    let data: any = toPrismaData({ ...dto });
    if (this.config.autoRelations) {
      for (const relation of this.config.autoRelations) {
        data[relation.field] = relation.value;
      }
    }

    const model = this.getModel();
    const result = await model.create({ data });

    await this.invalidateCache();
    return result;
  }

  /**
   * POST /bulk — Buat banyak data sekaligus
   * Endpoint: POST /bulk
   */
  async createBulk(dtos: CreateDto[]): Promise<BulkOperationResult<T>> {
    const success: T[] = [];
    const failed: { data?: any; error: string }[] = [];

    const model = this.getModel();

    for (const dto of dtos) {
      try {
        let data: any = toPrismaData({ ...dto });
        if (this.config.autoRelations) {
          for (const relation of this.config.autoRelations) {
            data[relation.field] = relation.value;
          }
        }
        const result = await model.create({ data });
        success.push(result);
      } catch (error) {
        failed.push({
          data: dto,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    if (success.length > 0) {
      await this.invalidateCache();
    }

    return {
      success,
      failed,
      total: dtos.length,
      successCount: success.length,
      failedCount: failed.length,
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // PATCH OPERATIONS
  // ═══════════════════════════════════════════════════════════════

  /**
   * PATCH /:id — Update satu data berdasarkan Primary Key
   * Endpoint: PATCH /:id
   */
  async patchById(id: any, dto: Partial<UpdateDto>): Promise<T> {
    const model = this.getModel();

    // Check if exists
    const exists = await model.findUnique({
      where: { [this.config.primaryKey]: id } as any,
    });
    if (!exists) {
      throw new NotFoundException(`${this.config.modelName} not found`);
    }

    const result = await model.update({
      where: { [this.config.primaryKey]: id } as any,
      data: toPrismaData(dto),
    });

    await this.invalidateCache();
    await this.invalidateItemCache(id);

    return result;
  }

  /**
   * PATCH /by/:field/:value — Update data berdasarkan filter (non-PK)
   * Endpoint: PATCH /by/:field/:value
   */
  async patchByFilterReference(filter: FilterReference, dto: Partial<UpdateDto>): Promise<T[]> {
    const model = this.getModel();
    const where = toPrismaData(filter as any);

    // Check if any exists
    const count = await model.count({ where });
    if (count === 0) {
      throw new NotFoundException(`${this.config.modelName}(s) not found`);
    }

    const results = await model.updateMany({
      where,
      data: toPrismaData(dto),
    });

    await this.invalidateCache();

    // Return updated records
    return model.findMany({ where });
  }

  /**
   * PATCH /bulk — Update banyak data sekaligus
   * Endpoint: PATCH /bulk
   * Body: { ids: number[], data: Partial<UpdateDto> }
   */
  async patchBulk(ids: any[], dto: Partial<UpdateDto>): Promise<BulkOperationResult<T>> {
    const success: T[] = [];
    const failed: { id?: any; error: string }[] = [];

    const model = this.getModel();

    for (const id of ids) {
      try {
        const result = await model.update({
          where: { [this.config.primaryKey]: id } as any,
          data: toPrismaData(dto),
        });
        success.push(result);
      } catch (error) {
        if (error instanceof NotFoundException) {
          failed.push({ id, error: 'Not found' });
        } else {
          failed.push({
            id,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    }

    if (success.length > 0) {
      await this.invalidateCache();
    }

    return {
      success,
      failed,
      total: ids.length,
      successCount: success.length,
      failedCount: failed.length,
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // DELETE OPERATIONS
  // ═══════════════════════════════════════════════════════════════

  /**
   * DELETE /:id — Hapus satu data berdasarkan Primary Key
   * Endpoint: DELETE /:id
   * Jika softDelete = true, maka update isActive = false
   */
  async deleteById(id: any): Promise<T> {
    const model = this.getModel();

    // Check if exists
    const exists = await model.findUnique({
      where: { [this.config.primaryKey]: id } as any,
    });
    if (!exists) {
      throw new NotFoundException(`${this.config.modelName} not found`);
    }

    let result: T;

    if (this.config.softDelete && this.config.softDeleteField) {
      // Soft delete
      result = await model.update({
        where: { [this.config.primaryKey]: id } as any,
        data: { [this.config.softDeleteField]: false } as any,
      });
    } else {
      // Hard delete
      result = await model.delete({
        where: { [this.config.primaryKey]: id } as any,
      });
    }

    await this.invalidateCache();
    await this.invalidateItemCache(id);

    return result;
  }

  /**
   * DELETE /by/:field/:value — Hapus data berdasarkan filter (non-PK)
   * Endpoint: DELETE /by/:field/:value
   */
  async deleteByFilterReference(filter: FilterReference): Promise<{ count: number }> {
    const model = this.getModel();
    const where = toPrismaData(filter as any);

    // Check if any exists
    const count = await model.count({ where });
    if (count === 0) {
      throw new NotFoundException(`${this.config.modelName}(s) not found`);
    }

    let result: any;

    if (this.config.softDelete && this.config.softDeleteField) {
      // Soft delete
      result = await model.updateMany({
        where,
        data: { [this.config.softDeleteField]: false } as any,
      });
    } else {
      // Hard delete
      result = await model.deleteMany({
        where,
      });
    }

    await this.invalidateCache();

    return { count: result.count ?? count };
  }

  /**
   * DELETE /bulk — Hapus banyak data sekaligus
   * Endpoint: DELETE /bulk
   * Body: { ids: number[] }
   */
  async deleteBulk(ids: any[]): Promise<BulkOperationResult<T>> {
    const success: T[] = [];
    const failed: { id?: any; error: string }[] = [];

    const model = this.getModel();

    for (const id of ids) {
      try {
        // Check if exists
        const exists = await model.findUnique({
          where: { [this.config.primaryKey]: id } as any,
        });
        if (!exists) {
          failed.push({ id, error: 'Not found' });
          continue;
        }

        let result: T;
        if (this.config.softDelete && this.config.softDeleteField) {
          result = await model.update({
            where: { [this.config.primaryKey]: id } as any,
            data: { [this.config.softDeleteField]: false } as any,
          });
        } else {
          result = await model.delete({
            where: { [this.config.primaryKey]: id } as any,
          });
        }
        success.push(result);
      } catch (error) {
        failed.push({
          id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    if (success.length > 0) {
      await this.invalidateCache();
    }

    return {
      success,
      failed,
      total: ids.length,
      successCount: success.length,
      failedCount: failed.length,
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // UPSERT OPERATIONS
  // ═══════════════════════════════════════════════════════════════

  /**
   * UPSERT / — Insert atau Update berdasarkan Primary Key
   * Endpoint: UPSERT
   * Body: { where: { id }, create: DTO, update: Partial<DTO> }
   */
  async upsert(
    where: WhereUnique,
    createDto: CreateDto,
    updateDto: Partial<UpdateDto>,
  ): Promise<T> {
    const model = this.getModel();

    const result = await model.upsert({
      where: toPrismaData(where as any),
      create: toPrismaData(createDto as any),
      update: toPrismaData(updateDto as any),
    });

    await this.invalidateCache();
    return result;
  }

  /**
   * UPSERT /by/:field — Insert atau Update berdasarkan filter non-PK
   * Endpoint: UPSERT /by/:field
   * Body: { filter: { email }, create: DTO, update: Partial<DTO> }
   */
  async upsertByFilterReference(
    filter: FilterReference,
    createDto: CreateDto,
    updateDto: Partial<UpdateDto>,
  ): Promise<T> {
    const model = this.getModel();
    const where = toPrismaData(filter as any);

    // Check if exists
    const existing = await model.findFirst({
      where,
    });

    if (existing) {
      // Update
      const result = await model.update({
        where: { [this.config.primaryKey]: (existing as any)[this.config.primaryKey] } as any,
        data: toPrismaData(updateDto as any),
      });
      await this.invalidateCache();
      return result;
    } else {
      // Create
      const result = await model.create({
        data: toPrismaData({ ...filter, ...createDto } as any),
      });
      await this.invalidateCache();
      return result;
    }
  }

  /**
   * UPSERT /bulk — Bulk upsert
   * Endpoint: UPSERT /bulk
   */
  async upsertBulk(
    items: UpsertReference[],
  ): Promise<BulkOperationResult<T>> {
    const success: T[] = [];
    const failed: { data?: UpsertReference; error: string }[] = [];

    const model = this.getModel();

    for (const item of items) {
      try {
        // Check if exists
        const itemWhere = toPrismaData(item.where as any);
        const existing = await model.findFirst({
          where: itemWhere,
        });

        let result: T;
        if (existing) {
          result = await model.update({
            where: { [this.config.primaryKey]: (existing as any)[this.config.primaryKey] } as any,
            data: toPrismaData(item.update as any),
          });
        } else {
          result = await model.create({
            data: toPrismaData({ ...item.where, ...item.create } as any),
          });
        }
        success.push(result);
      } catch (error) {
        failed.push({
          data: item,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    if (success.length > 0) {
      await this.invalidateCache();
    }

    return {
      success,
      failed,
      total: items.length,
      successCount: success.length,
      failedCount: failed.length,
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // HELPER METHODS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Get Prisma model reference
   */
  getModel(): any {
    return (this.prisma as any)[this.config.modelName];
  }

  /**
   * Invalidate all cache for this model
   */
  async invalidateCache(): Promise<void> {
    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);
  }

  /**
   * Invalidate specific item cache
   */
  async invalidateItemCache(id: any): Promise<void> {
    await this.redis.del(`${this.CACHE_PREFIX}:${id}:*`);
  }
}
