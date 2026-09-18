"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";

export interface CurrentUser {
  id: string;
  username: string;
  name: string;
  email: string | null;
  role: string;
  isActive: boolean;
  company: { ID: number; CompanyCode: string; Name: string } | null;
  menus: unknown[];
}

interface AuthContextValue {
  user: CurrentUser | null;
  loading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({ user: null, loading: true, logout: () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    api.logout();
    setUser(null);
    router.replace("/auth/login");
  }, [router]);

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      if (!api.getToken()) {
        router.replace("/auth/login");
        return;
      }
      const res = await api.get<CurrentUser>("auth/me").catch(() => ({ success: false, data: null } as any));
      if (cancelled) return;
      if (res.success && res.data) {
        setUser(res.data);
        setLoading(false);
      } else {
        api.logout();
        router.replace("/auth/login");
      }
    };

    check();
    return () => { cancelled = true; };
  }, [router]);

  return <AuthContext.Provider value={{ user, loading, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
