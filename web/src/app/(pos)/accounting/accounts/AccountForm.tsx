"use client";

// Tambah / Ubah Perkiraan (Chart of Accounts): Tipe Header/Detail, Kelompok, Posisi, Induk, Kode, Nama, Kas Bank.

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { KCheckbox, KInput, KRadioGroup, KRow, KSelect, KToggle } from "@/components/kform";
import { ConfirmDelete, DocActions, DocShell, KReadOnly, useDocRoute, useList, type Row } from "@/components/kform/erp";
import { api } from "@/lib/api-client";
import { usePageTitle } from "@/lib/page-title";
import { ACCOUNT_GROUPS, groupOf } from "./groups";

const POSISI: Record<string, string[]> = {
  AKTIVA: ["KAS & BANK", "PIUTANG", "PERSEDIAAN", "PAJAK DIBAYAR DIMUKA", "AKTIVA TETAP", "AKTIVA LAINNYA"],
  KEWAJIBAN: ["HUTANG DAGANG", "HUTANG PAJAK", "HUTANG LAINNYA", "DEPOSIT"],
  MODAL: ["MODAL", "LABA DITAHAN", "LABA TAHUN BERJALAN"],
  PENDAPATAN: ["PENDAPATAN USAHA", "POTONGAN PENJUALAN"],
  HPP: ["HARGA POKOK PENJUALAN"],
  BIAYA: ["BIAYA OPERASIONAL", "BIAYA UMUM"],
  "PENDAPATAN LAIN": ["PENDAPATAN LAIN-LAIN"],
  "BIAYA LAIN": ["BIAYA LAIN-LAIN"],
};

export default function AccountForm() {
  const router = useRouter();
  const { id, copyId } = useDocRoute();
  const loadId = id ?? copyId;
  const isEdit = !!id;
  usePageTitle(isEdit ? "Ubah Perkiraan" : "Tambah Perkiraan");

  const accounts = useList("account", { $take: 1000, $orderBy: { Code: "asc" } });
  const [kind, setKind] = useState("D");
  const [group, setGroup] = useState("AKTIVA");
  const [posisi, setPosisi] = useState("");
  const [parentId, setParentId] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [cashBank, setCashBank] = useState(false);
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [del, setDel] = useState(false);

  const g = ACCOUNT_GROUPS.find((x) => x.key === group)!;

  useEffect(() => {
    if (!loadId) return;
    api.getOne<Row>("account", loadId, { $include: "Type,Children" }).then((r) => {
      const d = r.data; if (!d) return setErr("Data tidak ditemukan");
      setGroup(groupOf(d)); setName(d.Name); setParentId(d.ParentID ? String(d.ParentID) : ""); setActive(d.IsActive !== false);
      setCode(isEdit ? d.Code : ""); setKind((d.Children?.length ?? 0) > 0 ? "H" : "D");
    }).catch(() => setErr("Data tidak ditemukan"));
  }, [loadId, isEdit]);

  useEffect(() => { if (!isEdit && !code) setCode(`${g.prefix}-`); }, [g.prefix, isEdit, code]);

  const parentOpts = useMemo(() => accounts.filter((a: Row) => String(a.ID) !== id).map((a: Row) => ({ value: a.ID, label: `${a.Code} - ${a.Name}` })), [accounts, id]);

  const save = async () => {
    setErr("");
    if (!code.trim() || code.trim() === `${g.prefix}-`) return setErr("Kode Perkiraan wajib diisi");
    if (!name.trim()) return setErr("Nama Perkiraan wajib diisi");
    setSaving(true);
    try {
      const body = { Code: code.trim(), Name: name.trim(), TypeID: g.typeId, ParentID: parentId ? Number(parentId) : undefined, IsActive: active };
      const res = isEdit ? await api.patch("account", id!, body) : await api.post("account", body);
      if (res.success) router.push("/accounting/accounts"); else setErr(res.message || "Gagal menyimpan");
    } catch (e) { setErr((e as Error).message || "Gagal menyimpan"); } finally { setSaving(false); }
  };
  const remove = async () => {
    try { const r = await api.delete("account", id!); if (r.success === false) { setErr(r.message || "Gagal menghapus"); setDel(false); } else router.push("/accounting/accounts"); }
    catch (e) { setErr((e as Error).message); setDel(false); }
  };

  return (
    <DocShell backHref="/accounting/accounts" error={err} notice="Tersimpan di API: Kode, Nama, Kelompok, Induk, Aktif. Tipe Header/Detail, Posisi dan Kas/Bank belum disimpan di backend. Beberapa akun sistem tidak dapat dihapus.">
      <div className="max-w-[640px]">
        <KRadioGroup label="Tipe" value={kind} onChange={setKind} options={[{ value: "H", label: "Header Perkiraan ( tidak dapat diposting )" }, { value: "D", label: "Detail Perkiraan ( dapat diposting )" }]} />
        <KSelect label="Kelompok" value={group} onChange={(v) => { setGroup(v || "AKTIVA"); setPosisi(""); if (!isEdit) setCode(""); }} placeholder="Pilih..." options={ACCOUNT_GROUPS.map((x) => ({ value: x.key, label: x.key }))} />
        <KSelect label="Posisi" value={posisi} onChange={setPosisi} options={(POSISI[group] ?? []).map((p) => ({ value: p, label: p }))} />
        <KSelect label="Induk Perkiraan" value={parentId} onChange={setParentId} options={parentOpts} placeholder="(Tanpa induk)" />
        <KRow cols={2}>
          <KReadOnly label="Perkiraan" value={g.prefix} />
          <KInput label="Kode" value={code} onChange={(e) => setCode(e.target.value)} />
        </KRow>
        <KInput label="Nama" value={name} onChange={(e) => setName(e.target.value)} />
        <KReadOnly label="Saldo Normal" value={g.debitNormal ? "Debet" : "Kredit"} />
        <KCheckbox label="Kas Bank" checked={cashBank} onChange={setCashBank} />
        <div className="mb-3"><KToggle label="Aktif" checked={active} onChange={setActive} /></div>
      </div>
      <DocActions hideNew onSave={save} saving={saving} canDelete={isEdit} onDelete={() => setDel(true)} />
      <ConfirmDelete open={del} onClose={() => setDel(false)} onConfirm={remove} label={name || "perkiraan"} />
    </DocShell>
  );
}
