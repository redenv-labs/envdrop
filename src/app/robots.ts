import type { MetadataRoute } from "next";
import { getOrigin } from "@/lib/url";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const origin = await getOrigin();

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/share"],
        disallow: ["/s/", "/api/"],
      },
    ],
    sitemap: `${origin}/sitemap.xml`,
  };
}
