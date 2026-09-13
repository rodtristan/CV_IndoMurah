"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Lock,
  User,
  Building,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
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
      // Mock login - accept any credentials for demo
      await new Promise((resolve) => setTimeout(resolve, 800));

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
    <div className="flex min-h-screen">
      {/* Left Panel - Dark Purple Branding (Matching Original POS) */}
      <div className="hidden flex-1 flex-col justify-between bg-pos-login p-10 text-white lg:flex">
        <div>
          {/* Logo */}
          <div className="mb-8 flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded bg-purple-600 text-white">
              <span className="text-lg font-bold">POS</span>
            </div>
            <span className="text-2xl font-bold">KETOKO</span>
          </div>
        </div>

        {/* Decorative gradient shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -left-20 -top-20 size-80 rounded-full bg-purple-500/20 blur-3xl" />
          <div className="absolute -bottom-40 -right-20 size-96 rounded-full bg-purple-400/10 blur-3xl" />
        </div>

        <div className="relative space-y-6">
          <h1 className="text-4xl font-bold leading-tight">
            Kendalikan Bisnis Anda dalam Satu Ekosistem
          </h1>
          <p className="text-lg text-purple-200">
            Tingkatkan efisiensi operasional dengan solusi cloud ERP,
            point-of-sale, dan manajemen inventori terintegrasi.
          </p>

          <div className="grid gap-4 pt-4">
            <div className="flex items-center gap-3 rounded-lg bg-purple-900/30 p-4">
              <div className="flex size-10 items-center justify-center rounded-lg bg-purple-500/50">
                <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <div className="font-medium">Sistem Inventori Terpusat & Akurat</div>
                <div className="text-sm text-purple-300">Kelola stok real-time</div>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg bg-purple-900/30 p-4">
              <div className="flex size-10 items-center justify-center rounded-lg bg-purple-500/50">
                <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <div className="font-medium">Analitik & Laporan Keuangan Real-time</div>
                <div className="text-sm text-purple-300">Lihat data kapan saja</div>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg bg-purple-900/30 p-4">
              <div className="flex size-10 items-center justify-center rounded-lg bg-purple-500/50">
                <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <div>
                <div className="font-medium">Integrasi Omnichannel & Multi-Cabang</div>
                <div className="text-sm text-purple-300">Jual di mana saja</div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative text-sm text-purple-300">
          © Ketoko.co.id 2.3.1.0 - Inspirasibiz / Inspirasi Media Kreatif
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex flex-1 flex-col justify-center bg-white px-8 py-12 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile Logo */}
          <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
            <div className="flex size-10 items-center justify-center rounded bg-purple-600 text-white">
              <span className="font-bold">POS</span>
            </div>
            <span className="text-xl font-bold text-purple-600">KETOKO</span>
          </div>

          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-2xl font-bold text-gray-900">POS KETOKO</h2>
            <p className="mt-2 text-sm text-gray-600">
              Masuk untuk mengelola layanan Ketoko.co.id akun Anda
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertCircle className="size-5 shrink-0" />
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Company ID */}
            <div className="space-y-1">
              <label
                htmlFor="companyId"
                className="block text-sm font-medium text-gray-700"
              >
                ID Perusahaan
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Building className="size-4 text-gray-500" />
                </div>
                <input
                  id="companyId"
                  type="text"
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                  placeholder="Masukkan ID perusahaan Anda"
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 py-3 pl-10 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#9C27B0] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#9C27B0]"
                  required
                />
              </div>
            </div>

            {/* User ID */}
            <div className="space-y-1">
              <label
                htmlFor="userId"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <User className="size-4 text-gray-500" />
                </div>
                <input
                  id="userId"
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="Ketoko.co.id"
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 py-3 pl-10 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#9C27B0] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#9C27B0]"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="size-4 text-gray-500" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password Anda"
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 py-3 pl-10 pr-10 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#9C27B0] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#9C27B0]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
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
                className="size-4 rounded border-gray-300 text-[#9C27B0] focus:ring-[#9C27B0]"
              />
              <label
                htmlFor="remember"
                className="ml-2 text-sm text-gray-600"
              >
                Ingatkan saya
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              block
              loading={loading}
              className="h-11 bg-[#9C27B0] text-white hover:bg-[#7B1FA2]"
            >
              Login
            </Button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 space-y-3 text-center text-sm">
            <a
              href="#"
              className="block text-purple-600 hover:underline"
            >
              Lupa Password?
            </a>

            <div className="flex items-center justify-center gap-2 text-gray-500">
              <span>atau</span>
            </div>

            <Button variant="outline" block className="h-11 border-gray-300 text-gray-700 hover:bg-gray-50">
              Buat Akun Baru
            </Button>

            <div className="pt-4">
              <a
                href="#"
                className="text-gray-500 hover:text-purple-600"
              >
                Panduan Pemakaian
              </a>
            </div>
          </div>

          {/* Footer Links */}
          <div className="mt-8 flex items-center justify-center gap-4 text-xs text-gray-500">
            <a href="#" className="hover:text-purple-600">
              Kebijakan Privasi
            </a>
            <span>•</span>
            <a href="#" className="hover:text-purple-600">
              Contact & Support
            </a>
            <span>•</span>
            <a href="#" className="hover:text-purple-600">
              Harga Layanan
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
