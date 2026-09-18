"use client";

import { Bell, Menu, ChevronLeft, ChevronDown, LogOut, Settings, UserRound, ShoppingCart, Package, Archive, CreditCard, Calendar, CheckCheck } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useRef } from "react";
import { cn, formatTimeAgo } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api-client";
import { POSSidebar } from "./Sidebar";

interface MainLayoutProps {
  children: React.ReactNode;
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// Explicit titles for routes whose real Ketoko.co.id name isn't a literal
// slugification of the URL (e.g. /master/items is "Daftar Item", not "Items").
const TITLE_OVERRIDES: Record<string, string> = {
  "/master/items": "Daftar Item",
  "/master/items/stock-card": "Kartu Stok",
  "/master/suppliers": "Daftar Supplier",
  "/master/customers": "Daftar Pelanggan",
  "/master/categories": "Kategori Item",
  "/master/sale-points": "Sale Point",
  "/master/sales-persons": "Sales Person",
  "/master/warehouses": "Gudang",
  "/master/brands": "Merek",
  "/master/units": "Satuan",
  "/sale/pos": "Kasir (POS)",
  "/accounting/accounts": "Daftar Perkiraan",
  "/reports/sales": "Laporan Penjualan",
  "/reports/purchase": "Laporan Pembelian",
  "/reports/inventory": "Laporan Persediaan",
  "/reports/stock-mutation": "Mutasi Stok",
  "/reports/financial": "Laporan Keuangan",
  "/reports/profit": "Laporan Laba Rugi",
  "/reports/cash": "Laporan Arus Kas",
  "/settings/company": "Data Perusahaan",
  "/settings": "Pengaturan",
  "/settings/profile": "Profil Saya",
  "/settings/general": "Pengaturan Umum",
  "/settings/numbering": "Setting Nomor",
  "/accounting/cash-in": "Kas Masuk",
  "/accounting/cash-out": "Kas Keluar",
  "/accounting/cash-transfer": "Transfer Kas",
  "/accounting/customer-deposits": "Setoran Pelanggan",
  "/accounting/journals": "Jurnal Umum",
  "/accounting/supplier-deposits": "Setoran Supplier",
  "/inventory/minimum-stock": "Stock Minim",
  "/inventory/opening-stock": "Saldo Awal Item",
  "/inventory/stock-out": "Barang Keluar",
  "/inventory/transfers": "Transfer Stock",
  "/purchase/list": "Daftar Pembelian",
  "/purchase/order": "Pesanan Pembelian",
  "/reports/debt": "Hutang",
  "/reports/receivable": "Piutang",
  "/sale/returns": "Retur Penjualan",
  "/sale/price-history": "History Harga Jual",
  "/sale/points": "Point Penjualan",
  "/sale/shipping": "Data Pengiriman",
  "/settings/roles": "Hak Akses",
  "/settings/menus": "Menu Aplikasi",
  "/settings/activity-log": "Log Aktivitas",
  "/settings/import": "Import Data",
  "/hr/attendance": "Absensi",
  "/hr/employees": "Karyawan",
  "/settings/users": "Pengguna",
};

function pageTitle(pathname: string): string {
  if (TITLE_OVERRIDES[pathname]) return TITLE_OVERRIDES[pathname];

  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0 || (segments.length === 1 && segments[0] === "dashboard")) {
    return "Halaman Utama";
  }
  const last = segments[segments.length - 1];
  return last.split("-").map(capitalize).join(" ");
}

const NOTIF_TYPE_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  SALE: ShoppingCart,
  PURCHASE: Package,
  STOCK: Archive,
  PAYMENT: CreditCard,
  APPOINTMENT: Calendar,
  REMINDER: Bell,
};

function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchUnreadCount = useCallback(async () => {
    const res = await api.get<{ count: number }>("notifications/unread-count").catch(() => ({ success: false } as any));
    if (res.success && res.data) setUnreadCount(res.data.count);
  }, []);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<any[]>("notifications", { $include: "Type", $orderBy: { CreatedAt: "desc" }, $take: 10 } as any)
        .catch(() => ({ success: false, data: [] } as any));
      if (res.success) setItems(res.data || []);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchUnreadCount();
    pollRef.current = setInterval(fetchUnreadCount, 30000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [fetchUnreadCount]);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next) fetchList();
  };

  const handleClickItem = async (item: any) => {
    if (!item.IsRead) {
      await api.patch("notifications", `${item.ID}/read`, {}).catch(() => ({}));
      setItems((prev) => prev.map((n) => (n.ID === item.ID ? { ...n, IsRead: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
    }
    setOpen(false);
    if (item.ReferenceType === "Sale") router.push("/sale/list");
    else if (item.ReferenceType === "Purchase") router.push("/purchase/list");
    else if (item.ReferenceType === "Product") router.push("/master/items");
  };

  const markAllRead = async () => {
    await api.patch("notifications", "mark-all-read", {}).catch(() => ({}));
    setItems((prev) => prev.map((n) => ({ ...n, IsRead: true })));
    setUnreadCount(0);
  };

  return (
    <div className="relative">
      <button
        onClick={toggle}
        className="relative flex size-9 items-center justify-center rounded-lg text-toned transition-colors hover:bg-bg hover:text-highlighted"
      >
        <Bell className="size-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-20 mt-2 w-80 rounded-lg border border-default bg-elevated shadow-lg">
            <div className="flex items-center justify-between border-b border-default px-3 py-2.5">
              <span className="text-sm font-semibold text-highlighted">Notifikasi</span>
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="flex items-center gap-1 text-xs text-primary hover:underline">
                  <CheckCheck className="size-3.5" />
                  Tandai semua dibaca
                </button>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <p className="px-3 py-6 text-center text-sm text-muted">Memuat...</p>
              ) : items.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-muted">Tidak ada notifikasi</p>
              ) : (
                items.map((item) => {
                  const Icon = NOTIF_TYPE_ICON[item.Type?.Code] || Bell;
                  return (
                    <button
                      key={item.ID}
                      onClick={() => handleClickItem(item)}
                      className={cn(
                        "flex w-full items-start gap-3 border-b border-default px-3 py-2.5 text-left transition-colors last:border-0 hover:bg-bg",
                        !item.IsRead && "bg-primary/5"
                      )}
                    >
                      <div
                        className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full"
                        style={{ backgroundColor: `${item.Type?.Color || "#78909C"}20`, color: item.Type?.Color || "#78909C" }}
                      >
                        <Icon className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={cn("text-sm text-highlighted", !item.IsRead && "font-semibold")}>{item.Title}</p>
                        <p className="truncate text-xs text-muted">{item.Message}</p>
                        <p className="mt-0.5 text-[11px] text-muted">{formatTimeAgo(item.CreatedAt)}</p>
                      </div>
                      {!item.IsRead && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function UserMenu() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const initial = user?.name?.charAt(0).toUpperCase() || "?";

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 transition-colors hover:bg-black/5"
      >
        <div className="flex size-8 items-center justify-center rounded-full bg-success text-sm font-semibold text-white">
          {initial}
        </div>
        <span className="hidden text-sm font-medium text-highlighted sm:inline">{user?.name || "..."}</span>
        <ChevronDown className="size-3.5 text-muted" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-20 mt-2 w-48 rounded-lg border border-default bg-elevated py-1.5 shadow-lg">
            <Link
              href="/settings/profile"
              className="flex items-center gap-2 px-3 py-2 text-sm text-highlighted hover:bg-bg"
              onClick={() => setOpen(false)}
            >
              <UserRound className="size-4 text-muted" />
              Profil
            </Link>
            <Link
              href="/settings"
              className="flex items-center gap-2 px-3 py-2 text-sm text-highlighted hover:bg-bg"
              onClick={() => setOpen(false)}
            >
              <Settings className="size-4 text-muted" />
              Pengaturan
            </Link>
            <button
              onClick={logout}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-danger hover:bg-danger/5"
            >
              <LogOut className="size-4" />
              Keluar
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export function MainLayout({ children }: MainLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const title = pageTitle(pathname);
  const isDashboard = title === "Halaman Utama";

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      {/* Sidebar */}
      <aside
        className={cn(
          "flex shrink-0 flex-col bg-sidebar-bg transition-all duration-200",
          collapsed ? "w-[68px]" : "w-64"
        )}
      >
        {/* Brand header */}
        <div className="flex h-[116px] shrink-0 items-center gap-3 bg-sidebar-header px-4">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex size-9 shrink-0 items-center justify-center rounded-md text-white/90 transition-colors hover:bg-white/10"
          >
            <Menu className="size-6" />
          </button>
          {!collapsed && (
            <Link href="/dashboard" className="truncate text-[22px] font-extrabold text-white">
              Ketoko.co.id
            </Link>
          )}
        </div>

        {/* Navigation */}
        <POSSidebar collapsed={collapsed} />
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-default bg-elevated px-5">
          <div className="flex items-center gap-3">
            {!isDashboard && (
              <button
                onClick={() => router.back()}
                className="flex size-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-bg hover:text-highlighted"
              >
                <ChevronLeft className="size-5" />
              </button>
            )}
            <h1 className="text-lg font-semibold text-highlighted">{title}</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm font-medium text-toned md:inline">
              CV INDOMURAH GROUP <span className="text-muted">[UTM]</span>
            </span>
            <NotificationBell />
            <div className="h-6 w-px bg-default" />
            <UserMenu />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
