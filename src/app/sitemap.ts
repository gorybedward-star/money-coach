import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { articles } from "@/content/articles";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/philosophy", "/roadmap", "/employee-benefits", "/tools", "/tools/scorecard", "/tools/pay-yourself-first", "/tools/cost-of-waiting", "/pricing", "/learn", "/about", "/get-started", "/disclaimer"];
  return [
    ...routes.map((r) => ({ url: `${site.url}${r}`, changeFrequency: "monthly" as const, priority: r === "" ? 1 : 0.7 })),
    ...articles.map((a) => ({ url: `${site.url}/learn/${a.slug}`, changeFrequency: "yearly" as const, priority: 0.5 })),
  ];
}
