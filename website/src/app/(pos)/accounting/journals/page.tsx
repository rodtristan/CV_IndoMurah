"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Eye, RefreshCw, Filter, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/pos/Modal";
import { PageWrapper, PageTitle } from "@/components/pos/layout/PosLayout";
import { DataTable } from "@/components/pos/DataTable";
import { api } from "@/lib/api";
import type { Journal, JournalEntry, Account } from "@/types/pos";
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
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function JournalsPage() {
  const [journals, setJournals] = useState<Journal[]>([]);
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
  const [isPostedFilter, setIsPostedFilter] = useState<string>("");

  // Detail modal
  const [selectedJournal, setSelectedJournal] = useState<Journal | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

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

  const fetchJournals = useCallback(async () => {
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
      if (isPostedFilter === 'posted') params.isPosted = true;
      if (isPostedFilter === 'unposted') params.isPosted = false;

      const response = await api.request<{ data: Journal[]; meta: any }>('GET', 'journals', undefined, params);

      if (response.success) {
        setJournals(response.data || []);
        setTotal(response.meta?.total || 0);
        setTotalPages(response.meta?.pages || 1);
      }
    } catch (error) {
      console.error("Failed to fetch journals:", error);
    } finally {
      setLoading(false);
    }
  }, [page, search, dateFrom, dateTo, isPostedFilter]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  useEffect(() => {
    fetchJournals();
  }, [fetchJournals]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => setPage(1), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleViewDetail = async (journal: Journal) => {
    setDetailLoading(true);
    setSelectedJournal(journal);
    setShowDetailModal(true);
    try {
      const res = await api.request<{ data: Journal }>('GET', `journals/${journal.id}`);
      if (res.success && res.data) {
        setSelectedJournal(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch journal detail:", error);
    } finally {
      setDetailLoading(false);
    }
  };

  const handlePost = async (journal: Journal) => {
    try {
      const res = await api.request('POST', `journals/${journal.id}/post`);
      if (res.success) {
        fetchJournals();
        if (showDetailModal && selectedJournal?.id === journal.id) {
          handleViewDetail({ ...journal, isPosted: true });
        }
      } else {
        alert(res.message || "Gagal memposting jurnal");
      }
    } catch (error) {
      console.error("Failed to post journal:", error);
      alert("Terjadi kesalahan saat memposting");
    }
  };

  const clearFilters = () => {
    setDateFrom("");
    setDateTo("");
    setIsPostedFilter("");
    setSearch("");
    setPage(1);
  };

  const columns = [
    { key: "code", label: "Kode", sortable: true, render: (v: unknown) => (
      <span className="font-mono font-medium">{v as string}</span>
    )},
    { key: "date", label: "Tanggal", sortable: true, render: (v: unknown) => formatDate(v as string) },
    { key: "description", label: "Keterangan", render: (v: unknown) => (
      <span className="text-muted truncate max-w-[200px] block">{v as string || '-'}</span>
    )},
    {
      key: "totalDebit",
      label: "Total Debit",
      align: "right" as const,
      render: (_: unknown, row: Journal) => {
        const totalDebit = row.journalEntries?.reduce((sum, e) => sum + e.debit, 0) || 0;
        return <span className="font-medium">{formatCurrency(totalDebit)}</span>;
      }
    },
    {
      key: "totalCredit",
      label: "Total Kredit",
      align: "right" as const,
      render: (_: unknown, row: Journal) => {
        const totalCredit = row.journalEntries?.reduce((sum, e) => sum + e.credit, 0) || 0;
        return <span className="font-medium">{formatCurrency(totalCredit)}</span>;
      }
    },
    { key: "isPosted", label: "Status", render: (v: unknown) => (
      <span className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        v ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
      )}>
        {v ? 'Posted' : 'Draft'}
      </span>
    )},
    { key: "actions", label: "", align: "center" as const, render: (_: unknown, row: Journal) => (
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={() => handleViewDetail(row)} title="Lihat Detail">
          <Eye className="size-4" />
        </Button>
        {!row.isPosted && (
          <Button variant="ghost" size="sm" onClick={() => handlePost(row)} title="Posting">
            <FileText className="size-4 text-success" />
          </Button>
        )}
      </div>
    )},
  ];

  const totalDebit = journals.reduce((sum, j) => sum + (j.journalEntries?.reduce((s, e) => s + e.debit, 0) || 0), 0);
  const totalCredit = journals.reduce((sum, j) => sum + (j.journalEntries?.reduce((s, e) => s + e.credit, 0) || 0), 0);

  return (
    <PageWrapper>
      <PageTitle
        title="Daftar Jurnal"
        subtitle={`Total: ${total} jurnal | Debit: ${formatCurrency(totalDebit)} | Kredit: ${formatCurrency(totalCredit)}`}
        actions={
          <Button icon={Plus} href="/accounting/journals/new">
            Jurnal Baru
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
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchJournals} disabled={loading}>
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
                <label className="mb-1 block text-sm font-medium">Status</label>
                <select
                  value={isPostedFilter}
                  onChange={(e) => setIsPostedFilter(e.target.value)}
                  className="w-full rounded-lg border border-default bg-bg px-3 py-2 text-sm"
                >
                  <option value="">Semua</option>
                  <option value="posted">Posted</option>
                  <option value="unposted">Draft</option>
                </select>
              </div>
            </div>
            {(dateFrom || dateTo || isPostedFilter) && (
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
        data={journals}
        columns={columns}
        page={page}
        pageSize={20}
        totalItems={total}
        onPageChange={setPage}
        loading={loading}
        emptyMessage="Tidak ada data jurnal"
      />

      {/* Journal Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => { setShowDetailModal(false); setSelectedJournal(null); }}
        title={`Jurnal - ${selectedJournal?.code || ''}`}
        size="lg"
      >
        {detailLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : selectedJournal ? (
          <div className="space-y-4">
            <div className="rounded-lg bg-elevated/50 p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted">Tanggal</p>
                  <p className="font-medium">{formatDate(selectedJournal.date)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted">Status</p>
                  <span className={cn(
                    "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium mt-1",
                    selectedJournal.isPosted ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                  )}>
                    {selectedJournal.isPosted ? 'Posted' : 'Draft'}
                  </span>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted">Keterangan</p>
                  <p className="font-medium">{selectedJournal.description || '-'}</p>
                </div>
              </div>
            </div>

            {/* Journal Entries Table */}
            <div>
              <h4 className="mb-2 font-medium">Detail Jurnal</h4>
              <div className="rounded-lg border border-default overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-elevated">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-muted">Akun</th>
                      <th className="px-3 py-2 text-right font-medium text-muted">Debit</th>
                      <th className="px-3 py-2 text-right font-medium text-muted">Kredit</th>
                      <th className="px-3 py-2 text-left font-medium text-muted">Memo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-default">
                    {selectedJournal.journalEntries?.map((entry, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2">
                          <div className="font-medium">{entry.account?.name || `Akun #${entry.accountId}`}</div>
                          <div className="text-xs text-muted">{entry.account?.code || ''}</div>
                        </td>
                        <td className="px-3 py-2 text-right">
                          {entry.debit > 0 ? formatCurrency(entry.debit) : '-'}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {entry.credit > 0 ? formatCurrency(entry.credit) : '-'}
                        </td>
                        <td className="px-3 py-2 text-muted text-xs">
                          {entry.memo || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-elevated font-semibold">
                    <tr>
                      <td className="px-3 py-2">Total</td>
                      <td className="px-3 py-2 text-right">{formatCurrency(selectedJournal.journalEntries?.reduce((s, e) => s + e.debit, 0) || 0)}</td>
                      <td className="px-3 py-2 text-right">{formatCurrency(selectedJournal.journalEntries?.reduce((s, e) => s + e.credit, 0) || 0)}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setShowDetailModal(false); setSelectedJournal(null); }}>
                Tutup
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-muted">Tidak ada data</div>
        )}
      </Modal>
    </PageWrapper>
  );
}
