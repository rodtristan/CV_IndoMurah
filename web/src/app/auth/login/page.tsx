"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, UserRound, Lock, Eye, EyeOff, Loader2, HelpCircle } from "lucide-react";
import { api } from "@/lib/api-client";

const FEATURES = [
  "Sistem Inventori Terpusat & Akurat",
  "Analitik & Laporan Keuangan Real-time",
  "Integrasi Omnichannel & Multi-Cabang",
];

export default function LoginPage() {
  const router = useRouter();
  const [companyId, setCompanyId] = useState("");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.login(companyId, userId, password);
      if (res.success && res.data?.token) {
        router.push("/dashboard");
      } else {
        setError(res.message || "Login gagal. Periksa User ID dan password Anda.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#fafafa]">
      {/* Brand panel */}
      <div
        className="relative hidden w-full max-w-[576px] shrink-0 items-center justify-center overflow-hidden px-12 py-16 lg:flex"
        style={{
          background:
            "linear-gradient(160deg, var(--color-brand-1) 0%, var(--color-brand-2) 40%, var(--color-brand-3) 70%, var(--color-brand-4) 100%)",
        }}
      >
        {/* decorative shapes */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-16 -top-20 size-[300px] rounded-full bg-white/[0.06]" />
          <div className="absolute right-[-40px] top-[230px] size-[200px] rounded-full bg-white/[0.06]" />
          <div className="absolute bottom-[115px] left-[58px] size-[150px] rounded-full bg-white/[0.06]" />
        </div>

        <div className="relative z-10 flex w-full max-w-[480px] flex-col items-center text-center">
          <span className="mb-2 text-4xl font-extrabold text-white">Ketoko.co.id</span>

          <h2 className="mb-4 text-4xl font-extrabold leading-tight text-white">
            Kendalikan Bisnis Anda
            <br />
            dalam Satu Ekosistem
          </h2>
          <p className="mx-10 mb-9 text-base text-white/90">
            Tingkatkan efisiensi operasional dengan solusi <i>cloud</i> ERP, point-of-sale, dan
            manajemen inventori terintegrasi.
          </p>

          <div className="inline-flex flex-col gap-4 rounded-2xl bg-white/[0.08] px-8 py-6 shadow-[0_8px_32px_rgba(0,0,0,0.1)]">
            {FEATURES.map((f) => (
              <div key={f} className="flex items-center gap-3.5 text-[15px] font-medium text-white">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-white/20 shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M4 10l4 4 8-8"
                      stroke="white"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-7 text-center text-xs text-white/35">
          &copy; Ketoko.co.id CV IndoMurah &mdash; Kloning Tampilan
        </div>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-[420px]">
          <div className="mb-7 text-center">
            <h1 className="mb-1.5 text-[28px] font-extrabold text-primary">Ketoko.co.id</h1>
            <p className="text-[13px] text-muted">
              Masuk untuk mengelola layanan Ketoko.co.id akun Anda
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-danger/20 bg-danger/5 p-3 text-sm text-danger">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-[18px]">
            <div>
              <label
                htmlFor="companyId"
                className="mb-1.5 flex items-center gap-1.5 text-[13px] font-semibold text-gray-700"
              >
                <Building2 className="size-4 text-primary" />
                ID Perusahaan
              </label>
              <input
                id="companyId"
                type="text"
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                placeholder="INDOMURAH"
                autoComplete="off"
                required
                className="h-[38px] w-full rounded border border-default bg-white px-3.5 text-sm text-[#1e293b] placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label
                htmlFor="userId"
                className="mb-1.5 flex items-center gap-1.5 text-[13px] font-semibold text-gray-700"
              >
                <UserRound className="size-4 text-primary" />
                User ID
              </label>
              <input
                id="userId"
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="admin"
                autoComplete="off"
                required
                className="h-[38px] w-full rounded border border-default bg-white px-3.5 text-sm text-[#1e293b] placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 flex items-center gap-1.5 text-[13px] font-semibold text-gray-700"
              >
                <Lock className="size-4 text-primary" />
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password Anda"
                  required
                  className="h-[38px] w-full rounded border border-default bg-white px-3.5 pr-10 text-sm text-[#1e293b] placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted transition-colors hover:text-highlighted"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-2 text-sm text-toned">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="size-4 rounded border-default accent-primary"
              />
              Ingatkan saya
            </label>

            <button
              type="submit"
              disabled={loading}
              className="flex h-[38px] w-full items-center justify-center gap-2 rounded bg-info text-sm font-medium text-white transition-colors hover:bg-info/90 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <span>Login</span>
              )}
            </button>
          </form>

          <div className="mt-4 text-center">
            <a href="#" className="text-sm text-info hover:underline">
              Lupa Password?
            </a>
          </div>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-default" />
            <span className="text-xs font-medium text-muted">ATAU</span>
            <div className="h-px flex-1 bg-default" />
          </div>

          <button
            type="button"
            className="h-[38px] w-full rounded border border-[#7b7c7d] bg-transparent text-sm text-[#333] transition-colors hover:bg-black/[0.03]"
          >
            Buat Akun Baru
          </button>

          <div className="mt-4 flex items-center justify-center gap-1.5 text-sm text-muted">
            <HelpCircle className="size-4" />
            <a href="#" className="hover:underline">
              Panduan Pemakaian
            </a>
          </div>

          <div className="mt-8 flex items-center justify-center gap-3 text-xs text-muted">
            <a href="#" className="hover:underline">
              Kebijakan Privasi
            </a>
            <span>&middot;</span>
            <a href="#" className="hover:underline">
              Contact &amp; Support
            </a>
            <span>&middot;</span>
            <a href="#" className="hover:underline">
              Harga Layanan
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
