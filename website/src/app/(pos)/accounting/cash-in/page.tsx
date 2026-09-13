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
import type { CashIn, Account } from "@/types/pos";
import { cn } from "@/lib/utils";

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

interface CashInFormData {
  date: string;
  accountId: number | null;
  amount: number;
  description: string;
}

export default function CashInPage() {
  const [cashIns, setCashIns] = useState<CashIn[]>([]);
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
  const [editingCashIn, setEditingCashIn] = useState<CashIn | null>(null);
  const [deletingCashIn, setDeletingCashIn] = useState<CashIn | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CashInFormData>({
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

  const fetchCashIns = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {
        $skip: (page - 1) * 20,
        $take: 20,
        $orderBy: { createdAt: 'desc' },
      };

      if (search) {
        params.$search = search;
      }
      if (dateFrom) {
        params.dateFrom = dateFrom;
      }
      if (dateTo) {
        params.dateTo = dateTo;
      }
      if (accountFilter) {
        params.accountId = accountFilter;
      }

      const response = await api.request<{ data: CashIn[]; meta: any }>('GET', 'cash-ins', undefined, params);

      if (response.success) {
        setCashIns(response.data || []);
        setTotal(response.meta?.total || 0);
        setTotalPages(response.meta?.pages || 1);
      }
    } catch (error) {
      console.error("Failed to fetch cash-ins:", error);
    } finally {
      setLoading(false);
    }
  }, [page, search, dateFrom, dateTo, accountFilter]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  useEffect(() => {
    fetchCashIns();
  }, [fetchCashIns]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => setPage(1), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleOpenModal = (cashIn?: CashIn) => {
    if (cashIn) {
      setEditingCashIn(cashIn);
      setFormData({
        date: cashIn.date.split('T')[0],
        accountId: cashIn.accountId,
        amount: cashIn.amount,
        description: cashIn.description || "",
      });
    } else {
      setEditingCashIn(null);
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

      if (editingCashIn) {
        const res = await api.request('PUT', `cash-ins/${editingCashIn.id}`, payload);
        if (!res.success) {
          alert(res.message || "Gagal mengupdate kas masuk");
          return;
        }
      } else {
        const res = await api.request('POST', 'cash-ins', payload);
        if (!res.success) {
          alert(res.message || "Gagal membuat kas masuk");
          return;
        }
      }
      setIsModalOpen(false);
      fetchCashIns();
    } catch (error) {
      console.error("Failed to save cash-in:", error);
      alert("Terjadi kesalahan saat menyimpan");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCashIn) return;
    setSaving(true);
    try {
      const res = await api.request('DELETE', `cash-ins/${deletingCashIn.id}`);
      if (res.success) {
        setIsDeleteConfirmOpen(false);
        setDeletingCashIn(null);
        fetchCashIns();
      } else {
        alert(res.message || "Gagal menghapus kas masuk");
      }
    } catch (error) {
      console.error("Failed to delete cash-in:", error);
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

  const totalAmount = cashIns.reduce((sum, c) => sum + c.amount, 0);

  const columns = [
    { key: "code", label: "Kode", sortable: true, render: (v: unknown) => (
      <span className="font-mono font-medium">{v as string}</span>
    )},
    { key: "date", label: "Tanggal", sortable: true, render: (v: unknown) => formatDate(v as string) },
    {
      key: "account",
      label: "Akun",
      render: (_: unknown, row: CashIn) => row.account?.name || `Akun #${row.accountId}`
    },
    { key: "description", label: "Keterangan", render: (v: unknown) => (
      <span className="text-muted truncate max-w-[200px] block">{v as string || '-'}</span>
    )},
    {
      key: "amount",
      label: "Jumlah",
      align: "right" as const,
      sortable: true,
      render: (v: unknown) => (
        <span className="font-semibold text-success">{formatCurrency(v as number)}</span>
      )
    },
    {
      key: "actions",
      label: "",
      align: "center" as const,
      render: (_: unknown, row: CashIn) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => handleOpenModal(row)} title="Edit">
            <Edit className="size-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => { setDeletingCashIn(row); setIsDeleteConfirmOpen(true); }} title="Hapus">
            <Trash2 className="size-4 text-error" />
          </Button>
        </div>
      )
    },
  ];

  return (
    <PageWrapper>
      <PageTitle
        title="Kas Masuk"
        subtitle={`Total: ${total} transaksi | Rp ${formatCurrency(totalAmount)}`}
        actions={
          <Button onClick={() => handleOpenModal()} icon={Plus}>
            Kas Masuk Baru
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
          <Button
            variant={showFilters ? "default" : "outline"}
            size="sm"
            icon={Filter}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filter
          </Button>
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchCashIns} disabled={loading}>
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
        data={cashIns}
        columns={columns}
        page={page}
        pageSize={20}
        totalItems={total}
        onPageChange={setPage}
        loading={loading}
        emptyMessage="Tidak ada data kas masuk"
      />

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCashIn ? "Edit Kas Masuk" : "Kas Masuk Baru"}
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
              placeholder="Keterangan kas masuk..."
            />
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Menyimpan..." : (editingCashIn ? "Update" : "Simpan")}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onConfirm={handleDelete}
        onCancel={() => { setIsDeleteConfirmOpen(false); setDeletingCashIn(null); }}
        title="Hapus Kas Masuk?"
        message={`Yakin ingin menghapus kas masuk "${deletingCashIn?.code}"?`}
        confirmText="Hapus"
        cancelText="Batal"
        variant="danger"
        loading={saving}
      />
    </PageWrapper>
  );
}
