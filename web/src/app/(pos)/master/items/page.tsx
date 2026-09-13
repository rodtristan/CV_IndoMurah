"use client";

import { useState, useCallback, useEffect } from "react";
import { Plus, Edit, Trash2, Eye, Package } from "lucide-react";
import { PageWrapper, PageHeader, Card } from "@/components/layout/PageWrapper";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/StatCard";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { FilterBar } from "@/components/ui/FilterBar";
import { ConfirmModal } from "@/components/ui/Modal";
import { api, odata } from "@/lib/api-client";
import { formatCurrency, formatNumber } from "@/lib/utils";
import type { Product, Category, Brand, Unit, Warehouse } from "@/lib/types";

export default function MasterItemsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [filters, setFilters] = useState<Record<string, unknown>>({});
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0, totalPages: 0 });
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    code: "", barcode: "", name: "", categoryId: "", brandId: "",
    unitId: "", warehouseId: "", purchasePrice: "", sellingPrice: "",
    stock: "", minimumStock: "", description: "", isActive: true,
  });

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

      const res = await api.get<Product[]>("product", query.toParams());
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
    const [catRes, brandRes, unitRes, whRes] = await Promise.all([
      api.get<Category[]>("category", odata().take(100).toParams()).catch(() => ({ data: [] } as any)),
      api.get<Brand[]>("brand", odata().take(100).toParams()).catch(() => ({ data: [] } as any)),
      api.get<Unit[]>("unit", odata().take(100).toParams()).catch(() => ({ data: [] } as any)),
      api.get<Warehouse[]>("warehouse", odata().take(100).toParams()).catch(() => ({ data: [] } as any)),
    ]);
    setCategories(catRes.data || []);
    setBrands(brandRes.data || []);
    setUnits(unitRes.data || []);
    setWarehouses(whRes.data || []);
  };

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const openCreate = () => {
    setSelectedProduct(null);
    setForm({ code: "", barcode: "", name: "", categoryId: "", brandId: "", unitId: "", warehouseId: "", purchasePrice: "", sellingPrice: "", stock: "", minimumStock: "", description: "", isActive: true });
    fetchLookups();
    setShowForm(true);
  };

  const openEdit = (product: Product) => {
    setSelectedProduct(product);
    setForm({
      code: product.code, barcode: product.barcode || "", name: product.name,
      categoryId: String(product.categoryId || ""), brandId: String(product.brandId || ""),
      unitId: String(product.unitId), warehouseId: String(product.warehouseId || ""),
      purchasePrice: String(product.purchasePrice), sellingPrice: String(product.sellingPrice),
      stock: String(product.stock), minimumStock: String(product.minimumStock),
      description: product.description || "", isActive: product.isActive,
    });
    fetchLookups();
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        code: form.code, barcode: form.barcode || null, name: form.name,
        categoryId: form.categoryId ? Number(form.categoryId) : null,
        brandId: form.brandId ? Number(form.brandId) : null,
        unitId: Number(form.unitId),
        warehouseId: form.warehouseId ? Number(form.warehouseId) : null,
        purchasePrice: Number(form.purchasePrice),
        sellingPrice: Number(form.sellingPrice),
        stock: Number(form.stock),
        minimumStock: Number(form.minimumStock),
        description: form.description || null,
        isActive: form.isActive,
      };

      if (selectedProduct) {
        await api.put("product", selectedProduct.id, payload);
      } else {
        await api.post("product", payload);
      }
      setShowForm(false);
      fetchProducts();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;
    setSaving(true);
    try {
      await api.delete("product", selectedProduct.id);
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
      key: "code",
      label: "Kode",
      sortable: true,
      render: (v: unknown) => <span className="font-mono text-xs">{v as string}</span>,
    },
    {
      key: "name",
      label: "Nama Produk",
      sortable: true,
      render: (v: unknown, row: Product) => (
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-elevated">
            <Package className="size-4 text-muted" />
          </div>
          <div>
            <p className="font-medium">{String(v)}</p>
            <p className="text-xs text-muted">{row.category?.name || row.brand?.name || "-"}</p>
          </div>
        </div>
      ),
    },
    {
      key: "stock",
      label: "Stok",
      align: "right" as const,
      sortable: true,
      render: (v: unknown, row: Product) => {
        const stock = Number(v);
        const min = Number(row.minimumStock);
        const variant = stock === 0 ? "danger" : stock < min ? "warning" : "success";
        return <Badge variant={variant}>{formatNumber(stock)}</Badge>;
      },
    },
    {
      key: "purchasePrice",
      label: "Harga Beli",
      align: "right" as const,
      render: (v: unknown) => formatCurrency(v as number),
    },
    {
      key: "sellingPrice",
      label: "Harga Jual",
      align: "right" as const,
      render: (v: unknown) => <span className="font-semibold text-primary">{formatCurrency(v as number)}</span>,
    },
    {
      key: "isActive",
      label: "Status",
      render: (v: unknown) => (
        <Badge variant={v ? "success" : "danger"}>{v ? "Aktif" : "Nonaktif"}</Badge>
      ),
    },
    {
      key: "actions",
      label: "",
      width: 100,
      render: (_: unknown, row: Product) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" icon={Eye} onClick={() => { setSelectedProduct(row); setShowDetail(true); }} />
          <Button variant="ghost" size="icon" icon={Edit} onClick={() => openEdit(row)} />
          <Button variant="ghost" size="icon" icon={Trash2} onClick={() => { setSelectedProduct(row); setShowDelete(true); }} />
        </div>
      ),
    },
  ];

  return (
    <PageWrapper>
      <PageHeader
        title="Produk"
        subtitle="Kelola daftar produk"
        actions={<Button variant="primary" icon={Plus} onClick={openCreate}>Tambah Produk</Button>}
      />

      <Card>
        <FilterBar
          fields={[
            { key: "categoryId", label: "Kategori", type: "select", options: [{ value: "", label: "Semua" }, ...categories.map(c => ({ value: c.id, label: c.name }))] },
            { key: "brandId", label: "Merek", type: "select", options: [{ value: "", label: "Semua" }, ...brands.map(b => ({ value: b.id, label: b.name }))] },
            { key: "isActive", label: "Status", type: "select", options: [{ value: "", label: "Semua" }, { value: "true", label: "Aktif" }, { value: "false", label: "Nonaktif" }] },
          ]}
          onFilter={setFilters}
          loading={loading}
        />

        <div className="mt-4">
          <DataTable
            data={products}
            columns={columns}
            loading={loading}
            emptyMessage="Tidak ada produk"
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

      {/* Form Modal */}
      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={selectedProduct ? "Edit Produk" : "Tambah Produk"}
        size="lg"
        footer={<><Button variant="outline" onClick={() => setShowForm(false)}>Batal</Button><Button variant="primary" onClick={handleSave} loading={saving}>Simpan</Button></>}
      >
        <div className="grid grid-cols-2 gap-4">
          <Input label="Kode" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} required />
          <Input label="Barcode" value={form.barcode} onChange={(e) => setForm((f) => ({ ...f, barcode: e.target.value }))} />
          <div className="col-span-2"><Input label="Nama Produk" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required /></div>
          <Select label="Kategori" value={form.categoryId} onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))} options={[{ value: "", label: "Pilih..." }, ...categories.map(c => ({ value: c.id, label: c.name }))]} />
          <Select label="Merek" value={form.brandId} onChange={(e) => setForm((f) => ({ ...f, brandId: e.target.value }))} options={[{ value: "", label: "Pilih..." }, ...brands.map(b => ({ value: b.id, label: b.name }))]} />
          <Select label="Satuan" value={form.unitId} onChange={(e) => setForm((f) => ({ ...f, unitId: e.target.value }))} options={[{ value: "", label: "Pilih..." }, ...units.map(u => ({ value: u.id, label: `${u.name} (${u.abbreviation || u.code})` }))]} required />
          <Select label="Gudang" value={form.warehouseId} onChange={(e) => setForm((f) => ({ ...f, warehouseId: e.target.value }))} options={[{ value: "", label: "Pilih..." }, ...warehouses.map(w => ({ value: w.id, label: w.name }))]} />
          <Input label="Harga Beli" type="number" value={form.purchasePrice} onChange={(e) => setForm((f) => ({ ...f, purchasePrice: e.target.value }))} required />
          <Input label="Harga Jual" type="number" value={form.sellingPrice} onChange={(e) => setForm((f) => ({ ...f, sellingPrice: e.target.value }))} required />
          <Input label="Stok" type="number" value={form.stock} onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))} required />
          <Input label="Stok Minimum" type="number" value={form.minimumStock} onChange={(e) => setForm((f) => ({ ...f, minimumStock: e.target.value }))} />
        </div>
      </Modal>

      <ConfirmModal
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Hapus Produk"
        message={`Yakin ingin menghapus "${selectedProduct?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus"
        variant="danger"
        loading={saving}
      />
    </PageWrapper>
  );
}



