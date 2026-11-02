export type RoadmapStage = {
  n: number;
  id: string;
  title: string;
  summary: string;
  why: string;
  milestones: string[];
  checklist: string[];
  tools: { href: string; label: string; available: boolean }[];
};

export const roadmapStages: RoadmapStage[] = [
  {
    n: 1,
    id: "know-your-numbers",
    title: "Know Your Numbers",
    summary: "See exactly where your money comes from and where it goes.",
    why: "You cannot direct money you cannot see. Clarity removes guesswork and shame, and it is the foundation for every other stage.",
    milestones: ["You know your monthly take-home pay", "You know your essential monthly expenses", "You have chosen a pay-yourself-first percentage"],
    checklist: [
      "List every source of household income",
      "Track spending for 30 days",
      "Separate essentials from wants",
      "Pull your free credit reports",
      "Set up an automatic savings transfer",
    ],
    tools: [
      { href: "/tools/scorecard", label: "Family Money Scorecard", available: true },
      { href: "/tools/net-worth", label: "Family Net Worth Tracker", available: true },
      { href: "/tools/budget", label: "Family Budget Builder", available: true },
      { href: "/tools/pay-yourself-first", label: "Pay Yourself First Calculator", available: true },
    ],
  },
  {
    n: 2,
    id: "build-your-safety-net",
    title: "Build Your Safety Net",
    summary: "Create a cushion so surprises do not become debt.",
    why: "A car repair or a short gap in work should not land on a credit card. An emergency fund buys your family time and options.",
    milestones: ["Starter fund of one month of essentials", "Three months of essentials saved", "Working toward six months if income is variable"],
    checklist: [
      "Open a separate savings account for emergencies",
      "Automate a transfer every payday",
      "Set a starter goal of one month of essentials",
      "Decide what counts as an emergency",
    ],
    tools: [{ href: "/tools/emergency-fund", label: "Emergency Fund Calculator", available: true }],
  },
  {
    n: 3,
    id: "protect-your-household",
    title: "Protect Your Household",
    summary: "Understand the protection your family has and the gaps that remain.",
    why: "Your ability to earn is likely your largest asset. Life and disability protection, and correct beneficiaries, help keep your plan intact if the unexpected happens.",
    milestones: ["You know your life and disability coverage", "Beneficiaries are current on every account", "You understand your workplace protection benefits"],
    checklist: [
      "Find your employer life and disability coverage amounts",
      "Review any individual policies you own",
      "Update beneficiaries on retirement accounts and insurance",
      "Learn the difference between term and permanent life insurance",
      "Consider talking with a licensed professional about your needs",
    ],
    tools: [
      { href: "/employee-benefits#checklist", label: "Employee Benefits Checklist", available: true },
      { href: "/tools/life-insurance", label: "Life Insurance Needs Estimator", available: true },
    ],
  },
  {
    n: 4,
    id: "eliminate-costly-debt",
    title: "Eliminate Costly Debt",
    summary: "Pay off high-interest credit cards and personal loans on a clear plan.",
    why: "Every dollar of interest is a dollar not working for your family. Clearing costly debt frees up cash flow to invest.",
    milestones: ["All debts listed with balances and rates", "A payoff method chosen", "No new high-interest balances"],
    checklist: [
      "List each debt with balance, APR, and minimum payment",
      "Choose snowball or avalanche",
      "Put every extra dollar toward one debt at a time",
      "Celebrate each debt you eliminate",
    ],
    tools: [{ href: "/tools/debt-payoff", label: "Debt Payoff Calculator", available: true }],
  },
  {
    n: 5,
    id: "invest-consistently",
    title: "Invest Consistently",
    summary: "Put time and compound growth to work for your family.",
    why: "Consistent investing in diversified, low-cost funds over long periods has historically been one of the most accessible paths to building wealth, though returns are never guaranteed.",
    milestones: ["Receiving any full employer match available", "Investing every paycheck automatically", "Increasing your contribution rate each year"],
    checklist: [
      "Confirm your employer match formula",
      "Learn what an index ETF is and what it costs",
      "Understand Traditional versus Roth accounts",
      "Set an automatic annual contribution increase",
    ],
    tools: [
      { href: "/tools/employer-match", label: "Employer Match Calculator", available: true },
      { href: "/tools/cost-of-waiting", label: "Cost of Waiting Calculator", available: true },
      { href: "/tools/compound-growth", label: "Compound Growth Calculator", available: true },
    ],
  },
  {
    n: 6,
    id: "build-and-transfer-wealth",
    title: "Build and Transfer Wealth",
    summary: "Own assets, teach the next generation, and plan your legacy.",
    why: "Generational wealth is about more than money. It is the habits, knowledge, and plans you pass on.",
    milestones: ["You own assets that can grow", "Your children are learning money basics", "You understand basic estate planning concepts"],
    checklist: [
      "Talk with your children about saving and spending",
      "Learn the basics of wills, trusts, and beneficiaries",
      "Explore homeownership, rental property, or business ownership",
      "Consider consulting a licensed estate planning attorney",
    ],
    tools: [
      { href: "/tools/net-worth", label: "Track Your Net Worth", available: true },
      { href: "/learn", label: "Learn library", available: true },
    ],
  },
];
