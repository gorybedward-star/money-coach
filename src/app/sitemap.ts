import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { articles } from "@/content/articles";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/philosophy", "/roadmap", "/employee-benefits", "/tools", "/tools/scorecard", "/tools/budget", "/tools/pay-yourself-first", "/tools/cost-of-waiting", "/tools/compound-growth", "/tools/emergency-fund", "/tools/debt-payoff", "/tools/employer-match", "/tools/life-insurance", "/pricing", "/learn", "/about", "/get-started", "/disclaimer"];
  return [
    ...routes.map((r) => ({ url: `${site.url}${r}`, changeFrequency: "monthly" as const, priority: r === "" ? 1 : 0.7 })),
    ...articles.map((a) => ({ url: `${site.url}/learn/${a.slug}`, changeFrequency: "yearly" as const, priority: 0.5 })),
  ];
}
