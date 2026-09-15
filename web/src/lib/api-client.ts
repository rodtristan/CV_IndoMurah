// ============================================================
// Ketoko POS API Client
// OData-optimized with intelligent caching & batching
// ============================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// ─── Types ──────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: {
    total: number;
    skip: number;
    take: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ODataParams {
  $select?: string | string[];
  $include?: string | string[];
  $where?: Record<string, unknown>;
  $search?: string;
  $searchFields?: string | string[];
  $orderBy?: Record<string, 'asc' | 'desc'> | string;
  $skip?: number;
  $take?: number;
  $page?: number;
  $pageSize?: number;
  [key: string]: unknown;
}

// ─── Cache ───────────────────────────────────────────────────

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  etag?: string;
}

class QueryCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private ttl = 30000; // 30 seconds default TTL

  private makeKey(endpoint: string, params?: ODataParams): string {
    return `${endpoint}:${JSON.stringify(params || {})}`;
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    return entry.data;
  }

  set<T>(key: string, data: T, etag?: string): void {
    this.cache.set(key, { data, timestamp: Date.now(), etag });
  }

  invalidate(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  setTTL(ms: number): void {
    this.ttl = ms;
  }
}

export const queryCache = new QueryCache();

// ─── OData Query Builder ────────────────────────────────────

class ODataQueryBuilder {
  private params: URLSearchParams = new URLSearchParams();

  select(fields: string | string[]): this {
    const f = Array.isArray(fields) ? fields.join(',') : fields;
    this.params.set('$select', f);
    return this;
  }

  include(relations: string | string[]): this {
    const r = Array.isArray(relations) ? relations.join(',') : relations;
    this.params.set('$include', r);
    return this;
  }

  where(conditions: Record<string, unknown>): this {
    Object.entries(conditions).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        this.params.set(`$where[${key}]`, String(value));
      }
    });
    return this;
  }

  search(query: string, fields?: string | string[]): this {
    this.params.set('$search', query);
    if (fields) {
      const f = Array.isArray(fields) ? fields.join(',') : fields;
      this.params.set('$searchFields', f);
    }
    return this;
  }

  orderBy(field: string, direction: 'asc' | 'desc' = 'asc'): this {
    this.params.set('$orderBy', `${field}:${direction}`);
    return this;
  }

  orderByMulti(orders: Record<string, 'asc' | 'desc'>): this {
    const parts = Object.entries(orders).map(([k, v]) => `${k}:${v}`);
    this.params.set('$orderBy', parts.join(','));
    return this;
  }

  page(page: number, pageSize = 20): this {
    const skip = (page - 1) * pageSize;
    this.params.set('$skip', String(skip));
    this.params.set('$take', String(pageSize));
    return this;
  }

  skip(n: number): this { this.params.set('$skip', String(n)); return this; }
  take(n: number): this { this.params.set('$take', String(n)); return this; }

  toParams(): ODataParams {
    const result: ODataParams = {};
    this.params.forEach((value, key) => {
      if (key === '$orderBy') {
        // Internal representation is "field:dir,field2:dir2" — the backend's
        // Smart Query engine needs a real { field: dir } object (sent as
        // $orderBy[field]=dir on the wire, see ApiClient.buildUrl).
        const orderBy: Record<string, 'asc' | 'desc'> = {};
        value.split(',').filter(Boolean).forEach((part) => {
          const [field, dir] = part.split(':');
          if (field && (dir === 'asc' || dir === 'desc')) orderBy[field] = dir;
        });
        if (Object.keys(orderBy).length > 0) result.$orderBy = orderBy;
      } else if (key.startsWith('$where[')) {
        const field = key.replace('$where[', '').replace(']', '');
        if (!result.$where) result.$where = {};
        (result.$where as Record<string, unknown>)[field] = this.parseValue(value);
      } else if (key.startsWith('$')) {
        result[key] = value;
      } else {
        result[key] = this.parseValue(value);
      }
    });
    return result;
  }

  toQueryString(): string {
    return this.params.toString();
  }

  private parseValue(value: string): unknown {
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (/^\d+$/.test(value)) return parseInt(value, 10);
    if (/^\d+\.\d+$/.test(value)) return parseFloat(value);
    return value;
  }

  clone(): ODataQueryBuilder {
    const q = new ODataQueryBuilder();
    q.params = new URLSearchParams(this.params.toString());
    return q;
  }
}

// ─── OData query helper ─────────────────────────────────────

export const odata = () => new ODataQueryBuilder();

// ─── API Client ─────────────────────────────────────────────

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestConfig {
  method: RequestMethod;
  endpoint: string;
  body?: unknown;
  params?: ODataParams;
  headers?: Record<string, string>;
  cache?: RequestCache;
  tags?: string[];
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;
  private requestQueue: (() => Promise<void>)[] = [];
  private isProcessing = false;
  private maxConcurrent = 6;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('ketoko_token');
    }
  }

  setToken(token: string | null): void {
    this.token = token;
    if (token && typeof window !== 'undefined') {
      localStorage.setItem('ketoko_token', token);
    } else if (typeof window !== 'undefined') {
      localStorage.removeItem('ketoko_token');
    }
  }

  getToken(): string | null {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem('ketoko_token');
    }
    return this.token;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  private buildUrl(endpoint: string, params?: ODataParams): string {
    const url = new URL(`${this.baseUrl}/${endpoint.replace(/^\//, '')}`);
    if (!params) return url.toString();

    // Backend (Fastify + `qs`, see api/src/main.ts) parses bracket-notation
    // query strings into nested objects, e.g. `$where[price][$gt]=100` →
    // `{ $where: { price: { $gt: '100' } } }`. Each leaf must be appended
    // as its OWN `key[...]=value` pair — not pre-joined into one string —
    // otherwise `qs` can't rebuild the nested shape the Smart Query engine
    // (api/src/common/query/query-service.ts) expects.
    const appendNested = (prefix: string, v: unknown) => {
      if (v === undefined || v === null) return;
      if (typeof v === 'object' && !Array.isArray(v)) {
        for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
          appendNested(`${prefix}[${k}]`, val);
        }
      } else {
        url.searchParams.append(prefix, String(v));
      }
    };

    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null) continue;
      if ((key === '$where' || key === '$orderBy') && typeof value === 'object') {
        appendNested(key, value);
      } else if (Array.isArray(value)) {
        url.searchParams.set(key, value.join(','));
      } else {
        url.searchParams.set(key, String(value));
      }
    }

    return url.toString();
  }

  private async processRequest<T>(config: RequestConfig): Promise<ApiResponse<T>> {
    const { method, endpoint, body, params, headers, cache, tags } = config;
    const url = this.buildUrl(endpoint, params);
    const reqHeaders = { ...this.getHeaders(), ...headers };

    const fetchOptions: RequestInit = {
      method,
      headers: reqHeaders,
    };

    if (body && method !== 'GET') {
      fetchOptions.body = JSON.stringify(body);
    }

    if (cache) fetchOptions.cache = cache;
    if (tags) fetchOptions.next = { tags };

    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  async request<T>(
    method: RequestMethod,
    endpoint: string,
    body?: unknown,
    params?: ODataParams,
    options?: { cache?: RequestCache; tags?: string[] }
  ): Promise<ApiResponse<T>> {
    return this.processRequest<T>({
      method,
      endpoint,
      body,
      params,
      ...options,
    });
  }

  // ─── Smart GET with caching ────────────────────────────────

  async get<T>(
    endpoint: string,
    params?: ODataParams,
    options?: { cache?: RequestCache; tags?: string[]; skipCache?: boolean }
  ): Promise<ApiResponse<T>> {
    const cacheKey = `${endpoint}:${JSON.stringify(params || {})}`;

    if (!options?.skipCache && options?.cache !== 'no-store') {
      const cached = queryCache.get<ApiResponse<T>>(cacheKey);
      if (cached) return cached;
    }

    const result = await this.request<T>('GET', endpoint, undefined, params, options);
    if (result.success) {
      queryCache.set(cacheKey, result);
    }
    return result;
  }

  async getOne<T>(endpoint: string, id: number | string, params?: ODataParams): Promise<ApiResponse<T>> {
    return this.get<T>(`${endpoint}/${id}`, params);
  }

  async post<T>(endpoint: string, body: unknown, params?: ODataParams): Promise<ApiResponse<T>> {
    const result = await this.request<T>('POST', endpoint, body, params);
    queryCache.invalidate(endpoint);
    return result;
  }

  async put<T>(endpoint: string, id: number | string, body: unknown, params?: ODataParams): Promise<ApiResponse<T>> {
    const result = await this.request<T>('PUT', `${endpoint}/${id}`, body, params);
    queryCache.invalidate(endpoint);
    return result;
  }

  async patch<T>(endpoint: string, id: number | string, body: unknown, params?: ODataParams): Promise<ApiResponse<T>> {
    const result = await this.request<T>('PATCH', `${endpoint}/${id}`, body, params);
    queryCache.invalidate(endpoint);
    return result;
  }

  async delete<T>(endpoint: string, id: number | string): Promise<ApiResponse<T>> {
    const result = await this.request<T>('DELETE', `${endpoint}/${id}`);
    queryCache.invalidate(endpoint);
    return result;
  }

  // ─── Batch operations ──────────────────────────────────────

  async batch<T>(requests: Array<() => Promise<ApiResponse<T>>>): Promise<ApiResponse<T>[]> {
    const results: ApiResponse<T>[] = [];
    let index = 0;

    const processBatch = async () => {
      while (index < requests.length) {
        const batch = requests.slice(index, index + this.maxConcurrent);
        index += this.maxConcurrent;
        const batchResults = await Promise.all(batch.map(r => r()));
        results.push(...batchResults);
      }
    };

    await processBatch();
    return results;
  }

  // ─── Auth ──────────────────────────────────────────────────

  async login(companyCode: string, username: string, password: string): Promise<ApiResponse<{ token: string; user: unknown }>> {
    const result = await this.request<{ token: string; user: unknown }>('POST', 'auth/login', { companyCode, username, password });
    if (result.success && result.data?.token) {
      this.setToken(result.data.token);
    }
    return result;
  }

  logout(): void {
    this.setToken(null);
    queryCache.invalidate();
  }

  // ─── Cache control ─────────────────────────────────────────

  invalidateCache(pattern?: string): void {
    queryCache.invalidate(pattern);
  }
}

export const api = new ApiClient();
export type { ODataQueryBuilder };
export default api;
