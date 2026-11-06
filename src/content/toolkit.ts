/** Copy for the Financial Reset Toolkit. Plain English, education only. */

export const toolkitBrand = {
  name: "Financial Reset Toolkit",
  owner: "Money Coach",
  philosophy: "Build savings. Eliminate debt. Invest consistently. Grow your net worth.",
  price: "$39 one-time",
  coachingHref: "/money-reset",
};

export type ModuleId = "paycheck" | "debt" | "emergency" | "investing" | "benefits" | "reset" | "net-worth";

export const MODULES: { id: ModuleId; n: number; title: string; short: string; blurb: string }[] = [
  { id: "net-worth", n: 7, title: "Net Worth Tracker", short: "Net Worth", blurb: "The one number that shows if you are moving forward." },
  { id: "paycheck", n: 1, title: "Paycheck Planner", short: "Paycheck", blurb: "Give every dollar of your paycheck a job." },
  { id: "debt", n: 2, title: "Debt Freedom Tracker", short: "Debt", blurb: "Snowball or avalanche, with real payoff dates." },
  { id: "emergency", n: 3, title: "Emergency Fund Builder", short: "Emergency Fund", blurb: "Your cushion against life's surprises." },
  { id: "investing", n: 4, title: "Investing Calculator", short: "Investing", blurb: "See what steady investing can grow into." },
  { id: "benefits", n: 5, title: "Employee Benefits Checklist", short: "Benefits", blurb: "Find the money your employer already offers." },
  { id: "reset", n: 6, title: "30-Day Money Reset", short: "30-Day Reset", blurb: "Four weeks, one clear action at a time." },
];

export const BENEFIT_STATUSES = [
  { id: "not-started", label: "Not reviewed" },
  { id: "reviewed", label: "Reviewed" },
  { id: "available", label: "Available" },
  { id: "using", label: "Using it" },
  { id: "follow-up", label: "Needs follow-up" },
  { id: "not-offered", label: "Not offered" },
] as const;

export type BenefitItem = { id: string; title: string; group: string; what: string; ask: string; federal?: boolean };

export const BENEFIT_ITEMS: BenefitItem[] = [
  { id: "401k-match", group: "Retirement", title: "401(k) or 403(b) and employer match", what: "A workplace retirement plan. Many employers add money when you contribute, often called a match. Contributing enough to get the full match is one of the highest-value moves available to most workers.", ask: "Do you match contributions? How much, and what do I need to contribute to get all of it? When does the match vest?" },
  { id: "tsp", group: "Retirement", federal: true, title: "Thrift Savings Plan (TSP)", what: "The retirement savings plan for federal employees and the uniformed services. See the federal section below for the basics.", ask: "Am I contributing at least 5% of basic pay? Which fund or funds am I invested in?" },
  { id: "roth-traditional", group: "Retirement", title: "Traditional vs. Roth contributions", what: "Traditional contributions lower your taxable income today and are taxed when you withdraw. Roth contributions are taxed today and can come out tax-free in retirement if the rules are met. Many plans offer both.", ask: "Does our plan offer a Roth option? Can I split contributions between Roth and traditional?" },
  { id: "health", group: "Health & protection", title: "Health insurance", what: "Compare premiums, deductibles and out-of-pocket maximums, not just the paycheck cost. A lower premium can mean a much higher bill when you actually need care.", ask: "What are the deductible and out-of-pocket maximum for each plan? Are my doctors in network?" },
  { id: "hsa-fsa", group: "Health & protection", title: "HSA and FSA eligibility", what: "A Health Savings Account (HSA) is available only with an HSA-eligible high-deductible plan; the money is yours to keep and can be invested. A Flexible Spending Account (FSA) is usually use-it-or-lose-it each plan year.", ask: "Is my health plan HSA-eligible? Does the company contribute to an HSA? What are the FSA carryover rules?" },
  { id: "life-disability", group: "Health & protection", title: "Life and disability insurance", what: "Group life insurance is often one or two times salary, which may not be enough for a family. Disability insurance replaces part of your income if you cannot work, and many people overlook it.", ask: "How much life and disability coverage do I have now? Can I buy more? Are my beneficiaries up to date?" },
  { id: "eap", group: "Support & growth", title: "Employee Assistance Program (EAP)", what: "Many employers offer free, confidential counseling, legal and financial consultations through an EAP. It's often unused simply because people don't know it exists.", ask: "Do we have an EAP? What services does it include and how do I reach it?" },
  { id: "tuition", group: "Support & growth", title: "Tuition assistance", what: "Some employers pay for courses, certifications or degrees. Rules on repayment if you leave are common, so read them first.", ask: "Is tuition assistance offered? What's the annual limit and are there stay-or-repay rules?" },
  { id: "other", group: "Support & growth", title: "Other employer-sponsored benefits", what: "Commuter benefits, dependent-care accounts, employee stock purchase plans, student loan help, legal plans, discounts and wellness credits. Each one can be real money.", ask: "Can you send me the full benefits guide, including anything I'm not enrolled in?" },
];

export const FEDERAL_TSP_BASICS = [
  { title: "Agency contributions (FERS)", body: "Under FERS, your agency deposits 1% of basic pay automatically and matches your own contributions up to another 4%. Contributing at least 5% of basic pay each pay period is how you receive the full 5% from your agency." },
  { title: "Traditional and Roth TSP", body: "You can contribute traditional (pre-tax) or Roth (after-tax), or split between them. The annual employee contribution limit is set by the IRS each year and is shared across both." },
  { title: "The TSP funds", body: "The TSP offers individual funds (G, F, C, S, I) and Lifecycle (L) funds that shift over time. Money Coach does not recommend specific funds or allocations; review the fund descriptions at tsp.gov." },
  { title: "Low costs", body: "TSP funds are known for low administrative expenses. Over decades, lower costs can mean meaningfully more money kept in your account." },
];

export type ResetTask = { id: string; label: string; module?: ModuleId };
export const RESET_WEEKS: { n: number; title: string; focus: string; tasks: ResetTask[] }[] = [
  {
    n: 1,
    title: "Understand your money",
    focus: "You can't change what you can't see. This week is about honest numbers, not judgment.",
    tasks: [
      { id: "w1-numbers", label: "Gather balances for every account and debt (round numbers are fine)" },
      { id: "w1-networth", label: "Enter your assets and liabilities in the Net Worth Tracker", module: "net-worth" },
      { id: "w1-snapshot", label: "Save your first monthly net worth snapshot", module: "net-worth" },
      { id: "w1-spend", label: "Look back at last month's spending and note any surprises" },
    ],
  },
  {
    n: 2,
    title: "Organize your paycheck and debt",
    focus: "Give every dollar a job, then point your extra dollars at debt with a plan.",
    tasks: [
      { id: "w2-paycheck", label: "Build your plan in the Paycheck Planner", module: "paycheck" },
      { id: "w2-debts", label: "List every debt in the Debt Freedom Tracker", module: "debt" },
      { id: "w2-method", label: "Choose snowball or avalanche and set an extra monthly payment", module: "debt" },
      { id: "w2-cards", label: "Stop adding new balances to credit cards" },
    ],
  },
  {
    n: 3,
    title: "Automate savings and review benefits",
    focus: "Pay yourself first, automatically, and make sure your employer's benefits are working for you.",
    tasks: [
      { id: "w3-auto", label: "Set up an automatic transfer to savings on payday", module: "emergency" },
      { id: "w3-starter", label: "Set your starter emergency fund goal", module: "emergency" },
      { id: "w3-benefits", label: "Work through the Employee Benefits Checklist", module: "benefits" },
      { id: "w3-protection", label: "Review your health, life and disability coverage", module: "benefits" },
      { id: "w3-beneficiaries", label: "Confirm the beneficiaries on your retirement accounts and life insurance" },
    ],
  },
  {
    n: 4,
    title: "Invest consistently and set goals",
    focus: "Build a habit you can keep for decades, and decide what you're working toward.",
    tasks: [
      { id: "w4-match", label: "Confirm you're contributing enough to get any employer match", module: "benefits" },
      { id: "w4-invest", label: "Run your numbers in the Investing Calculator", module: "investing" },
      { id: "w4-goal", label: "Set your net worth goal", module: "net-worth" },
      { id: "w4-move", label: "Write down My One Money Move and a deadline" },
    ],
  },
];

export const CLOSING_QUESTION = "What's the one money move you will make this week that your future self will thank you for?";

export const DISCLAIMER_SHORT =
  "Educational tool only, not individualized financial, investment, tax, legal or insurance advice. Projections are hypothetical and not guaranteed.";

export const PROTECTION_DISCLAIMER =
  "Insurance, securities and other financial products are regulated by each state. Money Coach provides education only and does not sell or recommend specific products. Consult licensed professionals before making decisions.";
