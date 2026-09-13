"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Edit, Trash2, RefreshCw, Filter, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/pos/Modal";
import { ConfirmDialog } from "@/components/pos/ConfirmDialog";
import { PageWrapper, PageTitle } from "@/components/pos/layout/PosLayout";
import { DataTable } from "@/components/pos/DataTable";
import { api } from "@/lib/api";
import type { CashTransfer, Account } from "@/types/pos";

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

interface CashTransferFormData {
  date: string;
  fromAccountId: number | null;
  toAccountId: number | null;
  amount: number;
  description: string;
}

export default function CashTransferPage() {
  const [transfers, setTransfers] = useState<CashTransfer[]>([]);
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

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [editingTransfer, setEditingTransfer] = useState<CashTransfer | null>(null);
  const [deletingTransfer, setDeletingTransfer] = useState<CashTransfer | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CashTransferFormData>({
    date: new Date().toISOString().split('T')[0],
    fromAccountId: null,
    toAccountId: null,
    amount: 0,
    description: "",
  });

  const fetchAccounts = useCallback(async () => {
    try {
      const res = await api.request<{ data: Account[] }>('GET', 'accounts', undefined, {
        $where: { isActive: true, type: 'ASSET' },
        $take: 100,
      });
      if (res.success && res.data) {
        setAccounts(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch accounts:", error);
    }
  }, []);

  const fetchTransfers = useCallback(async () => {
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

      const response = await api.request<{ data: CashTransfer[]; meta: any }>('GET', 'cash-transfers', undefined, params);

      if (response.success) {
        setTransfers(response.data || []);
        setTotal(response.meta?.total || 0);
        setTotalPages(response.meta?.pages || 1);
      }
    } catch (error) {
      console.error("Failed to fetch cash transfers:", error);
    } finally {
      setLoading(false);
    }
  }, [page, search, dateFrom, dateTo]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  useEffect(() => {
    fetchTransfers();
  }, [fetchTransfers]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => setPage(1), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleOpenModal = (transfer?: CashTransfer) => {
    if (transfer) {
      setEditingTransfer(transfer);
      setFormData({
        date: transfer.date.split('T')[0],
        fromAccountId: transfer.fromAccountId,
        toAccountId: transfer.toAccountId,
        amount: transfer.amount,
        description: transfer.description || "",
      });
    } else {
      setEditingTransfer(null);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        fromAccountId: accounts.length > 0 ? accounts[0].id : null,
        toAccountId: accounts.length > 1 ? accounts[1].id : null,
        amount: 0,
        description: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fromAccountId || !formData.toAccountId || formData.amount <= 0) {
      alert("Mohon isi semua field yang diperlukan");
      return;
    }
    if (formData.fromAccountId === formData.toAccountId) {
      alert("Akun asal dan tujuan tidak boleh sama");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        date: formData.date,
        fromAccountId: formData.fromAccountId,
        toAccountId: formData.toAccountId,
        amount: formData.amount,
        description: formData.description || undefined,
      };

      if (editingTransfer) {
        const res = await api.request('PUT', `cash-transfers/${editingTransfer.id}`, payload);
        if (!res.success) {
          alert(res.message || "Gagal mengupdate transfer");
          return;
        }
      } else {
        const res = await api.request('POST', 'cash-transfers', payload);
        if (!res.success) {
          alert(res.message || "Gagal membuat transfer");
          return;
        }
      }
      setIsModalOpen(false);
      fetchTransfers();
    } catch (error) {
      console.error("Failed to save transfer:", error);
      alert("Terjadi kesalahan saat menyimpan");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingTransfer) return;
    setSaving(true);
    try {
      const res = await api.request('DELETE', `cash-transfers/${deletingTransfer.id}`);
      if (res.success) {
        setIsDeleteConfirmOpen(false);
        setDeletingTransfer(null);
        fetchTransfers();
      } else {
        alert(res.message || "Gagal menghapus transfer");
      }
    } catch (error) {
      console.error("Failed to delete transfer:", error);
      alert("Terjadi kesalahan saat menghapus");
    } finally {
      setSaving(false);
    }
  };

  const clearFilters = () => {
    setDateFrom("");
    setDateTo("");
    setSearch("");
    setPage(1);
  };

  const totalAmount = transfers.reduce((sum, t) => sum + t.amount, 0);

  const columns = [
    { key: "code", label: "Kode", sortable: true, render: (v: unknown) => (
      <span className="font-mono font-medium">{v as string}</span>
    )},
    { key: "date", label: "Tanggal", sortable: true, render: (v: unknown) => formatDate(v as string) },
    {
      key: "accounts",
      label: "Dari / Ke",
      render: (_: unknown, row: CashTransfer) => (
        <div className="flex items-center gap-2 text-sm">
          <span className="truncate max-w-[100px]">{row.fromAccount?.name || `Akun #${row.fromAccountId}`}</span>
          <ArrowRight className="size-3 text-muted shrink-0" />
          <span className="truncate max-w-[100px]">{row.toAccount?.name || `Akun #${row.toAccountId}`}</span>
        </div>
      )
    },
    { key: "description", label: "Keterangan", render: (v: unknown) => (
      <span className="text-muted truncate max-w-[150px] block">{v as string || '-'}</span>
    )},
    { key: "amount", label: "Jumlah", align: "right" as const, sortable: true, render: (v: unknown) => (
      <span className="font-semibold text-primary">{formatCurrency(v as number)}</span>
    )},
    { key: "actions", label: "", align: "center" as const, render: (_: unknown, row: CashTransfer) => (
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={() => handleOpenModal(row)} title="Edit">
          <Edit className="size-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => { setDeletingTransfer(row); setIsDeleteConfirmOpen(true); }} title="Hapus">
          <Trash2 className="size-4 text-error" />
        </Button>
      </div>
    )},
  ];

  return (
    <PageWrapper>
      <PageTitle
        title="Transfer Kas"
        subtitle={`Total: ${total} transfer | Rp ${formatCurrency(totalAmount)}`}
        actions={
          <Button onClick={() => handleOpenModal()} icon={Plus}>
            Transfer Baru
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
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchTransfers} disabled={loading}>
            Refresh
          </Button>
        </div>

        {showFilters && (
          <div className="rounded-lg border border-default bg-elevated/50 p-4 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Dari Tanggal</label>
                <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Sampai Tanggal</label>
                <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
              </div>
            </div>
            {(dateFrom || dateTo) && (
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
        data={transfers}
        columns={columns}
        page={page}
        pageSize={20}
        totalItems={total}
        onPageChange={setPage}
        loading={loading}
        emptyMessage="Tidak ada data transfer kas"
      />

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTransfer ? "Edit Transfer Kas" : "Transfer Kas Baru"}
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
            <label className="mb-1 block text-sm font-medium">Dari Akun *</label>
            <select
              value={formData.fromAccountId || ""}
              onChange={(e) => setFormData({ ...formData, fromAccountId: e.target.value ? Number(e.target.value) : null })}
              className="w-full rounded-lg border border-default bg-bg px-3 py-2 text-sm"
              required
            >
              <option value="">Pilih Akun Asal</option>
              {accounts.map(a => (
                <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Ke Akun *</label>
            <select
              value={formData.toAccountId || ""}
              onChange={(e) => setFormData({ ...formData, toAccountId: e.target.value ? Number(e.target.value) : null })}
              className="w-full rounded-lg border border-default bg-bg px-3 py-2 text-sm"
              required
            >
              <option value="">Pilih Akun Tujuan</option>
              {accounts.map(a => (
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
              placeholder="Keterangan transfer..."
            />
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Menyimpan..." : (editingTransfer ? "Update" : "Simpan")}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onConfirm={handleDelete}
        onCancel={() => { setIsDeleteConfirmOpen(false); setDeletingTransfer(null); }}
        title="Hapus Transfer?"
        message={`Yakin ingin menghapus transfer "${deletingTransfer?.code}"?`}
        confirmText="Hapus"
        cancelText="Batal"
        variant="danger"
        loading={saving}
      />
    </PageWrapper>
  );
}
