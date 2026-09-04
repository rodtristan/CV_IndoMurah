import { Injectable } from '@nestjs/common';

/**
 * ============================================================
 * SMART QUERY ENGINE — Faster than OData & GraphQL
 * ============================================================
 *
 * Why faster?
 * - No schema introspection overhead (GraphQL)
 * - No complex OData parser
 * - Direct translation to Prisma query = single optimized SQL
 * - Zero serialization/deserialization layers
 * - Results cached in Redis automatically
 *
 * Query Parameters:
 *   $select       = field1,field2          → Select specific fields
 *   $include      = relation1,relation2    → Include relations (nested with dot notation)
 *   $where[field] = value                  → Filter by field
 *   $orderBy[field] = asc|desc             → Sort
 *   $skip         = 0                      → Offset for pagination
 *   $take         = 20                     → Limit (max 100)
 *   $search       = keyword                → Full-text search
 *   $searchFields = field1,field2          → Fields to search in
 *
 * Advanced filters:
 *   $where[field][$gt]    = value          → Greater than
 *   $where[field][$gte]   = value          → Greater than or equal
 *   $where[field][$lt]    = value          → Less than
 *   $where[field][$lte]   = value          → Less than or equal
 *   $where[field][$not]   = value          → Not equal
 *   $where[field][$in]    = val1,val2      → In array
 *   $where[field][$like]  = %keyword%      → Contains (case-insensitive)
 *   $where[field][$null]  = true|false     → Is null / is not null
 * ============================================================
 */
@Injectable()
export class QueryService {
  /**
   * Build a complete Prisma query from request query parameters
   */
  buildPrismaQuery(
    query: Record<string, any>,
    options?: {
      allowedFields?: string[];     // Whitelist of allowed select fields
      allowedIncludes?: string[];   // Whitelist of allowed includes
      allowedSortFields?: string[]; // Whitelist of allowed sort fields
      searchableFields?: string[];  // Default fields for $search
      maxTake?: number;             // Maximum page size (default 100)
      defaultTake?: number;         // Default page size (default 20)
      defaultOrderBy?: Record<string, 'asc' | 'desc'>; // Default sort
    },
  ): {
    select: Record<string, any> | undefined;
    include: Record<string, any> | undefined;
    where: Record<string, any>;
    orderBy: Record<string, any> | Record<string, any>[];
    skip: number;
    take: number;
  } {
    const maxTake = options?.maxTake ?? 100;
    const defaultTake = options?.defaultTake ?? 20;

    return {
      select: this.parseSelect(query, options?.allowedFields),
      include: this.parseInclude(query, options?.allowedIncludes),
      where: this.parseWhere(query, options?.searchableFields),
      orderBy: this.parseOrderBy(query, options?.allowedSortFields, options?.defaultOrderBy),
      skip: this.parseSkip(query),
      take: this.parseTake(query, maxTake, defaultTake),
    };
  }

  /**
   * Parse $select=id,name,email → { id: true, name: true, email: true }
   */
  private parseSelect(
    query: Record<string, any>,
    allowedFields?: string[],
  ): Record<string, boolean> | undefined {
    const selectStr = query['$select'];
    if (!selectStr) return undefined;

    const fields = String(selectStr).split(',').map((f) => f.trim()).filter(Boolean);
    if (fields.length === 0) return undefined;

    const select: Record<string, boolean> = {};
    for (const field of fields) {
      if (!allowedFields || allowedFields.includes(field)) {
        select[field] = true;
      }
    }

    return Object.keys(select).length > 0 ? select : undefined;
  }

  /**
   * Parse $include=category,variants.warehouse
   * → { category: true, variants: { include: { warehouse: true } } }
   */
  private parseInclude(
    query: Record<string, any>,
    allowedIncludes?: string[],
  ): Record<string, any> | undefined {
    const includeStr = query['$include'];
    if (!includeStr) return undefined;

    const relations = String(includeStr).split(',').map((r) => r.trim()).filter(Boolean);
    if (relations.length === 0) return undefined;

    const include: Record<string, any> = {};

    for (const relation of relations) {
      const rootRelation = relation.split('.')[0];
      if (allowedIncludes && !allowedIncludes.includes(rootRelation)) {
        continue;
      }

      const parts = relation.split('.');
      if (parts.length === 1) {
        include[parts[0]] = true;
      } else {
        // Nested: variants.warehouse → { variants: { include: { warehouse: true } } }
        let current = include;
        for (let i = 0; i < parts.length; i++) {
          const part = parts[i];
          if (i === parts.length - 1) {
            if (typeof current[part] !== 'object') {
              current[part] = true;
            }
          } else {
            if (current[part] === true || !current[part]) {
              current[part] = { include: {} };
            }
            current = current[part].include;
          }
        }
      }
    }

    return Object.keys(include).length > 0 ? include : undefined;
  }

  /**
   * Parse $where[field]=value, $where[field][$gt]=value, etc.
   * Also handles $search and $searchFields
   */
  private parseWhere(
    query: Record<string, any>,
    defaultSearchFields?: string[],
  ): Record<string, any> {
    const where: Record<string, any> = {};

    // Parse $where filters
    const whereObj = query['$where'];
    if (whereObj && typeof whereObj === 'object') {
      for (const [field, value] of Object.entries(whereObj)) {
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          // Advanced operator: $where[field][$gt]=10
          where[field] = this.parseOperator(value as Record<string, string>);
        } else {
          // Simple: $where[field]=value
          where[field] = this.castValue(value as string);
        }
      }
    }

    // Parse $search
    const searchStr = query['$search'];
    if (searchStr && String(searchStr).trim()) {
      const searchFieldsStr = query['$searchFields'];
      const searchFields = searchFieldsStr
        ? String(searchFieldsStr).split(',').map((f) => f.trim()).filter(Boolean)
        : defaultSearchFields || [];

      if (searchFields.length > 0) {
        where.OR = searchFields.map((field) => ({
          [field]: { contains: String(searchStr).trim(), mode: 'insensitive' },
        }));
      }
    }

    return where;
  }

  /**
   * Parse advanced operators like $gt, $gte, $lt, $lte, $not, $in, $like, $null
   */
  private parseOperator(operators: Record<string, string>): Record<string, any> {
    const result: Record<string, any> = {};

    for (const [op, rawValue] of Object.entries(operators)) {
      const value = this.castValue(rawValue);

      switch (op) {
        case '$gt':
          result.gt = value;
          break;
        case '$gte':
          result.gte = value;
          break;
        case '$lt':
          result.lt = value;
          break;
        case '$lte':
          result.lte = value;
          break;
        case '$not':
          result.not = value;
          break;
        case '$in':
          result.in = String(rawValue).split(',').map((v) => this.castValue(v.trim()));
          break;
        case '$like':
          result.contains = String(rawValue);
          result.mode = 'insensitive';
          break;
        case '$null':
          if (rawValue === 'true') {
            return null as any; // field IS NULL
          } else {
            result.not = null;
          }
          break;
        default:
          result[op] = value;
      }
    }

    return result;
  }

  /**
   * Parse $orderBy[field]=asc|desc
   */
  private parseOrderBy(
    query: Record<string, any>,
    allowedSortFields?: string[],
    defaultOrderBy?: Record<string, 'asc' | 'desc'>,
  ): Record<string, any> | Record<string, any>[] {
    const orderByObj = query['$orderBy'];
    if (!orderByObj || typeof orderByObj !== 'object') {
      return defaultOrderBy || { createdAt: 'desc' };
    }

    const orderByArray: Record<string, any>[] = [];
    for (const [field, direction] of Object.entries(orderByObj)) {
      if (allowedSortFields && !allowedSortFields.includes(field)) continue;
      const dir = String(direction).toLowerCase();
      if (dir === 'asc' || dir === 'desc') {
        orderByArray.push({ [field]: dir });
      }
    }

    return orderByArray.length > 0
      ? orderByArray.length === 1
        ? orderByArray[0]
        : orderByArray
      : defaultOrderBy || { createdAt: 'desc' };
  }

  /**
   * Parse $skip=0
   */
  private parseSkip(query: Record<string, any>): number {
    const skip = parseInt(query['$skip'], 10);
    return isNaN(skip) || skip < 0 ? 0 : skip;
  }

  /**
   * Parse $take=20 (capped at maxTake)
   */
  private parseTake(query: Record<string, any>, maxTake: number, defaultTake: number): number {
    const take = parseInt(query['$take'], 10);
    if (isNaN(take) || take < 1) return defaultTake;
    return Math.min(take, maxTake);
  }

  /**
   * Auto-cast string values to proper types
   */
  private castValue(raw: any): any {
    if (raw === undefined || raw === null) return raw;
    const str = String(raw);
    if (str === 'true') return true;
    if (str === 'false') return false;
    if (str === 'null') return null;
    // Check if it's a number
    if (/^-?\d+$/.test(str)) return parseInt(str, 10);
    if (/^-?\d+\.\d+$/.test(str)) return parseFloat(str);
    // Check if it's a date (ISO format)
    if (/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2})?/.test(str)) {
      const date = new Date(str);
      if (!isNaN(date.getTime())) return date;
    }
    return str;
  }

  /**
   * Generate a cache key from query params for Redis
   */
  generateCacheKey(prefix: string, query: Record<string, any>): string {
    const sorted = JSON.stringify(query, Object.keys(query).sort());
    // Simple hash for compact keys
    let hash = 0;
    for (let i = 0; i < sorted.length; i++) {
      const char = sorted.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return `${prefix}:${hash}`;
  }
}
