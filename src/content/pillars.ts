import { Wallet, ShieldCheck, Scissors, TrendingUp, Home, Sprout, type LucideIcon } from "lucide-react";

export type Pillar = { n: number; title: string; short: string; body: string; topics: string[]; icon: LucideIcon; href: string };

export const pillars: Pillar[] = [
  {
    n: 1,
    title: "Keep Your Money",
    short: "Pay yourself first.",
    body: "A portion of all you earn is yours to keep. Understand your income, spending, and cash flow, and save before you spend.",
    topics: ["Pay yourself first", "Cash flow", "Spending awareness", "Automatic saving"],
    icon: Wallet,
    href: "/tools/pay-yourself-first",
  },
  {
    n: 2,
    title: "Protect Your Family",
    short: "Build your safety net.",
    body: "Emergency savings, life insurance education, disability protection, and up-to-date beneficiaries keep one bad day from becoming a family crisis.",
    topics: ["Emergency fund", "Life insurance basics", "Disability protection", "Beneficiaries"],
    icon: ShieldCheck,
    href: "/roadmap#protect-your-household",
  },
  {
    n: 3,
    title: "Eliminate Costly Debt",
    short: "Stop paying interest to others.",
    body: "High-interest credit cards and personal loans quietly drain wealth. Learn the debt snowball and avalanche methods and pick a plan you will stick with.",
    topics: ["Credit cards", "Personal loans", "Snowball method", "Avalanche method"],
    icon: Scissors,
    href: "/learn/eliminating-credit-card-debt",
  },
  {
    n: 4,
    title: "Grow Your Money",
    short: "Invest early and often.",
    body: "Time is a working family's greatest advantage. Learn diversified, low-cost ETF investing, retirement accounts, compound growth, and the real cost of waiting.",
    topics: ["Low-cost ETFs", "Retirement accounts", "Compound growth", "Cost of waiting"],
    icon: TrendingUp,
    href: "/tools/cost-of-waiting",
  },
  {
    n: 5,
    title: "Own Assets",
    short: "Move from earning to owning.",
    body: "Wealth is built by owning things that grow: retirement investments, a home, rental property, or a business. Understand the options and the responsibilities.",
    topics: ["Retirement investments", "Homeownership", "Rental properties", "Business ownership"],
    icon: Home,
    href: "/philosophy#own-assets",
  },
  {
    n: 6,
    title: "Build a Legacy",
    short: "Teach the next generation.",
    body: "Teach your children money fundamentals, learn estate planning concepts, and set up what you build to outlast you.",
    topics: ["Kids and money", "Estate planning concepts", "Beneficiaries", "Generational wealth"],
    icon: Sprout,
    href: "/roadmap#build-and-transfer-wealth",
  },
];
