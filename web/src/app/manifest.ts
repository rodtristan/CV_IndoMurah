import type { MetadataRoute } from "next";

/** PWA manifest — website bisa di-"Install" di HP/desktop; iPhone butuh ini untuk notifikasi push. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ketoko POS - Toko CV IndoMurah",
    short_name: "CV IndoMurah",
    description: "Point of Sale System for Toko CV IndoMurah",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#9c27b0",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
