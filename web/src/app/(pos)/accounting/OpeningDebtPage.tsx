"use client";

// Saldo Awal Hutang (supplier) / Piutang (pelanggan): sisa transaksi per tanggal saldo awal.
// TODO backend: no endpoint yet - rows are kept in this browser (localStorage) per party.

import { useEffect, useMemo, useState } from "react";
import { KCard, KEditableGrid, KInfoBox, KSaveBar, KSelect } from "@/components/kform";
import { KReadOnly, fmt, num, useList, type Row } from "@/components/kform/erp";
import { PageWrapper } from "@/components/layout/PageWrapper";

interface R extends Record<string, unknown> { trxNo: string; date: string; dueDate: string; accountId: string; amount: string }

export default function OpeningDebtPage({ kind }: { kind: "payable" | "receivable" }) {
  const isPay = kind === "payable";
  const parties = useList(isPay ? "supplier" : "customer", { $take: 500 });
  const accounts = useList("account", { $take: 500, $orderBy: { Code: "asc" } });
  const [partyId, setPartyId] = useState("");
  const [rows, setRows] = useState<R[]>([]);
  const [saved, setSaved] = useState(false);
  const key = `ketoko_opening_${kind}_${partyId}`;
  useEffect(() => {
    if (!partyId) { setRows([]); return; }
    try { setRows(JSON.parse(localStorage.getItem(key) ?? "[]")); } catch { setRows([]); }
    setSaved(false);
  }, [key, partyId]);
  const partyOpts = useMemo(() => parties.map((p: Row) => ({ value: p.ID, label: p.Name })), [parties]);
  const accOpts = useMemo(() => accounts.map((a: Row) => ({ value: a.ID, label: `${a.Code} - ${a.Name}` })), [accounts]);
  const total = rows.reduce((s, r) => s + num(r.amount), 0);
  const save = () => { try { localStorage.setItem(key, JSON.stringify(rows)); setSaved(true); } catch { /* ignore */ } };
  return (
    <PageWrapper>
      <KCard>
        <KInfoBox title="Keterangan" items={[isPay ? "Isi sisa hutang ke supplier per tanggal saldo awal (sehari sebelum tanggal saldo awal)." : "Isi sisa piutang dari pelanggan per tanggal saldo awal (sehari sebelum tanggal saldo awal)."]} />
        <div className="max-w-[520px]"><KSelect label={isPay ? "Supplier" : "Pelanggan"} value={partyId} onChange={setPartyId} options={partyOpts} /></div>
        <KEditableGrid<R>
          columns={[
            { key: "trxNo", label: isPay ? "No Transaksi Pembelian" : "No Transaksi Penjualan" },
            { key: "date", label: "Tanggal", width: "150px" },
            { key: "dueDate", label: "Tanggal JT", width: "150px" },
            { key: "accountId", label: `Kode Akun ${isPay ? "Hutang" : "Piutang"}`, type: "select", options: accOpts },
            { key: "amount", label: "Jumlah", type: "number", width: "160px" },
          ]}
          rows={rows}
          onChange={(r) => { setRows(r); setSaved(false); }}
          newRow={() => ({ trxNo: "", date: new Date().toISOString().slice(0, 10), dueDate: new Date().toISOString().slice(0, 10), accountId: "", amount: "" })}
          addLabel="Tambah"
        />
        <div className="mt-3 max-w-[360px]"><KReadOnly label="Total" value={fmt(total)} align="right" /></div>
        <KSaveBar onSave={save} extra={saved ? <span className="text-sm text-[#2e7d32]">Tersimpan di browser ini (belum ada API).</span> : undefined} />
      </KCard>
    </PageWrapper>
  );
}
