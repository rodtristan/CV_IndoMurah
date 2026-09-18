// ================================================================
// model-metadata.ts — Type Definitions untuk Template System
// ================================================================
//
// COMPREHENSIVE ODATA OPERATORS REFERENCE
// ================================================================
//
// This file documents all supported OData-style operators for $where clauses.
//
// BASIC USAGE:
//   $where[field][operator]=value
//   OR direct: field[operator]=value
//
// ALTERNATIVE (OData style):
//   $filter=field eq 'value' and field2 gt 10
//
// ============================================================================
// COMPARISON OPERATORS
// ============================================================================
// $where[age][eq]=18           → age == 18
// $where[age][ne]=18           → age != 18
// $where[age][gt]=18           → age > 18
// $where[age][gte]=18          → age >= 18
// $where[age][lt]=65           → age < 65
// $where[age][lte]=65          → age <= 65
// $where[name][ieq]=john      → LOWER(name) = 'john' (case-insensitive)
// $where[name][ine]=john       → LOWER(name) != 'john' (case-insensitive)
//
// ============================================================================
// STRING OPERATORS
// ============================================================================
// $where[name][contains]=john      → name LIKE '%john%' (case-insensitive)
// $where[name][startsWith]=dr     → name LIKE 'dr%' (case-insensitive)
// $where[name][endsWith]=jr       → name LIKE '%jr' (case-insensitive)
// $where[name][like]=%john%      → name LIKE '%john%' (with wildcards)
// $where[name][ilike]=john        → name ILIKE '%john%'
// $where[name][matches]=^john     → name ~* '^john' (regex)
// $where[name][imatches]=^john    → case-insensitive regex
//
// ============================================================================
// NULL & BOOLEAN OPERATORS
// ============================================================================
// $where[email][isNull]=true       → email IS NULL
// $where[email][isNotNull]=true   → email IS NOT NULL
// $where[active][isTrue]=true     → active = true
// $where[active][isFalse]=true     → active = false
// $where[name][isEmpty]=true      → name = ''
// $where[name][isNotEmpty]=true   → name != ''
//
// ============================================================================
// ARRAY OPERATORS
// ============================================================================
// $where[status][in]=active,pending,draft    → status IN ('active','pending','draft')
// $where[status][notIn]=draft,archived        → status NOT IN ('draft','archived')
// $where[tags][has]=featured                  → tags @> ARRAY['featured']
// $where[tags][hasSome]=a,b                   → tags && ARRAY['a','b']
// $where[tags][hasEvery]=a,b                  → tags @> ARRAY['a','b']
//
// ============================================================================
// RANGE OPERATORS
// ============================================================================
// $where[age][between]=18,65       → age >= 18 AND age <= 65
// $where[age][notBetween]=0,17     → age < 0 OR age > 17
// $where[createdAt][dateEq]=2024-01-15    → same date (ignores time)
// $where[createdAt][dateNe]=2024-01-15    → different date
// $where[createdAt][dateGt]=2024-01-15    → after date
// $where[createdAt][dateGte]=2024-01-15   → on or after date
// $where[createdAt][dateLt]=2024-01-15    → before date
// $where[createdAt][dateLte]=2024-01-15   → on or before date
// $where[createdAt][dateBetween]=2024-01-01,2024-12-31  → between dates
//
// ============================================================================
// TEXT LENGTH OPERATORS
// ============================================================================
// $where[code][minLength]=3        → LENGTH(code) >= 3
// $where[code][maxLength]=10       → LENGTH(code) <= 10
// $where[code][lengthBetween]=3,10 → LENGTH(code) BETWEEN 3 AND 10
//
// ============================================================================
// LOGICAL OPERATORS
// ============================================================================
// $where[_and][0][status][eq]=active
// $where[_and][1][age][gte]=18
//   → status = 'active' AND age >= 18
//
// $where[_or][0][name][eq]=john
// $where[_or][1][name][eq]=jane
//   → name = 'john' OR name = 'jane'
//
// ============================================================================
// ODATA $FILTER SYNTAX
// ============================================================================
// $filter=name eq 'John' and age gte 18
// $filter=status in ('active','pending')
// $filter=contains(name,'john')
// $filter=startswith(email,'admin')
//
// ============================================================================

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
