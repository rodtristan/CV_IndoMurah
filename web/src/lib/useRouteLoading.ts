"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * True from the moment an internal <Link>/nav click fires until the target
 * page's pathname actually lands. Covers the Next.js route-transition gap
 * (RSC fetch + render) that api-client's in-flight tracker can't see, since
 * that gap isn't a `fetch()` call api-client wraps.
 */
export function useRouteLoading(): boolean {
  const [navigating, setNavigating] = useState(false);
  const pathname = usePathname();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setNavigating(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, [pathname]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = (e.target as HTMLElement)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      const href = anchor.getAttribute("href");
      if (!href || !href.startsWith("/")) return;
      const url = new URL(href, window.location.origin);
      if (url.pathname === window.location.pathname) return;

      setNavigating(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setNavigating(false), 8000);
    }
    // Fase capture: <Link> Next.js memanggil preventDefault() di handler-nya
    // sendiri, jadi di fase bubble klik navigasi selalu terlihat "dibatalkan".
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return navigating;
}
