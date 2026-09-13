"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import type { POSUser, MenuItem } from "@/types/pos";

// ─── Types ─────────────────────────────────────────────────
interface POSContextValue {
  // User
  user: POSUser | null;
  setUser: (user: POSUser | null) => void;
  setIsAuthenticated: (value: boolean) => void;
  isAuthenticated: boolean;

  // Sidebar
  isSidebarCollapsed: boolean;
  toggleSidebarCollapsed: () => void;
  isMobileSidebarOpen: boolean;
  setMobileSidebarOpen: (value: boolean) => void;
  expandedMenus: number[];
  toggleMenu: (menuId: number) => void;

  // Search
  isSearchOpen: boolean;
  setSearchOpen: (value: boolean) => void;

  // Notifications
  isNotificationsOpen: boolean;
  setNotificationsOpen: (value: boolean) => void;

  // Company
  companyId: string;
  companyName: string;
}

// ─── Default Menu Structure (from POS Ketoko) ────────────────
export const POS_MENU: MenuItem[] = [
  {
    id: 1,
    name: "Dashboard",
    icon: "Home",
    href: "/dashboard",
  },
  {
    id: 2,
    name: "Master Data",
    icon: "Database",
    children: [
      { id: 21, name: "Item / Barang", href: "/master/items" },
      { id: 22, name: "Jenis Barang", href: "/master/categories" },
      { id: 23, name: "Satuan", href: "/master/units" },
      { id: 24, name: "Merek", href: "/master/brands" },
      { id: 25, name: "Supplier", href: "/master/suppliers" },
      { id: 26, name: "Pelanggan", href: "/master/customers" },
      { id: 27, name: "Sales", href: "/master/sales" },
      { id: 28, name: "Gudang", href: "/master/warehouses" },
    ],
  },
  {
    id: 3,
    name: "Pembelian",
    icon: "ShoppingCart",
    children: [
      { id: 31, name: "Pesanan Pembelian", href: "/purchase/orders" },
      { id: 32, name: "Daftar Pembelian", href: "/purchase/list" },
      { id: 33, name: "History Harga Beli", href: "/purchase/price-history" },
      { id: 34, name: "Retur Pembelian", href: "/purchase/returns" },
      { id: 35, name: "Daftar Pembayaran", href: "/purchase/payments" },
    ],
  },
  {
    id: 4,
    name: "Penjualan",
    icon: "Store",
    children: [
      { id: 41, name: "Pesanan Penjualan", href: "/sale/orders" },
      { id: 42, name: "POS / Kasir", href: "/sale/pos" },
      { id: 43, name: "History Harga Jual", href: "/sale/price-history" },
      { id: 44, name: "Retur Penjualan", href: "/sale/returns" },
      { id: 45, name: "Point Penjualan", href: "/sale/points" },
      { id: 46, name: "Daftar Pembayaran", href: "/sale/payments" },
    ],
  },
  {
    id: 5,
    name: "Persediaan",
    icon: "Package",
    children: [
      { id: 51, name: "Item Masuk", href: "/inventory/stock-in" },
      { id: 52, name: "Item Keluar", href: "/inventory/stock-out" },
      { id: 53, name: "Stock Opname", href: "/inventory/stock-opname" },
      { id: 54, name: "Transfer Item", href: "/inventory/transfers" },
      { id: 55, name: "Stock Minimum", href: "/inventory/minimum-stock" },
    ],
  },
  {
    id: 6,
    name: "Akuntansi",
    icon: "Calculator",
    children: [
      { id: 61, name: "Kas Masuk", href: "/accounting/cash-in" },
      { id: 62, name: "Kas Keluar", href: "/accounting/cash-out" },
      { id: 63, name: "Kas Transfer", href: "/accounting/cash-transfer" },
      { id: 64, name: "Deposit Pelanggan", href: "/accounting/deposits/customer" },
      { id: 65, name: "Deposit Supplier", href: "/accounting/deposits/supplier" },
      { id: 66, name: "Daftar Jurnal", href: "/accounting/journals" },
      { id: 67, name: "Buku Besar", href: "/accounting/ledger" },
      { id: 68, name: "Daftar Perkiraan", href: "/accounting/accounts" },
    ],
  },
  {
    id: 7,
    name: "Laporan",
    icon: "BarChart",
    children: [
      { id: 71, name: "Laporan Master", href: "/reports/master" },
      { id: 72, name: "Laporan Pembelian", href: "/reports/purchase" },
      { id: 73, name: "Laporan Penjualan", href: "/reports/sale" },
      { id: 74, name: "Laporan Hutang", href: "/reports/debt" },
      { id: 75, name: "Laporan Piutang", href: "/reports/receivable" },
      { id: 76, name: "Laporan Persediaan", href: "/reports/inventory" },
      { id: 77, name: "Laporan Kas", href: "/reports/cash" },
      { id: 78, name: "Laba Jual", href: "/reports/profit" },
      { id: 79, name: "Keuangan", href: "/reports/financial" },
    ],
  },
  {
    id: 8,
    name: "Pengaturan",
    icon: "Settings",
    children: [
      { id: 81, name: "Data User", href: "/settings/users" },
      { id: 82, name: "Pengaturan Umum", href: "/settings/general" },
      { id: 83, name: "Data Perusahaan", href: "/settings/company" },
      { id: 84, name: "Setting Nomor", href: "/settings/numbering" },
      { id: 85, name: "Log Aktivitas", href: "/settings/activity-log" },
    ],
  },
];

// ─── Context ───────────────────────────────────────────────
const POSContext = createContext<POSContextValue | null>(null);

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  return tag === "input" || tag === "textarea" || target.isContentEditable;
}

// ─── Provider ──────────────────────────────────────────────
export function POSProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  // User state
  const [user, setUser] = useState<POSUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Sidebar state
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<number[]>([1]); // Dashboard expanded by default

  // UI state
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);

  // Company info (from login)
  const [companyId, setCompanyId] = useState("XIANGYU");
  const [companyName] = useState("Toko CV IndoMurah");

  // Keyboard shortcuts ref
  const pendingG = useRef(false);
  const pendingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Toggle sidebar collapse
  const toggleSidebarCollapsed = useCallback(() => {
    setSidebarCollapsed((v) => !v);
  }, []);

  // Toggle menu expansion
  const toggleMenu = useCallback((menuId: number) => {
    setExpandedMenus((prev) =>
      prev.includes(menuId) ? prev.filter((id) => id !== menuId) : [...prev, menuId]
    );
  }, []);

  // Close sidebar/menus on route change
  const previousPathname = useRef(pathname);
  useEffect(() => {
    if (previousPathname.current === pathname) return;
    previousPathname.current = pathname;
    setMobileSidebarOpen(false);
  }, [pathname]);

  // Keyboard shortcuts
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (isTypingTarget(e.target)) return;

      // Cmd/Ctrl + K = Search
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
        return;
      }

      // Escape = Close modals/search
      if (e.key === "Escape") {
        setSearchOpen(false);
        setNotificationsOpen(false);
        return;
      }

      // G + key shortcuts (goto)
      if (pendingG.current) {
        pendingG.current = false;
        if (pendingTimeout.current) clearTimeout(pendingTimeout.current);
        switch (e.key.toLowerCase()) {
          case "h":
            router.push("/");
            break;
          case "d":
            router.push("/");
            break;
        }
        return;
      }

      if (e.key.toLowerCase() === "g") {
        pendingG.current = true;
        pendingTimeout.current = setTimeout(() => {
          pendingG.current = false;
        }, 800);
        return;
      }

      // N = Notifications
      if (e.key.toLowerCase() === "n") {
        setNotificationsOpen((v) => !v);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [router]);

  // Check for existing session
  useEffect(() => {
    const savedUser = localStorage.getItem("pos_user");
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch {
        localStorage.removeItem("pos_user");
      }
    }
  }, []);

  const value: POSContextValue = {
    user,
    setUser,
    setIsAuthenticated: setIsAuthenticated as (value: boolean) => void,
    isAuthenticated,
    isSidebarCollapsed,
    toggleSidebarCollapsed,
    isMobileSidebarOpen,
    setMobileSidebarOpen,
    expandedMenus,
    toggleMenu,
    isSearchOpen,
    setSearchOpen,
    isNotificationsOpen,
    setNotificationsOpen,
    companyId,
    companyName,
  };

  return <POSContext.Provider value={value}>{children}</POSContext.Provider>;
}

// ─── Hook ───────────────────────────────────────────────────
export function usePOS() {
  const ctx = useContext(POSContext);
  if (!ctx) throw new Error("usePOS must be used within POSProvider");
  return ctx;
}
