/**
 * Free TSP Checkup: a 10-question educational self-assessment.
 * The score measures familiarity with TSP basics only. It does not measure investment
 * suitability, risk tolerance, or whether any choice is right for you.
 */

export type TspAnswer = "yes" | "somewhat" | "no";

export const TSP_ANSWER_POINTS: Record<TspAnswer, number> = { yes: 10, somewhat: 5, no: 0 };

export type TspAction = { title: string; detail: string; href: string; linkLabel: string };

export type TspCheckupQuestion = {
  id: string;
  topic: string;
  question: string;
  help: string;
  /** Education module slugs related to this question. */
  modules: string[];
  action: TspAction;
};

export const tspCheckupQuestions: TspCheckupQuestion[] = [
  {
    id: "rate",
    topic: "Contribution rate",
    question: "Do you know your current TSP contribution percentage?",
    help: "It appears on your Leave and Earnings Statement (LES) and in your agency's payroll or HR self-service system.",
    modules: ["agency-contributions"],
    action: {
      title: "Find your contribution rate on your LES",
      detail: "Look at your most recent Leave and Earnings Statement for your TSP deduction and the percentage or dollar amount you elected.",
      href: "/federal-employees/learn/agency-contributions",
      linkLabel: "Read: Agency contributions",
    },
  },
  {
    id: "agency",
    topic: "Agency contributions",
    question: "Do you understand your eligibility for agency contributions?",
    help: "FERS employees generally receive agency contributions. CSRS employees do not.",
    modules: ["agency-contributions", "fers-retirement-fundamentals"],
    action: {
      title: "Check whether you receive the full agency match",
      detail: "Enter your basic pay and contribution rate to see estimated automatic and matching contributions under your retirement system.",
      href: "/federal-employees/calculators/agency-match",
      linkLabel: "Use the Agency Match Calculator",
    },
  },
  {
    id: "roth",
    topic: "Traditional vs. Roth",
    question: "Do you understand Traditional versus Roth TSP?",
    help: "The difference is mainly when you pay income tax: now (Roth) or later (Traditional).",
    modules: ["traditional-vs-roth-tsp"],
    action: {
      title: "Learn how Traditional and Roth are taxed",
      detail: "Explore how each is taxed going in and coming out, using illustrative tax assumptions. Neither is universally better.",
      href: "/federal-employees/calculators/roth-vs-traditional",
      linkLabel: "Try the Traditional vs. Roth Calculator",
    },
  },
  {
    id: "funds",
    topic: "Your funds",
    question: "Do you know which TSP funds you hold?",
    help: "Your current fund mix is shown when you log in at tsp.gov. Never share your login with anyone.",
    modules: ["tsp-individual-funds", "lifecycle-funds"],
    action: {
      title: "Learn what each TSP fund holds",
      detail: "Then log in at tsp.gov yourself to see your current mix. Knowing what you own comes before any decision.",
      href: "/federal-employees/learn/tsp-individual-funds",
      linkLabel: "Read: The G, F, C, S, and I Funds",
    },
  },
  {
    id: "risk",
    topic: "Risk and time horizon",
    question: "Do you understand your investment risk and time horizon?",
    help: "Time horizon is roughly how many years until you expect to use the money.",
    modules: ["lifecycle-funds", "tsp-individual-funds"],
    action: {
      title: "Learn how L Funds and diversification work",
      detail: "Understand how time horizon and risk relate, and why every fund, including the G Fund, carries some kind of risk.",
      href: "/federal-employees/learn/lifecycle-funds",
      linkLabel: "Read: Lifecycle Funds",
    },
  },
  {
    id: "review",
    topic: "Annual review",
    question: "Have you reviewed your TSP contribution elections recently?",
    help: "A raise, a new year's limit, or a life change are all good reasons to review.",
    modules: ["tsp-contribution-limits", "common-tsp-mistakes"],
    action: {
      title: "Schedule a once-a-year TSP review",
      detail: "Pick a date, such as each January or each Open Season, to confirm your contribution rate, Roth/Traditional split, and beneficiaries.",
      href: "/federal-employees/learn/common-tsp-mistakes",
      linkLabel: "Read: Common TSP mistakes",
    },
  },
  {
    id: "limit",
    topic: "Annual limit",
    question: "Do you know your applicable annual contribution limit?",
    help: "The limit depends on the year and your age, including catch-up eligibility.",
    modules: ["tsp-contribution-limits"],
    action: {
      title: "Look up this year's limit for your age",
      detail: "Check the elective deferral and catch-up limits, and whether your contributions are paced to last through every pay period.",
      href: "/federal-employees/learn/tsp-contribution-limits",
      linkLabel: "Read: Contribution limits",
    },
  },
  {
    id: "beneficiaries",
    topic: "Beneficiaries",
    question: "Have you reviewed your TSP beneficiaries?",
    help: "Without a designation, your TSP is paid in a legal order of precedence that may not match your wishes.",
    modules: ["tsp-beneficiaries"],
    action: {
      title: "Review your TSP beneficiary designation",
      detail: "Log in at tsp.gov to review or update it. Remember FEGLI and FERS have their own separate designations.",
      href: "/federal-employees/learn/tsp-beneficiaries",
      linkLabel: "Read: Beneficiary designations",
    },
  },
  {
    id: "fers",
    topic: "FERS and Social Security",
    question: "Do you understand how TSP fits with FERS and Social Security?",
    help: "FERS has three parts: a basic annuity, Social Security, and the TSP.",
    modules: ["fers-retirement-fundamentals", "fers-basic-benefit", "social-security-coordination"],
    action: {
      title: "Learn the three parts of FERS",
      detail: "See how your annuity, Social Security, and TSP work together so you can plan for all three.",
      href: "/federal-employees/learn/fers-retirement-fundamentals",
      linkLabel: "Read: FERS fundamentals",
    },
  },
  {
    id: "goal",
    topic: "Retirement goal",
    question: "Do you have a retirement savings goal?",
    help: "A goal can be as simple as a target date and a monthly income you hope to have.",
    modules: ["how-compound-growth-works", "retirement-eligibility-milestones"],
    action: {
      title: "Sketch a retirement savings goal",
      detail: "Use the TSP Growth Calculator to see an illustration of how contributions and time work together toward a goal.",
      href: "/federal-employees/calculators/growth",
      linkLabel: "Use the TSP Growth Calculator",
    },
  },
];

export type TspBand = { min: number; title: string; summary: string };

export const tspBands: TspBand[] = [
  {
    min: 80,
    title: "Well informed",
    summary: "You are familiar with most TSP basics. Your next step is staying current: limits change, life changes, and an annual review keeps everything aligned.",
  },
  {
    min: 50,
    title: "Building understanding",
    summary: "You know some of the essentials and have a few gaps. The learning modules and actions below focus on the areas you marked Somewhat or No.",
  },
  {
    min: 0,
    title: "Getting started",
    summary: "Many federal employees were never shown how the TSP works. That is common, and it is fixable. Start with the three actions below.",
  },
];

const FALLBACK_ACTIONS: TspAction[] = [
  {
    title: "Confirm your contributions stay paced through the year",
    detail: "Make sure your contributions last through every pay period so you do not miss agency matching.",
    href: "/federal-employees/calculators/agency-match",
    linkLabel: "Use the Agency Match Calculator",
  },
  {
    title: "Review your other federal benefits",
    detail: "FEGLI, FEHB, FEDVIP, and FSAFEDS choices can affect your family's finances as much as the TSP.",
    href: "/federal-employees/benefits",
    linkLabel: "Explore Federal Benefits Education",
  },
  {
    title: "See the cost of waiting",
    detail: "Share with a colleague or family member how starting earlier can change outcomes.",
    href: "/federal-employees/calculators/cost-of-waiting",
    linkLabel: "Use the Cost of Waiting Calculator",
  },
];

export function scoreTspCheckup(answers: Record<string, TspAnswer>) {
  const scored = tspCheckupQuestions.map((q, index) => ({ q, index, points: answers[q.id] ? TSP_ANSWER_POINTS[answers[q.id]] : 0 }));
  const score = scored.reduce((s, r) => s + r.points, 0);
  const max = tspCheckupQuestions.length * 10;
  const band = tspBands.find((b) => score >= b.min) ?? tspBands[tspBands.length - 1];
  const gaps = scored.filter((r) => r.points < 10).sort((a, b) => a.points - b.points || a.index - b.index);

  const actions = [...gaps.map((g) => g.q.action), ...FALLBACK_ACTIONS].slice(0, 3);
  const modules: string[] = [];
  for (const g of gaps) for (const m of g.q.modules) if (!modules.includes(m)) modules.push(m);
  if (modules.length < 3) for (const m of ["tsp-contribution-limits", "common-tsp-mistakes", "fers-retirement-fundamentals"]) if (!modules.includes(m)) modules.push(m);

  return { score, max, band, actions, modules: modules.slice(0, 6) };
}
