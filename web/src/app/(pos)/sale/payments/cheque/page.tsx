"use client";

// Cheque/Giro Payment Status for Sales - Track and manage customer cheques

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react";
import { KCard, KRow, KSelect, KInput } from "@/components/kform";
import { DocActions, fmt, num, useList, type Row } from "@/components/kform/erp";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { chequePaymentApi, type ChequePayment } from "@/lib/business-logic-api";
import { cn } from "@/lib/utils";

type StatusFilter = "ALL" | "PENDING" | "CLEARED" | "BOUNCED" | "CANCELLED";

export default function SaleChequePage() {
  return <ChequePaymentPage type="SALE" />;
}

function ChequePaymentPage({ type }: { type: "SALE" | "PURCHASE" }) {
  const banks = useList("bank");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [bankFilter, setBankFilter] = useState("");
  const [search, setSearch] = useState("");
  const [cheques, setCheques] = useState<ChequePayment[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<ChequePayment | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState<"clear" | "bounce" | "cancel" | null>(null);
  const [actionDate, setActionDate] = useState("");
  const [actionReason, setActionReason] = useState("");
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const bankOpts = useMemo(() => [
    { value: "", label: "Semua Bank" },
    ...banks.map((b: Row) => ({ value: b.ID, label: `${b.Code} - ${b.Name}` })),
  ], [banks]);

  const statusOpts = [
    { value: "ALL", label: "Semua Status" },
    { value: "PENDING", label: "Menunggu" },
    { value: "CLEARED", label: "Lunas" },
    { value: "BOUNCED", label: "Bounced" },
    { value: "CANCELLED", label: "Batal" },
  ];

  const loadCheques = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { type };
      if (statusFilter !== "ALL") params.status = statusFilter;
      if (bankFilter) params.bankId = Number(bankFilter);
      if (search) params.search = search;
      const r = await chequePaymentApi.list(params);
      setCheques(r.data?.cheques || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [type, statusFilter, bankFilter, search]);

  useEffect(() => { void loadCheques(); }, [loadCheques]);

  const openAction = (cheque: ChequePayment, action: "clear" | "bounce" | "cancel") => {
    setSelected(cheque);
    setActionType(action);
    setActionDate("");
    setActionReason("");
    setShowModal(true);
  };

  const handleAction = async () => {
    if (!selected || !actionType) return;
    setProcessing(true);
    setMessage(null);
    try {
      if (actionType === "clear") {
        await chequePaymentApi.clear(selected.id, {
          clearedDate: actionDate || undefined,
        });
        setMessage({ type: "success", text: "Cek/BG berhasil dilunasi" });
      } else if (actionType === "bounce") {
        if (!actionReason) throw new Error("Alasan wajib diisi");
        await chequePaymentApi.bounce(selected.id, {
          reason: actionReason,
          bouncedDate: actionDate || undefined,
        });
        setMessage({ type: "success", text: "Cek/BG berhasil di-bounce" });
      } else if (actionType === "cancel") {
        if (!actionReason) throw new Error("Alasan wajib diisi");
        await chequePaymentApi.cancel(selected.id, actionReason);
        setMessage({ type: "success", text: "Cek/BG berhasil dibatalkan" });
      }
      setShowModal(false);
      await loadCheques();
    } catch (e: any) {
      setMessage({ type: "error", text: e.message || "Gagal memproses" });
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (cheque: ChequePayment) => {
    if (!confirm("Hapus cek/giro ini?")) return;
    try {
      await chequePaymentApi.delete(cheque.id);
      await loadCheques();
      setMessage({ type: "success", text: "Cek/BG berhasil dihapus" });
    } catch (e: any) {
      setMessage({ type: "error", text: e.message || "Gagal menghapus" });
    }
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-800",
      CLEARED: "bg-green-100 text-green-800",
      BOUNCED: "bg-red-100 text-red-800",
      CANCELLED: "bg-gray-100 text-gray-800",
    };
    const labels: Record<string, string> = {
      PENDING: "Menunggu",
      CLEARED: "Lunas",
      BOUNCED: "Bounced",
      CANCELLED: "Batal",
    };
    return (
      <span className={cn("rounded px-2 py-0.5 text-xs font-medium", styles[status] || "")}>
        {labels[status] || status}
      </span>
    );
  };

  const totalAmount = cheques.reduce((s, c) => s + c.amount, 0);
  const pendingCount = cheques.filter(c => c.status === "PENDING").length;
  const clearedCount = cheques.filter(c => c.status === "CLEARED").length;

  return (
    <PageWrapper>
      <KCard>
        {message && (
          <div className={cn("mb-4 rounded px-4 py-3 text-sm", message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700")}>
            {message.text}
          </div>
        )}

        {/* Filters */}
        <KRow cols={4} className="mb-4">
          <KSelect label="Status" value={statusFilter} onChange={(v) => setStatusFilter(v as StatusFilter)} options={statusOpts} />
          <KSelect label="Bank" value={bankFilter} onChange={setBankFilter} options={bankOpts} />
          <KInput label="Cari" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="No. Cek/BG, Kode..." />
          <div className="flex items-end pb-3 gap-2">
            <button type="button" onClick={() => void loadCheques()} disabled={loading}
              className="inline-flex h-10 items-center gap-2 rounded bg-[#4caf50] px-4 text-white hover:bg-[#43a047] disabled:opacity-60">
              <RefreshCw className={cn("size-4", loading && "animate-spin")} />
              Refresh
            </button>
          </div>
        </KRow>

        {/* Summary */}
        <div className="mb-4 flex gap-4 text-sm">
          <div className="rounded bg-blue-50 px-3 py-2">
            <span className="text-gray-600">Total: </span>
            <span className="font-semibold">{fmt(totalAmount)}</span>
          </div>
          <div className="rounded bg-yellow-50 px-3 py-2">
            <span className="text-gray-600">Menunggu: </span>
            <span className="font-semibold">{pendingCount}</span>
          </div>
          <div className="rounded bg-green-50 px-3 py-2">
            <span className="text-gray-600">Lunas: </span>
            <span className="font-semibold">{clearedCount}</span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-[#c9d0d8]">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[#c9d0d8] bg-[#f5f6f8]">
                <th className="px-3 py-2 text-left font-medium">No.</th>
                <th className="px-3 py-2 text-left font-medium">Kode</th>
                <th className="px-3 py-2 text-left font-medium">No. Cek/BG</th>
                <th className="px-3 py-2 text-left font-medium">Bank</th>
                <th className="px-3 py-2 text-right font-medium">Jumlah</th>
                <th className="px-3 py-2 text-left font-medium">Tgl Cek</th>
                <th className="px-3 py-2 text-left font-medium">Jatuh Tempo</th>
                <th className="px-3 py-2 text-center font-medium">Status</th>
                <th className="px-3 py-2 text-center font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {cheques.length === 0 && (
                <tr>
                  <td colSpan={9} className="h-40 text-center text-[#9aa3ad]">
                    {loading ? "Memuat..." : "Tidak ada data"}
                  </td>
                </tr>
              )}
              {cheques.map((c, i) => (
                <tr key={c.id} className="border-b border-[#eceff2] hover:bg-gray-50">
                  <td className="px-3 py-2">{i + 1}</td>
                  <td className="px-3 py-2 font-mono text-xs">{c.code}</td>
                  <td className="px-3 py-2">{c.chequeNumber}</td>
                  <td className="px-3 py-2">{c.bank?.name || "-"}</td>
                  <td className="px-3 py-2 text-right">{fmt(c.amount)}</td>
                  <td className="px-3 py-2">{new Date(c.chequeDate).toLocaleDateString("id-ID")}</td>
                  <td className="px-3 py-2">{c.dueDate ? new Date(c.dueDate).toLocaleDateString("id-ID") : "-"}</td>
                  <td className="px-3 py-2 text-center">{statusBadge(c.status)}</td>
                  <td className="px-3 py-2 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {c.status === "PENDING" && (
                        <>
                          <button type="button" onClick={() => openAction(c, "clear")}
                            className="rounded p-1 text-green-600 hover:bg-green-50" title="Lunas">
                            <CheckCircle className="size-4" />
                          </button>
                          <button type="button" onClick={() => openAction(c, "bounce")}
                            className="rounded p-1 text-red-600 hover:bg-red-50" title="Bounce">
                            <XCircle className="size-4" />
                          </button>
                          <button type="button" onClick={() => openAction(c, "cancel")}
                            className="rounded p-1 text-gray-600 hover:bg-gray-100" title="Batal">
                            <AlertCircle className="size-4" />
                          </button>
                        </>
                      )}
                      <button type="button" onClick={() => handleDelete(c)}
                        className="rounded p-1 text-red-400 hover:bg-red-50 hover:text-red-600" title="Hapus"
                        disabled={c.status !== "PENDING"}>
                        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </KCard>

      {/* Action Modal */}
      {showModal && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h3 className="mb-4 text-lg font-semibold">
              {actionType === "clear" ? "Konfirmasi Lunas" : actionType === "bounce" ? "Bounce Cek/BG" : "Batalkan Cek/BG"}
            </h3>
            <div className="mb-4 space-y-4">
              <div className="rounded bg-gray-50 p-3 text-sm">
                <div><span className="text-gray-500">Kode:</span> {selected.code}</div>
                <div><span className="text-gray-500">No. Cek/BG:</span> {selected.chequeNumber}</div>
                <div><span className="text-gray-500">Jumlah:</span> {fmt(selected.amount)}</div>
              </div>
              <div><label className="mb-1 block text-sm font-medium text-gray-700">Tanggal</label><input type="date" className="h-9 w-full rounded border border-[#cfd4da] px-3" value={actionDate} onChange={(e) => setActionDate(e.target.value)} /></div>
              {(actionType === "bounce" || actionType === "cancel") && (
                <KInput label="Alasan" value={actionReason} onChange={(e) => setActionReason(e.target.value)}
                  placeholder="Masukkan alasan..." />
              )}
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowModal(false)}
                className="rounded border border-gray-300 px-4 py-2 hover:bg-gray-50">
                Batal
              </button>
              <button type="button" onClick={() => void handleAction()} disabled={processing}
                className="rounded bg-[#4caf50] px-4 py-2 text-white hover:bg-[#43a047] disabled:opacity-60">
                {processing ? "Memproses..." : "Konfirmasi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
