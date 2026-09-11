"use client";

import { useState } from "react";
import { Search, ShoppingCart, Trash2, Plus, Minus, CreditCard, Banknote, QrCode } from "lucide-react";
import { PageWrapper, PageTitle } from "@/components/pos/layout/PosLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SearchSelect } from "@/components/pos/ui/SearchSelect";
import { cn } from "@/lib/utils";
import { mockProducts, mockCustomers } from "@/lib/mock-data-pos";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

interface CartItem {
  product: typeof mockProducts[0];
  quantity: number;
}

export default function POSPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string | number>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [discount, setDiscount] = useState(0);

  const filteredProducts = mockProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const customerOptions = mockCustomers.map((c) => ({
    value: c.id.toString(),
    label: `${c.name} - ${c.phone || "Tanpa HP"}`,
  }));

  const subtotal = cart.reduce((sum, item) => sum + item.product.sellPrice * item.quantity, 0);
  const totalDiscount = discount;
  const tax = (subtotal - totalDiscount) * 0.11;
  const total = subtotal - totalDiscount + tax;

  const addToCart = (product: typeof mockProducts[0]) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handlePayment = () => {
    alert(`Total: ${formatCurrency(total)}\nMetode: ${paymentMethod}\nPembayaran berhasil!`);
    setCart([]);
    setDiscount(0);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-4 p-4">
      {/* Product Grid */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-lg border border-default bg-bg">
        <div className="border-b border-default p-4">
          <Input
            icon={Search}
            placeholder="Cari item..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="flex flex-col items-center rounded-lg border border-default bg-elevated p-3 text-center transition-all hover:border-primary hover:bg-primary/5"
              >
                <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <ShoppingCart className="size-5" />
                </div>
                <div className="w-full truncate text-sm font-medium">{product.name}</div>
                <div className="text-xs text-muted">{product.code}</div>
                <div className="mt-1 font-semibold text-primary">{formatCurrency(product.sellPrice)}</div>
                <div className="mt-1 text-xs text-muted">Stok: {product.stock}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cart Panel */}
      <div className="flex w-96 flex-col rounded-lg border border-default bg-bg">
        {/* Customer Selection */}
        <div className="border-b border-default p-4">
          <SearchSelect
            options={[{ value: "", label: "-- Pilih Pelanggan --" }, ...customerOptions]}
            value={selectedCustomer}
            onChange={setSelectedCustomer}
            placeholder="Pilih pelanggan..."
          />
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
          {cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-muted">
              <ShoppingCart className="mb-2 size-12" />
              <p>Keranjang kosong</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.product.id} className="rounded-lg border border-default p-3">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{item.product.name}</div>
                      <div className="text-xs text-muted">{formatCurrency(item.product.sellPrice)}</div>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="ml-2 text-muted hover:text-error"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.product.id, -1)}
                        className="flex size-7 items-center justify-center rounded bg-elevated text-toned hover:bg-default"
                      >
                        <Minus className="size-3" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, 1)}
                        className="flex size-7 items-center justify-center rounded bg-elevated text-toned hover:bg-default"
                      >
                        <Plus className="size-3" />
                      </button>
                    </div>
                    <div className="text-sm font-semibold">
                      {formatCurrency(item.product.sellPrice * item.quantity)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="border-t border-default p-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">Diskon</span>
              <span className="text-error">-{formatCurrency(totalDiscount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Pajak (11%)</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between border-t border-default pt-2 text-base font-bold">
              <span>Total</span>
              <span className="text-primary">{formatCurrency(total)}</span>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { value: "cash", icon: Banknote, label: "Tunai" },
              { value: "debit", icon: CreditCard, label: "Debit" },
              { value: "qris", icon: QrCode, label: "QRIS" },
            ].map((method) => (
              <button
                key={method.value}
                onClick={() => setPaymentMethod(method.value)}
                className={cn(
                  "flex flex-col items-center rounded-lg border p-2 text-xs transition-all",
                  paymentMethod === method.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-default text-muted hover:border-primary"
                )}
              >
                <method.icon className="size-5" />
                <span className="mt-1">{method.label}</span>
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="mt-4 space-y-2">
            <Button block onClick={handlePayment} disabled={cart.length === 0}>
              Bayar {formatCurrency(total)}
            </Button>
            <Button variant="outline" block onClick={() => setCart([])} disabled={cart.length === 0}>
              Batal
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
