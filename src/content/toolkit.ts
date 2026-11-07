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

export type ResetTask = { id: string; day: number; label: string; detail: string; module?: ModuleId | "results" };
// The order follows Dave Ramsey's 7 Baby Steps, with two Money Coach additions: keep the full employer match and
// review protection early. Step ids are stable keys for saved progress, so some ids keep their original week prefix.
export const RESET_WEEKS: { n: number; title: string; focus: string; tasks: ResetTask[] }[] = [
  {
    n: 1,
    title: "Know your numbers",
    focus: "You can't change what you can't see. This week is about honest numbers, not judgment.",
    tasks: [
      { id: "w1-start", day: 1, label: "Write down why you're doing this", detail: "One sentence about the money stress you want gone in 30 days. Keep it where you'll see it." },
      { id: "w1-numbers", day: 2, label: "Gather every balance", detail: "Checking, savings, retirement, cards and loans. Round numbers are fine." },
      { id: "w1-networth", day: 3, label: "Enter what you own and owe", detail: "Add your accounts and property in the Net Worth Tracker.", module: "net-worth" },
      { id: "w1-snapshot", day: 4, label: "Save your first net worth snapshot", detail: "This is your starting line. Every month after this is measured against it.", module: "net-worth" },
      { id: "w1-spend", day: 5, label: "Review last month's spending", detail: "Scan your bank and card statements and circle three things that surprised you." },
      { id: "w1-subs", day: 6, label: "Cancel one thing you don't use", detail: "A subscription, a membership or an app. Every dollar you free up goes toward your $1,000." },
      { id: "w2-paycheck", day: 7, label: "Build your paycheck plan", detail: "Enter your take-home pay and monthly expenses.", module: "paycheck" },
    ],
  },
  {
    n: 2,
    title: "Step 1: Save a $1,000 starter emergency fund",
    focus: "A small cushion first, so a flat tire or a doctor's bill doesn't turn into new debt. Aim to have it within 30 days.",
    tasks: [
      { id: "w2-zero", day: 8, label: "Give every dollar a job", detail: "Adjust until \"left after planned allocations\" is $0 or more, with a Savings line pointed at your $1,000.", module: "paycheck" },
      { id: "w3-starter", day: 9, label: "Set your $1,000 starter goal", detail: "$1,000 is the classic starter fund. Confirm it in the Emergency Fund Builder and see how soon you'll get there.", module: "emergency" },
      { id: "w3-account", day: 10, label: "Give your emergency fund its own home", detail: "A separate savings account you don't see every day." },
      { id: "w3-auto", day: 11, label: "Automate it", detail: "Set an automatic transfer to savings for the day your paycheck lands.", module: "emergency" },
      { id: "w2-cards", day: 12, label: "Stop adding to credit card balances", detail: "Move cards out of your wallet and saved logins. No new debt from here on." },
      { id: "w3-match", day: 13, label: "Confirm your employer match", detail: "A Money Coach addition: keep contributing enough to receive every matching dollar while you pay off debt. It's free money.", module: "benefits" },
      { id: "w1-move", day: 14, label: "Choose My One Money Move", detail: "One action, one deadline, one measurable result. If your $1,000 isn't there yet, finishing it is a great choice." },
    ],
  },
  {
    n: 3,
    title: "Step 2: Start your debt snowball, and protect your family",
    focus: "List every debt except the mortgage, smallest balance first, and throw every extra dollar at the smallest one. Then make sure one bad day can't undo your progress.",
    tasks: [
      { id: "w2-debts", day: 15, label: "List every debt except your mortgage", detail: "Balance, interest rate and minimum payment for each card and loan.", module: "debt" },
      { id: "w2-method", day: 16, label: "Start your debt snowball", detail: "Pick Snowball (smallest balance first) and set an extra monthly payment, even a small one. Avalanche is there if you prefer it.", module: "debt" },
      { id: "w2-call", day: 17, label: "Ask for a lower rate", detail: "Call one card issuer, mention you're paying it down and ask for a lower APR. It often works." },
      { id: "w2-pay", day: 18, label: "Make your first extra debt payment", detail: "Send your extra payment to the smallest debt. When it's gone, roll its payment into the next one.", module: "debt" },
      { id: "w3-benefits", day: 19, label: "Work through the Benefits Checklist", detail: "Mark what you have, what you use and what needs a follow-up.", module: "benefits" },
      { id: "w3-protection", day: 20, label: "Review your insurance", detail: "Health, life and disability coverage. Would your family be okay if your income stopped?", module: "benefits" },
      { id: "w3-beneficiaries", day: 21, label: "Confirm your beneficiaries", detail: "On your retirement accounts and life insurance. It takes five minutes and matters a lot." },
      { id: "w3-hr", day: 22, label: "Send HR your questions", detail: "Anything marked \"Needs follow-up\" in the Benefits Checklist.", module: "benefits" },
    ],
  },
  {
    n: 4,
    title: "Steps 3 to 7: Map the road ahead",
    focus: "These steps take months or years, so this week you see each one coming and set your long-term goal.",
    tasks: [
      { id: "w4-full", day: 23, label: "Step 3: Plan your full emergency fund", detail: "See your 3 and 6 month targets and how long they'll take once your debts are gone.", module: "emergency" },
      { id: "w4-invest", day: 24, label: "Step 4: See what investing 15% could do", detail: "15% of household income into retirement. Try it in the Investing Calculator and set your monthly amount in the Paycheck Planner.", module: "investing" },
      { id: "w4-college", day: 25, label: "Step 5: Think about your children's college", detail: "If it applies to you, learn how 529 plans and Coverdell ESAs work. Skip it if not." },
      { id: "w4-mortgage", day: 26, label: "Step 6: Look at paying off your home early", detail: "Check your mortgage balance and rate. Extra principal payments, even one a year, can take years off." },
      { id: "w4-goal", day: 27, label: "Step 7: Set your net worth goal", detail: "Build wealth and give. Pick $100,000, $250,000, $500,000, $1 million or your own number, then see your goal date.", module: "net-worth" },
      { id: "w4-snapshot2", day: 28, label: "Save a fresh net worth snapshot", detail: "Update your balances and compare with Day 4.", module: "net-worth" },
      { id: "w4-results", day: 29, label: "Open your 30-day results", detail: "See how far you've come since Day 1.", module: "results" },
      { id: "w4-next", day: 30, label: "Choose next month's One Money Move", detail: "Keep the momentum. Then start a new 30 days." },
    ],
  },
];

export const RESET_ORDER_NOTE =
  "The order follows Dave Ramsey's 7 Baby Steps, with two Money Coach additions: keep your full employer match and review your protection early. Money Coach is not affiliated with Ramsey Solutions.";

export const RESET_STEPS = RESET_WEEKS.flatMap((w) => w.tasks);

export const CLOSING_QUESTION = "What's the one money move you will make this week that your future self will thank you for?";

export const DISCLAIMER_SHORT =
  "Educational tool only, not individualized financial, investment, tax, legal or insurance advice. Projections are hypothetical and not guaranteed.";

export const PROTECTION_DISCLAIMER =
  "Insurance, securities and other financial products are regulated by each state. Money Coach provides education only and does not sell or recommend specific products. Consult licensed professionals before making decisions.";
