import type { MetadataRoute } from "next";

// This app is now an internal admin dashboard (ported from the Nuxt
// Dashboard Template), so it should not be indexed by search engines.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: "/",
    },
  };
}
