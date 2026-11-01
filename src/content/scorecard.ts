export type Answer = "yes" | "sometimes" | "no";

export const ANSWER_POINTS: Record<Answer, number> = { yes: 10, sometimes: 5, no: 0 };

export type ScorecardQuestion = {
  id: string;
  topic: string;
  question: string;
  nextStep: { title: string; detail: string; href: string; linkLabel: string };
};

export const scorecardQuestions: ScorecardQuestion[] = [
  {
    id: "numbers",
    topic: "Know your numbers",
    question: "Do you know roughly how much your household earns and spends each month?",
    nextStep: {
      title: "Track one month of spending",
      detail:
        "Write down your take-home pay and every bill and purchase for 30 days. Clarity comes before every other step.",
      href: "/roadmap#know-your-numbers",
      linkLabel: "See Roadmap Stage 1",
    },
  },
  {
    id: "pay-first",
    topic: "Pay yourself first",
    question: "Do you set aside savings automatically before you pay other bills?",
    nextStep: {
      title: "Automate a pay-yourself-first transfer",
      detail:
        "Pick a percentage, even 1–5%, and set an automatic transfer on payday so saving happens before spending.",
      href: "/tools/pay-yourself-first",
      linkLabel: "Use the Pay Yourself First Calculator",
    },
  },
  {
    id: "emergency",
    topic: "Emergency savings",
    question: "Could your household cover at least one month of essential expenses from savings?",
    nextStep: {
      title: "Start a starter emergency fund",
      detail:
        "Open a separate savings account and build toward one month of essential expenses, then keep going toward three to six.",
      href: "/roadmap#build-your-safety-net",
      linkLabel: "See Roadmap Stage 2",
    },
  },
  {
    id: "debt",
    topic: "Costly debt",
    question: "Are you free of high-interest credit card and personal loan balances, or paying them down on a plan?",
    nextStep: {
      title: "List your debts and pick a payoff method",
      detail:
        "Write down each balance, interest rate, and minimum. Then choose snowball (smallest balance first) or avalanche (highest rate first) and stick with it.",
      href: "/learn/eliminating-credit-card-debt",
      linkLabel: "Read: Eliminating Costly Debt",
    },
  },
  {
    id: "match",
    topic: "Employer match",
    question: "If your employer offers a retirement match, are you contributing enough to receive all of it?",
    nextStep: {
      title: "Confirm your employer match",
      detail:
        "Look up your plan's matching formula and contribute at least enough to receive the full match if you can. Ask HR if you are unsure.",
      href: "/employee-benefits",
      linkLabel: "Explore the Benefits Checkup",
    },
  },
  {
    id: "protection",
    topic: "Life and disability protection",
    question: "Do you understand what life and disability coverage your family has today?",
    nextStep: {
      title: "Inventory your protection",
      detail:
        "Check what life and disability coverage you have through work and on your own, and write down how much and who it covers.",
      href: "/employee-benefits#checklist",
      linkLabel: "Use the Benefits Checklist",
    },
  },
  {
    id: "investing",
    topic: "Consistent investing",
    question: "Do you invest something consistently, every month or every paycheck?",
    nextStep: {
      title: "Start small and stay consistent",
      detail:
        "Consistency matters more than amount. Learn how time and regular contributions work together before choosing investments.",
      href: "/tools/cost-of-waiting",
      linkLabel: "See the Cost of Waiting",
    },
  },
  {
    id: "benefits",
    topic: "Employee benefits",
    question: "Have you reviewed all of your workplace benefits in the last year?",
    nextStep: {
      title: "Do a benefits review before open enrollment",
      detail:
        "HSAs, FSAs, tuition help, dependent care, and supplemental coverage are often overlooked. A short review can uncover real value.",
      href: "/employee-benefits",
      linkLabel: "Explore the Benefits Checkup",
    },
  },
  {
    id: "beneficiaries",
    topic: "Beneficiary planning",
    question: "Are the beneficiaries on your retirement accounts and life insurance current?",
    nextStep: {
      title: "Check every beneficiary designation",
      detail:
        "Log into each retirement account and insurance policy and confirm who is listed. Life changes like marriage, divorce, and new children are easy to miss.",
      href: "/roadmap#build-and-transfer-wealth",
      linkLabel: "See Roadmap Stage 6",
    },
  },
  {
    id: "family-ed",
    topic: "Family financial education",
    question: "Do you talk about money with your children or family in an age-appropriate way?",
    nextStep: {
      title: "Start one money conversation this week",
      detail:
        "Share how you save, let kids help with a small budget, or open a savings account together. Habits are passed down.",
      href: "/roadmap#build-and-transfer-wealth",
      linkLabel: "See Roadmap Stage 6",
    },
  },
];

export type ScoreBand = { min: number; title: string; summary: string };

export const scoreBands: ScoreBand[] = [
  {
    min: 80,
    title: "Strong foundation",
    summary:
      "You have many of the core habits in place. Your next gains likely come from fine-tuning: making the most of your benefits, investing consistently, and planning for the next generation.",
  },
  {
    min: 50,
    title: "Building momentum",
    summary:
      "You are doing several things right, and a few gaps are holding you back. Focusing on the steps below can make a meaningful difference over the next 90 days.",
  },
  {
    min: 0,
    title: "Ready for a fresh start",
    summary:
      "Every family starts somewhere, and there is no shame in it. The steps below are simple, practical places to begin. Small, consistent actions add up.",
  },
];

export function scoreScorecard(answers: Record<string, Answer>) {
  const score = scorecardQuestions.reduce(
    (sum, q) => sum + (answers[q.id] ? ANSWER_POINTS[answers[q.id]] : 0),
    0,
  );
  const band = scoreBands.find((b) => score >= b.min) ?? scoreBands[scoreBands.length - 1];
  // Lowest-scoring answers first; ties keep question order.
  const ranked = scorecardQuestions
    .map((q, index) => ({ q, index, points: answers[q.id] ? ANSWER_POINTS[answers[q.id]] : 0 }))
    .filter((r) => r.points < 10)
    .sort((a, b) => a.points - b.points || a.index - b.index)
    .map((r) => r.q.nextStep);

  const fallback = [
    {
      title: "Get a Benefits Checkup",
      detail: "Even strong households often find value in a structured review of workplace benefits.",
      href: "/employee-benefits",
      linkLabel: "Explore the Benefits Checkup",
    },
    {
      title: "Model your long-term growth",
      detail: "See how your current contributions could grow over time under different hypothetical returns.",
      href: "/tools/cost-of-waiting",
      linkLabel: "Use the Cost of Waiting Calculator",
    },
    {
      title: "Plan your family legacy",
      detail: "Teach the next generation and learn the basics of estate planning concepts.",
      href: "/roadmap#build-and-transfer-wealth",
      linkLabel: "See Roadmap Stage 6",
    },
  ];

  const nextSteps = [...ranked, ...fallback].slice(0, 3);
  return { score, max: scorecardQuestions.length * 10, band, nextSteps };
}
