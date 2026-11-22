import type { MetadataRoute } from "next";

const SITE = "https://rvyk.dev";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/work", "/about", "/now"].map((path) => ({ url: `${SITE}${path}` }));
}
