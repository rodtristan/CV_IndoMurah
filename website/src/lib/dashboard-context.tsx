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

interface DashboardContextValue {
  isNotificationsSlideoverOpen: boolean;
  setNotificationsSlideoverOpen: (value: boolean) => void;
  isSidebarCollapsed: boolean;
  toggleSidebarCollapsed: () => void;
  isMobileSidebarOpen: boolean;
  setMobileSidebarOpen: (value: boolean) => void;
  isSearchOpen: boolean;
  setSearchOpen: (value: boolean) => void;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  return tag === "input" || tag === "textarea" || target.isContentEditable;
}

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [isNotificationsSlideoverOpen, setNotificationsSlideoverOpen] = useState(false);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isSearchOpen, setSearchOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const pendingG = useRef(false);
  const pendingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toggleSidebarCollapsed = useCallback(() => {
    setSidebarCollapsed((v) => !v);
  }, []);

  // Close notifications slideover and mobile sidebar on route change (but not
  // on the initial mount, since both already start closed).
  const previousPathname = useRef(pathname);
  useEffect(() => {
    if (previousPathname.current === pathname) return;
    previousPathname.current = pathname;
    // Synchronizing with the router (an external system) is a valid effect
    // use case.
    setNotificationsSlideoverOpen(false);
    setMobileSidebarOpen(false);
  }, [pathname]);

  // Keyboard shortcuts: g+h, g+i, g+c, g+s (navigation), n (notifications), meta+k (search)
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (isTypingTarget(e.target)) return;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
        return;
      }

      if (pendingG.current) {
        pendingG.current = false;
        if (pendingTimeout.current) clearTimeout(pendingTimeout.current);
        switch (e.key.toLowerCase()) {
          case "h":
            router.push("/");
            break;
          case "i":
            router.push("/inbox");
            break;
          case "c":
            router.push("/customers");
            break;
          case "s":
            router.push("/settings");
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

      if (e.key.toLowerCase() === "n") {
        setNotificationsSlideoverOpen((v) => !v);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [router]);

  return (
    <DashboardContext.Provider
      value={{
        isNotificationsSlideoverOpen,
        setNotificationsSlideoverOpen,
        isSidebarCollapsed,
        toggleSidebarCollapsed,
        isMobileSidebarOpen,
        setMobileSidebarOpen,
        isSearchOpen,
        setSearchOpen,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used within DashboardProvider");
  return ctx;
}
