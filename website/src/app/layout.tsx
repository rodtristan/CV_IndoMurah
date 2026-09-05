import type { Metadata } from "next";
import { Public_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { DashboardProvider } from "@/lib/dashboard-context";
import { ToastProvider } from "@/lib/toast-context";
import { DashboardShell } from "@/components/layout/DashboardShell";

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Toko CV IndoMurah — Dashboard",
    template: "%s | Toko CV IndoMurah Dashboard",
  },
  description:
    "Admin dashboard Toko CV IndoMurah untuk mengelola pesanan, pelanggan, dan operasional toko.",
  icons: {
    icon: "/favicon.ico",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${publicSans.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="h-full font-sans">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ToastProvider>
            <DashboardProvider>
              <DashboardShell>{children}</DashboardShell>
            </DashboardProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
