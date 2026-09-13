"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Banknote,
  QrCode,
  Smartphone,
  User,
  X,
  Check,
  Printer,
  Keyboard,
  AlertCircle,
  Package,
  Percent,
  ChevronRight,
  RotateCcw,
  Sparkles,
  Scan,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Kbd } from "@/components/ui/Kbd";
import { Modal } from "@/components/ui/Modal";
import { POSModal } from "@/components/pos/ui/POSModal";
import { ConfirmDialog } from "@/components/pos/ConfirmDialog";
import { apiClient } from "@/lib/api-client";
import type { Product, Customer, Sale } from "@/types/pos";
import { cn } from "@/lib/utils";

// ─── Utility Functions ─────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("id-ID").format(value);
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const KEYBOARD_SHORTCUTS = [
  { key: "F1", action: "search", label: "Fokus Pencarian" },
  { key: "F2", action: "customer", label: "Pilih Pelanggan" },
  { key: "F3", action: "checkout", label: "Bayar Sekarang" },
  { key: "F4", action: "clear", label: "Hapus Keranjang" },
  { key: "Esc", action: "cancel", label: "Tutup Modal" },
  { key: "Ctrl+Enter", action: "quick-checkout", label: "Bayar Cepat" },
];

const PAYMENT_METHODS = [
  { id: "CASH", label: "Tunai", icon: Banknote, color: "text-emerald-600" },
  { id: "DEBIT", label: "Debit", icon: CreditCard, color: "text-blue-600" },
  { id: "QRIS", label: "QRIS", icon: QrCode, color: "text-purple-600" },
  { id: "TRANSFER", label: "Transfer", icon: Smartphone, color: "text-orange-600" },
];

const QUICK_AMOUNTS = [100000, 50000, 20000, 10000];

// ─── Types ─────────────────────────────────────────────────────────────────────

interface CartItem {
  product: Product;
  quantity: number;
  subtotal: number;
}

interface PaymentSuccessData {
  sale: Sale;
  change: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function POSPage() {
  // ─── State ───────────────────────────────────────────────────────────────────

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [discountType, setDiscountType] = useState<"rp" | "percent">("rp");
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [amountPaid, setAmountPaid] = useState(0);

  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showPaymentSuccessModal, setShowPaymentSuccessModal] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState<PaymentSuccessData | null>(null);

  const [customerSearch, setCustomerSearch] = useState("");
  const [searchingCustomers, setSearchingCustomers] = useState(false);
  const [searchedCustomers, setSearchedCustomers] = useState<Customer[]>([]);

  const [processing, setProcessing] = useState(false);
  const [selectedProductIndex, setSelectedProductIndex] = useState<number>(-1);

  // ─── Refs ────────────────────────────────────────────────────────────────────

  const searchInputRef = useRef<HTMLInputElement>(null);
  const barcodeBufferRef = useRef("");
  const barcodeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cashInputRef = useRef<HTMLInputElement>(null);

  // ─── Data Fetching ───────────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        apiClient.products$getAll({
          $where: { isActive: true },
          $take: 1000,
          $include: ["category", "unit"],
        }),
        apiClient.categories$getAll({
          $where: { isActive: true },
        }),
      ]);

      if (productsRes.success) {
        setProducts((productsRes.data as Product[]) || []);
      }
      if (categoriesRes.success) {
        setCategories((categoriesRes.data as { id: number; name: string }[]) || []);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ─── Product Filtering ────────────────────────────────────────────────────────

  useEffect(() => {
    let filtered = [...products];

    if (selectedCategory) {
      filtered = filtered.filter((p) => p.categoryId === selectedCategory);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.code.toLowerCase().includes(searchLower) ||
          (p.barcode && p.barcode.toLowerCase().includes(searchLower))
      );
    }

    setFilteredProducts(filtered);
    setSelectedProductIndex(-1);
  }, [products, search, selectedCategory]);

  // ─── Keyboard Handling ──────────────────────────────────────────────────────

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Barcode scanner detection
      if (e.key === "Enter" && barcodeBufferRef.current.length > 5) {
        const barcode = barcodeBufferRef.current.trim();
        handleBarcodeScan(barcode);
        barcodeBufferRef.current = "";
        return;
      }

      // Track keystrokes for barcode detection
      if (
        e.key.length === 1 &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        barcodeBufferRef.current += e.key;
        if (barcodeTimeoutRef.current) {
          clearTimeout(barcodeTimeoutRef.current);
        }
        barcodeTimeoutRef.current = setTimeout(() => {
          barcodeBufferRef.current = "";
        }, 50);
      }

      // Keyboard shortcuts
      if (e.key === "F1") {
        e.preventDefault();
        searchInputRef.current?.focus();
        setSearch("");
      } else if (e.key === "F2") {
        e.preventDefault();
        setShowCustomerModal(true);
      } else if (e.key === "F3" && cart.length > 0) {
        e.preventDefault();
        handleCheckout();
      } else if (e.key === "F4" && cart.length > 0) {
        e.preventDefault();
        setShowClearConfirm(true);
      } else if (e.key === "Escape") {
        if (showKeyboardHelp) setShowKeyboardHelp(false);
        else if (showCustomerModal) setShowCustomerModal(false);
        else if (showPaymentSuccessModal) setShowPaymentSuccessModal(false);
      } else if (e.ctrlKey && e.key === "Enter" && cart.length > 0) {
        e.preventDefault();
        handleCheckout();
      }

      // Arrow navigation for products
      if (
        (e.key === "ArrowDown" || e.key === "ArrowUp") &&
        filteredProducts.length > 0
      ) {
        e.preventDefault();
        if (e.key === "ArrowDown") {
          setSelectedProductIndex((prev) =>
            prev < filteredProducts.length - 1 ? prev + 1 : prev
          );
        } else {
          setSelectedProductIndex((prev) => (prev > 0 ? prev - 1 : 0));
        }
      }

      // Enter to add selected product
      if (e.key === "Enter" && selectedProductIndex >= 0 && filteredProducts[selectedProductIndex]) {
        e.preventDefault();
        addToCart(filteredProducts[selectedProductIndex]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (barcodeTimeoutRef.current) {
        clearTimeout(barcodeTimeoutRef.current);
      }
    };
  }, [cart.length, showCustomerModal, showKeyboardHelp, showPaymentSuccessModal, filteredProducts, selectedProductIndex]);

  // ─── Barcode Scanner ────────────────────────────────────────────────────────

  const handleBarcodeScan = (barcode: string) => {
    const product = products.find(
      (p) => p.barcode === barcode || p.code === barcode
    );
    if (product) {
      addToCart(product);
      setSearch("");
      // Visual feedback
      searchInputRef.current?.focus();
    }
  };

  // ─── Customer Search ─────────────────────────────────────────────────────────

  const searchCustomers = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchedCustomers([]);
      return;
    }

    setSearchingCustomers(true);
    try {
      const res = await apiClient.customers$getAll({
        $search: query,
        $where: { isActive: true },
        $take: 10,
      });
      if (res.success) {
        setSearchedCustomers((res.data as Customer[]) || []);
      }
    } catch (error) {
      console.error("Failed to search customers:", error);
    } finally {
      setSearchingCustomers(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (customerSearch) searchCustomers(customerSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [customerSearch, searchCustomers]);

  // ─── Cart Operations ────────────────────────────────────────────────────────

  const addToCart = (product: Product) => {
    if (product.stock <= 0) return;

    const existingItem = cart.find((item) => item.product.id === product.id);

    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        return;
      }
      setCart(
        cart.map((item) =>
          item.product.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: (item.quantity + 1) * Number(product.sellingPrice),
              }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          product,
          quantity: 1,
          subtotal: Number(product.sellingPrice),
        },
      ]);
    }
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart(
      cart.map((item) => {
        if (item.product.id === productId) {
          const newQty = Math.max(1, item.quantity + delta);
          if (delta > 0 && newQty > item.product.stock) return item;
          return {
            ...item,
            quantity: newQty,
            subtotal: newQty * Number(item.product.sellingPrice),
          };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setCustomer(null);
    setDiscount(0);
    setTax(0);
    setAmountPaid(0);
  };

  // ─── Calculations ────────────────────────────────────────────────────────────

  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const discountAmount =
    discountType === "percent"
      ? subtotal * (discount / 100)
      : Math.min(discount, subtotal);
  const taxAmount = (subtotal - discountAmount) * (tax / 100);
  const total = subtotal - discountAmount + taxAmount;
  const change = amountPaid - total;

  // ─── Checkout ────────────────────────────────────────────────────────────────

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    if (paymentMethod === "CASH" && amountPaid < total) {
      cashInputRef.current?.focus();
      return;
    }

    setProcessing(true);
    try {
      const saleData = {
        customerId: customer?.id || 1,
        date: new Date().toISOString(),
        subtotal,
        discountAmount,
        discountPercent: discountType === "percent" ? discount : 0,
        taxPercent: tax,
        taxAmount,
        total,
        cashAmount: amountPaid,
        changeAmount: change,
        paymentMethod,
        paymentStatus: total <= amountPaid ? "PAID" : "PARTIAL",
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          unitId: item.product.unitId,
          unitPrice: item.product.sellingPrice,
          discountPercent: 0,
          discountAmount: 0,
          subtotal: item.subtotal,
        })),
      };

      const res = await apiClient.sales$create(saleData);
      if (res.success) {
        setPaymentSuccessData({
          sale: res.data as Sale,
          change,
        });
        setShowPaymentSuccessModal(true);
        clearCart();
        fetchData();
      } else {
        alert(res.message || "Transaksi gagal!");
      }
    } catch (error) {
      console.error("Checkout failed:", error);
      alert("Transaksi gagal!");
    } finally {
      setProcessing(false);
    }
  };

  // ─── Print Receipt ──────────────────────────────────────────────────────────

  const printReceipt = (sale: Sale) => {
    const receiptContent = `
=================================
         TOKO INDOMURAH
=================================
Tanggal: ${new Date(sale.createdAt).toLocaleString("id-ID")}
No: ${sale.code}
---------------------------------
Pelanggan: ${sale.customer?.name || "Umum"}
Kasir: ${sale.creator?.name || "Admin"}
=================================

${sale.saleItems?.map(
  (item, i) =>
    `${i + 1}. ${item.product?.name || "Item"}
   ${item.quantity} x ${formatCurrency(item.unitPrice)}
   Sub: ${formatCurrency(item.subtotal)}`
).join("\n") || "No items"}

---------------------------------
Subtotal: ${formatCurrency(sale.subtotal)}
Diskon: -${formatCurrency(sale.discountAmount || 0)}
Pajak: +${formatCurrency(sale.taxAmount || 0)}
---------------------------------
TOTAL: ${formatCurrency(sale.total)}
Bayar: ${formatCurrency(sale.cashAmount || sale.total)}
Kembalian: ${formatCurrency(sale.changeAmount || 0)}
=================================

    Terima Kasih!
    Selamat Belanja Kembali

=================================
    `.trim();

    const printWindow = window.open("", "", "width=300,height=600");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Receipt - ${sale.code}</title>
            <style>
              body {
                font-family: 'Courier New', monospace;
                font-size: 12px;
                margin: 0;
                padding: 10px;
                width: 280px;
              }
              @media print {
                @page { margin: 0; size: 80mm auto; }
              }
            </style>
          </head>
          <body>
            <pre>${receiptContent}</pre>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-dvh overflow-hidden bg-bg">
      {/* Left Panel - Products */}
      <div className="flex flex-1 flex-col border-r border-default overflow-hidden">
        {/* Header */}
        <div className="border-b border-default bg-elevated/50 p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Package className="size-5 text-primary" />
                <h2 className="text-lg font-bold">Produk</h2>
              </div>
              <Badge variant="subtle">{filteredProducts.length} items</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="subtle" className="hidden sm:flex">
                <ShoppingCart className="size-3 mr-1" />
                {cart.length} item
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowKeyboardHelp(true)}
                className="text-muted"
              >
                <Keyboard className="size-4" />
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-dimmed" />
            <Input
              ref={searchInputRef}
              placeholder="Cari produk atau scan barcode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 pl-11 pr-20 text-base"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Kbd className="text-xs">F1</Kbd>
            </div>
          </div>

          {/* Categories */}
          <div className="mt-3 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedCategory(null)}
              className={cn(
                "flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-all",
                selectedCategory === null
                  ? "bg-primary text-white"
                  : "bg-elevated text-muted hover:bg-primary/10 hover:text-primary"
              )}
            >
              Semua
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-all",
                  selectedCategory === cat.id
                    ? "bg-primary text-white"
                    : "bg-elevated text-muted hover:bg-primary/10 hover:text-primary"
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted">
              <AlertCircle className="size-12 mb-3 text-dimmed" />
              <p className="font-medium">Produk tidak ditemukan</p>
              <p className="text-sm mt-1">Coba kata kunci lain</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {filteredProducts.map((product, index) => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  disabled={product.stock <= 0}
                  className={cn(
                    "group relative flex flex-col rounded-xl border p-3 text-left transition-all",
                    selectedProductIndex === index && "ring-2 ring-primary",
                    product.stock <= 0
                      ? "opacity-50 cursor-not-allowed bg-elevated/50"
                      : "hover:border-primary hover:shadow-md hover:shadow-primary/5 bg-elevated/30 hover:bg-elevated/50"
                  )}
                >
                  {/* Stock Badge */}
                  {product.stock <= product.minimumStock && (
                    <Badge
                      variant="warning"
                      className="absolute right-2 top-2 text-[10px] px-1.5"
                    >
                      Low
                    </Badge>
                  )}
                  {product.stock <= 0 && (
                    <Badge
                      variant="danger"
                      className="absolute right-2 top-2 text-[10px] px-1.5"
                    >
                      Kosong
                    </Badge>
                  )}

                  {/* Product Image */}
                  <div className="mb-2 flex size-14 items-center justify-center rounded-lg bg-bg">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="size-14 object-cover rounded-lg"
                      />
                    ) : (
                      <Package className="size-8 text-dimmed" />
                    )}
                  </div>

                  {/* Product Info */}
                  <h3 className="font-semibold leading-tight line-clamp-2 text-sm">
                    {product.name}
                  </h3>
                  <p className="text-xs text-dimmed font-mono mt-0.5">
                    {product.code}
                  </p>
                  <p className="mt-auto pt-2 text-base font-bold text-primary">
                    {formatCurrency(Number(product.sellingPrice))}
                  </p>
                  <p className="text-xs text-dimmed">
                    Stock: {formatNumber(product.stock)}
                  </p>

                  {/* Add Button on Hover */}
                  <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex size-7 items-center justify-center rounded-full bg-primary text-white shadow-lg">
                      <Plus className="size-4" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Cart */}
      <div className="flex w-full flex-col overflow-hidden lg:w-[420px] xl:w-[480px] bg-elevated/30">
        {/* Customer Selection */}
        <div className="border-b border-default p-4 bg-bg">
          <button
            onClick={() => setShowCustomerModal(true)}
            className="flex w-full items-center gap-3 rounded-xl border-2 border-dashed p-3 text-sm transition-all hover:border-primary/50 hover:bg-primary/5"
          >
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
              <User className="size-5 text-primary" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium">
                {customer ? customer.name : "Pilih Pelanggan"}
              </p>
              <p className="text-xs text-dimmed">
                {customer ? customer.code : "Walk-in Customer"}
              </p>
            </div>
            <ChevronRight className="size-5 text-dimmed" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted">
              <div className="flex size-16 items-center justify-center rounded-full bg-elevated mb-4">
                <ShoppingCart className="size-8 text-dimmed" />
              </div>
              <p className="font-medium">Keranjang kosong</p>
              <p className="text-sm mt-1 text-dimmed">
                Klik produk untuk menambahkan
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs text-dimmed">
                <Scan className="size-3" />
                <span>Scan barcode untuk tambah cepat</span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div
                  key={item.product.id}
                  className="group relative rounded-xl border border-default bg-bg p-3 transition-all hover:border-primary/30"
                >
                  <div className="flex items-start gap-3">
                    {/* Product Icon */}
                    <div className="flex size-12 flex-shrink-0 items-center justify-center rounded-lg bg-elevated">
                      {item.product.image ? (
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="size-12 object-cover rounded-lg"
                        />
                      ) : (
                        <Package className="size-6 text-dimmed" />
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold truncate">{item.product.name}</h4>
                      <p className="text-sm text-dimmed">
                        {formatCurrency(Number(item.product.sellingPrice))} x{" "}
                        {item.quantity}
                      </p>
                      <p className="font-bold text-primary mt-1">
                        {formatCurrency(item.subtotal)}
                      </p>
                    </div>

                    {/* Actions */}
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="flex size-7 items-center justify-center rounded-full bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>

                  {/* Quantity Controls */}
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="size-8 p-0"
                        onClick={() => updateQuantity(item.product.id, -1)}
                      >
                        <Minus className="size-3" />
                      </Button>
                      <span className="w-12 text-center font-bold text-lg">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="size-8 p-0"
                        onClick={() => updateQuantity(item.product.id, 1)}
                      >
                        <Plus className="size-3" />
                      </Button>
                    </div>
                    <span className="text-sm text-dimmed">
                      Max: {formatNumber(item.product.stock)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary & Checkout */}
        <div className="border-t border-default bg-bg p-4 space-y-4">
          {/* Subtotal, Discount, Tax */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-dimmed">Subtotal</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>

            {/* Discount */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-dimmed">
                <Percent className="size-3.5" />
                <span>Diskon</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex rounded-lg border border-default overflow-hidden">
                  <button
                    onClick={() => setDiscountType("rp")}
                    className={cn(
                      "px-2 py-1 text-xs font-medium transition-colors",
                      discountType === "rp"
                        ? "bg-primary text-white"
                        : "bg-elevated hover:bg-primary/10"
                    )}
                  >
                    Rp
                  </button>
                  <button
                    onClick={() => setDiscountType("percent")}
                    className={cn(
                      "px-2 py-1 text-xs font-medium transition-colors",
                      discountType === "percent"
                        ? "bg-primary text-white"
                        : "bg-elevated hover:bg-primary/10"
                    )}
                  >
                    %
                  </button>
                </div>
                <Input
                  type="number"
                  value={discount}
                  onChange={(e) =>
                    setDiscount(Math.max(0, Number(e.target.value)))
                  }
                  className="w-24 text-right text-sm h-8"
                  min={0}
                  max={discountType === "percent" ? 100 : undefined}
                />
              </div>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-success">
                <span className="text-success">- {formatCurrency(discountAmount)}</span>
              </div>
            )}

            {/* Tax */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-dimmed">
                <Percent className="size-3.5" />
                <span>Pajak (%)</span>
              </div>
              <Input
                type="number"
                value={tax}
                onChange={(e) =>
                  setTax(Math.max(0, Math.min(100, Number(e.target.value))))
                }
                className="w-24 text-right text-sm h-8"
                min={0}
                max={100}
              />
            </div>

            {tax > 0 && (
              <div className="flex justify-between text-orange-500">
                <span>+ {formatCurrency(taxAmount)}</span>
              </div>
            )}

            {/* Total */}
            <div className="flex justify-between border-t border-default pt-2 text-lg font-bold">
              <span>Total</span>
              <span className="text-primary">{formatCurrency(total)}</span>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <p className="mb-2 text-xs font-medium text-dimmed uppercase tracking-wide">
              Metode Pembayaran
            </p>
            <div className="grid grid-cols-4 gap-2">
              {PAYMENT_METHODS.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-xl border-2 p-3 text-sm font-medium transition-all",
                    paymentMethod === method.id
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-default bg-elevated/50 hover:border-primary/50"
                  )}
                >
                  <method.icon className={cn("size-6", method.color)} />
                  <span>{method.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Cash Input */}
          {paymentMethod === "CASH" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Jumlah Bayar</span>
                <div className="relative">
                  <Input
                    ref={cashInputRef}
                    type="number"
                    value={amountPaid || ""}
                    onChange={(e) =>
                      setAmountPaid(Math.max(0, Number(e.target.value)))
                    }
                    className="w-44 text-right font-bold h-10 pl-8"
                    placeholder="0"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dimmed">
                    Rp
                  </span>
                </div>
              </div>

              {/* Quick Amount Buttons */}
              <div className="flex gap-2 flex-wrap">
                {QUICK_AMOUNTS.map((amount) => (
                  <Button
                    key={amount}
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setAmountPaid((prev) => prev + amount)
                    }
                    className="text-xs flex-1 min-w-[60px]"
                  >
                    +{formatNumber(amount)}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setAmountPaid(Math.ceil(total / 1000) * 1000)
                  }
                  className="text-xs flex-1 min-w-[60px]"
                >
                  Pas
                </Button>
              </div>

              {/* Change */}
              {change > 0 && (
                <div className="flex items-center justify-between rounded-xl bg-success/10 p-3">
                  <span className="text-sm font-medium text-success">
                    Kembalian
                  </span>
                  <span className="text-xl font-bold text-success">
                    {formatCurrency(change)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Checkout Button */}
          <Button
            className="w-full h-14 text-lg font-bold shadow-lg shadow-primary/25"
            onClick={handleCheckout}
            disabled={cart.length === 0 || processing}
          >
            {processing ? (
              <div className="flex items-center gap-2">
                <div className="size-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Memproses...
              </div>
            ) : (
              <>
                <Sparkles className="size-5 mr-2" />
                Bayar {formatCurrency(total)}
              </>
            )}
          </Button>

          {/* Clear Cart */}
          {cart.length > 0 && (
            <Button
              variant="ghost"
              className="w-full text-dimmed hover:text-red-500"
              onClick={() => setShowClearConfirm(true)}
            >
              <RotateCcw className="size-4 mr-2" />
              Clear Keranjang
            </Button>
          )}
        </div>
      </div>

      {/* Customer Modal */}
      <POSModal
        open={showCustomerModal}
        onClose={() => {
          setShowCustomerModal(false);
          setCustomerSearch("");
          setSearchedCustomers([]);
        }}
        title="Pilih Pelanggan"
        size="md"
      >
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-dimmed" />
            <Input
              placeholder="Cari nama atau kode pelanggan..."
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>

          {searchingCustomers ? (
            <div className="flex items-center justify-center py-8">
              <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : searchedCustomers.length > 0 ? (
            <div className="max-h-64 space-y-2 overflow-y-auto">
              {searchedCustomers.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setCustomer(c);
                    setShowCustomerModal(false);
                    setCustomerSearch("");
                    setSearchedCustomers([]);
                  }}
                  className="w-full rounded-xl border p-4 text-left transition-all hover:border-primary hover:bg-primary/5"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                      <User className="size-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{c.name}</div>
                      <div className="text-sm text-dimmed">
                        {c.code} {c.phone && `• ${c.phone}`}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : customerSearch.length >= 2 ? (
            <div className="py-8 text-center text-dimmed">
              Pelanggan tidak ditemukan
            </div>
          ) : (
            <div className="py-8 text-center text-dimmed">
              Ketik minimal 2 karakter untuk mencari
            </div>
          )}

          <div className="border-t border-default pt-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setCustomer(null);
                setShowCustomerModal(false);
                setCustomerSearch("");
                setSearchedCustomers([]);
              }}
            >
              Tetap sebagai Tamu (Walk-in)
            </Button>
          </div>
        </div>
      </POSModal>

      {/* Success Modal */}
      <POSModal
        open={showPaymentSuccessModal}
        onClose={() => setShowPaymentSuccessModal(false)}
        title=""
        size="md"
      >
        {paymentSuccessData && (
          <div className="text-center space-y-6">
            {/* Success Icon */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="flex size-20 items-center justify-center rounded-full bg-success/10">
                  <Check className="size-10 text-success" />
                </div>
                <div className="absolute -top-1 -right-1 flex size-6 items-center justify-center rounded-full bg-success text-white">
                  <Sparkles className="size-4" />
                </div>
              </div>
            </div>

            {/* Title */}
            <div>
              <h2 className="text-2xl font-bold text-success">
                Transaksi Berhasil!
              </h2>
              <p className="text-dimmed mt-1">
                Terima kasih atas kunjungannya
              </p>
            </div>

            {/* Amount */}
            <div className="rounded-2xl bg-elevated p-6">
              <p className="text-sm text-dimmed mb-1">Total Bayar</p>
              <p className="text-4xl font-bold text-primary">
                {formatCurrency(paymentSuccessData.sale.total)}
              </p>
              <p className="text-sm text-dimmed mt-2">
                No. Transaksi: {paymentSuccessData.sale.code}
              </p>
            </div>

            {/* Change */}
            {paymentSuccessData.change > 0 && (
              <div className="flex items-center justify-between rounded-xl bg-success/10 p-4">
                <span className="text-success font-medium">Kembalian</span>
                <span className="text-2xl font-bold text-success">
                  {formatCurrency(paymentSuccessData.change)}
                </span>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowPaymentSuccessModal(false)}
              >
                <X className="size-4 mr-2" />
                Tutup
              </Button>
              <Button
                className="flex-1 bg-primary"
                onClick={() => printReceipt(paymentSuccessData.sale)}
              >
                <Printer className="size-4 mr-2" />
                Cetak Struk
              </Button>
            </div>

            <p className="text-xs text-dimmed">
              Tekan <Kbd className="text-[10px]">Esc</Kbd> untuk menutup
            </p>
          </div>
        )}
      </POSModal>

      {/* Keyboard Shortcuts Modal */}
      <POSModal
        open={showKeyboardHelp}
        onClose={() => setShowKeyboardHelp(false)}
        title="Shortcut Keyboard"
        size="sm"
      >
        <div className="space-y-1">
          {KEYBOARD_SHORTCUTS.map((shortcut, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-3 border-b border-default last:border-0"
            >
              <span className="text-sm">{shortcut.label}</span>
              <Kbd>{shortcut.key}</Kbd>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-lg bg-elevated p-3 text-xs text-dimmed">
          <p className="font-medium mb-1">Tips:</p>
          <p>Gunakan barcode scanner untuk menambah produk dengan cepat. Scanner akan otomatis terdeteksi saat mengetik cepat.</p>
        </div>
      </POSModal>

      {/* Clear Cart Confirmation */}
      <ConfirmDialog
        isOpen={showClearConfirm}
        onConfirm={() => {
          clearCart();
          setShowClearConfirm(false);
        }}
        onCancel={() => setShowClearConfirm(false)}
        title="Hapus Keranjang?"
        message="Semua item di keranjang akan dihapus. Lanjutkan?"
        confirmText="Hapus"
        cancelText="Batal"
        variant="danger"
      />
    </div>
  );
}
