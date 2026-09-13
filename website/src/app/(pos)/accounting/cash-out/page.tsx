"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Edit, Trash2, RefreshCw, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/pos/Modal";
import { ConfirmDialog } from "@/components/pos/ConfirmDialog";
import { PageWrapper, PageTitle } from "@/components/pos/layout/PosLayout";
import { DataTable } from "@/components/pos/DataTable";
import { api } from "@/lib/api";
import type { CashOut, Account } from "@/types/pos";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

interface CashOutFormData {
  date: string;
  accountId: number | null;
  amount: number;
  description: string;
}

export default function CashOutPage() {
  const [cashOuts, setCashOuts] = useState<CashOut[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [accountFilter, setAccountFilter] = useState<number | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [editingCashOut, setEditingCashOut] = useState<CashOut | null>(null);
  const [deletingCashOut, setDeletingCashOut] = useState<CashOut | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CashOutFormData>({
    date: new Date().toISOString().split('T')[0],
    accountId: null,
    amount: 0,
    description: "",
  });

  const fetchAccounts = useCallback(async () => {
    try {
      const res = await api.request<{ data: Account[] }>('GET', 'accounts', undefined, {
        $where: { isActive: true },
        $take: 100,
      });
      if (res.success && res.data) {
        setAccounts(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch accounts:", error);
    }
  }, []);

  const fetchCashOuts = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {
        $skip: (page - 1) * 20,
        $take: 20,
        $orderBy: { createdAt: 'desc' },
      };

      if (search) params.$search = search;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      if (accountFilter) params.accountId = accountFilter;

      const response = await api.request<{ data: CashOut[]; meta: any }>('GET', 'cash-outs', undefined, params);

      if (response.success) {
        setCashOuts(response.data || []);
        setTotal(response.meta?.total || 0);
        setTotalPages(response.meta?.pages || 1);
      }
    } catch (error) {
      console.error("Failed to fetch cash-outs:", error);
    } finally {
      setLoading(false);
    }
  }, [page, search, dateFrom, dateTo, accountFilter]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  useEffect(() => {
    fetchCashOuts();
  }, [fetchCashOuts]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => setPage(1), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleOpenModal = (cashOut?: CashOut) => {
    if (cashOut) {
      setEditingCashOut(cashOut);
      setFormData({
        date: cashOut.date.split('T')[0],
        accountId: cashOut.accountId,
        amount: cashOut.amount,
        description: cashOut.description || "",
      });
    } else {
      setEditingCashOut(null);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        accountId: accounts.find(a => a.type === 'ASSET')?.id || null,
        amount: 0,
        description: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.accountId || formData.amount <= 0) {
      alert("Mohon isi semua field yang diperlukan");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        date: formData.date,
        accountId: formData.accountId,
        amount: formData.amount,
        description: formData.description || undefined,
      };

      if (editingCashOut) {
        const res = await api.request('PUT', `cash-outs/${editingCashOut.id}`, payload);
        if (!res.success) {
          alert(res.message || "Gagal mengupdate kas keluar");
          return;
        }
      } else {
        const res = await api.request('POST', 'cash-outs', payload);
        if (!res.success) {
          alert(res.message || "Gagal membuat kas keluar");
          return;
        }
      }
      setIsModalOpen(false);
      fetchCashOuts();
    } catch (error) {
      console.error("Failed to save cash-out:", error);
      alert("Terjadi kesalahan saat menyimpan");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCashOut) return;
    setSaving(true);
    try {
      const res = await api.request('DELETE', `cash-outs/${deletingCashOut.id}`);
      if (res.success) {
        setIsDeleteConfirmOpen(false);
        setDeletingCashOut(null);
        fetchCashOuts();
      } else {
        alert(res.message || "Gagal menghapus kas keluar");
      }
    } catch (error) {
      console.error("Failed to delete cash-out:", error);
      alert("Terjadi kesalahan saat menghapus");
    } finally {
      setSaving(false);
    }
  };

  const clearFilters = () => {
    setDateFrom("");
    setDateTo("");
    setAccountFilter(null);
    setSearch("");
    setPage(1);
  };

  const totalAmount = cashOuts.reduce((sum, c) => sum + c.amount, 0);

  const columns = [
    { key: "code", label: "Kode", sortable: true, render: (v: unknown) => (
      <span className="font-mono font-medium">{v as string}</span>
    )},
    { key: "date", label: "Tanggal", sortable: true, render: (v: unknown) => formatDate(v as string) },
    { key: "account", label: "Akun", render: (_: unknown, row: CashOut) => row.account?.name || `Akun #${row.accountId}` },
    { key: "description", label: "Keterangan", render: (v: unknown) => (
      <span className="text-muted truncate max-w-[200px] block">{v as string || '-'}</span>
    )},
    { key: "amount", label: "Jumlah", align: "right" as const, sortable: true, render: (v: unknown) => (
      <span className="font-semibold text-error">{formatCurrency(v as number)}</span>
    )},
    { key: "actions", label: "", align: "center" as const, render: (_: unknown, row: CashOut) => (
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={() => handleOpenModal(row)} title="Edit">
          <Edit className="size-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => { setDeletingCashOut(row); setIsDeleteConfirmOpen(true); }} title="Hapus">
          <Trash2 className="size-4 text-error" />
        </Button>
      </div>
    )},
  ];

  return (
    <PageWrapper>
      <PageTitle
        title="Kas Keluar"
        subtitle={`Total: ${total} transaksi | Rp ${formatCurrency(totalAmount)}`}
        actions={
          <Button onClick={() => handleOpenModal()} icon={Plus}>
            Kas Keluar Baru
          </Button>
        }
      />

      {/* Search and Filters */}
      <div className="mb-4 space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <Input
              placeholder="Cari kode atau keterangan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant={showFilters ? "default" : "outline"} size="sm" icon={Filter} onClick={() => setShowFilters(!showFilters)}>
            Filter
          </Button>
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchCashOuts} disabled={loading}>
            Refresh
          </Button>
        </div>

        {showFilters && (
          <div className="rounded-lg border border-default bg-elevated/50 p-4 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium">Dari Tanggal</label>
                <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Sampai Tanggal</label>
                <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Akun</label>
                <select
                  value={accountFilter || ""}
                  onChange={(e) => setAccountFilter(e.target.value ? Number(e.target.value) : null)}
                  className="w-full rounded-lg border border-default bg-bg px-3 py-2 text-sm"
                >
                  <option value="">Semua Akun</option>
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
            </div>
            {(dateFrom || dateTo || accountFilter) && (
              <div className="flex justify-end">
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="size-4 mr-1" /> Clear Filters
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <DataTable
        data={cashOuts}
        columns={columns}
        page={page}
        pageSize={20}
        totalItems={total}
        onPageChange={setPage}
        loading={loading}
        emptyMessage="Tidak ada data kas keluar"
      />

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCashOut ? "Edit Kas Keluar" : "Kas Keluar Baru"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Tanggal *</label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Akun *</label>
            <select
              value={formData.accountId || ""}
              onChange={(e) => setFormData({ ...formData, accountId: e.target.value ? Number(e.target.value) : null })}
              className="w-full rounded-lg border border-default bg-bg px-3 py-2 text-sm"
              required
            >
              <option value="">Pilih Akun</option>
              {accounts.filter(a => a.type === 'ASSET').map(a => (
                <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Jumlah (Rp) *</label>
            <Input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
              required
              min={0}
              placeholder="0"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Keterangan</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full rounded-lg border border-default bg-bg px-3 py-2 text-sm"
              placeholder="Keterangan kas keluar..."
            />
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Menyimpan..." : (editingCashOut ? "Update" : "Simpan")}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onConfirm={handleDelete}
        onCancel={() => { setIsDeleteConfirmOpen(false); setDeletingCashOut(null); }}
        title="Hapus Kas Keluar?"
        message={`Yakin ingin menghapus kas keluar "${deletingCashOut?.code}"?`}
        confirmText="Hapus"
        cancelText="Batal"
        variant="danger"
        loading={saving}
      />
    </PageWrapper>
  );
}
