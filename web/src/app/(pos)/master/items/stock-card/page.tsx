"use client";

import { useState, useCallback, useEffect } from "react";
import { PageWrapper, Card } from "@/components/layout/PageWrapper";
import { DataTable } from "@/components/ui/DataTable";
import { FilterBar } from "@/components/ui/FilterBar";
import { UtilityButton } from "@/components/ui/GridActions";
import { api, odata } from "@/lib/api-client";
import { formatDate, formatNumber } from "@/lib/utils";
import { Printer } from "lucide-react";
import type { Product, Warehouse } from "@/lib/types";

interface StockCardRow {
  id: number;
  date: string;
  reference: string;
  description: string;
  masuk: number;
  keluar: number;
  saldo: number;
}

export default function StockCardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [rows, setRows] = useState<StockCardRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<Record<string, unknown>>({});

  const fetchLookups = useCallback(async () => {
    const [prodRes, whRes] = await Promise.all([
      api.get<Product[]>("products", odata().take(200).toParams()).catch(() => ({ data: [] } as any)),
      api.get<Warehouse[]>("warehouse", odata().take(100).toParams()).catch(() => ({ data: [] } as any)),
    ]);
    setProducts(prodRes.data || []);
    setWarehouses(whRes.data || []);
  }, []);

  useEffect(() => {
    fetchLookups();
  }, [fetchLookups]);

  const fetchCard = useCallback(async (values: Record<string, unknown>) => {
    setFilters(values);
    if (!values.productId) {
      setRows([]);
      return;
    }
    setLoading(true);
    try {
      const res = await api
        .get<StockCardRow[]>(`product/${values.productId}/stock-card`, {
          warehouseId: values.warehouseId || undefined,
          dateFrom: values.dateFrom || undefined,
          dateTo: values.dateTo || undefined,
        })
        .catch(() => ({ success: false, data: [] } as any));
      setRows(res.success ? res.data || [] : []);
    } finally {
      setLoading(false);
    }
  }, []);

  const columns = [
    { key: "date", label: "Tanggal", render: (v: unknown) => formatDate(v as string) },
    { key: "reference", label: "No. Referensi" },
    { key: "description", label: "Keterangan / Jenis Transaksi" },
    { key: "masuk", label: "Masuk", align: "right" as const, render: (v: unknown) => (Number(v) ? formatNumber(Number(v)) : "-") },
    { key: "keluar", label: "Keluar", align: "right" as const, render: (v: unknown) => (Number(v) ? formatNumber(Number(v)) : "-") },
    {
      key: "saldo",
      label: "Saldo",
      align: "right" as const,
      render: (v: unknown) => <span className="font-semibold">{formatNumber(Number(v))}</span>,
    },
  ];

  return (
    <PageWrapper>
      <Card className="p-4">
        <FilterBar
          fields={[
            {
              key: "productId",
              label: "Kode / Nama Item",
              type: "select",
              options: products.map((p) => ({ value: p.id, label: `${p.code} - ${p.name}` })),
              placeholder: "Pilih item...",
            },
            {
              key: "warehouseId",
              label: "Dept/Gudang",
              type: "select",
              options: [{ value: "", label: "Semua Gudang" }, ...warehouses.map((w) => ({ value: w.id, label: w.name }))],
            },
            { key: "dateFrom", label: "Dari Tanggal", type: "date" },
            { key: "dateTo", label: "Sampai Tanggal", type: "date" },
          ]}
          onFilter={fetchCard}
          loading={loading}
          actions={
            <UtilityButton icon={Printer} onClick={() => window.print()}>
              Cetak
            </UtilityButton>
          }
        />

        <div className="mt-4">
          <DataTable
            data={rows}
            columns={columns}
            loading={loading}
            emptyMessage="Pilih item untuk menampilkan history keluar masuk barang"
          />
        </div>
      </Card>
    </PageWrapper>
  );
}
