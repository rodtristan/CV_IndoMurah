// ============================================================
// Ketoko POS API Client
// OData-optimized with intelligent caching & batching
// ============================================================

// NEXT_PUBLIC_API_URL is inlined at build time (see web/.env.example). In development
// we fall back to the local API (port 5000, prefix /api/v1); a production build without
// it must fail loudly instead of silently pointing browsers at localhost.
function resolveApiBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/+$/, '');
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'NEXT_PUBLIC_API_URL belum di-set. Set variabel ini (mis. https://api.domain-anda.com/api/v1) sebelum build produksi.',
    );
  }
  return 'http://localhost:5000/api/v1';
}

export const API_BASE_URL = resolveApiBaseUrl();

const CLIENT_LABEL = `IndoMurah Web:${process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'}`;

/** Turns a NestJS error body ({ message: string | string[] }) into one readable sentence. */
function extractErrorMessage(errorData: unknown, status: number, statusText: string): string {
  const msg = (errorData as { message?: unknown } | null)?.message;
  if (Array.isArray(msg)) return msg.map(String).join('; ');
  if (typeof msg === 'string' && msg) return msg;
  return `HTTP ${status}: ${statusText}`;
}

// ─── Global in-flight request tracker ──────────────────────────
// Every get/post/put/patch/delete/login call funnels through
// processRequest() below, so incrementing/decrementing here in one
// place gives every page a global "is the backend loading right now"
// signal without each page having to track its own fetch state.
let pendingRequestCount = 0;
const loadingListeners = new Set<() => void>();

function notifyLoadingListeners(): void {
  for (const listener of loadingListeners) listener();
}

function beginRequest(): void {
  pendingRequestCount += 1;
  notifyLoadingListeners();
}

function endRequest(): void {
  pendingRequestCount = Math.max(0, pendingRequestCount - 1);
  notifyLoadingListeners();
}

export function subscribeApiLoading(listener: () => void): () => void {
  loadingListeners.add(listener);
  return () => loadingListeners.delete(listener);
}

export function getApiLoadingSnapshot(): boolean {
  return pendingRequestCount > 0;
}

/** Ikutkan fetch() manual (upload file, unduh Excel, dll) ke loader global. */
export async function trackRequest<T>(promise: Promise<T>): Promise<T> {
  beginRequest();
  try {
    return await promise;
  } finally {
    endRequest();
  }
}

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
  /** true = request latar belakang (polling) — tidak menyalakan loader global. */
  silent?: boolean;
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
      // Kolom "Komputer" di daftar transaksi (seperti "Ketoko Web:2.0.0.5").
      'X-Client': CLIENT_LABEL,
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
    const { method, endpoint, body, params, headers, cache, tags, silent } = config;
    const url = this.buildUrl(endpoint, params);
    const reqHeaders = { ...this.getHeaders(), ...headers };
    const hasBody = body !== undefined && body !== null && method !== 'GET';

    // Fastify's body parser rejects any request sent with
    // Content-Type: application/json but no actual body (e.g. DELETE) —
    // only attach the header when there's a body to parse.
    if (!hasBody) delete reqHeaders['Content-Type'];

    const fetchOptions: RequestInit = {
      method,
      headers: reqHeaders,
    };

    if (hasBody) {
      fetchOptions.body = JSON.stringify(body);
    }

    if (cache) fetchOptions.cache = cache;
    if (tags) fetchOptions.next = { tags };

    if (!silent) beginRequest();
    try {
      const response = await fetch(url, fetchOptions);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(extractErrorMessage(errorData, response.status, response.statusText));
      }

      return await response.json();
    } finally {
      if (!silent) endRequest();
    }
  }

  async request<T>(
    method: RequestMethod,
    endpoint: string,
    body?: unknown,
    params?: ODataParams,
    options?: { cache?: RequestCache; tags?: string[]; silent?: boolean }
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
    options?: { cache?: RequestCache; tags?: string[]; skipCache?: boolean; silent?: boolean }
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
