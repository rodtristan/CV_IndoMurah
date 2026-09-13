"use client";

import { useState, useEffect, useCallback } from "react";
import { Download, RefreshCw, Package, AlertTriangle, DollarSign, FileText, Filter, Layers } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { PageWrapper, PageTitle } from "@/components/pos/layout/PosLayout";
import { api } from "@/lib/api";
import type { Product, Warehouse, Category } from "@/types/pos";
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

interface InventoryStats {
  totalProducts: number;
  totalStock: number;
  totalValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalCost: number;
}

export default function InventoryReportPage() {
  const [products, setProducts] = useState<(Product & { warehouseStock?: number })[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Filters
  const [warehouseFilter, setWarehouseFilter] = useState<number | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<number | null>(null);
  const [stockFilter, setStockFilter] = useState<string>("");

  // Stats
  const [stats, setStats] = useState<InventoryStats>({
    totalProducts: 0,
    totalStock: 0,
    totalValue: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    totalCost: 0,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {
        $skip: 0,
        $take: 1000,
        $orderBy: { name: 'asc' },
      };

      if (search) params.$search = search;
      if (warehouseFilter) params.$where = { ...params.$where, warehouseId: warehouseFilter };
      if (categoryFilter) params.$where = { ...params.$where, categoryId: categoryFilter };

      const [productsRes, warehousesRes, categoriesRes] = await Promise.all([
        api.getProducts(params),
        api.getWarehouses({ $where: { isActive: true }, $take: 100 }),
        api.getCategories({ $where: { isActive: true }, $take: 100 }),
      ]);

      if (productsRes.success) {
        let productsData = productsRes.data || [];

        // Apply stock filter locally
        if (stockFilter === 'low') {
          productsData = productsData.filter((p: Product) => (p.stock || 0) > 0 && (p.stock || 0) <= (p.minimumStock || 0));
        } else if (stockFilter === 'out') {
          productsData = productsData.filter((p: Product) => (p.stock || 0) <= 0);
        } else if (stockFilter === 'normal') {
          productsData = productsData.filter((p: Product) => (p.stock || 0) > (p.minimumStock || 0));
        }

        setProducts(productsData);

        // Calculate stats from all products (before stock filter)
        const allProducts = productsRes.data || [];
        const totalStock = allProducts.reduce((sum: number, p: Product) => sum + (p.stock || 0), 0);
        const totalValue = allProducts.reduce((sum: number, p: Product) => sum + ((p.stock || 0) * p.sellingPrice), 0);
        const totalCost = allProducts.reduce((sum: number, p: Product) => sum + ((p.stock || 0) * p.purchasePrice), 0);
        const lowStockCount = allProducts.filter((p: Product) => (p.stock || 0) > 0 && (p.stock || 0) <= (p.minimumStock || 0)).length;
        const outOfStockCount = allProducts.filter((p: Product) => (p.stock || 0) <= 0).length;

        setStats({
          totalProducts: allProducts.length,
          totalStock,
          totalValue,
          totalCost,
          lowStockCount,
          outOfStockCount,
        });
      }

      if (warehousesRes.success) {
        setWarehouses(warehousesRes.data || []);
      }
      if (categoriesRes.success) {
        setCategories(categoriesRes.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }, [search, warehouseFilter, categoryFilter, stockFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExport = () => {
    const headers = ['Kode', 'Nama', 'Kategori', 'Merek', 'Stok', 'Min Stok', 'Harga Beli', 'Harga Jual', 'Nilai Stok'];
    const rows = products.map(p => [
      p.code,
      p.name,
      p.category?.name || '-',
      p.brand?.name || '-',
      p.stock || 0,
      p.minimumStock || 0,
      p.purchasePrice,
      p.sellingPrice,
      (p.stock || 0) * p.purchasePrice,
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `laporan_inventori_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock <= 0) return { label: "Habis", color: "error" as const };
    if (stock <= minStock) return { label: "Minim", color: "warning" as const };
    return { label: "Normal", color: "success" as const };
  };

  return (
    <PageWrapper>
      <PageTitle
        title="Laporan Persediaan"
        subtitle={`Total: ${stats.totalProducts} produk`}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" icon={Download} onClick={handleExport}>
              Export CSV
            </Button>
            <Button variant="outline" icon={RefreshCw} onClick={fetchData} disabled={loading}>
              Refresh
            </Button>
          </div>
        }
      />

      {/* Stats Cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-6">
        <div className="rounded-lg border border-default bg-bg p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
              <Package className="size-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted">Total Produk</p>
              <p className="text-xl font-bold">{loading ? '...' : formatNumber(stats.totalProducts)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-default bg-bg p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-info/10">
              <Layers className="size-6 text-info" />
            </div>
            <div>
              <p className="text-sm text-muted">Total Stok</p>
              <p className="text-xl font-bold">{loading ? '...' : formatNumber(stats.totalStock)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-default bg-bg p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-success/10">
              <DollarSign className="size-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted">Nilai Jual</p>
              <p className="text-xl font-bold">{loading ? '...' : formatCurrency(stats.totalValue)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-default bg-bg p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-warning/10">
              <DollarSign className="size-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted">Nilai Beli (HPP)</p>
              <p className="text-xl font-bold">{loading ? '...' : formatCurrency(stats.totalCost)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-default bg-bg p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-warning/10">
              <AlertTriangle className="size-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted">Stock Minim</p>
              <p className="text-xl font-bold text-warning">{loading ? '...' : stats.lowStockCount}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-default bg-bg p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-error/10">
              <AlertTriangle className="size-6 text-error" />
            </div>
            <div>
              <p className="text-sm text-muted">Stock Habis</p>
              <p className="text-xl font-bold text-error">{loading ? '...' : stats.outOfStockCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="mb-1 block text-sm font-medium">Pencarian</label>
          <Input
            placeholder="Cari produk, kode, atau barcode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Gudang</label>
          <select
            value={warehouseFilter || ""}
            onChange={(e) => setWarehouseFilter(e.target.value ? Number(e.target.value) : null)}
            className="rounded-lg border border-default bg-bg px-3 py-2 text-sm"
          >
            <option value="">Semua Gudang</option>
            {warehouses.map(wh => (
              <option key={wh.id} value={wh.id}>{wh.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Kategori</label>
          <select
            value={categoryFilter || ""}
            onChange={(e) => setCategoryFilter(e.target.value ? Number(e.target.value) : null)}
            className="rounded-lg border border-default bg-bg px-3 py-2 text-sm"
          >
            <option value="">Semua Kategori</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Status Stok</label>
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="rounded-lg border border-default bg-bg px-3 py-2 text-sm"
          >
            <option value="">Semua</option>
            <option value="normal">Normal</option>
            <option value="low">Minim</option>
            <option value="out">Habis</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-default overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-elevated">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted">Kode</th>
                <th className="px-4 py-3 text-left font-medium text-muted">Nama Produk</th>
                <th className="px-4 py-3 text-left font-medium text-muted">Kategori</th>
                <th className="px-4 py-3 text-left font-medium text-muted">Merek</th>
                <th className="px-4 py-3 text-right font-medium text-muted">Stok</th>
                <th className="px-4 py-3 text-right font-medium text-muted">Min</th>
                <th className="px-4 py-3 text-right font-medium text-muted">Harga Beli</th>
                <th className="px-4 py-3 text-right font-medium text-muted">Harga Jual</th>
                <th className="px-4 py-3 text-right font-medium text-muted">Nilai Stok</th>
                <th className="px-4 py-3 text-center font-medium text-muted">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-default bg-bg">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center">
                    <div className="flex items-center justify-center gap-2 text-muted">
                      <div className="size-5 animate-spin rounded-full border-2 border-default border-t-primary" />
                      Memuat data...
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-muted">
                    <FileText className="size-12 mx-auto mb-2" />
                    <p>Tidak ada data</p>
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const status = getStockStatus(product.stock || 0, product.minimumStock || 0);
                  const stockValue = (product.stock || 0) * product.purchasePrice;
                  return (
                    <tr key={product.id} className="hover:bg-elevated/50">
                      <td className="px-4 py-3 font-mono text-xs">{product.code}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{product.name}</div>
                        {product.barcode && <div className="text-xs text-muted">{product.barcode}</div>}
                      </td>
                      <td className="px-4 py-3 text-muted">{product.category?.name || '-'}</td>
                      <td className="px-4 py-3 text-muted">{product.brand?.name || '-'}</td>
                      <td className={cn("px-4 py-3 text-right font-semibold",
                        (product.stock || 0) <= 0 ? "text-error" :
                        (product.stock || 0) <= (product.minimumStock || 0) ? "text-warning" : ""
                      )}>
                        {formatNumber(product.stock || 0)}
                      </td>
                      <td className="px-4 py-3 text-right text-muted">{formatNumber(product.minimumStock || 0)}</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(product.purchasePrice)}</td>
                      <td className="px-4 py-3 text-right font-medium text-primary">{formatCurrency(product.sellingPrice)}</td>
                      <td className="px-4 py-3 text-right font-semibold">{formatCurrency(stockValue)}</td>
                      <td className="px-4 py-3 text-center">
                        <Badge color={status.color} variant="subtle">{status.label}</Badge>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {!loading && products.length > 0 && (
              <tfoot className="bg-elevated font-semibold">
                <tr>
                  <td colSpan={4} className="px-4 py-3">Total ({products.length} items)</td>
                  <td className="px-4 py-3 text-right">{formatNumber(stats.totalStock)}</td>
                  <td colSpan={3}></td>
                  <td className="px-4 py-3 text-right">{formatCurrency(stats.totalCost)}</td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </PageWrapper>
  );
}
