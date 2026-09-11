// ============================================================
// API Client for POS - CV IndoMurah
// ============================================================

import type {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  PaginatedResponse,
  Product,
  Supplier,
  Customer,
  Category,
  Unit,
  Brand,
  Warehouse,
  Sale,
  Purchase,
} from "@/types/pos";

// NEXT_PUBLIC_ variables are exposed to the browser in Next.js
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

// ─── Auth Token ─────────────────────────────────────────────
let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) {
    localStorage.setItem("pos_token", token);
  } else {
    localStorage.removeItem("pos_token");
  }
}

export function getAuthToken(): string | null {
  if (!authToken) {
    authToken = localStorage.getItem("pos_token");
  }
  return authToken;
}

// ─── Fetch Wrapper ──────────────────────────────────────────
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getAuthToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Terjadi kesalahan server",
        errors: data.errors,
      };
    }

    return {
      success: true,
      message: data.message || "Berhasil",
      data: data.data,
    };
  } catch (error) {
    console.error("API Error:", error);
    return {
      success: false,
      message: "Tidak dapat terhubung ke server",
    };
  }
}

// ─── Auth API ──────────────────────────────────────────────
export const authApi = {
  login: async (credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    return fetchApi<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  register: async (data: {
    companyId: string;
    email: string;
    password: string;
    fullName: string;
  }): Promise<ApiResponse<LoginResponse>> => {
    return fetchApi<LoginResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getMe: async (): Promise<ApiResponse<LoginResponse["user"]>> => {
    return fetchApi("/auth/me");
  },

  logout: () => {
    setAuthToken(null);
    localStorage.removeItem("pos_user");
  },
};

// ─── Products API ──────────────────────────────────────────
export const productsApi = {
  getAll: async (params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    categoryId?: number;
  }): Promise<ApiResponse<PaginatedResponse<Product>>> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.pageSize) searchParams.set("pageSize", params.pageSize.toString());
    if (params?.search) searchParams.set("search", params.search);
    if (params?.categoryId) searchParams.set("categoryId", params.categoryId.toString());

    const query = searchParams.toString();
    return fetchApi<PaginatedResponse<Product>>(`/products${query ? `?${query}` : ""}`);
  },

  getById: async (id: number): Promise<ApiResponse<Product>> => {
    return fetchApi<Product>(`/products/${id}`);
  },

  create: async (data: Partial<Product>): Promise<ApiResponse<Product>> => {
    return fetchApi<Product>("/products", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: Partial<Product>): Promise<ApiResponse<Product>> => {
    return fetchApi<Product>(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<ApiResponse<void>> => {
    return fetchApi<void>(`/products/${id}`, {
      method: "DELETE",
    });
  },
};

// ─── Categories API ────────────────────────────────────────
export const categoriesApi = {
  getAll: async (): Promise<ApiResponse<Category[]>> => {
    return fetchApi<Category[]>("/categories");
  },

  create: async (data: Partial<Category>): Promise<ApiResponse<Category>> => {
    return fetchApi<Category>("/categories", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: Partial<Category>): Promise<ApiResponse<Category>> => {
    return fetchApi<Category>(`/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<ApiResponse<void>> => {
    return fetchApi<void>(`/categories/${id}`, {
      method: "DELETE",
    });
  },
};

// ─── Units API ─────────────────────────────────────────────
export const unitsApi = {
  getAll: async (): Promise<ApiResponse<Unit[]>> => {
    return fetchApi<Unit[]>("/units");
  },
};

// ─── Brands API ─────────────────────────────────────────────
export const brandsApi = {
  getAll: async (): Promise<ApiResponse<Brand[]>> => {
    return fetchApi<Brand[]>("/brands");
  },
};

// ─── Warehouses API ─────────────────────────────────────────
export const warehousesApi = {
  getAll: async (): Promise<ApiResponse<Warehouse[]>> => {
    return fetchApi<Warehouse[]>("/warehouses");
  },
};

// ─── Suppliers API ──────────────────────────────────────────
export const suppliersApi = {
  getAll: async (params?: {
    page?: number;
    pageSize?: number;
    search?: string;
  }): Promise<ApiResponse<PaginatedResponse<Supplier>>> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.pageSize) searchParams.set("pageSize", params.pageSize.toString());
    if (params?.search) searchParams.set("search", params.search);

    const query = searchParams.toString();
    return fetchApi<PaginatedResponse<Supplier>>(`/suppliers${query ? `?${query}` : ""}`);
  },

  getById: async (id: number): Promise<ApiResponse<Supplier>> => {
    return fetchApi<Supplier>(`/suppliers/${id}`);
  },

  create: async (data: Partial<Supplier>): Promise<ApiResponse<Supplier>> => {
    return fetchApi<Supplier>("/suppliers", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: Partial<Supplier>): Promise<ApiResponse<Supplier>> => {
    return fetchApi<Supplier>(`/suppliers/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<ApiResponse<void>> => {
    return fetchApi<void>(`/suppliers/${id}`, {
      method: "DELETE",
    });
  },
};

// ─── Customers API ──────────────────────────────────────────
export const customersApi = {
  getAll: async (params?: {
    page?: number;
    pageSize?: number;
    search?: string;
  }): Promise<ApiResponse<PaginatedResponse<Customer>>> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.pageSize) searchParams.set("pageSize", params.pageSize.toString());
    if (params?.search) searchParams.set("search", params.search);

    const query = searchParams.toString();
    return fetchApi<PaginatedResponse<Customer>>(`/customers${query ? `?${query}` : ""}`);
  },

  getById: async (id: number): Promise<ApiResponse<Customer>> => {
    return fetchApi<Customer>(`/customers/${id}`);
  },

  create: async (data: Partial<Customer>): Promise<ApiResponse<Customer>> => {
    return fetchApi<Customer>("/customers", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: Partial<Customer>): Promise<ApiResponse<Customer>> => {
    return fetchApi<Customer>(`/customers/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<ApiResponse<void>> => {
    return fetchApi<void>(`/customers/${id}`, {
      method: "DELETE",
    });
  },
};

// ─── Sales API ──────────────────────────────────────────────
export const salesApi = {
  getAll: async (params?: {
    page?: number;
    pageSize?: number;
    startDate?: string;
    endDate?: string;
    customerId?: number;
    status?: string;
  }): Promise<ApiResponse<PaginatedResponse<Sale>>> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.pageSize) searchParams.set("pageSize", params.pageSize.toString());
    if (params?.startDate) searchParams.set("startDate", params.startDate);
    if (params?.endDate) searchParams.set("endDate", params.endDate);
    if (params?.customerId) searchParams.set("customerId", params.customerId.toString());
    if (params?.status) searchParams.set("status", params.status);

    const query = searchParams.toString();
    return fetchApi<PaginatedResponse<Sale>>(`/sales${query ? `?${query}` : ""}`);
  },

  getById: async (id: number): Promise<ApiResponse<Sale>> => {
    return fetchApi<Sale>(`/sales/${id}`);
  },

  create: async (data: Partial<Sale>): Promise<ApiResponse<Sale>> => {
    return fetchApi<Sale>("/sales", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};

// ─── Purchases API ─────────────────────────────────────────
export const purchasesApi = {
  getAll: async (params?: {
    page?: number;
    pageSize?: number;
    startDate?: string;
    endDate?: string;
    supplierId?: number;
    status?: string;
  }): Promise<ApiResponse<PaginatedResponse<Purchase>>> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.pageSize) searchParams.set("pageSize", params.pageSize.toString());
    if (params?.startDate) searchParams.set("startDate", params.startDate);
    if (params?.endDate) searchParams.set("endDate", params.endDate);
    if (params?.supplierId) searchParams.set("supplierId", params.supplierId.toString());
    if (params?.status) searchParams.set("status", params.status);

    const query = searchParams.toString();
    return fetchApi<PaginatedResponse<Purchase>>(`/purchases${query ? `?${query}` : ""}`);
  },

  getById: async (id: number): Promise<ApiResponse<Purchase>> => {
    return fetchApi<Purchase>(`/purchases/${id}`);
  },

  create: async (data: Partial<Purchase>): Promise<ApiResponse<Purchase>> => {
    return fetchApi<Purchase>("/purchases", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};

// ─── Utility Functions ─────────────────────────────────────
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
