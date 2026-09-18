"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Package,
  Truck,
  ShoppingBasket,
  Wrench,
  Boxes,
  Landmark,
  BarChart3,
  Settings,
  Store,
  ChevronDown,
  ChevronRight,
  UserCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, type CSSProperties } from "react";

// ─── Menu Types ──────────────────────────────────────────────

interface SubItem {
  label: string;
  href: string;
  badge?: string;
  disabled?: boolean;
}

interface MenuGroup {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string; style?: CSSProperties }>;
  iconColor: string;
  href?: string;
  items?: SubItem[];
}

// ─── Menu Configuration ──────────────────────────────────────
// Mirrors the module list & order of the real Ketoko.co.id sidebar
// (Home, Master Data, Pembelian, Penjualan, Perakitan, Persediaan,
// Akuntansi, Laporan, Pengaturan, E-commerce).

const MENU_GROUPS: MenuGroup[] = [
  {
    key: "home",
    label: "Home",
    icon: Home,
    iconColor: "#F4C430",
    href: "/dashboard",
  },
  {
    key: "master",
    label: "Master Data",
    icon: Package,
    iconColor: "#FF9800",
    items: [
      { label: "Daftar Item", href: "/master/items" },
      { label: "Kartu Stok", href: "/master/items/stock-card" },
      { label: "Kategori", href: "/master/categories" },
      { label: "Merek", href: "/master/brands" },
      { label: "Satuan", href: "/master/units" },
      { label: "Gudang", href: "/master/warehouses" },
      { label: "Pelanggan", href: "/master/customers" },
      { label: "Supplier", href: "/master/suppliers" },
      { label: "Sales Person", href: "/master/sales-persons" },
      { label: "Sale Point", href: "/master/sale-points" },
    ],
  },
  {
    key: "purchase",
    label: "Pembelian",
    icon: Truck,
    iconColor: "#7B1FA2",
    items: [
      { label: "Pesanan Pembelian", href: "/purchase/order", disabled: true },
      { label: "Daftar Pembelian", href: "/purchase/list" },
      { label: "Retur Pembelian", href: "/purchase/returns" },
    ],
  },
  {
    key: "sale",
    label: "Penjualan",
    icon: ShoppingBasket,
    iconColor: "#43A047",
    items: [
      { label: "Kasir (POS)", href: "/sale/pos", badge: "baru" },
      { label: "Daftar Penjualan", href: "/sale/list" },
      { label: "Retur Penjualan", href: "/sale/returns" },
      { label: "History Harga Jual", href: "/sale/price-history" },
      { label: "Point Penjualan", href: "/sale/points" },
      { label: "Data Pengiriman", href: "/sale/shipping" },
    ],
  },
  {
    key: "assembly",
    label: "Perakitan",
    icon: Wrench,
    iconColor: "#E53935",
  },
  {
    key: "inventory",
    label: "Persediaan",
    icon: Boxes,
    iconColor: "#00897B",
    items: [
      { label: "Barang Masuk", href: "/inventory/stock-in" },
      { label: "Barang Keluar", href: "/inventory/stock-out" },
      { label: "Transfer Stock", href: "/inventory/transfers" },
      { label: "Stock Opname", href: "/inventory/stock-opname" },
      { label: "Saldo Awal", href: "/inventory/opening-stock" },
      { label: "Stock Minim", href: "/inventory/minimum-stock", disabled: true },
    ],
  },
  {
    key: "accounting",
    label: "Akuntansi",
    icon: Landmark,
    iconColor: "#00ACC1",
    items: [
      { label: "Chart of Accounts", href: "/accounting/accounts" },
      { label: "Jurnal Umum", href: "/accounting/journals" },
      { label: "Kas Masuk", href: "/accounting/cash-in" },
      { label: "Kas Keluar", href: "/accounting/cash-out" },
      { label: "Transfer Kas", href: "/accounting/cash-transfer", disabled: true },
      { label: "Setoran Pelanggan", href: "/accounting/customer-deposits" },
      { label: "Setoran Supplier", href: "/accounting/supplier-deposits" },
    ],
  },
  {
    key: "hr",
    label: "Kepegawaian",
    icon: UserCheck,
    iconColor: "#8E24AA",
    items: [
      { label: "Absensi", href: "/hr/attendance" },
      { label: "Karyawan", href: "/hr/employees" },
    ],
  },
  {
    key: "reports",
    label: "Laporan",
    icon: BarChart3,
    iconColor: "#3F51B5",
    items: [
      { label: "Penjualan", href: "/reports/sales" },
      { label: "Pembelian", href: "/reports/purchase" },
      { label: "Inventory", href: "/reports/inventory" },
      { label: "Mutasi Stok", href: "/reports/stock-mutation" },
      { label: "Keuangan", href: "/reports/financial" },
      { label: "Laba Rugi", href: "/reports/profit" },
      { label: "Arus Kas", href: "/reports/cash" },
      { label: "Hutang", href: "/reports/debt" },
      { label: "Piutang", href: "/reports/receivable" },
      { label: "Stock Opname", href: "/reports/stock-opname" },
    ],
  },
  {
    key: "settings",
    label: "Pengaturan",
    icon: Settings,
    iconColor: "#78909C",
    items: [
      { label: "Perusahaan", href: "/settings/company" },
      { label: "Pengguna", href: "/settings/users" },
      { label: "Hak Akses", href: "/settings/roles" },
      { label: "Menu Aplikasi", href: "/settings/menus" },
      { label: "Log Aktivitas", href: "/settings/activity-log" },
      { label: "Import Data", href: "/settings/import" },
      { label: "Pengaturan Umum", href: "/settings/general" },
      { label: "Setting Nomor", href: "/settings/numbering" },
    ],
  },
  {
    key: "ecommerce",
    label: "E-commerce",
    icon: Store,
    iconColor: "#F4511E",
  },
];

// ─── Components ───────────────────────────────────────────────
// Clicking a group with children accordions its sub-items open directly
// below the row (pushing the rest of the sidebar down), matching
// Ketoko.co.id.

function GroupRow({
  group,
  collapsed,
  isOpen,
  isActive,
  onToggle,
}: {
  group: MenuGroup;
  collapsed: boolean;
  isOpen: boolean;
  isActive: boolean;
  onToggle: () => void;
}) {
  const Icon = group.icon;
  const hasChildren = !!group.items?.length;

  const inner = (
    <>
      <Icon className="size-5 shrink-0" style={{ color: group.iconColor }} />
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{group.label}</span>
          {!group.href && !hasChildren && (
            <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] font-normal text-white/50">
              segera
            </span>
          )}
          {hasChildren &&
            (isOpen ? (
              <ChevronDown className="size-3.5 shrink-0 opacity-70" />
            ) : (
              <ChevronRight className="size-3.5 shrink-0 opacity-70" />
            ))}
        </>
      )}
    </>
  );

  const rowClass = cn(
    "flex w-full items-center gap-3.5 px-5 py-[15px] text-[15px] font-semibold leading-none transition-colors",
    isActive ? "bg-sidebar-active text-white" : "text-white hover:bg-sidebar-hover",
    !group.href && !hasChildren && "cursor-default text-white/50 hover:bg-transparent"
  );

  if (group.href && !hasChildren) {
    return (
      <Link href={group.href} className={rowClass}>
        {inner}
      </Link>
    );
  }

  if (hasChildren) {
    return (
      <button type="button" onClick={onToggle} className={rowClass}>
        {inner}
      </button>
    );
  }

  return <div className={rowClass}>{inner}</div>;
}

function AccordionPanel({
  group,
  isOpen,
}: {
  group: MenuGroup;
  isOpen: boolean;
}) {
  const pathname = usePathname();
  if (!group.items?.length) return null;

  return (
    <div
      className={cn(
        "grid overflow-hidden bg-black/20 transition-[grid-template-rows] duration-200 ease-in-out",
        isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
      )}
    >
      <div className="min-h-0">
        {group.items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");

          if (item.disabled) {
            return (
              <div
                key={item.href}
                title="Fitur ini sedang tidak diaktifkan"
                className="flex cursor-not-allowed items-center gap-2 py-2.5 pl-[52px] pr-5 text-[14px] text-white/30"
              >
                <span className="flex-1 truncate">{item.label}</span>
                <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] font-normal text-white/40">
                  nonaktif
                </span>
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 py-2.5 pl-[52px] pr-5 text-[14px] transition-colors",
                active ? "bg-sidebar-active font-medium text-white" : "text-white/80 hover:bg-sidebar-hover hover:text-white"
              )}
            >
              <span className="flex-1 truncate">{item.label}</span>
              {item.badge && (
                <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] text-white">{item.badge}</span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function POSSidebar({ collapsed = false }: { collapsed?: boolean }) {
  const pathname = usePathname();
  const [openKey, setOpenKey] = useState<string | null>(() => {
    const active = MENU_GROUPS.find((g) =>
      g.items?.some((i) => pathname === i.href || pathname.startsWith(i.href + "/"))
    );
    return active?.key ?? null;
  });

  return (
    <nav className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin">
      {MENU_GROUPS.map((group) => {
        const isGroupActive =
          (group.href && (pathname === group.href || pathname.startsWith(group.href + "/"))) ||
          !!group.items?.some((i) => pathname === i.href || pathname.startsWith(i.href + "/"));
        const isOpen = openKey === group.key;

        return (
          <div key={group.key}>
            <GroupRow
              group={group}
              collapsed={collapsed}
              isOpen={isOpen}
              isActive={!!isGroupActive}
              onToggle={() => setOpenKey(isOpen ? null : group.key)}
            />
            {!collapsed && <AccordionPanel group={group} isOpen={isOpen} />}
          </div>
        );
      })}
    </nav>
  );
}
