// ================================================================
// model-metadata.ts — Type Definitions untuk Template System
// ================================================================

import { Type } from '@nestjs/common';

/**
 * Konfigurasi untuk setiap model - digunakan oleh BaseService & BaseController
 */
export interface ModelConfig<
  T extends Record<string, any>,
  CreateDto extends Record<string, any>,
  UpdateDto extends Record<string, any> = any,
  WhereUnique extends Record<string, any> = any,
  WhereInput extends Record<string, any> = any,
> {
  /** Nama model Prisma (lowercase) */
  modelName: string;

  /** Create DTO class */
  createDtoClass?: Type<CreateDto>;

  /** Update DTO class */
  updateDtoClass?: Type<UpdateDto>;

  /** Primary key field name */
  primaryKey: string;

  /** Default fields untuk search (OData $search) */
  searchableFields?: string[];

  /** Fields yang boleh di-include sebagai relation */
  allowedIncludes?: string[];

  /** Fields yang boleh di-sort */
  allowedSortFields?: string[];

  /** Fields yang boleh di-select */
  allowedSelectFields?: string[];

  /** Default orderBy */
  defaultOrderBy?: Record<string, 'asc' | 'desc'>;

  /** Maximum $take value */
  maxTake?: number;

  /** Default $take value */
  defaultTake?: number;

  /** Cache TTL dalam detik */
  cacheTtl?: number;

  /** Enable soft delete (menggunakan isActive field) */
  softDelete?: boolean;

  /** Field untuk soft delete */
  softDeleteField?: string;

  /** Field unique untuk generate code otomatis */
  codeField?: string;

  /** Prefix untuk code generation */
  codePrefix?: string;

  /** Relations yang auto-generated saat create */
  autoRelations?: {
    field: string;
    value: any;
  }[];
}

/**
 * OData Query Options
 */
export interface ODataQuery {
  /** $select=id,name,email */
  $select?: string;

  /** $include=relation1,relation2.nested */
  $include?: string;

  /** $where[field]=value atau $where[field][$operator]=value */
  $where?: Record<string, any>;

  /** $orderBy[field]=asc|desc */
  $orderBy?: Record<string, 'asc' | 'desc'>;

  /** $skip=0 */
  $skip?: number;

  /** $take=20 */
  $take?: number;

  /** $search=keyword */
  $search?: string;

  /** $searchFields=field1,field2 */
  $searchFields?: string[];
}

/**
 * Result dari findAll dengan pagination
 */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  skip: number;
  take: number;
}

/**
 * Filter Reference - untuk operasi berdasarkan field non-PK
 * Contoh: DeleteByFilterReference({ email: "test@test.com" })
 */
export interface FilterReference {
  [key: string]: any;
}

/**
 * Bulk Operation Result
 */
export interface BulkOperationResult<T> {
  success: T[];
  failed: { id?: any; data?: any; error: string }[];
  total: number;
  successCount: number;
  failedCount: number;
}

/**
 * Upsert Reference - untuk upsert berdasarkan field non-unique
 */
export interface UpsertReference {
  where: Record<string, any>;
  create: Record<string, any>;
  update: Record<string, any>;
}
