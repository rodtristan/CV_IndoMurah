// ============================================================
// API Client for Toko CV IndoMurah
// Optimized with OData-like Smart Query
// ============================================================

import { API_BASE_URL } from './auth-context';

export interface ApiResponse<T = any> {
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

export interface QueryParams {
  $select?: string;
  $include?: string;
  $where?: Record<string, any>;
  $search?: string;
  $searchFields?: string;
  $orderBy?: Record<string, 'asc' | 'desc'>;
  $skip?: number;
  $take?: number;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('indomurah_dashboard_token');
  }

  private buildUrl(endpoint: string, params?: QueryParams): string {
    const url = new URL(`${this.baseUrl}/${endpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (typeof value === 'object') {
            // Handle $where, $orderBy as nested objects
            if (key === '$where' || key === '$orderBy') {
              Object.entries(value).forEach(([k, v]) => {
                if (v !== undefined && v !== null) {
                  url.searchParams.append(`${key}[${k}]`, String(v));
                }
              });
            }
          } else {
            url.searchParams.append(key, String(value));
          }
        }
      });
    }

    return url.toString();
  }

  async request<T>(
    method: string,
    endpoint: string,
    body?: any,
    params?: QueryParams
  ): Promise<ApiResponse<T>> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = this.buildUrl(endpoint, params);

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();
    return data;
  }

  // ─── Master Data ───────────────────────────────────────────

  // Categories
  async getCategories(params?: QueryParams) {
    return this.request('GET', 'categories', undefined, params);
  }

  async getCategory(id: number) {
    return this.request('GET', `categories/${id}`);
  }

  async createCategory(data: any) {
    return this.request('POST', 'categories', data);
  }

  async updateCategory(id: number, data: any) {
    return this.request('PUT', `categories/${id}`, data);
  }

  async deleteCategory(id: number) {
    return this.request('DELETE', `categories/${id}`);
  }

  // Units
  async getUnits(params?: QueryParams) {
    return this.request('GET', 'units', undefined, params);
  }

  async getUnit(id: number) {
    return this.request('GET', `units/${id}`);
  }

  async createUnit(data: any) {
    return this.request('POST', 'units', data);
  }

  async updateUnit(id: number, data: any) {
    return this.request('PUT', `units/${id}`, data);
  }

  async deleteUnit(id: number) {
    return this.request('DELETE', `units/${id}`);
  }

  // Brands
  async getBrands(params?: QueryParams) {
    return this.request('GET', 'brands', undefined, params);
  }

  async getBrand(id: number) {
    return this.request('GET', `brands/${id}`);
  }

  async createBrand(data: any) {
    return this.request('POST', 'brands', data);
  }

  async updateBrand(id: number, data: any) {
    return this.request('PUT', `brands/${id}`, data);
  }

  async deleteBrand(id: number) {
    return this.request('DELETE', `brands/${id}`);
  }

  // Suppliers
  async getSuppliers(params?: QueryParams) {
    return this.request('GET', 'suppliers', undefined, params);
  }

  async getSupplier(id: number) {
    return this.request('GET', `suppliers/${id}`);
  }

  async createSupplier(data: any) {
    return this.request('POST', 'suppliers', data);
  }

  async updateSupplier(id: number, data: any) {
    return this.request('PUT', `suppliers/${id}`, data);
  }

  async deleteSupplier(id: number) {
    return this.request('DELETE', `suppliers/${id}`);
  }

  // Customers
  async getCustomers(params?: QueryParams) {
    return this.request('GET', 'customers', undefined, params);
  }

  async getCustomer(id: number) {
    return this.request('GET', `customers/${id}`);
  }

  async createCustomer(data: any) {
    return this.request('POST', 'customers', data);
  }

  async updateCustomer(id: number, data: any) {
    return this.request('PUT', `customers/${id}`, data);
  }

  async deleteCustomer(id: number) {
    return this.request('DELETE', `customers/${id}`);
  }

  // Warehouses
  async getWarehouses(params?: QueryParams) {
    return this.request('GET', 'warehouses', undefined, params);
  }

  async getWarehouse(id: number) {
    return this.request('GET', `warehouses/${id}`);
  }

  async createWarehouse(data: any) {
    return this.request('POST', 'warehouses', data);
  }

  async updateWarehouse(id: number, data: any) {
    return this.request('PUT', `warehouses/${id}`, data);
  }

  async deleteWarehouse(id: number) {
    return this.request('DELETE', `warehouses/${id}`);
  }

  // Products
  async getProducts(params?: QueryParams) {
    return this.request('GET', 'products', undefined, params);
  }

  async getProduct(id: number) {
    return this.request('GET', `products/${id}`);
  }

  async createProduct(data: any) {
    return this.request('POST', 'products', data);
  }

  async updateProduct(id: number, data: any) {
    return this.request('PUT', `products/${id}`, data);
  }

  async deleteProduct(id: number) {
    return this.request('DELETE', `products/${id}`);
  }

  // ─── Sales ────────────────────────────────────────────────

  async getSales(params?: QueryParams) {
    return this.request('GET', 'sales', undefined, params);
  }

  async getSale(id: number) {
    return this.request('GET', `sales/${id}`);
  }

  async createSale(data: any) {
    return this.request('POST', 'sales', data);
  }

  async updateSale(id: number, data: any) {
    return this.request('PUT', `sales/${id}`, data);
  }

  // ─── Purchases ──────────────────────────────────────────────

  async getPurchases(params?: QueryParams) {
    return this.request('GET', 'purchases', undefined, params);
  }

  async getPurchase(id: number) {
    return this.request('GET', `purchases/${id}`);
  }

  async createPurchase(data: any) {
    return this.request('POST', 'purchases', data);
  }

  async updatePurchase(id: number, data: any) {
    return this.request('PUT', `purchases/${id}`, data);
  }

  // ─── Reports ──────────────────────────────────────────────

  async getSalesReport(params: { startDate: string; endDate: string; warehouseId?: string; customerId?: string }) {
    return this.request('GET', 'reports/sales', undefined, params as any);
  }

  async getPurchaseReport(params: { startDate: string; endDate: string; warehouseId?: string; supplierId?: string }) {
    return this.request('GET', 'reports/purchase', undefined, params as any);
  }

  async getInventoryReport(params?: { warehouseId?: string; categoryId?: string }) {
    return this.request('GET', 'reports/inventory', undefined, params as any);
  }

  async getCashReport(params: { startDate: string; endDate: string }) {
    return this.request('GET', 'reports/cash', undefined, params as any);
  }

  async getProfitLossReport(params: { startDate: string; endDate: string }) {
    return this.request('GET', 'reports/profit-loss', undefined, params as any);
  }

  async getDebtReport() {
    return this.request('GET', 'reports/debt');
  }

  async getReceivableReport() {
    return this.request('GET', 'reports/receivable');
  }
}

export const api = new ApiClient();
export default api;
