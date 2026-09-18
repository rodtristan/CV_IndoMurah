"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Search,
  X,
  User,
  Percent,
  CreditCard,
  Banknote,
  QrCode,
  Check,
  Package,
  ArrowLeftRight,
  Save,
  Printer,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/StatCard";
import { api, odata } from "@/lib/api-client";
import { formatCurrency, cn } from "@/lib/utils";
import type { Product, Customer, CartItem, PaymentMethod } from "@/lib/types";

// ─── Types ──────────────────────────────────────────────────

interface POSState {
  cart: CartItem[];
  customer: Customer | null;
  discountPercent: number;
  discountAmount: number;
  taxPercent: number;
  paymentMethod: PaymentMethod;
  cashAmount: number;
  notes: string;
}

// ─── Helpers ────────────────────────────────────────────────

function calcSubtotal(cart: CartItem[]): number {
  return cart.reduce((sum, item) => sum + item.subtotal, 0);
}

function calcDiscount(subtotal: number, discPct: number, discAmt: number): number {
  return subtotal * (discPct / 100) + discAmt;
}

function calcTax(subtotal: number, discount: number, taxPct: number): number {
  return (subtotal - discount) * (taxPct / 100);
}

function calcTotal(subtotal: number, discount: number, tax: number): number {
  return subtotal - discount + tax;
}

// ─── Components ─────────────────────────────────────────────

function CartItemRow({
  item,
  onUpdateQty,
  onRemove,
}: {
  item: CartItem;
  onUpdateQty: (qty: number) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-default p-3 transition-colors hover:border-primary/30">
      <div className="flex size-10 items-center justify-center rounded-lg bg-elevated">
        <Package className="size-5 text-muted" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-highlighted">{item.product.Name}</p>
        <p className="text-xs text-muted">{formatCurrency(item.unitPrice)} x {item.quantity}</p>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onUpdateQty(item.quantity - 1)}
          className="flex size-7 items-center justify-center rounded-md border border-default text-muted transition-colors hover:border-primary hover:text-primary"
        >
          <Minus className="size-3" />
        </button>
        <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
        <button
          onClick={() => onUpdateQty(item.quantity + 1)}
          className="flex size-7 items-center justify-center rounded-md border border-default text-muted transition-colors hover:border-primary hover:text-primary"
        >
          <Plus className="size-3" />
        </button>
      </div>
      <div className="min-w-[80px] text-right">
        <p className="text-sm font-semibold text-highlighted">{formatCurrency(item.subtotal)}</p>
        {item.discountPercent > 0 && (
          <p className="text-xs text-success">-{item.discountPercent}%</p>
        )}
      </div>
      <button
        onClick={onRemove}
        className="flex size-7 items-center justify-center rounded-md text-muted transition-colors hover:text-danger"
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}

function ProductSearchModal({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (product: Product) => void;
}) {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      fetchProducts("");
    }
  }, [open]);

  const fetchProducts = useCallback(async (query: string) => {
    setLoading(true);
    try {
      const params = odata()
        .search(query, ["code", "barcode", "name"])
        .include(["category", "unit"])
        .take(20)
        .toParams();

      const res = await api.get<Product[]>("products", params);
      if (res.success && res.data) {
        setProducts(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedSearch = useCallback(
    (() => {
      let timeout: NodeJS.Timeout;
      return (q: string) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => fetchProducts(q), 300);
        setSearch(q);
      };
    })(),
    [fetchProducts]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      setSelectedIndex((i) => Math.min(i + 1, products.length - 1));
    } else if (e.key === "ArrowUp") {
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && products[selectedIndex]) {
      onSelect(products[selectedIndex]);
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Cari Produk" size="lg">
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Ketik nama, kode, atau barcode produk..."
            value={search}
            onChange={(e) => debouncedSearch(e.target.value)}
            onKeyDown={handleKeyDown}
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
                onClick={() => {
                  onSelect(product);
                  onClose();
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors",
                  i === selectedIndex
                    ? "border-primary bg-primary/5"
                    : "border-transparent hover:border-default hover:bg-elevated"
                )}
              >
                <div className="flex size-10 items-center justify-center rounded-lg bg-elevated">
                  <Package className="size-5 text-muted" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-highlighted">{product.Name}</p>
                  <p className="text-xs text-muted">
                    {product.Code} {product.Barcode ? `| ${product.Barcode}` : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-primary">{formatCurrency(product.SellingPrice)}</p>
                  <p className="text-xs text-muted">Stock: {Number(product.Stock)}</p>
                </div>
              </button>
            ))}
            {products.length === 0 && search && (
              <div className="py-8 text-center text-muted">
                <Package className="mx-auto mb-2 size-8" />
                <p>Produk tidak ditemukan</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

function CustomerModal({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (customer: Customer) => void;
}) {
  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) fetchCustomers("");
  }, [open]);

  const fetchCustomers = async (query: string) => {
    setLoading(true);
    try {
      const params = odata().search(query, ["Code", "Name", "Phone"]).include(["CustomerGroup"]).take(20).toParams();
      const res = await api.get<Customer[]>("customer", params);
      if (res.success && res.data) setCustomers(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Pilih Pelanggan" size="md">
      <div className="space-y-4">
        <Input
          placeholder="Cari pelanggan..."
          leftIcon={Search}
          onChange={(e) => {
            setSearch(e.target.value);
            fetchCustomers(e.target.value);
          }}
        />
        <div className="max-h-[300px] space-y-1 overflow-y-auto">
          <button
            onClick={() => {
              onSelect(null as unknown as Customer);
              onClose();
            }}
            className="flex w-full items-center gap-3 rounded-lg border border-dashed border-default p-3 text-left transition-colors hover:border-primary hover:bg-primary/5"
          >
            <div className="flex size-10 items-center justify-center rounded-full bg-elevated">
              <User className="size-5 text-muted" />
            </div>
            <div>
              <p className="text-sm font-medium text-highlighted">Umum</p>
              <p className="text-xs text-muted">Pelanggan tidak dikenal</p>
            </div>
          </button>
          {customers.map((c) => (
            <button
              key={c.ID}
              onClick={() => {
                onSelect(c);
                onClose();
              }}
              className="flex w-full items-center gap-3 rounded-lg border border-transparent p-3 text-left transition-colors hover:border-default hover:bg-elevated"
            >
              <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                <User className="size-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-highlighted">{c.Name}</p>
                <p className="text-xs text-muted">{c.Phone || c.Code}</p>
              </div>
              <Badge variant="info">{c.CustomerGroup?.Name}</Badge>
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}

function PaymentModal({
  open,
  onClose,
  onPay,
  total,
}: {
  open: boolean;
  onClose: () => void;
  onPay: (method: PaymentMethod, cashAmount: number) => void;
  total: number;
}) {
  const [method, setMethod] = useState<PaymentMethod>("CASH");
  const [cash, setCash] = useState(total);

  useEffect(() => {
    setCash(total);
  }, [total]);

  const change = Math.max(0, cash - total);

  const methods: { value: PaymentMethod; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { value: "CASH", label: "Tunai", icon: Banknote },
    { value: "TRANSFER", label: "Transfer", icon: ArrowLeftRight },
    { value: "DEBIT", label: "Debit", icon: CreditCard },
    { value: "QRIS", label: "QRIS", icon: QrCode },
    { value: "CREDIT", label: "Kredit", icon: CreditCard },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Pembayaran"
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button
            variant="success"
            icon={Check}
            onClick={() => onPay(method, cash)}
          >
            Bayar {formatCurrency(total)}
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <div className="rounded-xl bg-primary/5 p-6 text-center">
          <p className="text-sm text-muted">Total Bayar</p>
          <p className="text-4xl font-bold text-primary">{formatCurrency(total)}</p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-highlighted">Metode Pembayaran</label>
          <div className="grid grid-cols-5 gap-2">
            {methods.map((m) => (
              <button
                key={m.value}
                onClick={() => setMethod(m.value)}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-lg border p-3 transition-colors",
                  method === m.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-default hover:border-primary/50"
                )}
              >
                <m.icon className="size-5" />
                <span className="text-xs">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {method === "CASH" && (
          <div className="space-y-3">
            <Input
              label="Jumlah Uang"
              type="number"
              value={cash}
              onChange={(e) => setCash(Number(e.target.value))}
              leftIcon={Banknote}
            />
            {cash >= total && (
              <div className="rounded-lg bg-success/10 p-3 text-center">
                <p className="text-sm text-muted">Kembalian</p>
                <p className="text-xl font-bold text-success">{formatCurrency(change)}</p>
              </div>
            )}
            <div className="grid grid-cols-4 gap-2">
              {[50000, 100000, 200000, 500000].map((v) => (
                <button
                  key={v}
                  onClick={() => setCash((c) => c + v)}
                  className="rounded-lg border border-default bg-elevated py-2 text-sm font-medium transition-colors hover:bg-primary/5 hover:border-primary"
                >
                  +{formatCurrency(v)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

// ─── Main POS Page ─────────────────────────────────────────

export default function POSPage() {
  const [state, setState] = useState<POSState>({
    cart: [],
    customer: null,
    discountPercent: 0,
    discountAmount: 0,
    taxPercent: 0,
    paymentMethod: "CASH",
    cashAmount: 0,
    notes: "",
  });
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [showCustomer, setShowCustomer] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [saving, setSaving] = useState(false);

  const addToCart = useCallback((product: Product) => {
    setState((prev) => {
      const existing = prev.cart.find((item) => item.productId === product.ID);
      if (existing) {
        return {
          ...prev,
          cart: prev.cart.map((item) =>
            item.productId === product.ID
              ? {
                  ...item,
                  quantity: item.quantity + 1,
                  subtotal: (item.quantity + 1) * item.unitPrice * (1 - item.discountPercent / 100),
                }
              : item
          ),
        };
      }
      return {
        ...prev,
        cart: [
          ...prev.cart,
          {
            productId: product.ID,
            product,
            quantity: 1,
            unitPrice: Number(product.SellingPrice),
            discountPercent: Number(product.DiscountPercent),
            discountAmount: 0,
            subtotal: Number(product.SellingPrice),
          },
        ],
      };
    });
  }, []);

  const updateQty = useCallback((productId: number, qty: number) => {
    if (qty <= 0) {
      setState((prev) => ({ ...prev, cart: prev.cart.filter((i) => i.productId !== productId) }));
    } else {
      setState((prev) => ({
        ...prev,
        cart: prev.cart.map((item) =>
          item.productId === productId
            ? {
                ...item,
                quantity: qty,
                subtotal: qty * item.unitPrice * (1 - item.discountPercent / 100),
              }
            : item
        ),
      }));
    }
  }, []);

  const removeItem = useCallback((productId: number) => {
    setState((prev) => ({ ...prev, cart: prev.cart.filter((i) => i.productId !== productId) }));
  }, []);

  const subtotal = calcSubtotal(state.cart);
  const discount = calcDiscount(subtotal, state.discountPercent, state.discountAmount);
  const tax = calcTax(subtotal, discount, state.taxPercent);
  const total = calcTotal(subtotal, discount, tax);

  const handlePayment = async (method: PaymentMethod, cashAmount: number) => {
    if (state.cart.length === 0) return;
    setSaving(true);
    try {
      const res = await api.post("sales", {
        // CustomerID is required by CreateSaleDto; fall back to the seeded
        // "Pelanggan Umum" walk-in customer (id=1, see prisma/seed.ts) when
        // the cashier didn't pick one.
        CustomerID: state.customer?.ID || 1,
        DiscountPercent: state.discountPercent,
        DiscountAmount: state.discountAmount,
        TaxPercent: state.taxPercent,
        // NOTE: CreateSaleDto has no "paymentMethod" field (only the numeric
        // PaymentMethodID FK) — this was already true before the PascalCase
        // rename, so the selected `method` string was never actually reaching
        // the backend. Sending it at all makes the whole request fail
        // class-validator's whitelist check ("property paymentMethod should
        // not exist"), which blocked sale creation entirely, so it's dropped
        // here. The backend falls back to the CASH payment method when
        // PaymentMethodID is omitted (see SaleService.create -> getCashMethodId).
        CashAmount: cashAmount,
        Notes: state.notes,
        Items: state.cart.map((item) => ({
          ProductID: item.productId,
          UnitID: item.product.UnitID,
          Quantity: item.quantity,
          UnitPrice: item.unitPrice,
          DiscountPercent: item.discountPercent,
          DiscountAmount: item.discountAmount,
        })),
      });

      if (res.success) {
        setState((prev) => ({ ...prev, cart: [], notes: "" }));
        setShowPayment(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {/* Left: Product Search */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Action Bar */}
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

          <button
            onClick={() => setShowCustomer(true)}
            className="flex h-14 items-center gap-2 rounded-xl border border-default bg-elevated px-4 transition-colors hover:border-primary/50"
          >
            <User className="size-5 text-muted" />
            <span className="text-sm font-medium">
              {state.customer?.Name || "Pilih Pelanggan"}
            </span>
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 space-y-2 overflow-y-auto">
          {state.cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-default py-12">
              <ShoppingCart className="mb-3 size-12 text-muted" />
              <p className="mb-1 font-medium text-muted">Keranjang kosong</p>
              <p className="text-sm text-muted">Cari dan tambahkan produk</p>
            </div>
          ) : (
            state.cart.map((item) => (
              <CartItemRow
                key={item.productId}
                item={item}
                onUpdateQty={(qty) => updateQty(item.productId, qty)}
                onRemove={() => removeItem(item.productId)}
              />
            ))
          )}
        </div>

        {/* Discount & Tax */}
        {state.cart.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-default bg-elevated px-3 py-2">
              <Percent className="size-4 text-muted" />
              <input
                type="number"
                min={0}
                max={100}
                value={state.discountPercent}
                onChange={(e) =>
                  setState((prev) => ({ ...prev, discountPercent: Number(e.target.value) }))
                }
                className="w-16 bg-transparent text-sm font-medium outline-none"
                placeholder="%"
              />
              <span className="text-xs text-muted">% Diskon</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-default bg-elevated px-3 py-2">
              <Percent className="size-4 text-muted" />
              <input
                type="number"
                min={0}
                max={100}
                value={state.taxPercent}
                onChange={(e) =>
                  setState((prev) => ({ ...prev, taxPercent: Number(e.target.value) }))
                }
                className="w-16 bg-transparent text-sm font-medium outline-none"
                placeholder="%"
              />
              <span className="text-xs text-muted">% PPN</span>
            </div>
          </div>
        )}
      </div>

      {/* Right: Summary Panel */}
      <div className="w-80 shrink-0 space-y-4">
        {/* Totals */}
        <div className="rounded-xl border border-default bg-elevated p-5">
          <h3 className="mb-4 text-sm font-semibold text-highlighted">Ringkasan</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Items</span>
              <span className="font-medium">{state.cart.reduce((s, i) => s + i.quantity, 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Subtotal</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-success">
                <span>Diskon</span>
                <span>-{formatCurrency(discount)}</span>
              </div>
            )}
            {tax > 0 && (
              <div className="flex justify-between">
                <span className="text-muted">PPN</span>
                <span>{formatCurrency(tax)}</span>
              </div>
            )}
            <div className="border-t border-default pt-3">
              <div className="flex justify-between">
                <span className="font-semibold text-highlighted">TOTAL</span>
                <span className="text-xl font-bold text-primary">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <Button
            variant="success"
            size="lg"
            className="w-full justify-center text-base"
            icon={Banknote}
            onClick={() => setShowPayment(true)}
            disabled={state.cart.length === 0}
          >
            Bayar
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full justify-center"
            icon={Printer}
            disabled={state.cart.length === 0}
          >
            Simpan & Cetak
          </Button>
        </div>

        {/* Notes */}
        <textarea
          value={state.notes}
          onChange={(e) => setState((prev) => ({ ...prev, notes: e.target.value }))}
          placeholder="Catatan transaksi..."
          className="w-full rounded-lg border border-default bg-elevated p-3 text-sm text-highlighted placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
          rows={3}
        />
      </div>

      {/* Modals */}
      <ProductSearchModal
        open={showProductSearch}
        onClose={() => setShowProductSearch(false)}
        onSelect={addToCart}
      />
      <CustomerModal
        open={showCustomer}
        onClose={() => setShowCustomer(false)}
        onSelect={(c) => setState((prev) => ({ ...prev, customer: c }))}
      />
      <PaymentModal
        open={showPayment}
        onClose={() => setShowPayment(false)}
        onPay={handlePayment}
        total={total}
      />
    </div>
  );
}
