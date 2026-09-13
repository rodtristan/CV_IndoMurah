"use client";

<<<<<<< HEAD
import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Edit, Trash2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/pos/Modal";
import { ConfirmDialog } from "@/components/pos/ConfirmDialog";
import { PageWrapper, PageTitle } from "@/components/pos/layout/PosLayout";
import { DataTable } from "@/components/pos/DataTable";
import { api } from "@/lib/api";
import type { Customer } from "@/types/pos";
import { cn } from "@/lib/utils";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

interface CustomerFormData {
  code: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  customerType: "retail" | "wholesale" | "vip";
  notes: string;
}
=======
import { useState } from "react";
import { Plus, Pencil, Trash2, Search, Filter, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { PageWrapper } from "@/components/pos/layout/PosLayout";
import { PageTitle } from "@/components/pos/layout/PosLayout";
import { Button } from "@/components/ui/Button";
import { CustomerForm } from "@/components/pos/master/CustomerForm";
import { mockCustomers } from "@/lib/mock-data-pos";
import type { Customer } from "@/types/pos";
import { cn } from "@/lib/utils";

const formatCurrency = (amount: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);
>>>>>>> 63daaa85a51c7e35690b29bd242c859ea670f111

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
<<<<<<< HEAD
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize] = useState(20);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CustomerFormData>({
    code: "",
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    customerType: "retail",
    notes: "",
  });

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = {
        $skip: (page - 1) * pageSize,
        $take: pageSize,
      };

      if (search) {
        params.$search = search;
      }

      const response = await api.getCustomers(params as any);

      if (response.success) {
        setCustomers(response.data || []);
        setTotal(response.meta?.total || 0);
        setTotalPages(response.meta?.pages || 1);
      }
    } catch (error) {
      console.error("Failed to fetch customers:", error);
    } finally {
      setLoading(false);
    }
  }, [page, search, pageSize]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleOpenModal = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        code: customer.code,
        name: customer.name,
        phone: customer.phone || "",
        email: customer.email || "",
        address: customer.address || "",
        city: (customer as any).city || "",
        customerType: customer.customerType || "retail",
        notes: customer.notes || "",
      });
    } else {
      setEditingCustomer(null);
      setFormData({
        code: "",
        name: "",
        phone: "",
        email: "",
        address: "",
        city: "",
        customerType: "retail",
        notes: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        code: formData.code,
        name: formData.name,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        address: formData.address || undefined,
        city: formData.city || undefined,
        customerGroup: formData.customerType,
        notes: formData.notes || undefined,
      };

      if (editingCustomer) {
        const res = await api.updateCustomer(editingCustomer.id, payload);
        if (!res.success) {
          alert(res.message || "Gagal mengupdate pelanggan");
          return;
        }
      } else {
        const res = await api.createCustomer(payload);
        if (!res.success) {
          alert(res.message || "Gagal membuat pelanggan");
          return;
        }
      }
      setIsModalOpen(false);
      fetchCustomers();
    } catch (error) {
      console.error("Failed to save customer:", error);
      alert("Terjadi kesalahan saat menyimpan");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCustomer) return;
    setSaving(true);
    try {
      const res = await api.deleteCustomer(deletingCustomer.id);
      if (res.success) {
        setIsDeleteConfirmOpen(false);
        setDeletingCustomer(null);
        fetchCustomers();
      } else {
        alert(res.message || "Gagal menghapus pelanggan");
      }
    } catch (error) {
      console.error("Failed to delete customer:", error);
      alert("Terjadi kesalahan saat menghapus");
    } finally {
      setSaving(false);
    }
  };

  const getCustomerTypeLabel = (type: string) => {
    switch (type) {
      case "vip":
        return "VIP";
      case "wholesale":
        return "Grosir";
      default:
        return "Retail";
    }
  };

  const getCustomerTypeColor = (type: string) => {
    switch (type) {
      case "vip":
        return "bg-purple-500/20 text-purple-300";
      case "wholesale":
        return "bg-blue-500/20 text-blue-400";
      default:
        return "bg-slate-500/20 text-slate-400";
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
      label: "Nama Pelanggan",
      sortable: true,
      render: (v: unknown, row: Customer) => (
        <div>
          <div className="font-medium">{v as string}</div>
          {row.email && <div className="text-xs text-muted">{row.email}</div>}
        </div>
      ),
    },
    {
      key: "phone",
      label: "Telepon",
      render: (v: unknown) => v || "-",
    },
    {
      key: "customerType",
      label: "Group",
      align: "center" as const,
      render: (v: unknown) => (
        <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", getCustomerTypeColor(v as string))}>
          {getCustomerTypeLabel(v as string)}
        </span>
      ),
    },
    {
      key: "totalReceivable",
      label: "Total Piutang",
      align: "right" as const,
      sortable: true,
      render: (v: unknown) => (
        <span className="font-medium">{formatCurrency(v as number)}</span>
      ),
    },
    {
      key: "pointBalance",
      label: "Poin",
      align: "right" as const,
      render: (v: unknown) => formatCurrency(v as number),
    },
    {
      key: "isActive",
      label: "Status",
      align: "center" as const,
      render: (v: unknown) => (
        <Badge color={v ? "success" : "default"} variant="subtle">
          {v ? "Aktif" : "Nonaktif"}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "",
      align: "center" as const,
      render: (_: unknown, row: Customer) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => handleOpenModal(row)} title="Edit">
            <Edit className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setDeletingCustomer(row);
              setIsDeleteConfirmOpen(true);
            }}
            title="Hapus"
          >
            <Trash2 className="size-4 text-error" />
          </Button>
        </div>
      ),
    },
  ];

=======
  const [customers] = useState<Customer[]>(mockCustomers);
  const [formOpen, setFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredData = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

>>>>>>> 63daaa85a51c7e35690b29bd242c859ea670f111
  return (
    <PageWrapper className="bg-gray-100">
      <PageTitle
<<<<<<< HEAD
        title="Pelanggan"
        subtitle={`Total: ${total} pelanggan`}
        actions={
          <Button onClick={() => handleOpenModal()} icon={Plus}>
            Tambah Pelanggan
          </Button>
        }
      />

      {/* Search */}
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <Input
            placeholder="Cari pelanggan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          icon={RefreshCw}
          onClick={fetchCustomers}
          disabled={loading}
        >
          Refresh
        </Button>
      </div>

      {/* Table */}
      <DataTable
        data={customers}
        columns={columns}
        page={page}
        pageSize={pageSize}
        totalItems={total}
        onPageChange={setPage}
        loading={loading}
        emptyMessage="Tidak ada pelanggan ditemukan"
      />

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCustomer ? "Edit Pelanggan" : "Tambah Pelanggan Baru"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Kode *</label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                required
                placeholder="CST001"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Nama Pelanggan *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Nama pelanggan"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Telepon</label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="0812-3456-7890"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Group Pelanggan</label>
              <select
                value={formData.customerType}
                onChange={(e) => setFormData({ ...formData, customerType: e.target.value as "retail" | "wholesale" | "vip" })}
                className="w-full rounded-lg border border-default bg-bg px-3 py-2 text-sm"
              >
                <option value="retail">Retail</option>
                <option value="wholesale">Grosir</option>
                <option value="vip">VIP</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="customer@email.com"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Alamat</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={2}
              className="w-full rounded-lg border border-default bg-bg px-3 py-2 text-sm"
              placeholder="Alamat pelanggan..."
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Kota</label>
            <Input
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="Kota"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Catatan</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              className="w-full rounded-lg border border-default bg-bg px-3 py-2 text-sm"
              placeholder="Catatan tambahan..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Menyimpan..." : editingCustomer ? "Update" : "Simpan"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onConfirm={handleDelete}
        onCancel={() => {
          setIsDeleteConfirmOpen(false);
          setDeletingCustomer(null);
        }}
        title="Hapus Pelanggan?"
        message={`Yakin ingin menghapus pelanggan "${deletingCustomer?.name}"?`}
        confirmText="Hapus"
        cancelText="Batal"
        variant="danger"
        loading={saving}
      />
=======
        title="Master / Pelanggan"
        subtitle="Kelola daftar pelanggan"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="border-gray-300">
              <Download className="size-4 mr-2" /> Export
            </Button>
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700" onClick={() => { setEditingCustomer(null); setFormOpen(true); }}>
              <Plus className="size-4 mr-2" /> Tambah Pelanggan
            </Button>
          </div>
        }
      />

      <div className="bg-white rounded-lg border border-gray-200 mb-4">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <input type="text" placeholder="Cari pelanggan..." value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} className="pl-9 pr-4 py-2 w-64 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500" />
            </div>
            <Button variant="outline" size="sm" className="border-gray-200">
              <Filter className="size-4 mr-2" /> Filter
            </Button>
          </div>
          <div className="text-sm text-gray-500">{filteredData.length} data</div>
        </div>

        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="text-xs text-gray-500 text-left">
              <th className="px-4 py-3 font-medium w-10"><input type="checkbox" className="rounded border-gray-300" /></th>
              <th className="px-4 py-3 font-medium">Kode</th>
              <th className="px-4 py-3 font-medium">Nama Pelanggan</th>
              <th className="px-4 py-3 font-medium">Telepon</th>
              <th className="px-4 py-3 font-medium">Tipe</th>
              <th className="px-4 py-3 font-medium text-right">Saldo Poin</th>
              <th className="px-4 py-3 font-medium text-right">Piutang</th>
              <th className="px-4 py-3 font-medium text-center w-20">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedData.map((customer) => (
              <tr key={customer.id} className="hover:bg-gray-50">
                <td className="px-4 py-3"><input type="checkbox" className="rounded border-gray-300" /></td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{customer.code}</td>
                <td className="px-4 py-3 text-sm font-medium text-purple-600">{customer.name}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{customer.phone || "-"}</td>
                <td className="px-4 py-3">
                  <span className={cn("inline-flex px-2 py-0.5 text-xs font-medium rounded-full",
                    customer.customerType === "vip" ? "bg-purple-100 text-purple-700" :
                    customer.customerType === "wholesale" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600")}>
                    {customer.customerType === "vip" ? "VIP" : customer.customerType === "wholesale" ? "Grosir" : "Retail"}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-right text-gray-700">{formatCurrency(customer.pointBalance || 0)}</td>
                <td className="px-4 py-3 text-sm text-right text-gray-700">{formatCurrency(0)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1">
                    <button onClick={() => { setEditingCustomer(customer); setFormOpen(true); }} className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded"><Pencil className="size-4" /></button>
                    <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 className="size-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <div className="text-sm text-gray-500">Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredData.length)} dari {filteredData.length}</div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)} className="border-gray-200"><ChevronLeft className="size-4" /></Button>
            <span className="text-sm text-gray-600 px-2">Halaman {currentPage} dari {totalPages || 1}</span>
            <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)} className="border-gray-200"><ChevronRight className="size-4" /></Button>
          </div>
        </div>
      </div>

      <CustomerForm open={formOpen} onClose={() => { setFormOpen(false); setEditingCustomer(null); }} onSave={() => setFormOpen(false)} initialData={editingCustomer || undefined} isEditing={!!editingCustomer} />
>>>>>>> 63daaa85a51c7e35690b29bd242c859ea670f111
    </PageWrapper>
  );
}
