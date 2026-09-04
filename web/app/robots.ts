import type { MetadataRoute } from "next";
import { absolute } from "@/lib/site";

/** The admin is behind a login and behind the proxy; it has no business in an index either. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/admin/"] }],
    sitemap: absolute("/sitemap.xml"),
    host: absolute("/"),
  };
}
