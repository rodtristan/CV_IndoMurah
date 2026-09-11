"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Eye,
  EyeOff,
  Lock,
  User,
  Building,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { usePOS } from "@/lib/pos-context";
import type { POSUser } from "@/types/pos";

export default function POSLoginPage() {
  const router = useRouter();
  const { setUser, setIsAuthenticated } = usePOS();

  const [companyId, setCompanyId] = useState("");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // TODO: Replace with actual API call
      // const response = await authApi.login({ companyId, userId, password });

      // Mock login - accept any credentials for demo
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (!companyId || !userId || !password) {
        setError("Semua field harus diisi");
        setLoading(false);
        return;
      }

      // Mock successful login
      const mockUser: POSUser = {
        id: 1,
        companyId: companyId.toUpperCase(),
        userId: userId,
        fullName: "Administrator",
        email: "admin@example.com",
        role: "admin",
      };

      // Save to localStorage
      localStorage.setItem("pos_user", JSON.stringify(mockUser));
      localStorage.setItem("pos_company_id", companyId);

      setUser(mockUser);
      setIsAuthenticated(true);

      router.push("/dashboard");
    } catch (err) {
      setError("Login gagal. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh">
      {/* Left Panel - Dark Gradient Branding */}
      <div className="hidden flex-1 flex-col justify-between bg-gradient-dark p-8 text-white lg:flex">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
              <Building2 className="size-6" />
            </div>
            <span className="text-xl font-bold">Ketoko.co.id</span>
          </div>
        </div>

        <div className="space-y-6">
          <h1 className="text-3xl font-bold leading-tight">
            Kendalikan Bisnis Anda dalam Satu Ekosistem
          </h1>
          <p className="text-lg text-slate-300">
            Tingkatkan efisiensi operasional dengan solusi cloud ERP,
            point-of-sale, dan manajemen inventori terintegrasi.
          </p>

          <div className="grid gap-4 pt-4">
            <div className="flex items-center gap-3 rounded-xl bg-white/10 p-4 backdrop-blur-sm">
              <div className="flex size-10 items-center justify-center rounded-lg bg-purple-500/30">
                <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <div className="font-medium">Sistem Inventori Terpusat & Akurat</div>
                <div className="text-sm text-slate-300">Kelola stok real-time</div>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-white/10 p-4 backdrop-blur-sm">
              <div className="flex size-10 items-center justify-center rounded-lg bg-purple-500/30">
                <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <div className="font-medium">Analitik & Laporan Keuangan Real-time</div>
                <div className="text-sm text-slate-300">Lihat data kapan saja</div>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-white/10 p-4 backdrop-blur-sm">
              <div className="flex size-10 items-center justify-center rounded-lg bg-purple-500/30">
                <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <div>
                <div className="font-medium">Integrasi Omnichannel & Multi-Cabang</div>
                <div className="text-sm text-slate-300">Jual di mana saja</div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-sm text-slate-400">
          © Ketoko.co.id 2.3.1.0 - Inspirasibiz / Inspirasi Media Kreatif
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex flex-1 flex-col justify-center px-8 py-12 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile Logo */}
          <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-white">
              <Building2 className="size-6" />
            </div>
            <span className="text-xl font-bold text-highlighted">Ketoko.co.id</span>
          </div>

          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-2xl font-bold text-highlighted">Ketoko.co.id</h2>
            <p className="mt-2 text-muted">
              Masuk untuk mengelola layanan Ketoko.co.id akun Anda
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-error/10 px-4 py-3 text-sm text-error">
              <AlertCircle className="size-5 shrink-0" />
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Company ID */}
            <div className="space-y-1.5">
              <label
                htmlFor="companyId"
                className="block text-sm font-medium text-toned"
              >
                ID Perusahaan
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Building className="size-4 text-dimmed" />
                </div>
                <input
                  id="companyId"
                  type="text"
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                  placeholder="Masukkan ID perusahaan Anda"
                  className="block w-full rounded-md border-0 bg-bg py-2.5 pl-10 pr-3 text-sm text-highlighted ring-1 ring-inset ring-default placeholder:text-dimmed focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
            </div>

            {/* User ID */}
            <div className="space-y-1.5">
              <label
                htmlFor="userId"
                className="block text-sm font-medium text-toned"
              >
                User ID
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <User className="size-4 text-dimmed" />
                </div>
                <input
                  id="userId"
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="Masukkan User ID Anda"
                  className="block w-full rounded-md border-0 bg-bg py-2.5 pl-10 pr-3 text-sm text-highlighted ring-1 ring-inset ring-default placeholder:text-dimmed focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-toned"
              >
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="size-4 text-dimmed" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password Anda"
                  className="block w-full rounded-md border-0 bg-bg py-2.5 pl-10 pr-10 text-sm text-highlighted ring-1 ring-inset ring-default placeholder:text-dimmed focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-dimmed hover:text-toned"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="size-4 rounded-sm border-default text-primary accent-[var(--color-primary)] focus:ring-primary"
              />
              <label
                htmlFor="remember"
                className="ml-2 text-sm text-muted"
              >
                Ingatkan saya
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              block
              loading={loading}
              className="h-11 bg-primary text-white hover:bg-primary/90"
            >
              Login
            </Button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 space-y-3 text-center text-sm">
            <a
              href="#"
              className="block text-primary hover:underline"
            >
              Lupa Password?
            </a>

            <div className="flex items-center justify-center gap-2 text-muted">
              <span>atau</span>
            </div>

            <Button variant="outline" block className="h-11">
              Buat Akun Baru
            </Button>

            <div className="pt-4">
              <a
                href="#"
                className="text-muted hover:text-primary"
              >
                Panduan Pemakaian
              </a>
            </div>
          </div>

          {/* Footer Links */}
          <div className="mt-8 flex items-center justify-center gap-4 text-xs text-muted">
            <a href="#" className="hover:text-primary">
              Kebijakan Privasi
            </a>
            <span>•</span>
            <a href="#" className="hover:text-primary">
              Contact & Support
            </a>
            <span>•</span>
            <a href="#" className="hover:text-primary">
              Harga Layanan
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
