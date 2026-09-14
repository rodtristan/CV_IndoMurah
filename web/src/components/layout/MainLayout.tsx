"use client";

import { Bell, Menu, ChevronLeft, ChevronDown, LogOut, Settings, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
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
  "/reports/financial": "Laporan Keuangan",
  "/reports/profit": "Laporan Laba Rugi",
  "/reports/cash": "Laporan Arus Kas",
  "/settings/company": "Data Perusahaan",
  "/accounting/cash-in": "Kas Masuk",
  "/accounting/cash-out": "Kas Keluar",
  "/accounting/cash-transfer": "Transfer Kas",
  "/accounting/customer-deposits": "Setoran Pelanggan",
  "/accounting/journals": "Jurnal Umum",
  "/accounting/supplier-deposits": "Setoran Supplier",
  "/inventory/minimum-stock": "Stock Minim",
  "/inventory/stock-out": "Barang Keluar",
  "/inventory/transfers": "Transfer Stock",
  "/purchase/list": "Daftar Pembelian",
  "/purchase/order": "Pesanan Pembelian",
  "/reports/debt": "Hutang",
  "/reports/receivable": "Piutang",
  "/sale/returns": "Retur Penjualan",
  "/settings/roles": "Hak Akses",
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

function UserMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 transition-colors hover:bg-black/5"
      >
        <div className="flex size-8 items-center justify-center rounded-full bg-success text-sm font-semibold text-white">
          A
        </div>
        <span className="hidden text-sm font-medium text-highlighted sm:inline">ADMIN</span>
        <ChevronDown className="size-3.5 text-muted" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-20 mt-2 w-48 rounded-lg border border-default bg-elevated py-1.5 shadow-lg">
            <Link
              href="/settings/company"
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
            <button className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-danger hover:bg-danger/5">
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
            <button className="relative flex size-9 items-center justify-center rounded-lg text-toned transition-colors hover:bg-bg hover:text-highlighted">
              <Bell className="size-5" />
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold text-white">
                50
              </span>
            </button>
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
