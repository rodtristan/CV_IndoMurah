"use client";

import { Bell, BellOff, BellRing, AlertTriangle, Info, Menu, ChevronLeft, ChevronDown, LogOut, Settings, UserRound, ShoppingCart, Package, Archive, CreditCard, Calendar, CheckCheck } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useRef } from "react";
import { cn, formatTimeAgo } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api-client";
import { POSSidebar } from "./Sidebar";
import { FetchingIndicator, GlobalPageLoader, LoadingState, Spinner, TopProgressBar } from "@/components/ui/Loader";
import { disablePush, enablePush, getPushState, registerServiceWorker, resyncPush, sendTestPush, type PushState } from "@/lib/push";
import { usePageTitleOverride } from "@/lib/page-title";

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
  "/reports": "Menu Laporan",
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
  "/inventory/stock-in": "Barang Masuk",
  "/inventory/opening-stock": "Saldo Awal Item",
  "/inventory/stock-out": "Barang Keluar",
  "/inventory/transfers": "Transfer Stock",
  "/purchase/list": "Daftar Pembelian",
  "/purchase/returns": "Retur Pembelian",
  "/sale/list": "Daftar Penjualan",
  "/inventory/stock-opname": "Stock Opname",
  "/reports/stock-opname": "Laporan Stock Opname",
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
  "/hr/attendance-locations": "Lokasi Absensi",
  "/settings/users": "Pengguna",
};

function pageTitle(pathname: string): string {
  if (TITLE_OVERRIDES[pathname]) return TITLE_OVERRIDES[pathname];
  if (pathname.startsWith("/reports/run/")) return "Laporan";

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
  ALERT: AlertTriangle,
  INFO: Info,
};

const NOTIF_REFERENCE_URL: Record<string, string> = {
  Sale: "/sale/list",
  Purchase: "/purchase/list",
  Product: "/master/items",
  Attendance: "/hr/attendance",
};

/** Kontrol notifikasi sistem (Web Push) untuk perangkat yang sedang dipakai. */
function DevicePushControl() {
  const [state, setState] = useState<PushState | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getPushState().then(setState).catch(() => setState("unsupported"));
  }, []);

  const run = async (fn: () => Promise<unknown>, ok?: string) => {
    setBusy(true);
    try {
      const msg = await fn();
      if (ok || typeof msg === "string") toast.success(ok ?? String(msg));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal mengatur notifikasi");
    } finally {
      setBusy(false);
      setState(await getPushState().catch(() => "unsupported" as PushState));
    }
  };

  if (state === null) return null;
  return (
    <div className="border-t border-default px-3 py-2.5 text-xs">
      {state === "on" ? (
        <div className="flex items-center gap-2">
          <BellRing className="size-4 shrink-0 text-success" />
          <span className="flex-1 text-toned">Notifikasi aktif di perangkat ini</span>
          <button disabled={busy} onClick={() => run(sendTestPush)} className="text-primary hover:underline disabled:opacity-50">
            Tes
          </button>
          <button disabled={busy} onClick={() => run(disablePush, "Notifikasi perangkat dimatikan")} className="text-muted hover:underline disabled:opacity-50">
            Matikan
          </button>
        </div>
      ) : state === "off" ? (
        <button
          disabled={busy}
          onClick={() => run(enablePush, "Notifikasi aktif — akan muncul di HP/desktop ini walau tab ditutup")}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 font-medium text-white hover:bg-primary/90 disabled:opacity-60"
        >
          {busy ? <Spinner className="size-3.5" /> : <BellRing className="size-4" />}
          Aktifkan notifikasi di HP / desktop ini
        </button>
      ) : state === "denied" ? (
        <p className="flex items-start gap-2 text-toned">
          <BellOff className="mt-0.5 size-4 shrink-0 text-danger" />
          Notifikasi diblokir browser. Klik ikon gembok di address bar → Notifications → Allow, lalu muat ulang.
        </p>
      ) : state === "ios-needs-install" ? (
        <p className="flex items-start gap-2 text-toned">
          <BellOff className="mt-0.5 size-4 shrink-0 text-muted" />
          iPhone/iPad: tekan Share → Add to Home Screen, buka dari ikon tersebut, lalu aktifkan notifikasi di sini.
        </p>
      ) : (
        <p className="flex items-start gap-2 text-muted">
          <BellOff className="mt-0.5 size-4 shrink-0" />
          Browser ini tidak mendukung notifikasi sistem (butuh Chrome/Edge/Firefox via https).
        </p>
      )}
    </div>
  );
}

function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const lastCount = useRef<number | null>(null);

  const goTo = useCallback((referenceType?: string | null) => {
    const url = referenceType ? NOTIF_REFERENCE_URL[referenceType] : undefined;
    if (url) router.push(url);
  }, [router]);

  const loadList = useCallback(async (silent: boolean) => {
    const res = await api
      .get<any[]>("notifications", { $include: "Type", $orderBy: { CreatedAt: "desc" }, $take: 10 } as any, { skipCache: true, silent })
      .catch(() => ({ success: false, data: [] } as any));
    return res.success ? (res.data as any[]) || [] : null;
  }, []);

  /** Polling latar belakang (tidak menyalakan loader). Bila ada notifikasi baru, tampilkan toast. */
  const refreshCount = useCallback(async () => {
    const res = await api
      .get<{ count: number }>("notifications/unread-count", undefined, { skipCache: true, silent: true })
      .catch(() => ({ success: false } as any));
    if (!res.success || !res.data) return;
    const count = Number(res.data.count) || 0;
    const prev = lastCount.current;
    lastCount.current = count;
    setUnreadCount(count);
    if (prev !== null && count > prev) {
      const latest = await loadList(true);
      if (!latest) return;
      setItems(latest);
      latest
        .filter((n) => !n.IsRead)
        .slice(0, Math.min(count - prev, 3))
        .reverse()
        .forEach((n) =>
          toast(n.Title, {
            description: n.Message,
            icon: <Bell className="size-4 text-primary" />,
            action: NOTIF_REFERENCE_URL[n.ReferenceType] ? { label: "Lihat", onClick: () => goTo(n.ReferenceType) } : undefined,
          }),
        );
    }
  }, [goTo, loadList]);

  useEffect(() => {
    refreshCount();
    const poll = setInterval(refreshCount, 30000);
    const onFocus = () => refreshCount();
    window.addEventListener("focus", onFocus);
    // Push masuk saat tab terbuka → perbarui lonceng segera (tanpa menunggu polling).
    const onSwMessage = (e: MessageEvent) => {
      if (e.data?.type === "push-received") refreshCount();
    };
    navigator.serviceWorker?.addEventListener("message", onSwMessage);
    // Daftarkan service worker & sinkronkan langganan push ke user yang sedang login.
    registerServiceWorker().then(() => resyncPush());
    return () => {
      clearInterval(poll);
      window.removeEventListener("focus", onFocus);
      navigator.serviceWorker?.removeEventListener("message", onSwMessage);
    };
  }, [refreshCount]);

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    if (!next) return;
    setLoading(true);
    try {
      const list = await loadList(false);
      if (list) setItems(list);
    } finally {
      setLoading(false);
    }
  };

  const handleClickItem = async (item: any) => {
    if (!item.IsRead) {
      await api.patch("notifications", `${item.ID}/read`, {}).catch(() => ({}));
      setItems((prev) => prev.map((n) => (n.ID === item.ID ? { ...n, IsRead: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
      lastCount.current = Math.max(0, (lastCount.current ?? 1) - 1);
    }
    setOpen(false);
    goTo(item.ReferenceType);
  };

  const markAllRead = async () => {
    await api.patch("notifications", "mark-all-read", {}).catch(() => ({}));
    setItems((prev) => prev.map((n) => ({ ...n, IsRead: true })));
    setUnreadCount(0);
    lastCount.current = 0;
  };

  return (
    <div className="relative">
      <button
        onClick={toggle}
        aria-label="Notifikasi"
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
                <LoadingState text="Memuat notifikasi..." className="py-6" />
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
                        <p className="line-clamp-2 text-xs text-muted">{item.Message}</p>
                        <p className="mt-0.5 text-[11px] text-muted">{formatTimeAgo(item.CreatedAt)}</p>
                      </div>
                      {!item.IsRead && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />}
                    </button>
                  );
                })
              )}
            </div>
            <DevicePushControl />
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
  const titleOverride = usePageTitleOverride();
  const title = titleOverride ?? pageTitle(pathname);
  const isDashboard = title === "Halaman Utama";

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <TopProgressBar />
      <FetchingIndicator />
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
            <GlobalPageLoader className="text-primary" />
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
