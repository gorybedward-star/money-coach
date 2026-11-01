/**
 * The 7-Week Money Reset: public program description, in the founder's words.
 * Week titles, principles and coaching questions match the coaching
 * curriculum in supabase/migrations.
 */
export const resetPositioning =
  "I help working individuals and families build better money habits, eliminate costly debt, maximize their workplace benefits, and create a practical path toward financial independence.";

export const resetWeeks = [
  {
    n: 1,
    title: "Understand Your Money Story",
    theme: "Awareness",
    mindset: "Your personal experiences influence how you handle money.",
    babyStep: "Baby Step 1: Save a $1,000 starter emergency fund.",
    action: "Identify one spending habit to change and set an achievable first savings target.",
    question: "What is one thing you do with money that you know isn't helping your future?",
    deliverable: "Money Commitment + Starter Savings Plan",
  },
  {
    n: 2,
    title: "Take Control of Your Money",
    theme: "Clarity",
    mindset: "Building wealth depends on the gap between what you earn and what you spend.",
    babyStep: "Preparing for Baby Step 2: Pay off all non-mortgage debt using the debt snowball.",
    action: "Create a monthly spending plan and list every debt from smallest balance to largest.",
    question: "If we could free up $200 a month without changing your income, where would it come from?",
    deliverable: "Monthly Money Plan + Debt Inventory",
  },
  {
    n: 3,
    title: "Break the Debt Cycle",
    theme: "Control",
    mindset: "True financial progress requires controlling lifestyle inflation and debt.",
    babyStep: "Baby Step 2: Pay off all non-mortgage debt.",
    action: "Select the first debt to attack and set a realistic extra-payment amount.",
    question: "What would your life look like without credit-card payments?",
    deliverable: "Personal Debt Freedom Roadmap",
  },
  {
    n: 4,
    title: "Create Financial Security",
    theme: "Resilience",
    mindset: "Having a margin of safety protects you from uncertainty.",
    babyStep: "Baby Step 3: Save 3 to 6 months of expenses in a fully funded emergency fund.",
    action: "Calculate your emergency fund target, set up an automatic savings plan, and review your life, disability, and health coverage and beneficiaries.",
    question: "If you couldn't work for six months, or weren't here tomorrow, would your family be protected?",
    deliverable: "Financial Security & Protection Blueprint",
  },
  {
    n: 5,
    title: "Start Building Wealth",
    theme: "Growth",
    mindset: "Compounding is powerful when you give it time.",
    babyStep: "Baby Step 4: Invest 15% of household gross income for retirement.",
    action: "Review your retirement accounts and set a contribution target that matches your financial readiness.",
    question: "What could consistently investing a manageable amount every payday mean for your future?",
    deliverable: "Retirement & Investing Plan",
  },
  {
    n: 6,
    title: "Maximize Your Financial Opportunities",
    theme: "Optimization",
    mindset: "Long-term wealth comes from consistent, intentional decisions.",
    babyStep: "Baby Steps 5 and 6: Save for children's college; pay off your home early.",
    action: "Choose the goal that matters most: education savings, mortgage planning, or maximizing employer benefits.",
    question: "Are you leaving valuable employer benefits unused?",
    deliverable: "Benefits & Long-Term Goals Review",
  },
  {
    n: 7,
    title: "Build Your Financial Freedom Plan",
    theme: "Independence",
    mindset: "The greatest benefit of money is freedom and control over your time.",
    babyStep: "Baby Step 7: Build wealth and give generously.",
    action: "Commit to one 90-day priority and build a 12-month financial roadmap.",
    question: "What would financial freedom allow you to do that you cannot comfortably do today?",
    deliverable: "Personal Financial Freedom Roadmap",
  },
] as const;

/** Mindset + Action + Accountability. */
export const resetFramework = [
  { label: "Mindset", source: "Inspired by The Psychology of Money", body: "Understand why you make the money decisions you do." },
  { label: "Action", source: "Guided by the 7 Baby Steps", body: "Know what financial step makes sense next." },
  { label: "Accountability", source: "The Money Coach difference", body: "Actually do one meaningful thing each week, with a coach in your corner." },
] as const;

export const resetPrinciples = [
  { title: "Behavior before math", body: "Spreadsheets don't change lives; habits do. When your spending behavior changes, progress lasts." },
  { title: "One thing at a time", body: "You leave every session with one clear action, not a list of ten tasks." },
  { title: "Stability before aggressive investing", body: "High-interest debt, emergency savings, the right insurance protection, and your employer match come first. The order adapts to your situation." },
  { title: "No judgment", body: "Everyone has made money mistakes. This is a safe place to talk about yours and move forward." },
  { title: "Progress you can measure", body: "We track debt paid down, savings built, habits changed, and actions completed. We never promise investment returns." },
] as const;

export const resetOutcomes = [
  "A clear picture of where your money goes",
  "Better money habits that stick",
  "A plan to eliminate costly debt",
  "A financial cushion for life's surprises",
  "Insurance protection reviewed, so one setback can't undo your progress",
  "Workplace benefits you're actually using",
  "A personal 12-month financial roadmap",
] as const;

/** Every session closes with the client answering these. */
export const closingQuestions = [
  "What am I changing?",
  "What exactly will I do before our next call?",
  "How will we know I completed it?",
] as const;

export const sessionFlow = [
  { minutes: 5, label: "Check in and celebrate progress" },
  { minutes: 10, label: "Explore the week's money behavior" },
  { minutes: 20, label: "Work through your real numbers" },
  { minutes: 10, label: "Agree on one specific action" },
  { minutes: 5, label: "Confirm your commitment and accountability" },
] as const;

export const resetFaqs = [
  {
    q: "Will I be debt-free in seven weeks?",
    a: "No program can honestly promise that, and we won't. The seven weeks are coaching milestones. You'll leave with a clearer financial picture, better habits, and a personal plan for what comes next, at a pace that fits your situation.",
  },
  {
    q: "What if I can't do everything each week?",
    a: "That's normal. You never have to hit a financial milestone to move on to the next lesson. Each week we agree on one realistic action, and your plan adjusts to your life.",
  },
  {
    q: "What do I need to share?",
    a: "Approximate numbers for income, spending, savings, and debt. We never ask for Social Security numbers, account numbers, or passwords, and we never put your financial details in an email.",
  },
  {
    q: "How are sessions held?",
    a: "By video or phone, once a week for about 50 minutes. Between sessions, your private portal shows your checklist, your One Money Move, and your next appointment.",
  },
  {
    q: "Will you tell me which investments to buy?",
    a: "No. We teach how investing works (diversified low-cost funds, compounding, time horizons, risk) so you can make informed decisions. We don't pick specific securities or manage money, and we'll point you to a licensed professional when that's what you need.",
  },
  {
    q: "Do you sell insurance?",
    a: "No. Protecting your family is part of every plan, so we help you understand the coverage you have (life, disability, health, and beneficiaries), spot possible gaps, and know what to ask. Insurance is regulated by each state, and only a licensed agent can recommend or sell a policy. We don't sell insurance, recommend specific policies, or earn commissions. When you're ready to act, we'll encourage you to talk with a licensed insurance professional.",
  },
  {
    q: "Is this based on a book or a famous program?",
    a: "Our approach draws on well-known ideas from behavioral finance and the popular Baby Steps framework, adapted to your circumstances. Money Coach is independent and not affiliated with or endorsed by Morgan Housel, Dave Ramsey, or Ramsey Solutions.",
  },
  {
    q: "What happens after Week 7?",
    a: "You graduate with your Personal Financial Freedom Roadmap and a 90-day priority. If you'd like to keep the momentum, optional monthly accountability coaching is available. There's no need to repeat the program.",
  },
] as const;

/** The question every coaching call ends on. */
export const recurringQuestion = "What's the one money move you will make this week that your future self will thank you for?";

/** The weekly commitment card, with the founder's Week 1 example. */
export const commitmentCardExample = {
  priority: "Start building my $1,000 emergency fund.",
  commitment: "I will transfer $25 into a dedicated savings account by Friday.",
  measure: "The transfer is completed and my savings balance is updated.",
};

/** What the graduation scorecard records. */
export const scorecardRows = [
  { measure: "Emergency savings", start: "Baseline", end: "Updated" },
  { measure: "Credit-card debt", start: "Baseline", end: "Updated" },
  { measure: "Monthly cash flow", start: "Baseline", end: "Updated" },
  { measure: "Retirement contribution", start: "Baseline", end: "Updated" },
  { measure: "Insurance protection (life, disability, health)", start: "Not reviewed", end: "Reviewed" },
  { measure: "Beneficiaries", start: "Not checked", end: "Current" },
  { measure: "Employer benefits", start: "Not reviewed", end: "Reviewed" },
  { measure: "90-day money goal", start: "Undefined", end: "Established" },
] as const;

/** The five standards every coaching call follows. */
export const fiveStandards = [
  { title: "One clear objective", question: "What must you accomplish?" },
  { title: "One financial principle", question: "What mindset or behavior are we addressing?" },
  { title: "One practical action", question: "What will you do before the next call?" },
  { title: "One measurable result", question: "How will we verify progress?" },
  { title: "One deliverable", question: "What plan will you leave with?" },
] as const;
