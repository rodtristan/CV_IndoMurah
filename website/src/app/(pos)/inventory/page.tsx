"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, RefreshCw, Package, AlertTriangle, TrendingUp, TrendingDown, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/pos/Modal";
import { PageWrapper, PageTitle } from "@/components/pos/layout/PosLayout";
import { StatCard } from "@/components/pos/StatCard";
import { api } from "@/lib/api";
import type { Product, Warehouse, ProductStock } from "@/types/pos";
import { cn } from "@/lib/utils";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('id-ID').format(value);
}

export default function InventoryPage() {
  const [products, setProducts] = useState<(Product & { totalStock?: number })[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize] = useState(20);

  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [warehouseFilter, setWarehouseFilter] = useState<number | null>(null);
  const [stockFilter, setStockFilter] = useState<string>("");

  // Summary stats
  const [stats, setStats] = useState({
    totalItems: 0,
    totalValue: 0,
    lowStock: 0,
    outOfStock: 0,
  });

  // Detail modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const fetchWarehouses = useCallback(async () => {
    try {
      const res = await api.getWarehouses({ $where: { isActive: true } });
      if (res.success) {
        setWarehouses(res.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch warehouses:", error);
    }
  }, []);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {
        $skip: (page - 1) * pageSize,
        $take: pageSize,
        $orderBy: { name: 'asc' },
        $include: 'category,warehouse,unit',
      };

      if (search) {
        params.$search = search;
      }

      if (warehouseFilter) {
        params.$where = { ...params.$where, warehouseId: warehouseFilter };
      }

      if (stockFilter === 'low') {
        params.$where = { ...params.$where, minimumStock_gt: 0 };
      } else if (stockFilter === 'out') {
        params.$where = { ...params.$where, stock: 0 };
      }

      const response = await api.getProducts(params);

      if (response.success) {
        // Calculate total stock across warehouses for each product
        const productsWithStock = (response.data || []).map((p: Product) => ({
          ...p,
          totalStock: p.stock || 0,
        }));

        setProducts(productsWithStock);
        setTotal(response.meta?.total || 0);
        setTotalPages(response.meta?.pages || 1);

        // Calculate summary stats
        const allProducts = productsWithStock;
        const totalItems = allProducts.reduce((sum, p) => sum + (p.stock || 0), 0);
        const totalValue = allProducts.reduce((sum, p) => sum + ((p.stock || 0) * p.purchasePrice), 0);
        const lowStock = allProducts.filter((p: Product) => p.stock > 0 && p.stock <= (p.minimumStock || 0)).length;
        const outOfStock = allProducts.filter((p: Product) => p.stock <= 0).length;

        setStats({
          totalItems,
          totalValue,
          lowStock,
          outOfStock,
        });
      }
    } catch (error) {
      console.error("Failed to fetch inventory:", error);
    } finally {
      setLoading(false);
    }
  }, [page, search, pageSize, warehouseFilter, stockFilter]);

  useEffect(() => {
    fetchWarehouses();
  }, [fetchWarehouses]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleViewDetail = async (product: Product) => {
    setSelectedProduct(product);
    setShowDetailModal(true);
  };

  const clearFilters = () => {
    setWarehouseFilter(null);
    setStockFilter("");
    setSearch("");
    setPage(1);
  };

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock <= 0) return { label: "Out of Stock", color: "error", bgClass: "bg-error/10", textClass: "text-error" };
    if (stock <= minStock) return { label: "Low Stock", color: "warning", bgClass: "bg-warning/10", textClass: "text-warning" };
    return { label: "In Stock", color: "success", bgClass: "bg-success/10", textClass: "text-success" };
  };

  const columns = [
    {
      key: "image",
      label: "",
      width: "50px",
      render: (_: unknown, row: Product) => (
        <div className="size-10 overflow-hidden rounded bg-elevated flex items-center justify-center">
          {row.image ? (
            <img src={row.image} alt={row.name} className="size-full object-cover" />
          ) : (
            <span className="text-lg">📦</span>
          )}
        </div>
      )
    },
    {
      key: "code",
      label: "Kode",
      sortable: true,
      render: (v: unknown) => <span className="font-mono text-xs">{v as string}</span>
    },
    {
      key: "name",
      label: "Nama Produk",
      sortable: true,
      render: (v: unknown, row: Product) => (
        <div className="max-w-[200px]">
          <div className="font-medium truncate">{v as string}</div>
          <div className="text-xs text-muted">{row.category?.name || '-'}</div>
        </div>
      )
    },
    {
      key: "warehouse",
      label: "Gudang",
      render: (_: unknown, row: Product) => row.warehouse?.name || '-'
    },
    {
      key: "stock",
      label: "Stok",
      align: "center" as const,
      sortable: true,
      render: (v: unknown, row: Product) => {
        const status = getStockStatus(v as number, row.minimumStock || 0);
        return (
          <span className={cn("font-semibold", (v as number) <= 0 ? "text-error" : (v as number) <= (row.minimumStock || 0) ? "text-warning" : "")}>
            {formatNumber(v as number)}
          </span>
        );
      }
    },
    {
      key: "minStock",
      label: "Min",
      align: "center" as const,
      render: (v: unknown) => (
        <span className="text-muted">{formatNumber(v as number)}</span>
      )
    },
    {
      key: "purchasePrice",
      label: "Harga Beli",
      align: "right" as const,
      render: (v: unknown) => formatCurrency(v as number)
    },
    {
      key: "sellingPrice",
      label: "Harga Jual",
      align: "right" as const,
      render: (v: unknown) => (
        <span className="font-medium text-primary">{formatCurrency(v as number)}</span>
      )
    },
    {
      key: "status",
      label: "Status",
      align: "center" as const,
      render: (_: unknown, row: Product) => {
        const status = getStockStatus(row.stock || 0, row.minimumStock || 0);
        return (
          <Badge color={status.color as "success" | "warning" | "error"} variant="subtle">
            {status.label}
          </Badge>
        );
      }
    },
  ];

  const hasActiveFilters = warehouseFilter || stockFilter;

  return (
    <PageWrapper>
      <PageTitle
        title="Inventori"
        subtitle={`Total: ${total} produk`}
        actions={
          <Button variant="outline" icon={RefreshCw} onClick={fetchInventory} disabled={loading}>
            Refresh
          </Button>
        }
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-6">
        <div className="rounded-lg border border-default bg-bg p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
              <Package className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted">Total Item</p>
              <p className="text-xl font-semibold">{formatNumber(stats.totalItems)}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-default bg-bg p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-blue-500/10">
              <TrendingUp className="size-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted">Total Nilai</p>
              <p className="text-xl font-semibold">{formatCurrency(stats.totalValue)}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-default bg-bg p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-warning/10">
              <AlertTriangle className="size-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted">Stock Minim</p>
              <p className="text-xl font-semibold text-warning">{stats.lowStock}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-default bg-bg p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-error/10">
              <TrendingDown className="size-5 text-error" />
            </div>
            <div>
              <p className="text-sm text-muted">Habis</p>
              <p className="text-xl font-semibold text-error">{stats.outOfStock}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-4 space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <Input
              placeholder="Cari produk..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant={showFilters ? "default" : "outline"}
            size="sm"
            icon={Filter}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filter {hasActiveFilters && "*"}
          </Button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="rounded-lg border border-default bg-elevated/50 p-4 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium">Gudang</label>
                <select
                  value={warehouseFilter || ""}
                  onChange={(e) => setWarehouseFilter(e.target.value ? Number(e.target.value) : null)}
                  className="w-full rounded-lg border border-default bg-bg px-3 py-2 text-sm"
                >
                  <option value="">Semua Gudang</option>
                  {warehouses.map(wh => (
                    <option key={wh.id} value={wh.id}>{wh.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Status Stok</label>
                <select
                  value={stockFilter}
                  onChange={(e) => setStockFilter(e.target.value)}
                  className="w-full rounded-lg border border-default bg-bg px-3 py-2 text-sm"
                >
                  <option value="">Semua</option>
                  <option value="in">Tersedia</option>
                  <option value="low">Stock Minim</option>
                  <option value="out">Habis</option>
                </select>
              </div>
            </div>
            {hasActiveFilters && (
              <div className="flex justify-end">
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="size-4 mr-1" />
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Table - Using custom table for compatibility */}
      <div className="rounded-lg border border-default overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-elevated">
              <tr>
                <th className="px-3 py-3 text-left font-medium text-muted w-[50px]"></th>
                <th className="px-3 py-3 text-left font-medium text-muted">Kode</th>
                <th className="px-3 py-3 text-left font-medium text-muted">Nama Produk</th>
                <th className="px-3 py-3 text-left font-medium text-muted">Gudang</th>
                <th className="px-3 py-3 text-right font-medium text-muted">Stok</th>
                <th className="px-3 py-3 text-right font-medium text-muted">Min</th>
                <th className="px-3 py-3 text-right font-medium text-muted">Harga Beli</th>
                <th className="px-3 py-3 text-right font-medium text-muted">Harga Jual</th>
                <th className="px-3 py-3 text-center font-medium text-muted">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-default bg-bg">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-3 py-12 text-center">
                    <div className="flex items-center justify-center gap-2 text-muted">
                      <div className="size-5 animate-spin rounded-full border-2 border-default border-t-primary" />
                      Memuat data...
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-3 py-12 text-center text-muted">
                    Tidak ada data inventori
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const status = getStockStatus(product.stock || 0, product.minimumStock || 0);
                  return (
                    <tr key={product.id} className="hover:bg-elevated/50 cursor-pointer" onClick={() => handleViewDetail(product)}>
                      <td className="px-3 py-3">
                        <div className="size-10 overflow-hidden rounded bg-elevated flex items-center justify-center">
                          {product.image ? (
                            <img src={product.image} alt={product.name} className="size-full object-cover" />
                          ) : (
                            <span className="text-lg">📦</span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3 font-mono text-xs">{product.code}</td>
                      <td className="px-3 py-3">
                        <div className="font-medium max-w-[200px] truncate">{product.name}</div>
                        <div className="text-xs text-muted">{product.category?.name || '-'}</div>
                      </td>
                      <td className="px-3 py-3 text-muted">{product.warehouse?.name || '-'}</td>
                      <td className={cn("px-3 py-3 text-right font-semibold",
                        (product.stock || 0) <= 0 ? "text-error" :
                        (product.stock || 0) <= (product.minimumStock || 0) ? "text-warning" : ""
                      )}>
                        {formatNumber(product.stock || 0)}
                      </td>
                      <td className="px-3 py-3 text-right text-muted">{formatNumber(product.minimumStock || 0)}</td>
                      <td className="px-3 py-3 text-right">{formatCurrency(product.purchasePrice)}</td>
                      <td className="px-3 py-3 text-right font-medium text-primary">{formatCurrency(product.sellingPrice)}</td>
                      <td className="px-3 py-3 text-center">
                        <Badge color={status.color as "success" | "warning" | "error"} variant="subtle">
                          {status.label}
                        </Badge>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-default px-4 py-3 bg-elevated">
            <span className="text-sm text-muted">
              Halaman {page} dari {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Sebelumnya
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Selanjutnya
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedProduct(null);
        }}
        title="Detail Produk"
        size="md"
      >
        {selectedProduct && (
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="size-20 rounded-lg bg-elevated flex items-center justify-center overflow-hidden">
                {selectedProduct.image ? (
                  <img src={selectedProduct.image} alt={selectedProduct.name} className="size-full object-cover" />
                ) : (
                  <span className="text-3xl">📦</span>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{selectedProduct.name}</h3>
                <p className="text-sm text-muted font-mono">{selectedProduct.code}</p>
                {selectedProduct.barcode && (
                  <p className="text-sm text-muted">Barcode: {selectedProduct.barcode}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 rounded-lg bg-elevated/50 p-4">
              <div>
                <p className="text-sm text-muted">Kategori</p>
                <p className="font-medium">{selectedProduct.category?.name || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted">Merek</p>
                <p className="font-medium">{selectedProduct.brand?.name || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted">Gudang</p>
                <p className="font-medium">{selectedProduct.warehouse?.name || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted">Unit</p>
                <p className="font-medium">{selectedProduct.unit?.name || '-'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-default p-4 text-center">
                <p className="text-sm text-muted">Stok</p>
                <p className={cn("text-2xl font-bold",
                  (selectedProduct.stock || 0) <= 0 ? "text-error" :
                  (selectedProduct.stock || 0) <= (selectedProduct.minimumStock || 0) ? "text-warning" : "text-success"
                )}>
                  {formatNumber(selectedProduct.stock || 0)}
                </p>
                <p className="text-xs text-muted">Min: {selectedProduct.minimumStock || 0}</p>
              </div>
              <div className="rounded-lg border border-default p-4 text-center">
                <p className="text-sm text-muted">Nilai Stok</p>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency((selectedProduct.stock || 0) * selectedProduct.purchasePrice)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted">Harga Beli</p>
                <p className="font-semibold">{formatCurrency(selectedProduct.purchasePrice)}</p>
              </div>
              <div>
                <p className="text-sm text-muted">Harga Jual</p>
                <p className="font-semibold text-primary">{formatCurrency(selectedProduct.sellingPrice)}</p>
              </div>
            </div>

            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowDetailModal(false)}>
                Tutup
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </PageWrapper>
  );
}
