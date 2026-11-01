import { Calculator, ClipboardCheck, PiggyBank, Hourglass, LineChart, LifeBuoy, CreditCard, Handshake, Shield, ListChecks, type LucideIcon } from "lucide-react";

export type ToolInfo = { href: string; title: string; description: string; icon: LucideIcon; available: boolean; time?: string };

export const tools: ToolInfo[] = [
  { href: "/tools/budget", title: "Family Budget Builder", description: "Give every dollar a job in five simple steps, with a live budget checkup.", icon: Calculator, available: true, time: "5 min" },
  { href: "/tools/scorecard", title: "Family Money Scorecard", description: "Ten quick questions, your score, and three next steps. No email required.", icon: ClipboardCheck, available: true, time: "3 min" },
  { href: "/tools/pay-yourself-first", title: "Pay Yourself First Calculator", description: "See what saving a percentage of each paycheck adds up to over time.", icon: PiggyBank, available: true, time: "1 min" },
  { href: "/tools/cost-of-waiting", title: "Cost of Waiting Calculator", description: "Compare starting to invest now versus waiting a few more years.", icon: Hourglass, available: true, time: "2 min" },
  { href: "/employee-benefits#checklist", title: "Employee Benefits Checklist", description: "Check off what you have and get a list of questions to ask HR.", icon: ListChecks, available: true, time: "5 min" },
  { href: "/tools/compound-growth", title: "Compound Growth Calculator", description: "Project an account's growth with monthly contributions.", icon: LineChart, available: true, time: "1 min" },
  { href: "/tools/emergency-fund", title: "Emergency Fund Calculator", description: "Find your target reserve, your savings gap, and a timeline.", icon: LifeBuoy, available: true, time: "1 min" },
  { href: "/tools/debt-payoff", title: "Debt Payoff Calculator", description: "Compare snowball and avalanche payoff timelines.", icon: CreditCard, available: true, time: "3 min" },
  { href: "/tools/employer-match", title: "Employer Retirement Match Calculator", description: "See your contributions plus a potential match, and any match you may be missing.", icon: Handshake, available: true, time: "1 min" },
  { href: "/tools/life-insurance", title: "Life Insurance Needs Estimator", description: "An educational estimate of coverage needs and its limits.", icon: Shield, available: true, time: "3 min" },
];
