"use client";

// Kasir (POS). Harga per item mengikuti ProductPrice (STANDARD / LEVEL2-4 / QTY1-4, per satuan)
// lewat ../components/master/product-pricing; satuan jual dapat dipilih (konversi ke satuan
// dasar dihitung server); diskon grup pelanggan otomatis; voucher divalidasi server.
// Pembayaran mengirim PaymentMethodID + WarehouseID; stok divalidasi server per gudang.

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import {
  ShoppingCart, Plus, Minus, Trash2, Search, User, Percent, CreditCard, Banknote, QrCode, Check,
  Package, ArrowLeftRight, Printer, Warehouse as WarehouseIcon, Ticket, X, Wallet, AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/StatCard";
import { api, odata } from "@/lib/api-client";
import { formatCurrency, cn } from "@/lib/utils";
import type { Product } from "@/lib/types";
import {
  fetchProductPrices, fetchProductUnits, levelFromGroup, resolveUnitPrice,
  type PriceLevel, type ProductPriceInfo, type ProductUnitInfo,
} from "@/components/master/product-pricing";
import { printDocument } from "@/components/transaction/print";
import { LoadingState } from "@/components/ui/Loader";

// ─── Types ──────────────────────────────────────────────────

interface PosCustomer {
  ID: number;
  Code: string;
  Name: string;
  Phone?: string | null;
  CustomerGroup?: { ID: number; Code?: string; Name: string; DiscountPercent?: string | number } | null;
}

interface PaymentMethodRow { ID: number; Code: string; Name: string; IsActive?: boolean }
interface WarehouseRow { ID: number; Code: string; Name: string; IsDefault?: boolean; IsActive?: boolean }
interface VoucherRow {
  ID: number; Code: string; Name: string; Value: string | number; MinPurchaseAmount?: string | number;
  MaxDiscountAmount?: string | number | null; StartDate: string; EndDate: string; UsageLimit?: number | null;
  UsedCount?: number; IsActive?: boolean; Type?: { Code?: string; Name?: string } | null;
}

interface PosLine {
  key: string; // `${productId}-${unitId}`
  product: Product;
  units: ProductUnitInfo[]; // sellable units (fallback: product base unit)
  prices: ProductPriceInfo[];
  unitId: number;
  quantity: number;
  unitPrice: number;
  priceSource: string;
  discountPercent: number;
}

interface SaleResult {
  ID: number; Code: string; Date: string; Subtotal: string | number; DiscountAmount: string | number;
  VoucherDiscount?: string | number; TaxAmount: string | number; Total: string | number;
  CashAmount: string | number; ChangeAmount: string | number;
  Customer?: { Name: string } | null; Warehouse?: { Name: string } | null;
  SaleItems?: { Quantity: string | number; UnitPrice: string | number; DiscountAmount: string | number; Subtotal: string | number; Product?: { Code: string; Name: string }; Unit?: { Name: string } }[];
}

const num = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};
const r2 = (n: number) => Math.round(n * 100) / 100;
const arr = <T,>(d: unknown): T[] => (Array.isArray(d) ? (d as T[]) : []);

const METHOD_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  CASH: Banknote, BANK_TRANSFER: ArrowLeftRight, TRANSFER: ArrowLeftRight, QRIS: QrCode, EWALLET: Wallet,
  DEBIT: CreditCard, CREDIT: CreditCard,
};

function lineConversion(line: PosLine): number {
  return line.units.find((u) => u.unitId === line.unitId)?.conversion ?? 1;
}
function lineGross(line: PosLine): number {
  return r2(line.unitPrice * line.quantity);
}
function lineDiscount(line: PosLine): number {
  return r2(lineGross(line) * (line.discountPercent / 100));
}
function lineSubtotal(line: PosLine): number {
  return r2(lineGross(line) - lineDiscount(line));
}
function reprice(line: PosLine, level: PriceLevel): PosLine {
  const { price, source } = resolveUnitPrice({
    prices: line.prices, unitId: line.unitId, qty: line.quantity, level,
    baseSellingPrice: num(line.product.SellingPrice), conversion: lineConversion(line),
  });
  return { ...line, unitPrice: price, priceSource: source };
}

/** Client-side estimate of the voucher discount (same rules as the API); the server's value is final. */
function estimateVoucher(v: VoucherRow | null, base: number): { discount: number; problem?: string } {
  if (!v) return { discount: 0 };
  const min = num(v.MinPurchaseAmount);
  if (base < min) return { discount: 0, problem: `Minimal belanja ${formatCurrency(min)}` };
  const isPct = (v.Type?.Code ?? "").toUpperCase().startsWith("PERC");
  let d = isPct ? (base * num(v.Value)) / 100 : num(v.Value);
  const max = num(v.MaxDiscountAmount);
  if (isPct && max > 0) d = Math.min(d, max);
  return { discount: r2(Math.max(0, Math.min(d, base))) };
}

// ─── Components ─────────────────────────────────────────────

function CartItemRow({
  line, stock, onUpdateQty, onChangeUnit, onRemove,
}: {
  line: PosLine;
  stock: number | undefined; // base-unit stock in the selected warehouse
  onUpdateQty: (qty: number) => void;
  onChangeUnit: (unitId: number) => void;
  onRemove: () => void;
}) {
  const conv = lineConversion(line);
  const need = line.quantity * conv;
  const short = stock !== undefined && need > stock;
  const tierLabel = line.priceSource.startsWith("QTY") ? "Harga jumlah" : line.priceSource.startsWith("LEVEL") ? `Harga level ${line.priceSource.slice(5)}` : null;
  return (
    <div className={cn("flex items-center gap-3 rounded-lg border p-3 transition-colors", short ? "border-danger/50 bg-danger/5" : "border-default hover:border-primary/30")}>
      <div className="flex size-10 items-center justify-center rounded-lg bg-elevated">
        <Package className="size-5 text-muted" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-highlighted">{line.product.Name}</p>
        <p className="text-xs text-muted">
          {formatCurrency(line.unitPrice)} x {line.quantity}
          {tierLabel && <span className="ml-1 text-primary">({tierLabel})</span>}
        </p>
        {stock !== undefined && (
          <p className={cn("text-xs", short ? "font-medium text-danger" : "text-muted")}>
            {short ? <AlertTriangle className="mr-1 inline size-3" /> : null}
            Stok gudang: {stock}{conv !== 1 ? ` (butuh ${need} satuan dasar)` : ""}
          </p>
        )}
      </div>
      {line.units.length > 1 ? (
        <select
          value={line.unitId}
          onChange={(e) => onChangeUnit(Number(e.target.value))}
          className="h-8 rounded-md border border-default bg-elevated px-2 text-xs"
          title="Satuan jual"
        >
          {line.units.map((u) => (
            <option key={u.unitId} value={u.unitId}>{u.unitName ?? `Satuan ${u.unitId}`}{u.conversion !== 1 ? ` (${u.conversion})` : ""}</option>
          ))}
        </select>
      ) : (
        <span className="text-xs text-muted">{line.units[0]?.unitName ?? line.product.Unit?.Name ?? ""}</span>
      )}
      <div className="flex items-center gap-1">
        <button onClick={() => onUpdateQty(line.quantity - 1)} className="flex size-7 items-center justify-center rounded-md border border-default text-muted transition-colors hover:border-primary hover:text-primary">
          <Minus className="size-3" />
        </button>
        <input
          type="number" min={0} step="any" value={line.quantity}
          onChange={(e) => onUpdateQty(num(e.target.value))}
          className="h-7 w-14 rounded-md border border-default bg-transparent text-center text-sm font-semibold outline-none focus:border-primary"
        />
        <button onClick={() => onUpdateQty(line.quantity + 1)} className="flex size-7 items-center justify-center rounded-md border border-default text-muted transition-colors hover:border-primary hover:text-primary">
          <Plus className="size-3" />
        </button>
      </div>
      <div className="min-w-[90px] text-right">
        <p className="text-sm font-semibold text-highlighted">{formatCurrency(lineSubtotal(line))}</p>
        {line.discountPercent > 0 && <p className="text-xs text-success">-{line.discountPercent}%</p>}
      </div>
      <button onClick={onRemove} className="flex size-7 items-center justify-center rounded-md text-muted transition-colors hover:text-danger">
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}

function ProductSearchModal({ open, onClose, onSelect }: { open: boolean; onClose: () => void; onSelect: (product: Product) => void }) {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchProducts = useCallback(async (query: string) => {
    setLoading(true);
    try {
      const params = odata().search(query, ["Code", "Barcode", "Name"]).include(["Unit"]).where({ IsActive: true }).take(20).toParams();
      const res = await api.get<Product[]>("products", params, { skipCache: true });
      setProducts(arr<Product>(res.data));
      setSelectedIndex(0);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal memuat produk");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      setSearch("");
      inputRef.current?.focus();
      void fetchProducts("");
    }
  }, [open, fetchProducts]);

  const onType = (q: string) => {
    setSearch(q);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => void fetchProducts(q), 300);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") setSelectedIndex((i) => Math.min(i + 1, products.length - 1));
    else if (e.key === "ArrowUp") setSelectedIndex((i) => Math.max(i - 1, 0));
    else if (e.key === "Enter" && products[selectedIndex]) { onSelect(products[selectedIndex]); onClose(); }
  };

  return (
    <Modal open={open} onClose={onClose} title="Cari Produk" size="lg">
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            ref={inputRef} type="text" placeholder="Ketik nama, kode, atau barcode produk..."
            value={search} onChange={(e) => onType(e.target.value)} onKeyDown={handleKeyDown}
            className="h-12 w-full rounded-lg border border-default bg-elevated pl-10 pr-4 text-sm text-highlighted placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="max-h-[400px] space-y-1 overflow-y-auto">
            {products.map((product, i) => (
              <button
                key={product.ID}
                onClick={() => { onSelect(product); onClose(); }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors",
                  i === selectedIndex ? "border-primary bg-primary/5" : "border-transparent hover:border-default hover:bg-elevated",
                )}
              >
                <div className="flex size-10 items-center justify-center rounded-lg bg-elevated"><Package className="size-5 text-muted" /></div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-highlighted">{product.Name}</p>
                  <p className="text-xs text-muted">{product.Code} {product.Barcode ? `| ${product.Barcode}` : ""}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-primary">{formatCurrency(product.SellingPrice)}</p>
                  <p className="text-xs text-muted">Stok total: {num(product.Stock)} {product.Unit?.Name ?? ""}</p>
                </div>
              </button>
            ))}
            {products.length === 0 && search && (
              <div className="py-8 text-center text-muted"><Package className="mx-auto mb-2 size-8" /><p>Produk tidak ditemukan</p></div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

function CustomerModal({ open, onClose, onSelect }: { open: boolean; onClose: () => void; onSelect: (customer: PosCustomer | null) => void }) {
  const [customers, setCustomers] = useState<PosCustomer[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCustomers = useCallback(async (query: string) => {
    setLoading(true);
    try {
      const params = odata().search(query, ["Code", "Name", "Phone"]).include(["CustomerGroup"]).where({ IsActive: true }).take(20).toParams();
      const res = await api.get<PosCustomer[]>("customer", params, { skipCache: true });
      setCustomers(arr<PosCustomer>(res.data));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal memuat pelanggan");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (open) void fetchCustomers(""); }, [open, fetchCustomers]);

  return (
    <Modal open={open} onClose={onClose} title="Pilih Pelanggan" size="md">
      <div className="space-y-4">
        <Input placeholder="Cari pelanggan..." leftIcon={Search} onChange={(e) => void fetchCustomers(e.target.value)} />
        <div className="max-h-[300px] space-y-1 overflow-y-auto">
          <button
            onClick={() => { onSelect(null); onClose(); }}
            className="flex w-full items-center gap-3 rounded-lg border border-dashed border-default p-3 text-left transition-colors hover:border-primary hover:bg-primary/5"
          >
            <div className="flex size-10 items-center justify-center rounded-full bg-elevated"><User className="size-5 text-muted" /></div>
            <div>
              <p className="text-sm font-medium text-highlighted">Umum</p>
              <p className="text-xs text-muted">Pelanggan tidak dikenal (walk-in)</p>
            </div>
          </button>
          {loading && <LoadingState text="Memuat item..." className="py-3" />}
          {customers.map((c) => (
            <button
              key={c.ID}
              onClick={() => { onSelect(c); onClose(); }}
              className="flex w-full items-center gap-3 rounded-lg border border-transparent p-3 text-left transition-colors hover:border-default hover:bg-elevated"
            >
              <div className="flex size-10 items-center justify-center rounded-full bg-primary/10"><User className="size-5 text-primary" /></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-highlighted">{c.Name}</p>
                <p className="text-xs text-muted">{c.Phone || c.Code}</p>
              </div>
              {c.CustomerGroup && (
                <Badge variant="info">
                  {c.CustomerGroup.Name}{num(c.CustomerGroup.DiscountPercent) > 0 ? ` -${num(c.CustomerGroup.DiscountPercent)}%` : ""}
                </Badge>
              )}
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}

function PaymentModal({
  open, onClose, onPay, total, methods, saving, error,
}: {
  open: boolean;
  onClose: () => void;
  onPay: (methodId: number, paidAmount: number) => void;
  total: number;
  methods: PaymentMethodRow[];
  saving: boolean;
  error: string;
}) {
  const [methodId, setMethodId] = useState<number | null>(null);
  const [paid, setPaid] = useState(total);

  useEffect(() => { if (open) setPaid(total); }, [open, total]);
  useEffect(() => {
    if (open && methodId == null && methods.length) setMethodId((methods.find((m) => m.Code === "CASH") ?? methods[0]).ID);
  }, [open, methodId, methods]);

  const method = methods.find((m) => m.ID === methodId);
  const isCash = method?.Code === "CASH";
  const change = Math.max(0, r2(paid - total));
  const remaining = Math.max(0, r2(total - paid));

  return (
    <Modal
      open={open} onClose={onClose} title="Pembayaran" size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={saving}>Batal</Button>
          <Button variant="success" icon={Check} loading={saving} disabled={!methodId || saving || paid < 0} onClick={() => methodId && onPay(methodId, paid)}>
            {remaining > 0 ? `Simpan (sisa piutang ${formatCurrency(remaining)})` : `Bayar ${formatCurrency(total)}`}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="rounded-xl bg-primary/5 p-5 text-center">
          <p className="text-sm text-muted">Total Bayar</p>
          <p className="text-4xl font-bold text-primary">{formatCurrency(total)}</p>
        </div>

        {error && (
          <div className="flex gap-2 rounded-lg border border-danger/40 bg-danger/10 p-3 text-sm text-danger">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" /> <span>{error}</span>
          </div>
        )}

        <div>
          <label className="mb-2 block text-sm font-medium text-highlighted">Metode Pembayaran</label>
          {methods.length === 0 ? (
            <p className="text-sm text-danger">Belum ada metode pembayaran aktif. Tambahkan di master Metode Pembayaran.</p>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {methods.map((m) => {
                const Icon = METHOD_ICONS[m.Code] ?? CreditCard;
                return (
                  <button
                    key={m.ID}
                    onClick={() => { setMethodId(m.ID); if (m.Code !== "CASH") setPaid(total); }}
                    className={cn("flex flex-col items-center gap-1 rounded-lg border p-3 transition-colors", methodId === m.ID ? "border-primary bg-primary/10 text-primary" : "border-default hover:border-primary/50")}
                  >
                    <Icon className="size-5" />
                    <span className="text-center text-xs">{m.Name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <Input
            label={isCash ? "Jumlah Uang Diterima" : "Jumlah Dibayar"} type="number" value={paid}
            onChange={(e) => setPaid(num(e.target.value))} leftIcon={Banknote}
          />
          {isCash && change > 0 && (
            <div className="rounded-lg bg-success/10 p-3 text-center">
              <p className="text-sm text-muted">Kembalian</p>
              <p className="text-xl font-bold text-success">{formatCurrency(change)}</p>
            </div>
          )}
          {!isCash && paid > total && <p className="text-xs text-danger">Pembayaran non-tunai melebihi total; kelebihan akan tercatat sebagai kembalian.</p>}
          {remaining > 0 && (
            <div className="rounded-lg bg-warning/10 p-3 text-center text-sm">
              Sisa <b>{formatCurrency(remaining)}</b> dicatat sebagai piutang pelanggan (dibatasi limit piutang pelanggan).
            </div>
          )}
          <div className="grid grid-cols-5 gap-2">
            <button onClick={() => setPaid(total)} className="rounded-lg border border-default bg-elevated py-2 text-xs font-medium transition-colors hover:border-primary hover:bg-primary/5">Uang pas</button>
            {isCash && [50000, 100000, 200000, 500000].map((v) => (
              <button key={v} onClick={() => setPaid((c) => c + v)} className="rounded-lg border border-default bg-elevated py-2 text-xs font-medium transition-colors hover:border-primary hover:bg-primary/5">
                +{formatCurrency(v)}
              </button>
            ))}
            <button onClick={() => setPaid(0)} className="rounded-lg border border-default bg-elevated py-2 text-xs font-medium transition-colors hover:border-primary hover:bg-primary/5">Kredit penuh</button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

// ─── Main POS Page ─────────────────────────────────────────

export default function POSPage() {
  const [cart, setCart] = useState<PosLine[]>([]);
  const [customer, setCustomer] = useState<PosCustomer | null>(null);
  const [walkInId, setWalkInId] = useState<number | null>(null);
  const [levelOverride, setLevelOverride] = useState<PriceLevel | null>(null);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [taxPercent, setTaxPercent] = useState(0);
  const [notes, setNotes] = useState("");
  const [voucherCode, setVoucherCode] = useState("");
  const [voucher, setVoucher] = useState<VoucherRow | null>(null);
  const [checkingVoucher, setCheckingVoucher] = useState(false);
  const [warehouses, setWarehouses] = useState<WarehouseRow[]>([]);
  const [warehouseId, setWarehouseId] = useState<number | null>(null);
  const [stock, setStock] = useState<Record<number, number>>({}); // productId -> base qty in warehouse
  const [methods, setMethods] = useState<PaymentMethodRow[]>([]);
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [showCustomer, setShowCustomer] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [saving, setSaving] = useState(false);
  const [payError, setPayError] = useState("");
  const [result, setResult] = useState<SaleResult | null>(null);

  const groupLevel = levelFromGroup(customer?.CustomerGroup);
  const level: PriceLevel = levelOverride ?? groupLevel;

  // Lookups: payment methods, warehouses (default first), walk-in customer.
  useEffect(() => {
    api.get<PaymentMethodRow[]>("payment-methods", undefined, { skipCache: true })
      .then((r) => setMethods(arr<PaymentMethodRow>(r.data).filter((m) => m.IsActive !== false)))
      .catch((e) => toast.error(`Gagal memuat metode pembayaran: ${e instanceof Error ? e.message : e}`));
    api.get<WarehouseRow[]>("warehouse", { $take: 100, $orderBy: { ID: "asc" } }, { skipCache: true })
      .then((r) => {
        const list = arr<WarehouseRow>(r.data).filter((w) => w.IsActive !== false);
        setWarehouses(list);
        const def = list.find((w) => w.IsDefault) ?? list[0];
        if (def) setWarehouseId(def.ID);
      })
      .catch((e) => toast.error(`Gagal memuat gudang: ${e instanceof Error ? e.message : e}`));
    api.get<PosCustomer[]>("customer", { $where: { Code: "UMUM" }, $take: 1 }, { skipCache: true })
      .then((r) => setWalkInId(arr<PosCustomer>(r.data)[0]?.ID ?? null))
      .catch(() => setWalkInId(null));
  }, []);

  // Stock of the products in the cart for the selected warehouse.
  const productIds = useMemo(() => Array.from(new Set(cart.map((l) => l.product.ID))).sort((a, b) => a - b), [cart]);
  const productIdsKey = productIds.join(",");
  useEffect(() => {
    if (!warehouseId || productIds.length === 0) return;
    let alive = true;
    api.get<{ ProductID: number; Quantity: string | number }[]>(
      "product-stock",
      { $where: { WarehouseID: warehouseId, ProductID: { in: productIds } }, $take: 100 },
      { skipCache: true },
    )
      .then((r) => {
        if (!alive) return;
        const map: Record<number, number> = {};
        for (const id of productIds) map[id] = 0;
        for (const s of arr<{ ProductID: number; Quantity: string | number }>(r.data)) map[s.ProductID] = num(s.Quantity);
        setStock(map);
      })
      .catch(() => alive && setStock({}));
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [warehouseId, productIdsKey]);

  // Customer change: apply group discount + re-price every line for the new level.
  const selectCustomer = (c: PosCustomer | null) => {
    setCustomer(c);
    setLevelOverride(null);
    setDiscountPercent(num(c?.CustomerGroup?.DiscountPercent));
    const lv = levelFromGroup(c?.CustomerGroup);
    setCart((prev) => prev.map((l) => reprice(l, lv)));
  };

  const changeLevel = (lv: PriceLevel | null) => {
    setLevelOverride(lv);
    const eff = lv ?? groupLevel;
    setCart((prev) => prev.map((l) => reprice(l, eff)));
  };

  const addToCart = useCallback(async (product: Product) => {
    try {
      const [units, prices] = await Promise.all([fetchProductUnits(product.ID), fetchProductPrices(product.ID)]);
      const sellable = units.filter((u) => u.isSell);
      const unitList: ProductUnitInfo[] = sellable.length
        ? sellable
        : [{ unitId: product.UnitID, unitName: product.Unit?.Name, conversion: 1, isBase: true, isSell: true, isPurchase: true }];
      const baseUnit = unitList.find((u) => u.isBase) ?? unitList.find((u) => u.unitId === product.UnitID) ?? unitList[0];
      setCart((prev) => {
        const key = `${product.ID}-${baseUnit.unitId}`;
        const existing = prev.find((l) => l.key === key);
        if (existing) return prev.map((l) => (l.key === key ? reprice({ ...l, quantity: l.quantity + 1 }, level) : l));
        const line: PosLine = {
          key, product, units: unitList, prices, unitId: baseUnit.unitId, quantity: 1,
          unitPrice: 0, priceSource: "", discountPercent: num(product.DiscountPercent),
        };
        return [...prev, reprice(line, level)];
      });
    } catch (e) {
      toast.error(`Gagal memuat satuan/harga ${product.Name}: ${e instanceof Error ? e.message : e}`);
    }
  }, [level]);

  const updateQty = (key: string, qty: number) => {
    if (qty <= 0) { setCart((prev) => prev.filter((l) => l.key !== key)); return; }
    setCart((prev) => prev.map((l) => (l.key === key ? reprice({ ...l, quantity: qty }, level) : l)));
  };

  const changeUnit = (key: string, unitId: number) => {
    setCart((prev) => {
      const line = prev.find((l) => l.key === key);
      if (!line) return prev;
      const newKey = `${line.product.ID}-${unitId}`;
      const other = prev.find((l) => l.key === newKey);
      if (other) {
        // Merge into the existing line with that unit.
        return prev
          .filter((l) => l.key !== key)
          .map((l) => (l.key === newKey ? reprice({ ...l, quantity: l.quantity + line.quantity }, level) : l));
      }
      return prev.map((l) => (l.key === key ? reprice({ ...l, key: newKey, unitId }, level) : l));
    });
  };

  const removeItem = (key: string) => setCart((prev) => prev.filter((l) => l.key !== key));

  // Keyboard: F1 = cari produk
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "F1") { e.preventDefault(); setShowProductSearch(true); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // ─── Totals (mirror of SaleService.create; the server recomputes and is final) ──
  const subtotal = r2(cart.reduce((s, l) => s + lineSubtotal(l), 0));
  const invoiceDiscount = r2(subtotal * (Math.min(Math.max(discountPercent, 0), 100) / 100));
  const voucherEst = estimateVoucher(voucher, Math.max(subtotal - invoiceDiscount, 0));
  const afterDiscount = Math.max(r2(subtotal - invoiceDiscount - voucherEst.discount), 0);
  const tax = r2(afterDiscount * (Math.max(taxPercent, 0) / 100));
  const total = r2(afterDiscount + tax);

  // Base-unit quantity per product vs warehouse stock (server enforces; this is a warning).
  const shortages = useMemo(() => {
    const need: Record<number, number> = {};
    for (const l of cart) need[l.product.ID] = (need[l.product.ID] ?? 0) + l.quantity * lineConversion(l);
    return cart
      .filter((l, i, a) => a.findIndex((x) => x.product.ID === l.product.ID) === i)
      .filter((l) => stock[l.product.ID] !== undefined && need[l.product.ID] > stock[l.product.ID])
      .map((l) => `${l.product.Name} (butuh ${need[l.product.ID]}, stok ${stock[l.product.ID]})`);
  }, [cart, stock]);

  const applyVoucher = async () => {
    const code = voucherCode.trim();
    if (!code) return;
    setCheckingVoucher(true);
    try {
      const r = await api.get<VoucherRow[]>("vouchers", { $where: { Code: code }, $include: "Type", $take: 1 }, { skipCache: true });
      const v = arr<VoucherRow>(r.data)[0];
      if (!v) { toast.error(`Voucher "${code}" tidak ditemukan`); setVoucher(null); return; }
      if (v.IsActive === false) { toast.error(`Voucher ${v.Code} tidak aktif`); setVoucher(null); return; }
      setVoucher(v);
      toast.success(`Voucher ${v.Code} dipakai — divalidasi ulang oleh server saat pembayaran`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal memeriksa voucher");
    } finally {
      setCheckingVoucher(false);
    }
  };

  const resetSale = () => {
    setCart([]); setNotes(""); setVoucher(null); setVoucherCode(""); setPayError("");
    setCustomer(null); setLevelOverride(null); setDiscountPercent(0); setTaxPercent(0); setStock({});
  };

  const handlePayment = async (methodId: number, paidAmount: number) => {
    if (cart.length === 0) return;
    const customerId = customer?.ID ?? walkInId;
    if (!customerId) { setPayError("Pelanggan umum (kode UMUM) tidak ditemukan. Pilih pelanggan terlebih dahulu."); return; }
    if (!warehouseId) { setPayError("Pilih gudang terlebih dahulu."); return; }
    setSaving(true);
    setPayError("");
    try {
      const res = await api.post<SaleResult>("sales", {
        CustomerID: customerId,
        WarehouseID: warehouseId,
        PaymentMethodID: methodId,
        // The API applies DiscountAmount (rupiah); DiscountPercent is stored for reference.
        DiscountPercent: discountPercent,
        DiscountAmount: invoiceDiscount,
        TaxPercent: taxPercent,
        CashAmount: r2(paidAmount),
        ...(voucher ? { VoucherID: voucher.ID } : {}),
        Notes: notes || undefined,
        Items: cart.map((l) => ({
          ProductID: l.product.ID,
          UnitID: l.unitId,
          Quantity: l.quantity,
          UnitPrice: l.unitPrice,
          DiscountPercent: l.discountPercent,
          DiscountAmount: lineDiscount(l),
        })),
      });
      if (!res.success || !res.data) throw new Error(res.message || "Gagal menyimpan penjualan");
      setResult(res.data);
      setShowPayment(false);
      resetSale();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Gagal menyimpan penjualan";
      setPayError(/stok/i.test(msg) ? `Stok tidak cukup: ${msg}` : msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const printResult = (s: SaleResult) => {
    printDocument({
      title: "Struk Penjualan",
      code: s.Code,
      date: new Date(s.Date).toLocaleString("id-ID"),
      partnerLabel: "Pelanggan",
      partner: s.Customer?.Name ?? "-",
      warehouse: s.Warehouse?.Name,
      rows: (s.SaleItems ?? []).map((it) => ({
        code: it.Product?.Code ?? "", name: it.Product?.Name ?? "", qty: String(num(it.Quantity)), unit: it.Unit?.Name ?? "",
        price: num(it.UnitPrice), disc: num(it.DiscountAmount), subtotal: num(it.Subtotal),
      })),
      totals: [
        { label: "Subtotal", value: num(s.Subtotal) },
        { label: "Diskon", value: num(s.DiscountAmount) },
        ...(num(s.VoucherDiscount) > 0 ? [{ label: "Voucher", value: num(s.VoucherDiscount) }] : []),
        { label: "Pajak", value: num(s.TaxAmount) },
        { label: "Total", value: num(s.Total) },
        { label: "Dibayar", value: num(s.CashAmount) },
        { label: "Kembalian", value: num(s.ChangeAmount) },
      ],
    });
  };

  const selectedWarehouse = warehouses.find((w) => w.ID === warehouseId);

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {/* Left: cart */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="mb-4 flex items-center gap-3">
          <button
            onClick={() => setShowProductSearch(true)}
            className="flex flex-1 items-center gap-3 rounded-xl border-2 border-dashed border-default bg-elevated p-4 text-left transition-colors hover:border-primary/50"
          >
            <Search className="size-6 text-muted" />
            <div>
              <p className="font-medium text-highlighted">Cari produk...</p>
              <p className="text-xs text-muted">Tekan F1 atau klik untuk mencari</p>
            </div>
            <kbd className="ml-auto rounded bg-elevated px-2 py-1 text-xs text-muted">F1</kbd>
          </button>

          <label className="flex h-14 items-center gap-2 rounded-xl border border-default bg-elevated px-3" title="Gudang pengeluaran stok">
            <WarehouseIcon className="size-5 text-muted" />
            <select
              value={warehouseId ?? ""}
              onChange={(e) => setWarehouseId(e.target.value ? Number(e.target.value) : null)}
              className="bg-transparent text-sm font-medium outline-none"
            >
              {warehouses.length === 0 && <option value="">Tidak ada gudang</option>}
              {warehouses.map((w) => <option key={w.ID} value={w.ID}>{w.Name}{w.IsDefault ? " (default)" : ""}</option>)}
            </select>
          </label>

          <button
            onClick={() => setShowCustomer(true)}
            className="flex h-14 items-center gap-2 rounded-xl border border-default bg-elevated px-4 transition-colors hover:border-primary/50"
          >
            <User className="size-5 text-muted" />
            <span className="text-left text-sm font-medium">
              {customer?.Name || "Pelanggan Umum"}
              {customer?.CustomerGroup && <span className="block text-xs font-normal text-muted">{customer.CustomerGroup.Name}</span>}
            </span>
          </button>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-default py-12">
              <ShoppingCart className="mb-3 size-12 text-muted" />
              <p className="mb-1 font-medium text-muted">Keranjang kosong</p>
              <p className="text-sm text-muted">Cari dan tambahkan produk</p>
            </div>
          ) : (
            cart.map((line) => (
              <CartItemRow
                key={line.key}
                line={line}
                stock={stock[line.product.ID]}
                onUpdateQty={(qty) => updateQty(line.key, qty)}
                onChangeUnit={(u) => changeUnit(line.key, u)}
                onRemove={() => removeItem(line.key)}
              />
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-default bg-elevated px-3 py-2">
              <Percent className="size-4 text-muted" />
              <input
                type="number" min={0} max={100} value={discountPercent}
                onChange={(e) => setDiscountPercent(Math.min(100, Math.max(0, num(e.target.value))))}
                className="w-16 bg-transparent text-sm font-medium outline-none"
              />
              <span className="text-xs text-muted">% Diskon{num(customer?.CustomerGroup?.DiscountPercent) > 0 ? " (grup)" : ""}</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-default bg-elevated px-3 py-2">
              <Percent className="size-4 text-muted" />
              <input
                type="number" min={0} max={100} value={taxPercent}
                onChange={(e) => setTaxPercent(Math.min(100, Math.max(0, num(e.target.value))))}
                className="w-16 bg-transparent text-sm font-medium outline-none"
              />
              <span className="text-xs text-muted">% PPN</span>
            </div>
            <label className="flex items-center gap-2 rounded-lg border border-default bg-elevated px-3 py-2" title="Level harga jual (default dari grup pelanggan)">
              <span className="text-xs text-muted">Level Harga</span>
              <select
                value={levelOverride ?? ""}
                onChange={(e) => changeLevel(e.target.value ? (Number(e.target.value) as PriceLevel) : null)}
                className="flex-1 bg-transparent text-sm font-medium outline-none"
              >
                <option value="">Otomatis (Level {groupLevel})</option>
                {[1, 2, 3, 4].map((l) => <option key={l} value={l}>Level {l}</option>)}
              </select>
            </label>
          </div>
        )}
      </div>

      {/* Right: summary */}
      <div className="w-80 shrink-0 space-y-4 overflow-y-auto">
        <div className="rounded-xl border border-default bg-elevated p-5">
          <h3 className="mb-4 text-sm font-semibold text-highlighted">Ringkasan</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted">Item</span><span className="font-medium">{cart.reduce((s, l) => s + l.quantity, 0)}</span></div>
            <div className="flex justify-between"><span className="text-muted">Subtotal</span><span className="font-medium">{formatCurrency(subtotal)}</span></div>
            {invoiceDiscount > 0 && (
              <div className="flex justify-between text-success"><span>Diskon {discountPercent}%</span><span>-{formatCurrency(invoiceDiscount)}</span></div>
            )}
            {voucher && (
              <div className="flex justify-between text-success">
                <span>Voucher {voucher.Code} <span className="text-xs text-muted">(perkiraan)</span></span>
                <span>-{formatCurrency(voucherEst.discount)}</span>
              </div>
            )}
            {tax > 0 && <div className="flex justify-between"><span className="text-muted">PPN</span><span>{formatCurrency(tax)}</span></div>}
            <div className="border-t border-default pt-3">
              <div className="flex justify-between">
                <span className="font-semibold text-highlighted">TOTAL</span>
                <span className="text-xl font-bold text-primary">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Voucher */}
        <div className="rounded-xl border border-default bg-elevated p-3">
          {voucher ? (
            <div className="flex items-center gap-2 text-sm">
              <Ticket className="size-4 text-primary" />
              <div className="flex-1">
                <p className="font-medium">{voucher.Code} — {voucher.Name}</p>
                {voucherEst.problem && <p className="text-xs text-danger">{voucherEst.problem}</p>}
              </div>
              <button onClick={() => { setVoucher(null); setVoucherCode(""); }} title="Lepas voucher" className="text-muted hover:text-danger"><X className="size-4" /></button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                value={voucherCode} onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => { if (e.key === "Enter") void applyVoucher(); }}
                placeholder="Kode voucher"
                className="h-9 flex-1 rounded-md border border-default bg-transparent px-3 text-sm outline-none focus:border-primary"
              />
              <Button size="sm" variant="outline" icon={Ticket} loading={checkingVoucher} disabled={!voucherCode.trim()} onClick={() => void applyVoucher()}>Pakai</Button>
            </div>
          )}
        </div>

        {shortages.length > 0 && (
          <div className="rounded-lg border border-danger/40 bg-danger/10 p-3 text-xs text-danger">
            <p className="mb-1 font-semibold">Stok di {selectedWarehouse?.Name ?? "gudang"} tidak cukup:</p>
            <ul className="list-disc pl-4">{shortages.map((s) => <li key={s}>{s}</li>)}</ul>
            <p className="mt-1">Transaksi akan ditolak server.</p>
          </div>
        )}

        <Button
          variant="success" size="lg" className="w-full justify-center text-base" icon={Banknote}
          onClick={() => { setPayError(""); setShowPayment(true); }}
          disabled={cart.length === 0 || !warehouseId}
        >
          Bayar
        </Button>

        <textarea
          value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Catatan transaksi..." maxLength={1000}
          className="w-full resize-none rounded-lg border border-default bg-elevated p-3 text-sm text-highlighted placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          rows={3}
        />
      </div>

      <ProductSearchModal open={showProductSearch} onClose={() => setShowProductSearch(false)} onSelect={(p) => void addToCart(p)} />
      <CustomerModal open={showCustomer} onClose={() => setShowCustomer(false)} onSelect={selectCustomer} />
      <PaymentModal
        open={showPayment} onClose={() => setShowPayment(false)} onPay={handlePayment}
        total={total} methods={methods} saving={saving} error={payError}
      />

      {/* Result from the server (final totals incl. voucher) */}
      <Modal
        open={!!result} onClose={() => setResult(null)} title="Transaksi Berhasil" size="sm"
        footer={
          <>
            <Button variant="outline" icon={Printer} onClick={() => result && printResult(result)}>Cetak Struk</Button>
            <Button onClick={() => setResult(null)}>Transaksi Baru</Button>
          </>
        }
      >
        {result && (
          <div className="space-y-2 text-sm">
            <p className="text-center font-mono text-base font-semibold">{result.Code}</p>
            <div className="flex justify-between"><span className="text-muted">Subtotal</span><span>{formatCurrency(result.Subtotal)}</span></div>
            {num(result.DiscountAmount) > 0 && <div className="flex justify-between"><span className="text-muted">Diskon</span><span>-{formatCurrency(result.DiscountAmount)}</span></div>}
            {num(result.VoucherDiscount) > 0 && <div className="flex justify-between"><span className="text-muted">Voucher</span><span>-{formatCurrency(result.VoucherDiscount)}</span></div>}
            {num(result.TaxAmount) > 0 && <div className="flex justify-between"><span className="text-muted">PPN</span><span>{formatCurrency(result.TaxAmount)}</span></div>}
            <div className="flex justify-between border-t border-default pt-2 font-semibold"><span>Total</span><span>{formatCurrency(result.Total)}</span></div>
            <div className="flex justify-between"><span className="text-muted">Dibayar</span><span>{formatCurrency(result.CashAmount)}</span></div>
            {num(result.ChangeAmount) > 0 && <div className="flex justify-between text-success"><span>Kembalian</span><span className="font-bold">{formatCurrency(result.ChangeAmount)}</span></div>}
            {num(result.CashAmount) < num(result.Total) && (
              <div className="flex justify-between text-warning"><span>Sisa piutang</span><span>{formatCurrency(num(result.Total) - num(result.CashAmount))}</span></div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
