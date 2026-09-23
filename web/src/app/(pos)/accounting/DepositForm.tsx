"use client";

// Deposit Pelanggan (DPIN/DPOUT) and Deposit Supplier (DBIN/DBOUT) full-page form.
// Jenis deposit is encoded in the transaction code prefix (API has no type field).

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { KInput, KNumber, KSelect } from "@/components/kform";
import { ConfirmDelete, DocActions, DocShell, KReadOnly, fmt, nowLocal, num, toLocalInput, useDocRoute, useList, type Row } from "@/components/kform/erp";
import { api } from "@/lib/api-client";
import { usePageTitle } from "@/lib/page-title";

export type DepositKind = "customer" | "supplier";
const CFG = {
  customer: { title: "Deposit Pelanggan", endpoint: "customer-deposit", party: "customer", partyField: "customerId", partyKey: "CustomerID", partyLabel: "Pelanggan", base: "/accounting/customer-deposits", cashLabel: "Masuk ke Akun Kas", defAcc: "Deposit Pelanggan", inCode: "DPIN", outCode: "DPOUT", inLabel: "DPIN [Dana diterima dari Pelanggan]", outLabel: "DPOUT [Dana ditarik oleh Pelanggan]" },
  supplier: { title: "Deposit Supplier", endpoint: "supplier-deposit", party: "supplier", partyField: "supplierId", partyKey: "SupplierID", partyLabel: "Supplier", base: "/accounting/supplier-deposits", cashLabel: "Keluar dari Akun Kas", defAcc: "Dana Deposit Supplier", inCode: "DBIN", outCode: "DBOUT", inLabel: "DBIN [Dana dikirim ke Supplier]", outLabel: "DBOUT [Dana ditarik dari Supplier]" },
} as const;

export default function DepositForm({ kind }: { kind: DepositKind }) {
  const cfg = CFG[kind];
  const router = useRouter();
  const { id, copyId } = useDocRoute();
  const loadId = id ?? copyId;
  const isEdit = !!id;
  usePageTitle(isEdit ? `Ubah ${cfg.title}` : `${cfg.title} Baru`);

  const parties = useList(cfg.party, { $take: 500 });
  const accounts = useList("account", { $take: 500, $include: "Type", $orderBy: { Code: "asc" } });
  const [code, setCode] = useState("");
  const [date, setDate] = useState(nowLocal());
  const [type, setType] = useState<"IN" | "OUT">("IN");
  const [partyId, setPartyId] = useState("");
  const [cashAcc, setCashAcc] = useState("");
  const [depAcc, setDepAcc] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [balance, setBalance] = useState(0);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [del, setDel] = useState(false);

  const accOpts = useMemo(() => accounts.map((a: Row) => ({ value: a.ID, label: `${a.Code} - ${a.Name}`, t: a.Type?.Code as string | undefined })), [accounts]);
  useEffect(() => {
    if (!depAcc && accounts.length) { const m = accounts.find((a: Row) => String(a.Name).toLowerCase().includes("deposit")); if (m) setDepAcc(String(m.ID)); }
  }, [accounts, depAcc]);

  useEffect(() => {
    if (!loadId) return;
    api.getOne<Row>(cfg.endpoint, loadId, {}).then((r) => {
      const d = r.data; if (!d) return setErr("Data tidak ditemukan");
      if (isEdit) { setCode(d.Code); setDate(toLocalInput(d.CreatedAt)); }
      setType(String(d.Code).startsWith(cfg.outCode) ? "OUT" : "IN");
      setPartyId(String(d[cfg.partyKey])); setAmount(String(num(d.Amount))); setNote(d.Description ?? "");
    }).catch(() => setErr("Data tidak ditemukan"));
  }, [loadId, cfg, isEdit]);

  useEffect(() => {
    if (!partyId) { setBalance(0); return; }
    api.get<Row[]>(cfg.endpoint, { $where: { [cfg.partyKey]: Number(partyId) }, $take: 1000 }, { skipCache: true }).then((r) => {
      setBalance((r.data ?? []).reduce((s, d) => s + (String(d.Code).startsWith(cfg.outCode) ? -num(d.Amount) : num(d.Amount)), 0));
    }).catch(() => setBalance(0));
  }, [partyId, cfg]);

  const save = async () => {
    setErr("");
    if (!partyId) return setErr(`${cfg.partyLabel} wajib dipilih`);
    if (num(amount) <= 0) return setErr("Jumlah harus lebih dari 0");
    if (type === "OUT" && num(amount) > balance) return setErr("Jumlah penarikan melebihi saldo deposit");
    setSaving(true);
    try {
      const prefix = type === "IN" ? cfg.inCode : cfg.outCode;
      const body = { [cfg.partyField]: Number(partyId), amount: num(amount), description: note || undefined };
      const res = isEdit
        ? await api.patch(cfg.endpoint, id!, { ...body, code: code.replace(/^[A-Z]+-/, `${prefix}-`) })
        : await api.post(cfg.endpoint, { code: `${prefix}-${new Date().toISOString().replace(/\D/g, "").slice(0, 14)}`, ...body });
      if (res.success) router.push(cfg.base); else setErr(res.message || "Gagal menyimpan");
    } catch (e) { setErr((e as Error).message || "Gagal menyimpan"); } finally { setSaving(false); }
  };
  const remove = async () => {
    try { const r = await api.delete(cfg.endpoint, id!); if (r.success === false) { setErr(r.message || "Gagal menghapus"); setDel(false); } else router.push(cfg.base); }
    catch (e) { setErr((e as Error).message); setDel(false); }
  };

  return (
    <DocShell backHref={cfg.base} error={err} notice="API menyimpan Pelanggan/Supplier, Jumlah dan Keterangan (jenis deposit disimpan sebagai awalan No Transaksi). Tanggal, akun kas dan kode akun deposit belum disimpan di backend.">
      <div className="max-w-[640px]">
        <KReadOnly label="No Transaksi" value={isEdit ? code : "Auto"} />
        <KInput label="Tanggal" type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} />
        <KSelect label="Jenis Deposit" value={type} onChange={(v) => setType(v === "OUT" ? "OUT" : "IN")} placeholder="Pilih..." options={[{ value: "IN", label: cfg.inLabel }, { value: "OUT", label: cfg.outLabel }]} />
        <KSelect label={cfg.partyLabel} value={partyId} onChange={setPartyId} options={parties.map((p: Row) => ({ value: p.ID, label: `${p.Code ? p.Code + " - " : ""}${p.Name}` }))} />
        <KSelect label={cfg.cashLabel} value={cashAcc} onChange={setCashAcc} options={accOpts.filter((o) => o.t === "ASSET" || !o.t)} />
        <KReadOnly label="Jumlah Saldo" value={fmt(balance)} align="right" />
        <KSelect label="Kode Akun Deposit" value={depAcc} onChange={setDepAcc} options={accOpts} hint={`Default: ${cfg.defAcc}`} />
        <KNumber label="Jumlah" value={amount} onChange={setAmount} />
        <KInput label="Keterangan" value={note} onChange={(e) => setNote(e.target.value)} />
      </div>
      <DocActions onNew={() => router.push(`${cfg.base}/new`)} onSave={save} saving={saving} canDelete={isEdit} onDelete={() => setDel(true)} />
      <ConfirmDelete open={del} onClose={() => setDel(false)} onConfirm={remove} label={code || cfg.title} />
    </DocShell>
  );
}
