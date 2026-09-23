"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Layers } from "lucide-react";
import { PageWrapper, Card } from "@/components/layout/PageWrapper";
import { DataTable } from "@/components/ui/DataTable";
import { FilterBar } from "@/components/ui/FilterBar";
import { ConfirmModal } from "@/components/ui/Modal";
import { GridActions, RowEditIcon, UtilityButton } from "@/components/ui/GridActions";
import { api, odata } from "@/lib/api-client";
import { formatNumber } from "@/lib/utils";
import type { Product, Category, Brand, Warehouse } from "@/lib/types";

export default function MasterItemsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [filters, setFilters] = useState<Record<string, unknown>>({});
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0, totalPages: 0 });
  const [saving, setSaving] = useState(false);
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const query = odata()
        .include(["category", "brand", "unit", "warehouse"])
        .orderByMulti({ createdAt: "desc" })
        .skip((pagination.page - 1) * pagination.pageSize)
        .take(pagination.pageSize);

      if (filters.search) query.search(filters.search as string, ["code", "barcode", "name"]);
      if (filters.categoryId) query.where({ categoryId: Number(filters.categoryId) });
      if (filters.brandId) query.where({ brandId: Number(filters.brandId) });
      if (filters.isActive !== undefined) query.where({ isActive: filters.isActive === "true" });

      const res = await api.get<Product[]>("products", query.toParams());
      if (res.success) {
        setProducts(res.data || []);
        if (res.meta) {
          setPagination((p) => ({ ...p, total: res.meta!.total, totalPages: res.meta!.pages }));
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.pageSize]);

  const fetchLookups = async () => {
    const [catRes, brandRes, whRes] = await Promise.all([
      api.get<Category[]>("categories", odata().take(100).toParams()).catch(() => ({ data: [] } as any)),
      api.get<Brand[]>("brand", odata().take(100).toParams()).catch(() => ({ data: [] } as any)),
      api.get<Warehouse[]>("warehouse", odata().take(100).toParams()).catch(() => ({ data: [] } as any)),
    ]);
    setCategories(catRes.data || []);
    setBrands(brandRes.data || []);
    setWarehouses(whRes.data || []);
  };

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const openEdit = (product: Product) => router.push(`/master/items/${product.ID}`);
  const openCopy = (product: Product) => router.push(`/master/items/new?copyFrom=${product.ID}`);

  const handleDelete = async () => {
    if (!selectedProduct) return;
    setSaving(true);
    try {
      await api.delete("products", selectedProduct.ID);
      setShowDelete(false);
      fetchProducts();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      key: "edit",
      label: "",
      width: 36,
      render: (_: unknown, row: Product) => <RowEditIcon onClick={() => openEdit(row)} />,
    },
    { key: "Code", label: "Kode Item" },
    { key: "Barcode", label: "Barcode", render: (v: unknown) => (v as string) || "-" },
    { key: "sku", label: "SKU", render: () => "-" },
    {
      key: "Name",
      label: "Nama Item",
      render: (v: unknown) => <span className="font-medium">{String(v)}</span>,
    },
    {
      key: "Stock",
      label: "Stok Fisik",
      align: "right" as const,
      render: (v: unknown) => formatNumber(Number(v)),
    },
    {
      key: "Unit",
      label: "Satuan",
      render: (_: unknown, row: Product) => row.Unit?.Abbreviation || row.Unit?.Code || "-",
    },
    { key: "Category.Name", label: "Jenis", render: (_: unknown, row: Product) => row.Category?.Name || "-" },
    { key: "Brand.Name", label: "Merek", render: (_: unknown, row: Product) => row.Brand?.Name || "-" },
    { key: "rak", label: "Rak", render: () => "-" },
    {
      key: "PurchasePrice",
      label: "Harga Pokok",
      align: "right" as const,
      render: (v: unknown) => formatNumber(Number(v)),
    },
    {
      key: "avg",
      label: "HPP Rata-rata (AVG)",
      align: "right" as const,
      render: () => "0",
    },
    {
      key: "SellingPrice",
      label: "Harga Jual",
      align: "right" as const,
      render: (v: unknown) => formatNumber(Number(v)),
    },
    {
      key: "Description",
      label: "Keterangan",
      render: (v: unknown) => (v as string) || "-",
    },
  ];

  return (
    <PageWrapper>
      <Card className="p-4">
        <FilterBar
          fields={[
            { key: "search", label: "Kata Kunci", type: "text", placeholder: "Cari nama / kode / barcode" },
            { key: "warehouseId", label: "Dept/Gudang", type: "select", options: [{ value: "", label: "Semua Gudang" }, ...warehouses.map(w => ({ value: w.ID, label: w.Name }))] },
            { key: "categoryId", label: "Jenis", type: "select", options: [{ value: "", label: "Semua" }, ...categories.map(c => ({ value: c.ID, label: c.Name }))] },
            { key: "brandId", label: "Merek", type: "select", options: [{ value: "", label: "Semua" }, ...brands.map(b => ({ value: b.ID, label: b.Name }))] },
            { key: "isActive", label: "Pilihan Item", type: "select", options: [{ value: "", label: "Semua Data" }, { value: "true", label: "Aktif" }, { value: "false", label: "Nonaktif" }] },
          ]}
          onFilter={setFilters}
          loading={loading}
          actions={
            <>
              <GridActions
                onAdd={() => router.push('/master/items/new')}
                onEdit={() => selectedProduct && openEdit(selectedProduct)}
                onCopy={() => selectedProduct && openCopy(selectedProduct)}
                onDelete={() => selectedProduct && setShowDelete(true)}
                disableEdit={!selectedProduct}
                disableCopy={!selectedProduct}
                disableDelete={!selectedProduct}
              />
              <UtilityButton icon={Layers} onClick={() => window.open("/master/items/stock-card", "_self")}>
                Kartu Stok
              </UtilityButton>
            </>
          }
        />

        <div className="mt-4">
          <DataTable
            data={products}
            columns={columns}
            loading={loading}
            emptyMessage="Tidak ada item"
            selectedId={selectedProduct?.ID ?? null}
            onRowClick={(row) => setSelectedProduct(row)}
            pagination={{
              page: pagination.page,
              pageSize: pagination.pageSize,
              total: pagination.total,
              totalPages: pagination.totalPages,
              onPageChange: (p) => setPagination((prev) => ({ ...prev, page: p })),
            }}
          />
        </div>
      </Card>

      <ConfirmModal
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Hapus Produk"
        message={`Yakin ingin menghapus "${selectedProduct?.Name}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus"
        variant="danger"
        loading={saving}
      />
    </PageWrapper>
  );
}



