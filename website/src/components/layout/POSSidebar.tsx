"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  Store,
  FileText,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronRight,
  PackageSearch,
  Boxes,
  ArrowRightLeft,
  ClipboardList,
  Truck,
  RotateCcw,
  CreditCard,
  Banknote,
  BookOpen,
  Receipt,
  Building2,
  UserCog,
  Palette,
  Bell,
  Printer,
  Hash,
  Activity,
  Upload,
  Database,
  Wallet,
  Percent,
  MapPin,
  Tags,
  BanknoteIcon,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href?: string;
  icon: React.ElementType;
  children?: NavItem[];
}

const menuItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Data Master",
    href: "/master/items",
    icon: Package,
    children: [
      { label: "Daftar Item", href: "/master/items", icon: Package },
      { label: "Kartu Stok", href: "/master/stock-card", icon: PackageSearch },
      { label: "Datasheet", href: "/master/datasheet", icon: FileText },
      { label: "Daftar Supplier", href: "/master/suppliers", icon: Truck },
      { label: "Daftar Pelanggan", href: "/master/customers", icon: Users },
      { label: "Daftar Sales", href: "/master/sales", icon: Users },
      { label: "Grup Pelanggan", href: "/master/customer-groups", icon: Tags },
      { label: "Wilayah", href: "/master/regions", icon: MapPin },
      { label: "Diskon & Promosi", href: "/master/discounts", icon: Percent },
      { label: "Point Pelanggan", href: "/master/loyalty", icon: CreditCard },
      { label: "Lainnya", href: "/master/others", icon: MoreHorizontal, children: [
        { label: "Satuan", href: "/master/units", icon: Hash },
        { label: "Merek", href: "/master/brands", icon: Tags },
        { label: "Jenis", href: "/master/types", icon: Tags },
        { label: "Sub Jenis", href: "/master/sub-types", icon: Tags },
        { label: "Varian", href: "/master/variants", icon: Tags },
        { label: "Bank", href: "/master/banks", icon: BanknoteIcon },
        { label: "E-Money", href: "/master/e-money", icon: Wallet },
        { label: "Ongkir", href: "/master/shipping", icon: Truck },
        { label: "Gudang", href: "/master/warehouses", icon: Boxes },
      ]},
    ],
  },
  {
    label: "Pembelian",
    href: "/purchase/list",
    icon: ShoppingCart,
    children: [
      { label: "Pesanan Pembelian", href: "/purchase/orders", icon: FileText },
      { label: "Pembelian", href: "/purchase/list", icon: ShoppingCart },
      { label: "Retur Pembelian", href: "/purchase/returns", icon: RotateCcw },
      { label: "History Harga Beli", href: "/purchase/price-history", icon: Clock },
      { label: "Bayar Hutang", href: "/purchase/pay-debt", icon: CreditCard },
      { label: "Status BG/Cek", href: "/purchase/bg-status", icon: FileText },
    ],
  },
  {
    label: "Penjualan",
    href: "/sale/list",
    icon: Store,
    children: [
      { label: "Pesanan Penjualan", href: "/sale/orders", icon: FileText },
      { label: "Pesanan Marketplace", href: "/sale/marketplace", icon: Store },
      { label: "Kasir", href: "/sale/pos", icon: CreditCard },
      { label: "Retur Penjualan", href: "/sale/returns", icon: RotateCcw },
      { label: "Point Penjualan", href: "/sale/points", icon: CreditCard },
      { label: "Bayar Piutang", href: "/sale/pay-receivable", icon: CreditCard },
      { label: "Komisi Sales", href: "/sale/commission", icon: CreditCard },
      { label: "Ekspor Faktur Pajak", href: "/sale/export-tax", icon: Upload },
      { label: "Terminal Harga", href: "/sale/price-terminal", icon: Terminal },
    ],
  },
  {
    label: "Persediaan",
    href: "/inventory/stock-in",
    icon: Boxes,
    children: [
      { label: "Item Masuk", href: "/inventory/stock-in", icon: ArrowRightLeft },
      { label: "Item Keluar", href: "/inventory/stock-out", icon: ArrowRightLeft },
      { label: "Item Transfer", href: "/inventory/transfers", icon: ArrowRightLeft },
      { label: "Saldo Awal", href: "/inventory/initial-stock", icon: Package },
      { label: "Stock Opname", href: "/inventory/stock-opname", icon: ClipboardList },
      { label: "Stock Minimum", href: "/inventory/minimum-stock", icon: PackageSearch },
      { label: "Proses Perbaikan", href: "/inventory/fix", icon: Settings },
      { label: "Koreksi Nilai", href: "/inventory/correction", icon: Hash },
      { label: "Riwayat Serial", href: "/inventory/serial", icon: BarCode },
    ],
  },
  {
    label: "Akuntansi",
    href: "/accounting/accounts",
    icon: BookOpen,
    children: [
      { label: "Daftar Perkiraan", href: "/accounting/accounts", icon: BookOpen },
      { label: "Kas Masuk", href: "/accounting/cash-in", icon: Banknote },
      { label: "Kas Keluar", href: "/accounting/cash-out", icon: Banknote },
      { label: "Kas Transfer", href: "/accounting/cash-transfer", icon: ArrowRightLeft },
      { label: "Jurnal", href: "/accounting/journals", icon: FileText },
      { label: "Buku Besar", href: "/accounting/ledger", icon: BookOpen },
      { label: "Deposit Supplier", href: "/accounting/deposits-supplier", icon: Wallet },
      { label: "Deposit Pelanggan", href: "/accounting/deposits-customer", icon: Wallet },
      { label: "Deposit Saldo", href: "/accounting/deposits-balance", icon: Wallet },
      { label: "Pengaturan Aset", href: "/accounting/assets", icon: Settings },
      { label: "Saldo Awal Perkiraan", href: "/accounting/initial-balance", icon: Package },
      { label: "Saldo Awal Hutang", href: "/accounting/initial-debt", icon: CreditCard },
      { label: "Saldo Awal Piutang", href: "/accounting/initial-receivable", icon: CreditCard },
    ],
  },
  {
    label: "Laporan",
    href: "/reports/sale",
    icon: BarChart3,
    children: [
      { label: "Penjualan", href: "/reports/sale", icon: Store },
      { label: "Pembelian", href: "/reports/purchase", icon: ShoppingCart },
      { label: "Stok", href: "/reports/stock", icon: Package },
      { label: "Laba Rugi", href: "/reports/profit", icon: BarChart3 },
      { label: "Keuangan", href: "/reports/financial", icon: Banknote },
      { label: "Kas", href: "/reports/cash", icon: Banknote },
      { label: "Master Data", href: "/reports/master", icon: Package },
      { label: "Hutang", href: "/reports/debt", icon: CreditCard },
      { label: "Piutang", href: "/reports/receivable", icon: CreditCard },
    ],
  },
  {
    label: "Pengaturan",
    href: "/settings",
    icon: Settings,
    children: [
      { label: "Data User", href: "/settings/users", icon: UserCog },
      { label: "Kelompok Akses", href: "/settings/access-groups", icon: UserCog },
      { label: "Pengaturan Tema", href: "/settings/theme", icon: Palette },
      { label: "Pengaturan Umum", href: "/settings/general", icon: Settings },
      { label: "Pengaturan Perusahaan", href: "/settings/company", icon: Building2 },
      { label: "Integrasi", href: "/settings/integration", icon: Activity },
      { label: "Mini Printer", href: "/settings/printer", icon: Printer },
      { label: "Setting Nomor", href: "/settings/numbering", icon: Hash },
      { label: "Log Aktivitas", href: "/settings/activity-log", icon: Activity },
      { label: "Import Data", href: "/settings/import", icon: Upload },
      { label: "Pengaturan Database", href: "/settings/database", icon: Database },
    ],
  },
];

function MoreHorizontal({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </svg>
  );
}

function Clock({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12,6 12,12 16,14" />
    </svg>
  );
}

function Terminal({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="4,17 10,11 4,5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  );
}

function BarCode({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 5v14" />
      <path d="M8 5v14" />
      <path d="M12 5v14" />
      <path d="M17 5v14" />
      <path d="M21 5v14" />
    </svg>
  );
}

function NavMenuItem({ item, level = 0 }: { item: NavItem; level?: number }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(
    item.children?.some(
      (child) =>
        pathname === child.href ||
        (child.children && child.children.some((c) => pathname === c.href))
    ) || false
  );

  const isActive = item.href ? pathname === item.href || pathname.startsWith(item.href + "/") : false;
  const Icon = item.icon;
  const hasChildren = item.children && item.children.length > 0;

  return (
    <div>
      {item.href && !hasChildren ? (
        <Link
          href={item.href}
          className={cn(
            "flex items-center gap-2.5 rounded-md py-2 px-2.5 text-sm font-medium transition-colors",
            isActive
              ? "bg-purple-100 text-purple-700"
              : "text-gray-300 hover:bg-white/10 hover:text-white",
            level > 0 && "ml-4"
          )}
        >
          <Icon className="size-4 shrink-0" />
          <span className="flex-1 truncate">{item.label}</span>
        </Link>
      ) : (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-md py-2 px-2.5 text-sm font-medium transition-colors",
            isActive
              ? "bg-purple-100 text-purple-700"
              : "text-gray-300 hover:bg-white/10 hover:text-white",
            level > 0 && "ml-4"
          )}
        >
          <Icon className="size-4 shrink-0" />
          <span className="flex-1 truncate">{item.label}</span>
          {hasChildren && (
            isOpen ? (
              <ChevronDown className="size-3 shrink-0" />
            ) : (
              <ChevronRight className="size-3 shrink-0" />
            )
          )}
        </button>
      )}
      {hasChildren && isOpen && (
        <div className="mt-0.5 flex flex-col gap-0.5">
          {item.children!.map((child) => (
            <NavMenuItem key={child.href || child.label} item={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function POSSidebar() {
  return (
    <div className="flex flex-1 flex-col overflow-y-auto py-3">
      <nav className="flex flex-col gap-0.5 px-2">
        {menuItems.map((item) => (
          <NavMenuItem key={item.label} item={item} />
        ))}
      </nav>
    </div>
  );
}
