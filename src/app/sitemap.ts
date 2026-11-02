import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { articles } from "@/content/articles";
import { fedModules } from "@/content/federal/modules";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/philosophy", "/roadmap", "/employee-benefits", "/tools", "/tools/scorecard", "/tools/net-worth", "/tools/budget", "/tools/pay-yourself-first", "/tools/cost-of-waiting", "/tools/compound-growth", "/tools/emergency-fund", "/tools/debt-payoff", "/tools/employer-match", "/tools/life-insurance", "/federal-employees", "/federal-employees/tsp-checkup", "/federal-employees/calculators", "/federal-employees/calculators/agency-match", "/federal-employees/calculators/growth", "/federal-employees/calculators/roth-vs-traditional", "/federal-employees/calculators/cost-of-waiting", "/federal-employees/tsp-education", "/federal-employees/benefits", "/pricing", "/money-reset", "/learn", "/about", "/get-started", "/disclaimer"];
  return [
    ...routes.map((r) => ({ url: `${site.url}${r}`, changeFrequency: "monthly" as const, priority: r === "" ? 1 : 0.7 })),
    ...fedModules.map((m) => ({ url: `${site.url}/federal-employees/learn/${m.slug}`, changeFrequency: "yearly" as const, priority: 0.5 })),
    ...articles.map((a) => ({ url: `${site.url}/learn/${a.slug}`, changeFrequency: "yearly" as const, priority: 0.5 })),
  ];
}
