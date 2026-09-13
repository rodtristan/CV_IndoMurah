"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw, Package, Users, Truck, Building, Tags } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PageWrapper, PageTitle } from "@/components/pos/layout/PosLayout";
import { api } from "@/lib/api";

function formatNumber(value: number): string {
  return new Intl.NumberFormat('id-ID').format(value);
}

interface MasterStats {
  totalProducts: number;
  totalCategories: number;
  totalCustomers: number;
  totalSuppliers: number;
  totalWarehouses: number;
  totalUnits: number;
  totalBrands: number;
}

export default function MasterReportPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<MasterStats>({
    totalProducts: 0,
    totalCategories: 0,
    totalCustomers: 0,
    totalSuppliers: 0,
    totalWarehouses: 0,
    totalUnits: 0,
    totalBrands: 0,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [productsRes, categoriesRes, customersRes, suppliersRes, warehousesRes, unitsRes, brandsRes] = await Promise.all([
        api.getProducts({ $take: 1 }),
        api.getCategories({ $take: 1 }),
        api.getCustomers({ $take: 1 }),
        api.getSuppliers({ $take: 1 }),
        api.getWarehouses({ $take: 1 }),
        api.getUnits({ $take: 1 }),
        api.getBrands({ $take: 1 }),
      ]);

      setStats({
        totalProducts: productsRes.meta?.total || 0,
        totalCategories: categoriesRes.meta?.total || 0,
        totalCustomers: customersRes.meta?.total || 0,
        totalSuppliers: suppliersRes.meta?.total || 0,
        totalWarehouses: warehousesRes.meta?.total || 0,
        totalUnits: unitsRes.meta?.total || 0,
        totalBrands: brandsRes.meta?.total || 0,
      });
    } catch (error) {
      console.error("Failed to fetch master data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <PageWrapper>
      <PageTitle
        title="Laporan Master Data"
        subtitle="Ringkasan data master"
        actions={
          <Button variant="outline" icon={RefreshCw} onClick={fetchData} disabled={loading}>
            Refresh
          </Button>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <div className="rounded-lg border border-default bg-bg p-6">
          <div className="flex items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-xl bg-primary/10">
              <Package className="size-7 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted">Total Produk</p>
              <p className="text-3xl font-bold">
                {loading ? '...' : formatNumber(stats.totalProducts)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-default bg-bg p-6">
          <div className="flex items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-xl bg-purple-500/10">
              <Tags className="size-7 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-muted">Kategori</p>
              <p className="text-3xl font-bold">
                {loading ? '...' : formatNumber(stats.totalCategories)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-default bg-bg p-6">
          <div className="flex items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-xl bg-success/10">
              <Users className="size-7 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted">Pelanggan</p>
              <p className="text-3xl font-bold">
                {loading ? '...' : formatNumber(stats.totalCustomers)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-default bg-bg p-6">
          <div className="flex items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-xl bg-info/10">
              <Truck className="size-7 text-info" />
            </div>
            <div>
              <p className="text-sm text-muted">Supplier</p>
              <p className="text-3xl font-bold">
                {loading ? '...' : formatNumber(stats.totalSuppliers)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-default bg-bg p-6">
          <div className="flex items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-xl bg-warning/10">
              <Building className="size-7 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted">Gudang</p>
              <p className="text-3xl font-bold">
                {loading ? '...' : formatNumber(stats.totalWarehouses)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-default bg-bg p-6">
          <div className="flex items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-xl bg-blue-500/10">
              <Package className="size-7 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted">Unit</p>
              <p className="text-3xl font-bold">
                {loading ? '...' : formatNumber(stats.totalUnits)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-default bg-bg p-6">
          <div className="flex items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-xl bg-pink-500/10">
              <Tags className="size-7 text-pink-500" />
            </div>
            <div>
              <p className="text-sm text-muted">Merek</p>
              <p className="text-3xl font-bold">
                {loading ? '...' : formatNumber(stats.totalBrands)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Links */}
      <div className="mt-8">
        <h3 className="mb-4 font-semibold text-highlighted">Akses Cepat</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Button variant="outline" className="h-auto flex-col gap-2 py-4" href="/master/items">
            <Package className="size-6" />
            <span className="text-xs">Produk</span>
          </Button>
          <Button variant="outline" className="h-auto flex-col gap-2 py-4" href="/master/categories">
            <Tags className="size-6" />
            <span className="text-xs">Kategori</span>
          </Button>
          <Button variant="outline" className="h-auto flex-col gap-2 py-4" href="/master/customers">
            <Users className="size-6" />
            <span className="text-xs">Pelanggan</span>
          </Button>
          <Button variant="outline" className="h-auto flex-col gap-2 py-4" href="/master/suppliers">
            <Truck className="size-6" />
            <span className="text-xs">Supplier</span>
          </Button>
        </div>
      </div>
    </PageWrapper>
  );
}
