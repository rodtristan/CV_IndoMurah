"use client";

// Ketoko "Item Baru" / "Edit Item" full-page form. Used by /master/items/new and
// /master/items/[id]. Semua tab tersimpan: Data Umum + Dimensi + Potongan per grup +
// Akuntansi + Share Item + Data Pendukung Pajak (Product), satuan (ProductUnit),
// harga (ProductPrice: STANDARD, LEVEL2-4, QTY1-4, lihat ./product-pricing) dan
// gambar (ProductImage, file diunggah lewat /files/image).

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
import {
  fetchProductPrices, fetchProductUnits, saveUnitsAndPrices, type PriceToSave, type UnitToSave,
} from "./product-pricing";
import type { Product, Category, Brand, Unit, Warehouse, Account } from "@/lib/types";
import { uploadImage } from "@/lib/upload-image";
import { toast } from "sonner";
import { LoadingState } from "@/components/ui/Loader";

// ─── Types ─────────────────────────────────────────────────────────────

type UnitRow = {
  unitId: string; konversi: string; jualYN: string; beliYN: string; jual: string;
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
  unitId: "", konversi: "1", jualYN: "1", beliYN: "1", jual: "0",
  hj1: "0", hj2: "0", hj3: "0", hj4: "0", jml1: "0", jml2: "0", jml3: "0", jml4: "0", h1: "0", h2: "0", h3: "0", h4: "0",
});
const emptyDiscountRow = (): DiscountRow => ({ group: "", p1: "0", p2: "0", p3: "0", p4: "0" });

const initialForm = (): FormState => ({
  tipe: "GOODS", serial: false, code: "", name: "", categoryId: "", subCategoryId: "", brandId: "", rak: "",
  statusJual: "dijual", minimumStock: "0", supplierId: "", warehouseId: "", description: "", isActive: true,
  priceType: "satu", unitId: "", barcode: "", sku: "", pokok: "0", proc: "0", jual: "0", poin: "0", komisi: "0",
  unitRows: [emptyUnitRow()],
  berat: "0", panjang: "0", lebar: "0", tinggi: "0",
  discounts: [],
  acc: {},
  images: [],
  shareEnabled: false, youtubeId: "", kondisi: "NEW", stokShare: "", subKeterangan: "",
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

// Integrasi marketplace (Tokopedia/Shopee/...) tidak tersedia di aplikasi ini.
const UNSUPPORTED_TABS = ["marketplace"];

const ITEM_TYPES = [
  { value: "GOODS", label: "Barang" },
  { value: "SERVICE", label: "Jasa" },
  { value: "NON_INVENTORY", label: "Non Inventory" },
  { value: "EXPENSE", label: "Biaya" },
  { value: "ASSEMBLY", label: "Rakitan" },
];

const ACCOUNT_FIELDS: { key: string; label: string; match: RegExp; column: string }[] = [
  { key: "hpp", label: "Harga Pokok Penjualan", match: /harga pokok|hpp|cogs/i, column: "CogsAccountID" },
  { key: "pendJual", label: "Pendapatan Jual", match: /pendapatan.*(jual|penjualan)|penjualan|sales/i, column: "SalesAccountID" },
  { key: "pendJasa", label: "Pendapatan Jasa", match: /pendapatan.*jasa|jasa/i, column: "ServiceIncomeAccountID" },
  { key: "persediaan", label: "Persediaan", match: /^persediaan|inventory/i, column: "InventoryAccountID" },
  { key: "biayaNonInv", label: "Biaya Non Inventory", match: /non inventory|perlengkapan|biaya/i, column: "NonInventoryAccountID" },
  { key: "persLain", label: "Persediaan Lainnya", match: /persediaan lain|dalam proses/i, column: "OtherInventoryAccountID" },
  { key: "tenaga", label: "Biaya Tenaga Kerja", match: /tenaga kerja|gaji/i, column: "LaborCostAccountID" },
  { key: "overhead", label: "Biaya Overhead", match: /overhead/i, column: "OverheadAccountID" },
];
/** Akun yang aktif per Tipe Item (sama seperti Ketoko). */
const ACCOUNTS_BY_TIPE: Record<string, string[]> = {
  GOODS: ["hpp", "pendJual", "persediaan"],
  SERVICE: ["pendJasa"],
  NON_INVENTORY: ["biayaNonInv"],
  EXPENSE: ["biayaNonInv"],
  ASSEMBLY: ["hpp", "pendJual", "persediaan", "persLain", "tenaga", "overhead"],
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

// ─── Product ⇄ form (field tambahan Ketoko) ─────────────────────────────

const sv = (v: unknown) => (v === null || v === undefined ? "" : String(v));

function extraFromProduct(p: Record<string, unknown>): Partial<FormState> {
  const acc: Record<string, string> = {};
  for (const a of ACCOUNT_FIELDS) if (p[a.column]) acc[a.key] = String(p[a.column]);
  const gd = Array.isArray(p.GroupDiscounts) ? (p.GroupDiscounts as { groupId: number; p1: number; p2: number; p3: number; p4: number }[]) : [];
  return {
    tipe: sv(p.ItemType) || "GOODS",
    serial: Boolean(p.HasSerial),
    sku: sv(p.SKU),
    rak: sv(p.Shelf),
    taxInclude: sv(p.TaxIncludePercent ?? 0),
    statusJual: p.IsSold === false ? "tidak" : "dijual",
    supplierId: sv(p.SupplierID),
    poin: sv(p.Point ?? 0),
    komisi: sv(p.SalesCommission ?? 0),
    berat: sv(p.Weight ?? 0), panjang: sv(p.Length ?? 0), lebar: sv(p.Width ?? 0), tinggi: sv(p.Height ?? 0),
    discounts: gd.map((d) => ({ group: String(d.groupId), p1: String(d.p1), p2: String(d.p2), p3: String(d.p3), p4: String(d.p4) })),
    acc,
    shareEnabled: Boolean(p.ShareEnabled),
    youtubeId: sv(p.YoutubeID),
    kondisi: sv(p.Condition) || "NEW",
    stokShare: sv(p.ShareWarehouseID),
    subKeterangan: sv(p.ShareDescription),
    taxType: sv(p.TaxType),
    taxRef: sv(p.TaxRefCode),
    taxOption: sv(p.TaxGoodsService),
  };
}

function extraPayload(f: FormState): Record<string, unknown> {
  const n = (v: string) => { const x = Number(v); return Number.isFinite(x) ? x : 0; };
  const idOrNull = (v?: string) => (v ? Number(v) : null);
  const enabled = new Set(ACCOUNTS_BY_TIPE[f.tipe] ?? []);
  const accPayload: Record<string, number | null> = {};
  for (const a of ACCOUNT_FIELDS) {
    const k = a.column.charAt(0).toLowerCase() + a.column.slice(1).replace(/ID$/, "Id");
    accPayload[k] = enabled.has(a.key) ? idOrNull(f.acc[a.key]) : null;
  }
  return {
    itemType: f.tipe,
    hasSerial: f.serial,
    SKU: f.sku.trim() || null,
    shelf: f.rak.trim() || null,
    taxIncludePercent: Math.min(100, Math.max(0, n(f.taxInclude))),
    isSold: f.statusJual !== "tidak",
    supplierId: idOrNull(f.supplierId),
    point: Math.max(0, n(f.poin)),
    salesCommission: Math.max(0, n(f.komisi)),
    weight: Math.max(0, n(f.berat)), length: Math.max(0, n(f.panjang)), width: Math.max(0, n(f.lebar)), height: Math.max(0, n(f.tinggi)),
    groupDiscounts: f.discounts
      .filter((d) => d.group)
      .map((d) => ({ groupId: Number(d.group), p1: Math.min(100, Math.max(0, n(d.p1))), p2: Math.min(100, Math.max(0, n(d.p2))), p3: Math.min(100, Math.max(0, n(d.p3))), p4: Math.min(100, Math.max(0, n(d.p4))) })),
    ...accPayload,
    shareEnabled: f.shareEnabled,
    youtubeId: f.youtubeId.trim() || null,
    condition: f.kondisi === "USED" ? "USED" : "NEW",
    shareWarehouseId: idOrNull(f.stokShare),
    shareDescription: f.subKeterangan || null,
    taxType: f.taxType || null,
    taxRefCode: f.taxRef.trim() || null,
    taxGoodsService: f.taxOption || null,
  };
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
  const [createdId, setCreatedId] = useState<string | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [groups, setGroups] = useState<{ ID: number; Code: string; Name: string }[]>([]);
  const [suppliers, setSuppliers] = useState<{ ID: number; Code: string; Name: string }[]>([]);
  const [imageRows, setImageRows] = useState<{ ID: number; Url: string }[]>([]);

  usePageTitle(isNew ? "Item Baru" : itemName ? itemName : "Edit Item");

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setF((p) => ({ ...p, [k]: v }));

  // Lookups
  useEffect(() => {
    let alive = true;
    (async () => {
      const safe = <T,>(p: Promise<{ data?: unknown }>) => p.then((r) => list<T>(r)).catch(() => [] as T[]);
      const [c, b, u, w, a, g, sp] = await Promise.all([
        safe<Category>(api.get("categories", odata().take(200).toParams())),
        safe<Brand>(api.get("brand", odata().take(200).toParams())),
        safe<Unit>(api.get("unit", odata().take(200).toParams())),
        safe<Warehouse>(api.get("warehouse", odata().take(200).toParams())),
        safe<Account>(api.get("account", odata().take(500).toParams())),
        safe<{ ID: number; Code: string; Name: string }>(api.get("customer-group", odata().take(100).toParams())),
        safe<{ ID: number; Code: string; Name: string }>(api.get("supplier", odata().take(100).orderBy("Name").toParams())),
      ]);
      if (!alive) return;
      setCategories(c); setBrands(b); setUnits(u); setWarehouses(w); setAccounts(a); setGroups(g); setSuppliers(sp);
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
        const [pUnits, pPrices, pImages] = await Promise.all([
          fetchProductUnits(p.ID).catch(() => []),
          fetchProductPrices(p.ID).catch(() => []),
          api.get<{ ID: number; Url: string }[]>("product-image", { $where: { ProductID: p.ID }, $orderBy: { SortOrder: "asc" }, $take: 10 } as never, { skipCache: true })
            .then((r) => (Array.isArray(r.data) ? r.data : []))
            .catch(() => [] as { ID: number; Url: string }[]),
        ]);
        if (id) setImageRows(pImages);
        if (!alive) return;
        const loadedUnits = pUnits.length
          ? [...pUnits].sort((a, b) => Number(b.isBase) - Number(a.isBase) || a.conversion - b.conversion)
          : [{ unitId: p.UnitID, conversion: 1, isBase: true, isSell: true, isPurchase: true }];
        const priceOf = (unitId: number, type: string) => pPrices.find((x) => x.unitId === unitId && x.priceType === type);
        const rows: UnitRow[] = loadedUnits.map((u, i) => {
          const std = priceOf(u.unitId, "STANDARD")?.price ?? (i === 0 ? num(p.SellingPrice) : num(p.SellingPrice) * u.conversion);
          const r: UnitRow = {
            ...emptyUnitRow(), unitId: String(u.unitId), konversi: String(u.conversion),
            jualYN: u.isSell ? "1" : "0", beliYN: u.isPurchase ? "1" : "0", jual: String(std), hj1: String(std),
          };
          for (const lv of [2, 3, 4] as const) r[`hj${lv}`] = String(priceOf(u.unitId, `LEVEL${lv}`)?.price ?? 0);
          for (const q of [1, 2, 3, 4] as const) {
            const t = priceOf(u.unitId, `QTY${q}`);
            r[`jml${q}`] = String(t?.maxQty ?? 0);
            r[`h${q}`] = String(t?.price ?? 0);
          }
          return r;
        });
        const hasQty = pPrices.some((x) => x.priceType.startsWith("QTY"));
        const hasLevel = pPrices.some((x) => x.priceType.startsWith("LEVEL"));
        const loadedType = hasQty ? "jumlah" : hasLevel ? "level" : rows.length > 1 ? "satuan" : "satu";
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
          ...extraFromProduct(p as unknown as Record<string, unknown>),
          images: id ? pImages.map((x) => x.Url) : [],
          priceType: loadedType,
          unitRows: rows,
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
    const yn: KOption[] = [{ value: "1", label: "Ya" }, { value: "0", label: "Tidak" }];
    const base: KGridColumn<UnitRow> = { key: "unitId", label: "Satuan", type: "select", options: unitOptions, width: "180px" };
    const konv: KGridColumn<UnitRow> = { key: "konversi", label: "Jml Konversi", type: "number", width: "110px" };
    const jualYN: KGridColumn<UnitRow> = { key: "jualYN", label: "Dijual", type: "select", options: yn, width: "90px" };
    const beliYN: KGridColumn<UnitRow> = { key: "beliYN", label: "Dibeli", type: "select", options: yn, width: "90px" };
    const n = (key: keyof UnitRow & string, label: string): KGridColumn<UnitRow> => ({ key, label, type: "number", width: "110px" });
    const head = [base, konv, jualYN, beliYN];
    if (f.priceType === "level") return [...head, n("hj1", "HJ Level 1"), n("hj2", "HJ Level 2"), n("hj3", "HJ Level 3"), n("hj4", "HJ Level 4")];
    if (f.priceType === "jumlah") return [...head, n("jml1", "s/d Jumlah 1"), n("h1", "Harga 1"), n("jml2", "s/d Jumlah 2"), n("h2", "Harga 2"), n("jml3", "s/d Jumlah 3"), n("h3", "Harga 3"), n("jml4", "s/d Jumlah 4"), n("h4", "Harga 4")];
    return [...head, n("jual", "Harga Jual")];
  }, [f.priceType, unitOptions]);

  // ─── Derived persisted values ──
  /** Units + price tiers exactly as they will be stored; first row = satuan dasar. */
  const buildUnitsAndPrices = (): { units: UnitToSave[]; prices: PriceToSave[]; error?: string } => {
    if (f.priceType === "satu") {
      const unitId = num(f.unitId);
      return {
        units: unitId ? [{ unitId, conversion: 1, isBase: true, isSell: true, isPurchase: true }] : [],
        prices: unitId ? [{ unitId, priceType: "STANDARD", price: num(f.jual) }] : [],
      };
    }
    const rows = f.unitRows.filter((r) => num(r.unitId) > 0);
    const ids = rows.map((r) => num(r.unitId));
    if (new Set(ids).size !== ids.length) return { units: [], prices: [], error: "Satuan tidak boleh duplikat." };
    const units: UnitToSave[] = [];
    const prices: PriceToSave[] = [];
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const unitId = num(r.unitId);
      const conversion = i === 0 ? 1 : num(r.konversi);
      if (conversion <= 0) return { units: [], prices: [], error: `Jml konversi baris ${i + 1} harus lebih dari 0.` };
      units.push({ unitId, conversion, isBase: i === 0, isSell: r.jualYN !== "0", isPurchase: r.beliYN !== "0" });
      if (f.priceType === "satuan") {
        prices.push({ unitId, priceType: "STANDARD", price: num(r.jual) });
      } else if (f.priceType === "level") {
        prices.push({ unitId, priceType: "STANDARD", price: num(r.hj1) });
        for (const lv of [2, 3, 4] as const) {
          const v = num(r[`hj${lv}`]);
          if (v > 0) prices.push({ unitId, priceType: `LEVEL${lv}`, price: v });
        }
      } else {
        // Harga per jumlah: tier q berlaku untuk (Jumlah q-1) < qty <= (Jumlah q).
        // Jumlah 0 pada tingkat terakhir yang berharga = "dan seterusnya".
        const tiers = ([1, 2, 3, 4] as const)
          .map((q) => ({ upTo: num(r[`jml${q}`]), price: num(r[`h${q}`]) }))
          .filter((t) => t.price > 0);
        let prev = 0;
        for (let q = 0; q < tiers.length; q++) {
          const t = tiers[q];
          const isLast = q === tiers.length - 1;
          if (t.upTo <= 0 && !isLast) return { units: [], prices: [], error: `Baris ${i + 1}: "s/d Jumlah ${q + 1}" harus diisi (kecuali tingkat terakhir).` };
          if (t.upTo > 0 && t.upTo <= prev) return { units: [], prices: [], error: `Baris ${i + 1}: "s/d Jumlah" harus naik berurutan.` };
          prices.push({ unitId, priceType: `QTY${q + 1}`, price: t.price, minQty: prev > 0 ? prev : null, maxQty: t.upTo > 0 ? t.upTo : null });
          if (t.upTo > 0) prev = t.upTo;
        }
        prices.push({ unitId, priceType: "STANDARD", price: tiers[0]?.price ?? 0 });
      }
    }
    return { units, prices };
  };

  const persisted = () => {
    const { units, prices } = buildUnitsAndPrices();
    const base = units[0];
    const baseStd = prices.find((p) => p.unitId === base?.unitId && p.priceType === "STANDARD");
    return { unitId: base?.unitId ?? 0, barcode: f.barcode, purchasePrice: num(f.pokok), sellingPrice: baseStd?.price ?? 0 };
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

  /** Samakan ProductImage dengan daftar gambar di tab Gambar (urutan = SortOrder, pertama = utama). */
  const syncImages = async (productId: number) => {
    const current = productId === Number(id) ? imageRows : [];
    const keep = new Set(f.images);
    for (const row of current) if (!keep.has(row.Url)) await api.delete("product-image", row.ID).catch(() => undefined);
    const existing = new Map(current.map((r) => [r.Url, r.ID]));
    const next: { ID: number; Url: string }[] = [];
    for (let i = 0; i < f.images.length; i++) {
      const url = f.images[i];
      const body = { productId, url, sortOrder: i, isPrimary: i === 0 };
      const exId = existing.get(url);
      if (exId) {
        await api.patch("product-image", exId, { sortOrder: i, isPrimary: i === 0 }).catch(() => undefined);
        next.push({ ID: exId, Url: url });
      } else {
        const r = await api.post<{ ID: number }>("product-image", body);
        if (r.data?.ID) next.push({ ID: r.data.ID, Url: url });
      }
    }
    setImageRows(next);
  };

  const validate = () => {
    const e: { name?: string; unit?: string } = {};
    if (!f.name.trim()) e.name = "Nama Item harus diisi.";
    const built = buildUnitsAndPrices();
    if (built.error) e.unit = built.error;
    else if (!persisted().unitId) e.unit = "Satuan harus dipilih.";
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
      const { units: unitsToSave, prices: pricesToSave } = buildUnitsAndPrices();
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
        ...extraPayload(f),
      };
      const productId = id ?? createdId;
      if (productId) {
        const res = await api.patch<Product>("products", productId, payload);
        if (!res.success) throw new Error(res.message || "Gagal menyimpan item.");
        try {
          await saveUnitsAndPrices(Number(productId), unitsToSave, pricesToSave);
        } catch (err) {
          throw new Error(`Data umum tersimpan, tetapi satuan/harga gagal disimpan: ${err instanceof Error ? err.message : err}`);
        }
        await syncImages(Number(productId));
        setItemName(payload.name);
        if (!id) { router.replace(`/master/items/${productId}?saved=1`); return; }
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
        if (!newId) { router.replace("/master/items"); return; }
        // Remember the new id so a retry after a unit/price failure updates instead of duplicating.
        setCreatedId(String(newId));
        try {
          await saveUnitsAndPrices(Number(newId), unitsToSave, pricesToSave);
        } catch (err) {
          throw new Error(`Item dibuat, tetapi satuan/harga gagal disimpan: ${err instanceof Error ? err.message : err}. Klik Simpan untuk mencoba lagi.`);
        }
        await syncImages(Number(newId));
        router.replace(`/master/items/${newId}?saved=1`);
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
  if (!loaded) return <PageWrapper><KCard><LoadingState text="Memuat data item..." /></KCard></PageWrapper>;

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
              <KRadioGroup label="Tipe Item" value={f.tipe} onChange={(v) => set("tipe", v)} options={ITEM_TYPES} />
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
                <KSelect label="Jenis" value={f.categoryId} onChange={(v) => set("categoryId", v)} options={categories.map((c) => ({ value: String(c.ID), label: `${c.Code} - ${c.Name}` }))} />
                <KSelect label="Merek" value={f.brandId} onChange={(v) => set("brandId", v)} options={opts(brands)} />
              </KRow>
              <KInput label="Rak" value={f.rak} onChange={(e) => set("rak", e.target.value)} maxLength={100} fieldClassName="max-w-[320px]" />
              <KNumber label="Pajak Include %" value={f.taxInclude} onChange={(v) => set("taxInclude", v)} min={0} max={100} fieldClassName="max-w-[320px]" />
              <KRadioGroup label="Status Jual" inline value={f.statusJual} onChange={(v) => set("statusJual", v)} options={[
                { value: "dijual", label: "Masih dijual" }, { value: "tidak", label: "Tidak dijual" },
              ]} />
              <KNumber label="Stok Minimum" value={f.minimumStock} onChange={(v) => set("minimumStock", v)} fieldClassName="max-w-[320px]" />
              <KSelect label="Supplier" value={f.supplierId} onChange={(v) => set("supplierId", v)} options={suppliers.map((x) => ({ value: String(x.ID), label: x.Name }))} fieldClassName="max-w-[320px]" />
              <KSelect label="Dept/Gudang Default" value={f.warehouseId} onChange={(v) => set("warehouseId", v)} options={opts(warehouses)} fieldClassName="max-w-[320px]"
                hint="Gudang default untuk stok awal / transaksi item ini." />
              <KCheckbox label="Serial Number" caption="Item memakai nomor seri" checked={f.serial} onChange={(v) => set("serial", v)} />
              <KTextarea label="Keterangan" rows={4} value={f.description} onChange={(e) => set("description", e.target.value)} />
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
                  <KRow cols={3}>
                    <KNumber label="Harga Pokok" value={f.pokok} onChange={setPokok} />
                    <KNumber label="Proc %" value={f.proc} onChange={setProc} />
                    <KNumber label="Harga Jual" value={f.jual} onChange={setJual} />
                  </KRow>
                  <KRow>
                    <KNumber label="Poin" value={f.poin} onChange={(v) => set("poin", v)} min={0} />
                    <KNumber label="Komisi Sales" value={f.komisi} onChange={(v) => set("komisi", v)} min={0} />
                  </KRow>
                </div>
              ) : (
                <div>
                  <div className="max-w-[1070px]">
                    <KRow>
                      <KInput label="Kode Barcode (satuan dasar)" value={f.barcode} onChange={(e) => set("barcode", e.target.value)} />
                      <KNumber label="Harga Pokok (per satuan dasar)" value={f.pokok} onChange={(v) => set("pokok", v)} />
                    </KRow>
                    <KRow>
                      <KNumber label="Poin" value={f.poin} onChange={(v) => set("poin", v)} min={0} />
                      <KNumber label="Komisi Sales" value={f.komisi} onChange={(v) => set("komisi", v)} min={0} />
                    </KRow>
                  </div>
                  <KInfoBox title="KETERANGAN" items={[
                    "Baris pertama adalah satuan dasar (konversi = 1); stok selalu dihitung dalam satuan dasar.",
                    "Jml Konversi = isi satuan tersebut dalam satuan dasar (mis. 1 Dus = 12 Pcs).",
                    ...(f.priceType === "level" ? ["HJ Level 1 = harga standar. Level 2-4 dipakai kasir sesuai level harga pelanggan; kosong/0 = pakai harga standar."] : []),
                    ...(f.priceType === "jumlah" ? ["Harga 1 berlaku untuk jumlah s/d Jumlah 1, Harga 2 untuk jumlah di atas Jumlah 1 s/d Jumlah 2, dst. Jumlah 0 pada tingkat terakhir = dan seterusnya."] : []),
                  ]} />
                  <KEditableGrid<UnitRow>
                    columns={unitCols}
                    rows={f.unitRows}
                    onChange={setUnitRows}
                    newRow={emptyUnitRow}
                    addLabel="Tambah Satuan"
                    removeLabel="Hapus Satuan"
                  />
                </div>
              )}
            </div>
          )}

          {UNSUPPORTED_TABS.includes(tab) && (
            <KInfoBox variant="warning" title="Tidak tersedia">
              Sinkronisasi marketplace (Tokopedia/Shopee/Lazada/Bukalapak) tidak tersedia di aplikasi ini.
            </KInfoBox>
          )}
          <fieldset disabled={UNSUPPORTED_TABS.includes(tab)} className="m-0 min-w-0 border-0 p-0 disabled:opacity-60">
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
                { key: "group", label: "Kode Grup", type: "select", options: groups.map((g) => ({ value: String(g.ID), label: `${g.Code} - ${g.Name}` })), width: "260px" },
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
              <KImageList images={f.images} onChange={(v) => set("images", v)} max={5} onUpload={uploadImage} onError={(m) => toast.error(m)} />
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
                { value: "NEW", label: "Baru" }, { value: "USED", label: "Bekas" },
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
                { value: "PPN", label: "PPN" }, { value: "PPNBM", label: "PPnBM" }, { value: "NON", label: "Non Pajak" },
              ]} />
              <KInput label="Kode Referensi Barang Jasa" maxLength={6} value={f.taxRef} onChange={(e) => set("taxRef", e.target.value)} />
              <KSelect label="Opsi Barang Jasa" value={f.taxOption} onChange={(v) => set("taxOption", v)} options={[
                { value: "GOODS", label: "Barang" }, { value: "SERVICE", label: "Jasa" },
              ]} />
            </div>
          )}
          </fieldset>
        </div>

        <KSaveBar onSave={handleSave} saving={saving} />
      </div>
    </PageWrapper>
  );
}
