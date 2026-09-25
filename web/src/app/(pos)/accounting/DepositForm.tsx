"use client";

// Deposit Pelanggan (DPIN/DPOUT) and Deposit Supplier (DBIN/DBOUT) full-page form.
// Jenis: IN/OUT (sent as "type"; also encoded in the code prefix). Rows DPUSE/DBUSE are deposit usage created by
// sale/purchase payments paid with deposit (read-only here). Saving updates the deposit balance and posts the
// automatic journal (Pelanggan: Dr Kas / Cr Deposit; Supplier: Dr Deposit / Cr Kas; OUT reversed).

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { KInput, KNumber, KSelect } from "@/components/kform";
import { ConfirmDelete, DocActions, DocShell, KReadOnly, fmt, nowLocal, num, toLocalInput, useDocRoute, useList, type Row } from "@/components/kform/erp";
import { api } from "@/lib/api-client";
import { usePageTitle } from "@/lib/page-title";

export type DepositKind = "customer" | "supplier";
const CFG = {
  customer: { title: "Deposit Pelanggan", endpoint: "customer-deposit", party: "customer", partyField: "customerId", partyKey: "CustomerID", partyLabel: "Pelanggan", base: "/accounting/customer-deposits", cashLabel: "Masuk ke Akun Kas", defAcc: "Deposit Pelanggan", inCode: "DPIN", outCode: "DPOUT", useCode: "DPUSE", inLabel: "DPIN [Dana diterima dari Pelanggan]", outLabel: "DPOUT [Dana ditarik oleh Pelanggan]" },
  supplier: { title: "Deposit Supplier", endpoint: "supplier-deposit", party: "supplier", partyField: "supplierId", partyKey: "SupplierID", partyLabel: "Supplier", base: "/accounting/supplier-deposits", cashLabel: "Keluar dari Akun Kas", defAcc: "Dana Deposit Supplier", inCode: "DBIN", outCode: "DBOUT", useCode: "DBUSE", inLabel: "DBIN [Dana dikirim ke Supplier]", outLabel: "DBOUT [Dana ditarik dari Supplier]" },
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
  const [isUsage, setIsUsage] = useState(false);
  const [accTouched, setAccTouched] = useState(false);
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
  // Defaults from Setting Perkiraan (Kas Default + Deposit Pelanggan/Supplier).
  useEffect(() => {
    api.request<Record<string, number | null>>("GET", "account-setting").then((r) => {
      const d = r.data ?? {};
      const dep = kind === "customer" ? d.custDeposit : d.suppDeposit;
      if (d.cash) setCashAcc((v) => v || String(d.cash));
      if (dep) setDepAcc((v) => v || String(dep));
    }).catch(() => undefined);
  }, [kind]);

  useEffect(() => {
    if (!loadId) return;
    api.getOne<Row>(cfg.endpoint, loadId, {}).then((r) => {
      const d = r.data; if (!d) return setErr("Data tidak ditemukan");
      if (isEdit) { setCode(d.Code); setDate(toLocalInput(d.CreatedAt)); }
      const code = String(d.Code);
      setType(code.startsWith(cfg.outCode) || d.Type === "WITHDRAW" ? "OUT" : "IN");
      setIsUsage(code.startsWith(cfg.useCode) || d.Type === "USAGE");
      setPartyId(String(d[cfg.partyKey])); setAmount(String(num(d.Amount))); setNote(d.Description ?? "");
    }).catch(() => setErr("Data tidak ditemukan"));
  }, [loadId, cfg, isEdit]);

  useEffect(() => {
    if (!partyId) { setBalance(0); return; }
    api.request<{ balance: number }>("GET", `${cfg.endpoint}/balance/${partyId}`)
      .then((r) => setBalance(num(r.data?.balance)))
      .catch(() => setBalance(0));
  }, [partyId, cfg]);

  const save = async () => {
    setErr("");
    if (!partyId) return setErr(`${cfg.partyLabel} wajib dipilih`);
    if (num(amount) <= 0) return setErr("Jumlah harus lebih dari 0");
    if (isUsage) return setErr("Pemakaian deposit hanya dapat diubah dari menu Pembayaran");
    if (!isEdit && type === "OUT" && num(amount) > balance) return setErr("Jumlah penarikan melebihi saldo deposit");
    setSaving(true);
    try {
      const prefix = type === "IN" ? cfg.inCode : cfg.outCode;
      const body: Record<string, unknown> = {
        [cfg.partyField]: Number(partyId), amount: num(amount), description: note || undefined, type, date: new Date(date).toISOString(),
      };
      if (!isEdit || accTouched) {
        if (cashAcc) body.cashAccountId = Number(cashAcc);
        if (depAcc) body.depositAccountId = Number(depAcc);
      }
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
    <DocShell backHref={cfg.base} error={err} notice={isUsage ? "Transaksi ini adalah pemakaian deposit dari pembayaran dan hanya dapat diubah/dihapus dari menu Pembayaran." : isEdit ? "Akun kas & akun deposit hanya diubah bila Anda memilih ulang; bila tidak, akun pada jurnal sebelumnya dipakai." : undefined}>
      <div className="max-w-[640px]">
        <KReadOnly label="No Transaksi" value={isEdit ? code : "Auto"} />
        <KInput label="Tanggal" type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} />
        <KSelect label="Jenis Deposit" value={type} onChange={(v) => setType(v === "OUT" ? "OUT" : "IN")} placeholder="Pilih..." options={[{ value: "IN", label: cfg.inLabel }, { value: "OUT", label: cfg.outLabel }]} />
        <KSelect label={cfg.partyLabel} value={partyId} onChange={setPartyId} options={parties.map((p: Row) => ({ value: p.ID, label: `${p.Code ? p.Code + " - " : ""}${p.Name}` }))} />
        <KSelect label={cfg.cashLabel} value={cashAcc} onChange={(v) => { setCashAcc(v); setAccTouched(true); }} options={accOpts.filter((o) => o.t === "ASSET" || !o.t)} />
        <KReadOnly label="Jumlah Saldo" value={fmt(balance)} align="right" />
        <KSelect label="Kode Akun Deposit" value={depAcc} onChange={(v) => { setDepAcc(v); setAccTouched(true); }} options={accOpts} hint={`Default: ${cfg.defAcc}`} />
        <KNumber label="Jumlah" value={amount} onChange={setAmount} />
        <KInput label="Keterangan" value={note} onChange={(e) => setNote(e.target.value)} />
      </div>
      <DocActions onNew={() => router.push(`${cfg.base}/new`)} onSave={save} saving={saving} canDelete={isEdit && !isUsage} onDelete={() => setDel(true)} />
      <ConfirmDelete open={del} onClose={() => setDel(false)} onConfirm={remove} label={code || cfg.title} />
    </DocShell>
  );
}
