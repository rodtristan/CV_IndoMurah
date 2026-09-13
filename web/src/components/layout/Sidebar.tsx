"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  ArrowLeftRight,
  FileText,
  Users,
  Building2,
  Truck,
  Coins,
  Wallet,
  Banknote,
  ArrowDownUp,
  UserCog,
  Settings,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

// ─── Menu Types ──────────────────────────────────────────────

interface MenuItem {
  label: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: MenuItem[];
  badge?: string | number;
}

interface MenuGroup {
  label: string;
  items: MenuItem[];
}

// ─── Menu Configuration ──────────────────────────────────────

const MENU_GROUPS: MenuGroup[] = [
  {
    label: "Dashboard",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: "Penjualan",
    items: [
      {
        label: "POS",
        href: "/sale/pos",
        icon: ShoppingCart,
        badge: " baru",
      },
      {
        label: "Daftar Penjualan",
        href: "/sale/list",
        icon: FileText,
      },
      {
        label: "Retur Penjualan",
        href: "/sale/returns",
        icon: ArrowLeftRight,
      },
    ],
  },
  {
    label: "Pembelian",
    items: [
      {
        label: "Pesanan Pembelian",
        href: "/purchase/order",
        icon: Package,
      },
      {
        label: "Daftar Pembelian",
        href: "/purchase/list",
        icon: FileText,
      },
      {
        label: "Retur Pembelian",
        href: "/purchase/returns",
        icon: ArrowLeftRight,
      },
    ],
  },
  {
    label: "Inventory",
    items: [
      {
        label: "Barang Masuk",
        href: "/inventory/stock-in",
        icon: Coins,
      },
      {
        label: "Barang Keluar",
        href: "/inventory/stock-out",
        icon: Wallet,
      },
      {
        label: "Transfer Stock",
        href: "/inventory/transfers",
        icon: ArrowDownUp,
      },
      {
        label: "Stock Opname",
        href: "/inventory/stock-opname",
        icon: Package,
      },
      {
        label: "Stock Minim",
        href: "/inventory/minimum-stock",
        icon: ArrowLeftRight,
      },
    ],
  },
  {
    label: "Akunting",
    items: [
      {
        label: "Chart of Accounts",
        href: "/accounting/accounts",
        icon: Banknote,
      },
      {
        label: "Jurnal Umum",
        href: "/accounting/journals",
        icon: FileText,
      },
      {
        label: "Kas Masuk",
        href: "/accounting/cash-in",
        icon: Coins,
      },
      {
        label: "Kas Keluar",
        href: "/accounting/cash-out",
        icon: Wallet,
      },
      {
        label: "Transfer Kas",
        href: "/accounting/cash-transfer",
        icon: ArrowDownUp,
      },
      {
        label: "Setoran Pelanggan",
        href: "/accounting/customer-deposits",
        icon: Coins,
      },
      {
        label: "Setoran Supplier",
        href: "/accounting/supplier-deposits",
        icon: Coins,
      },
    ],
  },
  {
    label: "Laporan",
    items: [
      {
        label: "Penjualan",
        href: "/reports/sales",
        icon: FileText,
      },
      {
        label: "Pembelian",
        href: "/reports/purchase",
        icon: FileText,
      },
      {
        label: "Inventory",
        href: "/reports/inventory",
        icon: Package,
      },
      {
        label: "Keuangan",
        href: "/reports/financial",
        icon: Banknote,
      },
      {
        label: "Laba Rugi",
        href: "/reports/profit",
        icon: FileText,
      },
      {
        label: "Arus Kas",
        href: "/reports/cash",
        icon: Coins,
      },
      {
        label: "Hutang",
        href: "/reports/debt",
        icon: Truck,
      },
      {
        label: "Piutang",
        href: "/reports/receivable",
        icon: Users,
      },
      {
        label: "Stock Opname",
        href: "/reports/stock-opname",
        icon: Package,
      },
    ],
  },
  {
    label: "Master",
    items: [
      {
        label: "Produk",
        href: "/master/items",
        icon: Package,
      },
      {
        label: "Kategori",
        href: "/master/categories",
        icon: Building2,
      },
      {
        label: "Merek",
        href: "/master/brands",
        icon: Building2,
      },
      {
        label: "Satuan",
        href: "/master/units",
        icon: Building2,
      },
      {
        label: "Gudang",
        href: "/master/warehouses",
        icon: Building2,
      },
      {
        label: "Pelanggan",
        href: "/master/customers",
        icon: Users,
      },
      {
        label: "Supplier",
        href: "/master/suppliers",
        icon: Truck,
      },
      {
        label: "Sales Person",
        href: "/master/sales-persons",
        icon: Users,
      },
      {
        label: "Sale Point",
        href: "/master/sale-points",
        icon: Building2,
      },
    ],
  },
  {
    label: "Pengaturan",
    items: [
      {
        label: "Perusahaan",
        href: "/settings/company",
        icon: Building2,
      },
      {
        label: "Pengguna",
        href: "/settings/users",
        icon: UserCog,
      },
      {
        label: "Hak Akses",
        href: "/settings/roles",
        icon: Settings,
      },
    ],
  },
];

// ─── Components ───────────────────────────────────────────────

function MenuLink({
  item,
  isActive,
}: {
  item: MenuItem;
  isActive: boolean;
}) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href || "#"}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-primary/10 text-primary"
          : "text-muted hover:bg-elevated hover:text-highlighted"
      )}
    >
      <Icon className={cn("size-5 shrink-0", isActive && "text-primary")} />
      <span className="flex-1">{item.label}</span>
      {item.badge && (
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
          {item.badge}
        </span>
      )}
    </Link>
  );
}

function MenuSection({ group }: { group: MenuGroup }) {
  const pathname = usePathname();
  const hasActiveChild = group.items.some(
    (item) =>
      item.href &&
      (pathname === item.href || pathname.startsWith(item.href + "/"))
  );

  return (
    <div className="space-y-1">
      <div
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider",
          hasActiveChild ? "text-primary" : "text-muted"
        )}
      >
        <span>{group.label}</span>
      </div>
      {group.items.map((item) => {
        const isActive =
          item.href &&
          (pathname === item.href || pathname.startsWith(item.href + "/"));
        return (
          <MenuLink key={item.href || item.label} item={item} isActive={!!isActive} />
        );
      })}
    </div>
  );
}

export function POSSidebar({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin">
      <div className="space-y-6">
        {MENU_GROUPS.map((group, i) => (
          <MenuSection key={i} group={group} />
        ))}
      </div>
    </nav>
  );
}

export function UserMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-t border-default px-3 py-3">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-elevated"
      >
        <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
          <span className="text-sm font-semibold">AD</span>
        </div>
        <div className="flex-1 text-left">
          <p className="font-medium">Admin User</p>
          <p className="text-xs text-muted">admin@indomurah.com</p>
        </div>
        {open ? (
          <ChevronDown className="size-4 text-muted" />
        ) : (
          <ChevronRight className="size-4 text-muted" />
        )}
      </button>
      {open && (
        <div className="mt-2 space-y-1 border-l-2 border-primary/20 pl-2">
          <Link
            href="/settings/profile"
            className="block rounded-lg px-3 py-2 text-sm text-muted hover:bg-elevated hover:text-highlighted"
          >
            Profile
          </Link>
          <Link
            href="/settings"
            className="block rounded-lg px-3 py-2 text-sm text-muted hover:bg-elevated hover:text-highlighted"
          >
            Settings
          </Link>
          <button className="block w-full rounded-lg px-3 py-2 text-left text-sm text-danger hover:bg-danger/5">
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
