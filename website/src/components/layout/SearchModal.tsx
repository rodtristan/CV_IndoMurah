"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { Search, Code2, Users, Inbox, House, Settings } from "lucide-react";
import { useDashboard } from "@/lib/dashboard-context";
import { cn } from "@/lib/utils";

const NAV_RESULTS = [
  { label: "Home", href: "/", icon: House },
  { label: "Inbox", href: "/inbox", icon: Inbox },
  { label: "Customers", href: "/customers", icon: Users },
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "View page source", href: "https://github.com/nuxt-ui-templates/dashboard", icon: Code2, external: true },
];

export function SearchModal() {
  const { isSearchOpen, setSearchOpen } = useDashboard();
  const [query, setQuery] = useState("");
  const router = useRouter();

  const results = useMemo(
    () => NAV_RESULTS.filter((item) => item.label.toLowerCase().includes(query.toLowerCase())),
    [query],
  );

  function close() {
    setSearchOpen(false);
    setQuery("");
  }

  function select(item: (typeof NAV_RESULTS)[number]) {
    if (item.external) {
      window.open(item.href, "_blank");
    } else {
      router.push(item.href);
    }
    close();
  }

  return (
    <Dialog open={isSearchOpen} onClose={close} transition className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-zinc-950/50 transition duration-150 ease-out data-closed:opacity-0"
      />
      <div className="fixed inset-0 flex items-start justify-center p-4 pt-[15vh]">
        <DialogPanel
          transition
          className="w-full max-w-lg overflow-hidden rounded-lg border border-default bg-bg shadow-2xl transition duration-150 ease-out data-closed:scale-95 data-closed:opacity-0"
        >
          <div className="flex items-center gap-2 border-b border-default px-3.5 py-3">
            <Search className="size-4 shrink-0 text-dimmed" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              className="w-full bg-transparent text-sm text-highlighted placeholder:text-dimmed focus:outline-none"
            />
          </div>
          <div className="max-h-80 overflow-y-auto p-1.5">
            <p className="px-2 pb-1 pt-1.5 text-xs font-medium text-dimmed">Go to</p>
            {results.length === 0 && <p className="px-2 py-4 text-center text-sm text-muted">No results</p>}
            {results.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => select(item)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm text-toned hover:bg-elevated hover:text-highlighted",
                  )}
                >
                  <Icon className="size-4 shrink-0 text-dimmed" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}

export function SearchButton() {
  const { setSearchOpen, isSidebarCollapsed } = useDashboard();

  return (
    <button
      type="button"
      onClick={() => setSearchOpen(true)}
      className={cn(
        "flex w-full items-center gap-2 rounded-md py-1.5 text-sm text-dimmed ring-1 ring-default hover:bg-elevated",
        isSidebarCollapsed ? "justify-center px-1.5" : "px-2.5",
      )}
    >
      <Search className="size-4 shrink-0" />
      {!isSidebarCollapsed && (
        <>
          <span className="flex-1 text-left">Search...</span>
          <kbd className="rounded border border-default bg-elevated px-1 text-[10px] font-medium">⌘K</kbd>
        </>
      )}
    </button>
  );
}

