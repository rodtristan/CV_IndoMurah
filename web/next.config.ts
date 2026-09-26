import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Folder build terpisah untuk instance dev kedua (mis. NEXT_DIST_DIR=.next-qa),
  // supaya tidak menimpa .next milik dev server utama.
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
