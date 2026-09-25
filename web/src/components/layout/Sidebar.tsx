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
  /** Omitted for a submenu header that only groups `children`. */
  href?: string;
  badge?: string;
  disabled?: boolean;
  /** Nested submenu (one level, accordion). */
  children?: SubItem[];
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
      { label: "Datasheet", href: "/master/datasheet" },
      { label: "Daftar Supplier", href: "/master/suppliers" },
      { label: "Daftar Pelanggan", href: "/master/customers" },
      { label: "Daftar Sales", href: "/master/sales-persons" },
      { label: "Daftar Grup Pelanggan", href: "/master/customer-groups" },
      {
        label: "Wilayah",
        children: [
          { label: "Daftar Wilayah", href: "/master/regions" },
          { label: "Daftar Sub Wilayah", href: "/master/sub-regions" },
        ],
      },
      {
        label: "Diskon & Promosi",
        children: [
          { label: "Promo Periode", href: "/master/promotions" },
          { label: "Voucher", href: "/master/vouchers" },
        ],
      },
      {
        label: "Data Lainnya",
        children: [
          { label: "Data Jenis", href: "/master/categories" },
          { label: "Data Merek", href: "/master/brands" },
          { label: "Data Satuan", href: "/master/units" },
          { label: "Dept./Gudang", href: "/master/warehouses" },
          { label: "Daftar Rak", href: "/master/shelves" },
          { label: "Data Bank", href: "/master/banks" },
          { label: "Daftar E-Money", href: "/master/e-money" },
          { label: "Daftar Ongkir", href: "/master/shipping-costs" },
          { label: "Point Pelanggan", href: "/master/point-settings" },
          { label: "Sale Point", href: "/master/sale-points" },
        ],
      },
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
      { label: "Daftar Pembayaran", href: "/purchase/payments" },
      { label: "Status Lunas Bg/Cek", href: "/purchase/payments/cheque" },
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
      { label: "Daftar Pembayaran", href: "/sale/payments" },
      { label: "Status Lunas Cek/Bg", href: "/sale/payments/cheque" },
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
      { label: "Perbaikan Saldo", href: "/inventory/fix-balance" },
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
      { label: "Saldo Deposit", href: "/accounting/deposit-balance" },
      { label: "Setting Perkiraan", href: "/accounting/account-settings" },
      { label: "Saldo Awal", href: "/accounting/opening-balance" },
      { label: "Tutup Tahun", href: "/accounting/year-close" },
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
      { label: "Lokasi Absensi", href: "/hr/attendance-locations" },
    ],
  },
  {
    key: "reports",
    label: "Laporan",
    icon: BarChart3,
    iconColor: "#3F51B5",
    href: "/reports",
  },
  {
    key: "settings",
    label: "Pengaturan",
    icon: Settings,
    iconColor: "#78909C",
    items: [
      { label: "Daftar User", href: "/settings/users" },
      { label: "Kelompok Akses User", href: "/settings/roles" },
      { label: "Pengaturan Umum", href: "/settings/general" },
      { label: "Data Perusahaan", href: "/settings/company" },
      { label: "Pengaturan Website", href: "/settings/website" },
      { label: "Setting Nomor", href: "/settings/numbering" },
      { label: "Log Aktivitas", href: "/settings/activity-log" },
      { label: "List Backup", href: "/settings/backup" },
      { label: "Import Data", href: "/settings/import" },
      { label: "Pengaturan Database", href: "/settings/database" },
      { label: "Menu Aplikasi", href: "/settings/menus" },
    ],
  },
  {
    key: "ecommerce",
    label: "E-commerce",
    icon: Store,
    iconColor: "#F4511E",
  },
];

/** Every linkable entry of a group, including nested submenu children. */
function flatItems(items: SubItem[] | undefined): SubItem[] {
  return (items ?? []).flatMap((i) => [i, ...flatItems(i.children)]);
}

/** Longest-href match across every menu item, so "/reports" doesn't light up for "/reports/sales". */
function findActiveHref(pathname: string): string | null {
  let best: string | null = null;
  for (const g of MENU_GROUPS) {
    for (const i of flatItems(g.items)) {
      if (!i.href) continue;
      if (pathname === i.href || pathname.startsWith(i.href + "/")) {
        if (!best || i.href.length > best.length) best = i.href;
      }
    }
  }
  return best;
}

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

function ItemLink({ item, active, depth }: { item: SubItem; active: boolean; depth: number }) {
  const pad = depth === 0 ? "pl-[52px]" : "pl-[72px]";
  if (item.disabled || !item.href) {
    return (
      <div
        title="Fitur ini sedang tidak diaktifkan"
        className={cn("flex cursor-not-allowed items-center gap-2 py-2.5 pr-5 text-[14px] text-white/30", pad)}
      >
        <span className="flex-1 truncate">{item.label}</span>
        <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] font-normal text-white/40">nonaktif</span>
      </div>
    );
  }
  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-2 py-2.5 pr-5 text-[14px] transition-colors",
        pad,
        active ? "bg-sidebar-active font-medium text-white" : "text-white/80 hover:bg-sidebar-hover hover:text-white"
      )}
    >
      <span className="flex-1 truncate">{item.label}</span>
      {item.badge && <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] text-white">{item.badge}</span>}
    </Link>
  );
}

function AccordionPanel({
  group,
  isOpen,
}: {
  group: MenuGroup;
  isOpen: boolean;
}) {
  const pathname = usePathname();
  const activeHref = findActiveHref(pathname);
  // Only one nested submenu open at a time; the one holding the active page starts open.
  const [openSub, setOpenSub] = useState<string | null>(
    () => group.items?.find((i) => i.children?.some((c) => c.href === activeHref))?.label ?? null
  );
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
          if (!item.children?.length) {
            return <ItemLink key={item.href ?? item.label} item={item} active={item.href === activeHref} depth={0} />;
          }
          const subOpen = openSub === item.label;
          const subActive = item.children.some((c) => c.href === activeHref);
          return (
            <div key={item.label}>
              <button
                type="button"
                onClick={() => setOpenSub(subOpen ? null : item.label)}
                className={cn(
                  "flex w-full items-center gap-2 py-2.5 pl-[52px] pr-5 text-left text-[14px] transition-colors",
                  subActive ? "font-medium text-white" : "text-white/80 hover:bg-sidebar-hover hover:text-white"
                )}
              >
                <span className="flex-1 truncate">{item.label}</span>
                {subOpen ? <ChevronDown className="size-3.5 shrink-0 opacity-70" /> : <ChevronRight className="size-3.5 shrink-0 opacity-70" />}
              </button>
              <div
                className={cn(
                  "grid overflow-hidden bg-black/20 transition-[grid-template-rows] duration-200 ease-in-out",
                  subOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                )}
              >
                <div className="min-h-0">
                  {item.children.map((c) => (
                    <ItemLink key={c.href ?? c.label} item={c} active={c.href === activeHref} depth={1} />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function POSSidebar({ collapsed = false }: { collapsed?: boolean }) {
  const pathname = usePathname();
  const activeHref = findActiveHref(pathname);
  const [openKey, setOpenKey] = useState<string | null>(() => {
    const active = MENU_GROUPS.find((g) => flatItems(g.items).some((i) => i.href === activeHref));
    return active?.key ?? null;
  });

  return (
    <nav className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin">
      {MENU_GROUPS.map((group) => {
        const isGroupActive =
          (group.href && (pathname === group.href || pathname.startsWith(group.href + "/"))) ||
          flatItems(group.items).some((i) => i.href === activeHref);
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
