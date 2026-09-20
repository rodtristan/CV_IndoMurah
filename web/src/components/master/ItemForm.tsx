"use client";

// Ketoko "Item Baru" / "Edit Item" full-page form (9 tabs). Used by
// /master/items/new and /master/items/[id]. Fields the API does not support yet are
// kept in component state so the UI is complete (see buildPayload for what is sent).

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import {
  KTabs, KField, KInput, KNumber, KCode, KTextarea, KSelect, KRadioGroup, KCheckbox, KToggle,
  KInfoBox, KRichText, KImageList, KEditableGrid, KShareLink, KSaveBar, KCard, KRow,
  type KOption, type KGridColumn,
} from "@/components/kform";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { usePageTitle } from "@/lib/page-title";
import { api, odata } from "@/lib/api-client";
import type { Product, Category, Brand, Unit, Warehouse, Account } from "@/lib/types";

// ─── Types ─────────────────────────────────────────────────────────────

type UnitRow = {
  unitId: string; konversi: string; barcode: string; poin: string; komisi: string; pokok: string; jual: string;
  hj1: string; hj2: string; hj3: string; hj4: string;
  jml1: string; jml2: string; jml3: string; jml4: string;
  h1: string; h2: string; h3: string; h4: string;
};
type DiscountRow = { group: string; p1: string; p2: string; p3: string; p4: string };

interface FormState {
  tipe: string; serial: boolean; code: string; name: string; categoryId: string; subCategoryId: string;
  brandId: string; rak: string; statusJual: string; minimumStock: string; supplierId: string;
  warehouseId: string; description: string; isActive: boolean;
  priceType: string; unitId: string; barcode: string; sku: string; pokok: string; proc: string; jual: string;
  poin: string; komisi: string;
  unitRows: UnitRow[];
  berat: string; panjang: string; lebar: string; tinggi: string;
  discounts: DiscountRow[];
  acc: Record<string, string>;
  images: string[];
  shareEnabled: boolean; youtubeId: string; kondisi: string; stokShare: string; subKeterangan: string;
  taxType: string; taxInclude: string; taxRef: string; taxOption: string;
}

const emptyUnitRow = (): UnitRow => ({
  unitId: "", konversi: "1", barcode: "", poin: "0", komisi: "0", pokok: "0", jual: "0",
  hj1: "0", hj2: "0", hj3: "0", hj4: "0", jml1: "0", jml2: "0", jml3: "0", jml4: "0", h1: "0", h2: "0", h3: "0", h4: "0",
});
const emptyDiscountRow = (): DiscountRow => ({ group: "", p1: "0", p2: "0", p3: "0", p4: "0" });

const initialForm = (): FormState => ({
  tipe: "barang", serial: false, code: "", name: "", categoryId: "", subCategoryId: "", brandId: "", rak: "",
  statusJual: "dijual", minimumStock: "0", supplierId: "", warehouseId: "", description: "", isActive: true,
  priceType: "satu", unitId: "", barcode: "", sku: "", pokok: "0", proc: "0", jual: "0", poin: "0", komisi: "0",
  unitRows: [emptyUnitRow()],
  berat: "0", panjang: "0", lebar: "0", tinggi: "0",
  discounts: [],
  acc: {},
  images: [],
  shareEnabled: false, youtubeId: "", kondisi: "baru", stokShare: "", subKeterangan: "",
  taxType: "", taxInclude: "0", taxRef: "", taxOption: "",
});

const TABS = [
  { key: "umum", label: "Data Umum" },
  { key: "harga", label: "Satuan dan Harga" },
  { key: "dimensi", label: "Dimensi Barang" },
  { key: "potongan", label: "Potongan Harga Jual" },
  { key: "akuntansi", label: "Akuntansi" },
  { key: "gambar", label: "Gambar" },
  { key: "share", label: "Share Item" },
  { key: "marketplace", label: "Synchronize Marketplace" },
  { key: "pajak", label: "Data Pendukung Pajak" },
];

const TIPE_OPTIONS = [
  { value: "barang", label: "Barang" }, { value: "jasa", label: "Jasa" },
  { value: "rakitan_proses", label: "Rakitan Proses" }, { value: "rakitan_non", label: "Rakitan Non Proses" },
  { value: "non_inventory", label: "Non Inventory" }, { value: "biaya", label: "Biaya" }, { value: "varian", label: "Varian" },
];

// Customer groups (no list endpoint yet) — same seeded set used by /master/customers.
const GROUP_OPTIONS: KOption[] = [
  { value: "1", label: "GENERAL - Umum" }, { value: "2", label: "RETAIL - Retail" },
  { value: "3", label: "WHOLESALE - Grosir" }, { value: "4", label: "VIP - VIP" },
];

const ACCOUNT_FIELDS: { key: string; label: string; match: RegExp }[] = [
  { key: "hpp", label: "Harga Pokok Penjualan", match: /harga pokok|hpp|cogs/i },
  { key: "pendJual", label: "Pendapatan Jual", match: /pendapatan.*(jual|penjualan)|penjualan|sales/i },
  { key: "pendJasa", label: "Pendapatan Jasa", match: /pendapatan.*jasa|jasa/i },
  { key: "persediaan", label: "Persediaan", match: /^persediaan|inventory/i },
  { key: "biayaNonInv", label: "Biaya Non Inventory", match: /non inventory|perlengkapan|biaya/i },
  { key: "persLain", label: "Persediaan Lainnya", match: /persediaan lain/i },
  { key: "tenaga", label: "Biaya Tenaga Kerja", match: /tenaga kerja|gaji/i },
  { key: "overhead", label: "Biaya Overhead", match: /overhead/i },
];
const ACCOUNTS_BY_TIPE: Record<string, string[]> = {
  barang: ["hpp", "pendJual", "persediaan"],
  varian: ["hpp", "pendJual", "persediaan"],
  jasa: ["pendJasa"],
  non_inventory: ["biayaNonInv"],
  biaya: ["biayaNonInv"],
  rakitan_proses: ["hpp", "pendJual", "persediaan", "persLain", "tenaga", "overhead"],
  rakitan_non: ["hpp", "pendJual", "persediaan"],
};

const num = (v: string | number | null | undefined) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};
const round2 = (n: number) => String(Math.round(n * 100) / 100);

function list<T>(res: { data?: unknown }): T[] {
  const d = res.data as unknown;
  if (Array.isArray(d)) return d as T[];
  const inner = (d as { data?: unknown } | undefined)?.data;
  return Array.isArray(inner) ? (inner as T[]) : [];
}

// ─── Component ─────────────────────────────────────────────────────────

export function ItemForm({ id, copyFrom, justSaved }: { id?: string; copyFrom?: string; justSaved?: boolean }) {
  const router = useRouter();
  const isNew = !id;
  const [tab, setTab] = useState("umum");
  const [f, setF] = useState<FormState>(initialForm);
  const [loaded, setLoaded] = useState(isNew && !copyFrom);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(justSaved ? "Data item berhasil disimpan." : "");
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<{ name?: string; unit?: string }>({});
  const [itemName, setItemName] = useState("");

  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [suppliers, setSuppliers] = useState<{ ID: number; Name: string }[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);

  usePageTitle(isNew ? "Item Baru" : itemName ? itemName : "Edit Item");

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setF((p) => ({ ...p, [k]: v }));

  // Lookups
  useEffect(() => {
    let alive = true;
    (async () => {
      const safe = <T,>(p: Promise<{ data?: unknown }>) => p.then((r) => list<T>(r)).catch(() => [] as T[]);
      const [c, b, u, w, s, a] = await Promise.all([
        safe<Category>(api.get("categories", odata().take(200).toParams())),
        safe<Brand>(api.get("brand", odata().take(200).toParams())),
        safe<Unit>(api.get("unit", odata().take(200).toParams())),
        safe<Warehouse>(api.get("warehouse", odata().take(200).toParams())),
        safe<{ ID: number; Name: string }>(api.get("supplier", odata().take(200).toParams())),
        safe<Account>(api.get("account", odata().take(500).toParams())),
      ]);
      if (!alive) return;
      setCategories(c); setBrands(b); setUnits(u); setWarehouses(w); setSuppliers(s); setAccounts(a);
    })();
    return () => { alive = false; };
  }, []);

  // Load existing product (edit / copy)
  const sourceId = id ?? copyFrom;
  useEffect(() => {
    if (!sourceId) return;
    let alive = true;
    (async () => {
      try {
        const res = await api.get<Product>(`products/${sourceId}`, undefined, { skipCache: true });
        const p = res.data;
        if (!alive) return;
        if (!res.success || !p) { setLoadError("Item tidak ditemukan."); return; }
        setItemName(p.Name);
        setF((prev) => ({
          ...prev,
          code: id ? p.Code : "",
          name: p.Name,
          barcode: p.Barcode || "",
          categoryId: p.CategoryID ? String(p.CategoryID) : "",
          brandId: p.BrandID ? String(p.BrandID) : "",
          unitId: p.UnitID ? String(p.UnitID) : "",
          warehouseId: p.WarehouseID ? String(p.WarehouseID) : "",
          pokok: String(p.PurchasePrice ?? 0),
          jual: String(p.SellingPrice ?? 0),
          proc: num(p.PurchasePrice) > 0 ? round2((num(p.SellingPrice) / num(p.PurchasePrice) - 1) * 100) : "0",
          minimumStock: String(p.MinimumStock ?? 0),
          description: p.Description || "",
          isActive: p.IsActive,
        }));
        setLoaded(true);
      } catch {
        if (alive) setLoadError("Gagal memuat data item.");
      }
    })();
    return () => { alive = false; };
  }, [sourceId, id]);

  // Default accounts once accounts are known (only fill empty ones)
  useEffect(() => {
    if (accounts.length === 0) return;
    setF((p) => {
      const acc = { ...p.acc };
      for (const af of ACCOUNT_FIELDS) {
        if (acc[af.key]) continue;
        const hit = accounts.find((a) => af.match.test(a.Name));
        if (hit) acc[af.key] = String(hit.ID);
      }
      return { ...p, acc };
    });
  }, [accounts]);

  const unitOptions: KOption[] = useMemo(
    () => units.map((u) => ({ value: String(u.ID), label: `${u.Name} (${u.Abbreviation || u.Code})` })), [units]);
  const accountOptions: KOption[] = useMemo(
    () => accounts.map((a) => ({ value: String(a.ID), label: `${a.Code} - ${a.Name}` })), [accounts]);
  const opts = <T extends { ID: number; Name: string }>(l: T[]): KOption[] => l.map((x) => ({ value: String(x.ID), label: x.Name }));

  // ─── Price helpers ──
  const setPokok = (v: string) => setF((p) => ({ ...p, pokok: v, jual: round2(num(v) * (1 + num(p.proc) / 100)) }));
  const setProc = (v: string) => setF((p) => ({ ...p, proc: v, jual: round2(num(p.pokok) * (1 + num(v) / 100)) }));
  const setJual = (v: string) => setF((p) => ({ ...p, jual: v, proc: num(p.pokok) > 0 ? round2((num(v) / num(p.pokok) - 1) * 100) : p.proc }));

  const setUnitRows = (rows: UnitRow[]) => {
    // first row is always the base unit (konversi = 1)
    set("unitRows", rows.map((r, i) => (i === 0 ? { ...r, konversi: "1" } : r)));
  };

  const unitCols: KGridColumn<UnitRow>[] = useMemo(() => {
    const base: KGridColumn<UnitRow> = { key: "unitId", label: "Satuan", type: "select", options: unitOptions, width: "180px" };
    const konv: KGridColumn<UnitRow> = { key: "konversi", label: "Jml Konversi", type: "number", width: "110px" };
    const barcode: KGridColumn<UnitRow> = { key: "barcode", label: "Barcode", type: "text", width: "140px" };
    const poin: KGridColumn<UnitRow> = { key: "poin", label: "Point", type: "number", width: "80px" };
    const komisi: KGridColumn<UnitRow> = { key: "komisi", label: "Komisi Sales", type: "number", width: "110px" };
    const pokok: KGridColumn<UnitRow> = { key: "pokok", label: "Harga Pokok", type: "number", width: "120px" };
    const n = (key: keyof UnitRow & string, label: string): KGridColumn<UnitRow> => ({ key, label, type: "number", width: "110px" });
    if (f.priceType === "level") return [base, konv, poin, barcode, pokok, n("hj1", "HJ Level 1"), n("hj2", "HJ Level 2"), n("hj3", "HJ Level 3"), n("hj4", "HJ Level 4"), komisi];
    if (f.priceType === "jumlah") return [base, konv, poin, barcode, pokok, n("jml1", "Jumlah 1"), n("jml2", "Jumlah 2"), n("jml3", "Jumlah 3"), n("jml4", "Jumlah 4"), n("h1", "Harga 1"), n("h2", "Harga 2"), n("h3", "Harga 3"), n("h4", "Harga 4"), komisi];
    return [base, konv, barcode, poin, komisi, pokok, n("jual", "Harga Jual")];
  }, [f.priceType, unitOptions]);

  // ─── Derived persisted values ──
  const persisted = () => {
    if (f.priceType === "satu") {
      return { unitId: num(f.unitId), barcode: f.barcode, purchasePrice: num(f.pokok), sellingPrice: num(f.jual) };
    }
    const r = f.unitRows[0] ?? emptyUnitRow();
    const sell = f.priceType === "level" ? r.hj1 : f.priceType === "jumlah" ? r.h1 : r.jual;
    return { unitId: num(r.unitId), barcode: r.barcode, purchasePrice: num(r.pokok), sellingPrice: num(sell) };
  };

  // `skip` bumps the sequence so a retry avoids codes still held by soft-deleted rows.
  const generateCode = async (skip = 0): Promise<string> => {
    try {
      const res = await api.get<Product[]>(
        "products", odata().select(["code"]).orderByMulti({ createdAt: "desc" }).take(100).toParams(), { skipCache: true });
      let max = 0;
      for (const p of list<Product & { code?: string }>(res)) {
        const m = /^P(\d{6})$/.exec(String(p.Code ?? p.code ?? ""));
        if (m) max = Math.max(max, Number(m[1]));
      }
      return `P${String(max + 1 + skip).padStart(6, "0")}`;
    } catch {
      return `P${String(Date.now()).slice(-6)}`;
    }
  };

  const validate = () => {
    const e: { name?: string; unit?: string } = {};
    if (!f.name.trim()) e.name = "Nama Item harus diisi.";
    if (!persisted().unitId) e.unit = "Satuan harus dipilih.";
    setErrors(e);
    if (e.name) setTab("umum");
    else if (e.unit) setTab("harga");
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    setNotice(""); setError("");
    if (!validate()) return;
    setSaving(true);
    try {
      const pv = persisted();
      // Only fields accepted by CreateProductDto/UpdateProductDto (whitelist validation).
      const payload = {
        code: f.code.trim(),
        barcode: pv.barcode || null,
        name: f.name.trim(),
        categoryId: f.categoryId ? Number(f.categoryId) : null,
        brandId: f.brandId ? Number(f.brandId) : null,
        unitId: pv.unitId,
        warehouseId: f.warehouseId ? Number(f.warehouseId) : null,
        purchasePrice: pv.purchasePrice,
        sellingPrice: pv.sellingPrice,
        minimumStock: num(f.minimumStock),
        description: f.description || null,
        isActive: f.isActive,
      };
      if (id) {
        const res = await api.patch<Product>("products", id, payload);
        if (!res.success) throw new Error(res.message || "Gagal menyimpan item.");
        setItemName(payload.name);
        setNotice("Data item berhasil disimpan.");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        let res: Awaited<ReturnType<typeof api.post<Product & { id?: number }>>> | undefined;
        for (let attempt = 0; attempt < 5; attempt++) {
          const code = payload.code || (await generateCode(attempt));
          try {
            res = await api.post<Product & { id?: number }>("products", { ...payload, code, stock: 0 });
            break;
          } catch (err) {
            // Auto-generated code may collide with a soft-deleted item (unique Code) -> try the next number.
            const msg = err instanceof Error ? err.message : "";
            if (payload.code || attempt === 4 || /must be|should not|invalid/i.test(msg)) throw err;
          }
        }
        if (!res?.success) throw new Error(res?.message || "Gagal menyimpan item.");
        const newId = res.data?.ID ?? res.data?.id;
        router.replace(newId ? `/master/items/${newId}?saved=1` : "/master/items");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan item.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
    }
  };

  const enabledAcc = ACCOUNTS_BY_TIPE[f.tipe] ?? [];
  const shareLink = id && typeof window !== "undefined" ? `${window.location.origin}/share/item/${id}` : "[simpan data item terlebih dahulu]";

  if (loadError) return <PageWrapper><KCard><p className="text-danger">{loadError}</p></KCard></PageWrapper>;
  if (!loaded) return <PageWrapper><KCard><p className="text-sm text-[#6b7280]">Memuat data item...</p></KCard></PageWrapper>;

  return (
    <PageWrapper>
      <div>
        {notice && (
          <div className="mb-3 flex items-center gap-2 border-l-4 border-[#4caf50] bg-[#eaf6eb] px-4 py-2.5 text-[14px] text-[#245c28]">
            <CheckCircle2 className="size-4" /> {notice}
          </div>
        )}
        {error && <div className="mb-3 border-l-4 border-danger bg-[#fdecec] px-4 py-2.5 text-[14px] text-danger">{error}</div>}

        <KTabs tabs={TABS} active={tab} onChange={setTab} />
        <div className="border border-t-0 border-[#c9d3df] bg-white p-5">
          {tab === "umum" && (
            <div className="max-w-[1070px]">
              <KRadioGroup label="Tipe Item" value={f.tipe} onChange={(v) => set("tipe", v)} options={TIPE_OPTIONS} />
              <KCheckbox label="Item Serial" checked={f.serial} onChange={(v) => set("serial", v)} />
              <KCode label="Kode Item" value={f.code} isNew={isNew} onChange={isNew ? undefined : (v) => set("code", v)}
                fieldClassName="max-w-[320px]" />
              <KField label="Nama Item">
                <input
                  value={f.name}
                  onChange={(e) => set("name", e.target.value)}
                  className="h-10 w-full rounded border border-[#cfd4da] px-3 text-sm outline-none focus:border-primary"
                />
                {errors.name && <p className="mt-1 text-[13px] text-danger">{errors.name}</p>}
              </KField>
              <KRow>
                <KSelect label="Jenis" value={f.categoryId} onChange={(v) => set("categoryId", v)} options={opts(categories)} />
                <KSelect label="Sub Jenis" value={f.subCategoryId} onChange={(v) => set("subCategoryId", v)} options={opts(categories)} />
              </KRow>
              <KSelect label="Merek" value={f.brandId} onChange={(v) => set("brandId", v)} options={opts(brands)} />
              <KInput label="Rak" value={f.rak} onChange={(e) => set("rak", e.target.value)} />
              <KRadioGroup label="Status Jual" inline value={f.statusJual} onChange={(v) => set("statusJual", v)} options={[
                { value: "dijual", label: "Masih dijual" }, { value: "tidak", label: "Tidak dijual" },
                { value: "beli", label: "Bisa beli tidak dijual" },
              ]} />
              <KNumber label="Stok Minimum" value={f.minimumStock} onChange={(v) => set("minimumStock", v)} />
              <KSelect label="Supplier" value={f.supplierId} onChange={(v) => set("supplierId", v)} options={opts(suppliers)} />
              <KSelect label="Dept/Gudang" value={f.warehouseId} onChange={(v) => set("warehouseId", v)} options={opts(warehouses)} />
              <KTextarea label="Keterangan" rows={3} value={f.description} onChange={(e) => set("description", e.target.value)} />
              <KCheckbox label="Aktif" caption="Item aktif" checked={f.isActive} onChange={(v) => set("isActive", v)} />
            </div>
          )}

          {tab === "harga" && (
            <div>
              <KInfoBox variant="warning" title="PENTING" items={[
                "Mengubah satuan dan konversi setelah ada transaksi akan mengakibatkan kesalahan pada perhitungan.",
                "Persiapkan master data item yang benar sebelum pemakaian awal program. Data item yang berantakan mengakibatkan kesalahan perhitungan.",
              ]} />
              <KRadioGroup label="Tipe Harga Jual" inline value={f.priceType} onChange={(v) => set("priceType", v)} options={[
                { value: "satu", label: "Satu Harga" }, { value: "satuan", label: "Satuan" },
                { value: "level", label: "Level" }, { value: "jumlah", label: "Jumlah" },
              ]} />
              {errors.unit && <p className="mb-2 text-[13px] text-danger">{errors.unit}</p>}
              {f.priceType === "satu" ? (
                <div className="max-w-[1070px]">
                  <KSelect label="Satuan" value={f.unitId} onChange={(v) => set("unitId", v)} options={unitOptions} />
                  <KInput label="Kode Barcode" value={f.barcode} onChange={(e) => set("barcode", e.target.value)} />
                  <KInput label="SKU (Stock Keeping Unit)" value={f.sku} onChange={(e) => set("sku", e.target.value)} />
                  <KRow cols={3}>
                    <KNumber label="Harga Pokok" value={f.pokok} onChange={setPokok} />
                    <KNumber label="Proc %" value={f.proc} onChange={setProc} />
                    <KNumber label="Harga Jual" value={f.jual} onChange={setJual} />
                  </KRow>
                  <KRow>
                    <KNumber label="Poin" value={f.poin} onChange={(v) => set("poin", v)} />
                    <KNumber label="Komisi Sales" value={f.komisi} onChange={(v) => set("komisi", v)} />
                  </KRow>
                </div>
              ) : (
                <KEditableGrid<UnitRow>
                  columns={unitCols}
                  rows={f.unitRows}
                  onChange={setUnitRows}
                  newRow={emptyUnitRow}
                  addLabel="Tambah Satuan"
                  removeLabel="Hapus Satuan"
                />
              )}
            </div>
          )}

          {tab === "dimensi" && (
            <div className="max-w-[1070px]">
              <KInfoBox title="KETERANGAN" items={[
                "Data yang tampil sesuai dengan satuan yang telah diinput pada tab Satuan dan Harga.",
                "Satuan ukur Berat = gram, Satuan ukur Panjang, Lebar dan Tinggi = cm.",
              ]} />
              <KRow>
                <KNumber label="Berat" value={f.berat} onChange={(v) => set("berat", v)} />
                <KNumber label="Panjang" value={f.panjang} onChange={(v) => set("panjang", v)} />
                <KNumber label="Lebar" value={f.lebar} onChange={(v) => set("lebar", v)} />
                <KNumber label="Tinggi" value={f.tinggi} onChange={(v) => set("tinggi", v)} />
              </KRow>
            </div>
          )}

          {tab === "potongan" && (
            <KEditableGrid<DiscountRow>
              columns={[
                { key: "group", label: "Kode Grup", type: "select", options: GROUP_OPTIONS, width: "260px" },
                { key: "p1", label: "Potongan 1 (%)", type: "number" },
                { key: "p2", label: "Potongan 2 (%)", type: "number" },
                { key: "p3", label: "Potongan 3 (%)", type: "number" },
                { key: "p4", label: "Potongan 4 (%)", type: "number" },
              ]}
              rows={f.discounts}
              onChange={(r) => set("discounts", r)}
              newRow={emptyDiscountRow}
              addLabel="Tambah Potongan"
              removeLabel="Hapus Potongan"
              emptyText="No data"
            />
          )}

          {tab === "akuntansi" && (
            <div className="max-w-[1070px]">
              {ACCOUNT_FIELDS.map((a) => (
                <KSelect
                  key={a.key}
                  label={a.label}
                  value={f.acc[a.key] ?? ""}
                  onChange={(v) => setF((p) => ({ ...p, acc: { ...p.acc, [a.key]: v } }))}
                  options={accountOptions}
                  disabled={!enabledAcc.includes(a.key)}
                />
              ))}
            </div>
          )}

          {tab === "gambar" && (
            <div>
              <KInfoBox title="KETERANGAN" items={[
                "Batas upload max 5 gambar.",
                "Apabila size gambar terlalu besar silahkan lakukan proses crop atau resize ukuran.",
                "Jika melakukan duplikasi data, gambar tidak terduplikasi, silahkan upload gambar kembali.",
              ]} />
              <KImageList images={f.images} onChange={(v) => set("images", v)} max={5} />
            </div>
          )}

          {tab === "share" && (
            <div className="max-w-[1070px]">
              <div className="mb-4"><KToggle label="Item dapat dishare" checked={f.shareEnabled} onChange={(v) => set("shareEnabled", v)} /></div>
              <KField label="Link Share">
                {id ? <KShareLink value={shareLink} /> : (
                  <input readOnly value={shareLink} className="h-10 w-full rounded border border-dashed border-[#cfd4da] bg-[#f7f8fa] px-3 text-sm" />
                )}
              </KField>
              <KInput label="Youtube id Video" placeholder="Masukkan id video youtube" value={f.youtubeId} onChange={(e) => set("youtubeId", e.target.value)} />
              <KInfoBox title="" >
                <p>Contoh :Url video youtube : https://youtu.be/5aS9fMYzeyc / Yang di input : 5aS9fMYzeyc</p>
              </KInfoBox>
              <KRadioGroup label="Kondisi Barang" inline value={f.kondisi} onChange={(v) => set("kondisi", v)} options={[
                { value: "baru", label: "Baru" }, { value: "bekas", label: "Bekas" },
              ]} />
              <KSelect label="Stok Share" placeholder="Pilih departemen/gudang stok" value={f.stokShare} onChange={(v) => set("stokShare", v)} options={opts(warehouses)} />
              <KRichText label="Sub Keterangan" value={f.subKeterangan} onChange={(v) => set("subKeterangan", v)} />
            </div>
          )}

          {tab === "marketplace" && (
            <div className="max-w-[1070px]">
              {!id ? (
                <p className="font-bold text-danger">Simpan data terlebih dahulu untuk menggunakan Fitur Marketplace.</p>
              ) : (
                <div className="divide-y divide-[#e5e8ec] border border-[#d5d9de]">
                  {["Tokopedia", "Shopee", "Lazada", "Bukalapak"].map((m) => (
                    <div key={m} className="flex items-center justify-between px-4 py-3">
                      <span className="text-[15px] font-medium">{m}</span>
                      <button disabled className="h-9 rounded border border-[#cfd4da] bg-[#f3f4f6] px-4 text-sm text-[#9aa3ad]">Belum terhubung</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "pajak" && (
            <div className="max-w-[1070px]">
              <KInfoBox title="KETERANGAN" items={[
                "Referensi Kode Barang dan Jasa Maksimal 6 Karakter.",
                "Referensi Kode Barang dan Jasa Harus sesuai dengan Referensi DJP.",
              ]} />
              <KSelect label="Jenis Pajak" value={f.taxType} onChange={(v) => set("taxType", v)} options={[
                { value: "ppn", label: "PPN" }, { value: "ppnbm", label: "PPnBM" }, { value: "non", label: "Non Pajak" },
              ]} />
              <KNumber label="Pajak Include %" value={f.taxInclude} onChange={(v) => set("taxInclude", v)} />
              <KInput label="Kode Referensi Barang Jasa" maxLength={6} value={f.taxRef} onChange={(e) => set("taxRef", e.target.value)} />
              <KSelect label="Opsi Barang Jasa" value={f.taxOption} onChange={(v) => set("taxOption", v)} options={[
                { value: "barang", label: "Barang" }, { value: "jasa", label: "Jasa" },
              ]} />
            </div>
          )}
        </div>

        <KSaveBar onSave={handleSave} saving={saving} />
      </div>
    </PageWrapper>
  );
}
