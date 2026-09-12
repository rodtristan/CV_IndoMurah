"use client";

import { useState } from "react";
import { Search, ShoppingCart, Trash2, Plus, Minus, CreditCard, Banknote, QrCode, ChevronDown } from "lucide-react";
import { PageWrapper } from "@/components/pos/layout/PosLayout";
import { PageTitle } from "@/components/pos/layout/PosLayout";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { mockProducts, mockCustomers, mockCategories } from "@/lib/mock-data-pos";

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

const categories = ["Semua", ...mockCategories.map(c => c.name)];

export default function POSPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showPaymentDropdown, setShowPaymentDropdown] = useState(false);

  const filteredProducts = mockProducts.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "Semua" || p.categoryName === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const subtotal = cart.reduce((sum, item) => sum + item.product.sellPrice * item.quantity, 0);
  const tax = subtotal * 0.11;
  const total = subtotal + tax;

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
            ? { ...item, quantity: Math.max(1, item.quantity + delta) }
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
  };

  const selectedCustomerObj = mockCustomers.find(c => c.id.toString() === selectedCustomer);

  return (
    <PageWrapper className="bg-gray-100 p-0!">
      <PageTitle
        title="Penjualan / POS"
        subtitle="Transaksi penjualan POS"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="border-gray-300">
              Riwayat
            </Button>
          </div>
        }
      />

      <div className="flex h-[calc(100vh-10rem)] gap-4 px-4 pb-4">
        {/* Left Panel - Products */}
        <div className="flex flex-1 flex-col overflow-hidden rounded-lg bg-white border border-gray-200">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 border-b border-gray-200 px-4 py-3 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                  selectedCategory === cat
                    ? "bg-[#9C27B0] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="border-b border-gray-200 p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari item..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#9C27B0] focus:ring-1 focus:ring-[#9C27B0]"
              />
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
            <div className="grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="flex flex-col items-center rounded-lg border border-gray-200 bg-white p-3 text-center transition-all hover:border-[#9C27B0] hover:bg-purple-50"
                >
                  <div className="mb-2 flex size-12 items-center justify-center rounded-lg bg-[#9C27B0]/10 text-[#9C27B0]">
                    <ShoppingCart className="size-5" />
                  </div>
                  <div className="w-full truncate text-sm font-medium text-gray-900">{product.name}</div>
                  <div className="text-xs text-gray-400">{product.code}</div>
                  <div className="mt-1 font-semibold text-[#9C27B0]">{formatCurrency(product.sellPrice)}</div>
                  <div className="text-xs text-gray-400">Stok: {product.stock}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Cart */}
        <div className="flex w-[380px] flex-col rounded-lg bg-white border border-gray-200">
          {/* Customer Selection */}
          <div className="border-b border-gray-200 p-4">
            <label className="mb-1 block text-xs text-gray-500">Pelanggan</label>
            <div className="relative">
              <button
                onClick={() => setShowCustomerDropdown(!showCustomerDropdown)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm border border-gray-200 rounded-lg hover:border-[#9C27B0] focus:outline-none focus:border-[#9C27B0]"
              >
                <span className={selectedCustomer ? "text-gray-900" : "text-gray-400"}>
                  {selectedCustomerObj ? `${selectedCustomerObj.name} - ${selectedCustomerObj.phone || "Tanpa HP"}` : "-- Pilih Pelanggan --"}
                </span>
                <ChevronDown className="size-4 text-gray-400" />
              </button>
              {showCustomerDropdown && (
                <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
                  <div className="p-2">
                    <input
                      type="text"
                      placeholder="Cari pelanggan..."
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#9C27B0]"
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto border-t border-gray-100">
                    <button
                      onClick={() => { setSelectedCustomer(""); setShowCustomerDropdown(false); }}
                      className="w-full px-3 py-2 text-left text-sm text-gray-500 hover:bg-gray-50"
                    >
                      -- Tanpa Pelanggan --
                    </button>
                    {mockCustomers.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => { setSelectedCustomer(c.id.toString()); setShowCustomerDropdown(false); }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                      >
                        <div className="font-medium text-gray-900">{c.name}</div>
                        <div className="text-xs text-gray-500">{c.phone || "Tanpa HP"}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
            {cart.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-gray-400">
                <ShoppingCart className="mb-2 size-12" />
                <p>Keranjang kosong</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.product.id} className="rounded-lg border border-gray-200 p-3">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-gray-900">{item.product.name}</div>
                        <div className="text-xs text-gray-500">{formatCurrency(item.product.sellPrice)}</div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="ml-2 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.product.id, -1)}
                          className="flex size-7 items-center justify-center rounded bg-gray-100 text-gray-600 hover:bg-gray-200"
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, 1)}
                          className="flex size-7 items-center justify-center rounded bg-gray-100 text-gray-600 hover:bg-gray-200"
                        >
                          <Plus className="size-3" />
                        </button>
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        {formatCurrency(item.product.sellPrice * item.quantity)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Summary & Payment */}
          <div className="border-t border-gray-200 p-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-gray-900">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Pajak (11%)</span>
                <span className="text-gray-900">{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-bold">
                <span>Total</span>
                <span className="text-[#9C27B0]">{formatCurrency(total)}</span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="mt-4">
              <label className="mb-1 block text-xs text-gray-500">Metode Bayar</label>
              <div className="relative">
                <button
                  onClick={() => setShowPaymentDropdown(!showPaymentDropdown)}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm border border-gray-200 rounded-lg hover:border-[#9C27B0] focus:outline-none focus:border-[#9C27B0]"
                >
                  <span className="flex items-center gap-2">
                    {paymentMethod === "cash" && <Banknote className="size-4" />}
                    {paymentMethod === "debit" && <CreditCard className="size-4" />}
                    {paymentMethod === "qris" && <QrCode className="size-4" />}
                    <span className="text-gray-900">
                      {paymentMethod === "cash" ? "Tunai" : paymentMethod === "debit" ? "Debit" : "QRIS"}
                    </span>
                  </span>
                  <ChevronDown className="size-4 text-gray-400" />
                </button>
                {showPaymentDropdown && (
                  <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
                    <button
                      onClick={() => { setPaymentMethod("cash"); setShowPaymentDropdown(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50"
                    >
                      <Banknote className="size-4" /> Tunai
                    </button>
                    <button
                      onClick={() => { setPaymentMethod("debit"); setShowPaymentDropdown(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50"
                    >
                      <CreditCard className="size-4" /> Debit
                    </button>
                    <button
                      onClick={() => { setPaymentMethod("qris"); setShowPaymentDropdown(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50"
                    >
                      <QrCode className="size-4" /> QRIS
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 space-y-2">
              <Button
                block
                onClick={handlePayment}
                disabled={cart.length === 0}
                className="bg-[#9C27B0] hover:bg-[#7B1FA2]"
              >
                Bayar {formatCurrency(total)}
              </Button>
              <Button
                variant="outline"
                block
                onClick={() => setCart([])}
                disabled={cart.length === 0}
                className="border-gray-300"
              >
                Batal
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
