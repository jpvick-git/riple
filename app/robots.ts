import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/scenario/"]
    },
    sitemap: "https://riple.me/sitemap.xml",
    host: "https://riple.me"
  };
}
