/**
 * Financial Reset Toolkit: data model, defaults and fictional sample data.
 * Pure TypeScript, no UI. Stage 1 keeps everything in the visitor's browser (see storage in the app).
 */

export type Frequency = "weekly" | "biweekly" | "semimonthly" | "monthly";

export const FREQUENCIES: Record<Frequency, { perYear: number; label: string }> = {
  weekly: { perYear: 52, label: "Weekly" },
  biweekly: { perYear: 26, label: "Every two weeks" },
  semimonthly: { perYear: 24, label: "Twice a month" },
  monthly: { perYear: 12, label: "Monthly" },
};

export type ExpenseKey = "housing" | "transportation" | "utilities" | "groceries" | "insurance" | "other";

export const EXPENSES: { key: ExpenseKey; label: string; hint: string; essential: boolean }[] = [
  { key: "housing", label: "Housing", hint: "Rent or mortgage, HOA, renter's or home insurance", essential: true },
  { key: "transportation", label: "Transportation", hint: "Gas, transit, car insurance, maintenance (not the car loan)", essential: true },
  { key: "utilities", label: "Utilities", hint: "Electric, water, internet, phone", essential: true },
  { key: "groceries", label: "Groceries", hint: "Food and household basics", essential: true },
  { key: "insurance", label: "Insurance", hint: "Health, life and disability premiums you pay yourself", essential: true },
  { key: "other", label: "Everything else", hint: "Childcare, subscriptions, dining out, giving, fun money", essential: false },
];

export type Paycheck = {
  frequency: Frequency;
  netPay: number;
  expenses: Record<ExpenseKey, number>;
  /** When true, debt payments come from the Debt Freedom Tracker (minimums + extra). */
  debtFromTracker: boolean;
  debtPayments: number;
  savings: number;
  investing: number;
};

export type Debt = { id: string; name: string; balance: number; apr: number; minPayment: number; startBalance: number };
export type Strategy = "snowball" | "avalanche";
export type DebtPlan = { debts: Debt[]; extra: number; strategy: Strategy };

export type EmergencyGoal = "starter" | "three" | "six";
export type Emergency = {
  current: number;
  essentialsFromPaycheck: boolean;
  essentials: number;
  contribution: number;
  frequency: Frequency;
  starterGoal: number;
  goal: EmergencyGoal;
  /** Synced: this balance also appears as cash in the Net Worth Tracker. */
  syncToNetWorth: boolean;
  /** Synced: the monthly contribution comes from Savings in the Paycheck Planner. */
  contributionFromPaycheck: boolean;
};

export type Investing = {
  start: number;
  monthly: number;
  returnPct: number;
  years: number;
  inflationPct: number;
  showReal: boolean;
  /** Synced: starting balance = brokerage + retirement accounts in the Net Worth Tracker. */
  startFromNetWorth: boolean;
  /** Synced: monthly contribution = Investing in the Paycheck Planner. */
  monthlyFromPaycheck: boolean;
};

export type BenefitStatus = "not-started" | "reviewed" | "available" | "using" | "follow-up" | "not-offered";
export type BenefitEntry = { status: BenefitStatus; note: string };
export type Benefits = { federal: boolean; items: Record<string, BenefitEntry> };

export type OneMoneyMove = { priority: string; commitment: string; measure: string; deadline: string };
export type Reset = { done: Record<string, boolean>; move: OneMoneyMove };

export type AssetCategory = "cash" | "brokerage" | "retirement" | "vehicle" | "business" | "other";
export type LiabilityCategory = "credit-card" | "auto" | "student" | "personal" | "other";

export const ASSET_CATEGORIES: Record<AssetCategory, string> = {
  cash: "Checking & savings",
  brokerage: "Brokerage investments",
  retirement: "Retirement (TSP, 401(k), IRA)",
  vehicle: "Vehicles",
  business: "Business ownership",
  other: "Other assets",
};
export const LIABILITY_CATEGORIES: Record<LiabilityCategory, string> = {
  "credit-card": "Credit cards",
  auto: "Auto loans",
  student: "Student loans",
  personal: "Personal loans",
  other: "Other debts",
};

export type AssetItem = { id: string; category: AssetCategory; name: string; amount: number };
export type LiabilityItem = { id: string; category: LiabilityCategory; name: string; amount: number };
/** Real estate is entered once with its mortgage, so home equity is never double-counted. */
export type Property = { id: string; name: string; value: number; mortgage: number };
/** One saved month. `month` is "YYYY-MM". */
export type Snapshot = { id: string; month: string; assets: number; liabilities: number };

export const GOAL_PRESETS = [100_000, 250_000, 500_000, 1_000_000] as const;

export type NetWorth = {
  assets: AssetItem[];
  liabilities: LiabilityItem[];
  properties: Property[];
  snapshots: Snapshot[];
  goal: number;
  /** Synced: every Debt Freedom Tracker balance counts as a liability, so debts are entered once. */
  debtsFromTracker: boolean;
};

export type ToolkitState = {
  version: 1;
  /** "sample" = fictional demo family, "own" = the customer's own numbers. */
  mode: "sample" | "own";
  onboarded: boolean;
  name: string;
  paycheck: Paycheck;
  debt: DebtPlan;
  emergency: Emergency;
  investing: Investing;
  benefits: Benefits;
  reset: Reset;
  netWorth: NetWorth;
};

let counter = 0;
export const uid = (p = "id") => `${p}-${Date.now().toString(36)}-${(counter++).toString(36)}${Math.random().toString(36).slice(2, 6)}`;

/** "YYYY-MM" for a date, in local time. */
export function monthKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
export function addMonths(month: string, n: number) {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(y, m - 1 + n, 1);
  return monthKey(d);
}
export function monthsBetween(a: string, b: string) {
  const [ay, am] = a.split("-").map(Number);
  const [by, bm] = b.split("-").map(Number);
  return (by - ay) * 12 + (bm - am);
}

export function blankState(): ToolkitState {
  return {
    version: 1,
    mode: "own",
    onboarded: false,
    name: "",
    paycheck: {
      frequency: "biweekly",
      netPay: 0,
      expenses: { housing: 0, transportation: 0, utilities: 0, groceries: 0, insurance: 0, other: 0 },
      debtFromTracker: true,
      debtPayments: 0,
      savings: 0,
      investing: 0,
    },
    debt: { debts: [], extra: 0, strategy: "avalanche" },
    emergency: { current: 0, essentialsFromPaycheck: true, essentials: 0, contribution: 0, frequency: "biweekly", starterGoal: 1000, goal: "starter", syncToNetWorth: true, contributionFromPaycheck: true },
    investing: { start: 0, monthly: 0, returnPct: 7, years: 25, inflationPct: 3, showReal: false, startFromNetWorth: true, monthlyFromPaycheck: true },
    benefits: { federal: false, items: {} },
    reset: { done: {}, move: { priority: "", commitment: "", measure: "", deadline: "" } },
    netWorth: { assets: [], liabilities: [], properties: [], snapshots: [], goal: 100_000, debtsFromTracker: true },
  };
}

/** A fictional household used for the demo. Snapshot months are relative to `today` so the chart always looks current. */
export function sampleState(today = new Date()): ToolkitState {
  const debts: Debt[] = [
    { id: "d-visa", name: "Visa card", balance: 4_200, apr: 24.99, minPayment: 120, startBalance: 6_100 },
    { id: "d-store", name: "Store card", balance: 900, apr: 29.99, minPayment: 35, startBalance: 1_650 },
    { id: "d-auto", name: "Auto loan", balance: 14_800, apr: 6.9, minPayment: 389, startBalance: 18_400 },
    { id: "d-student", name: "Student loan", balance: 21_500, apr: 5.5, minPayment: 233, startBalance: 23_300 },
  ];
  const assets: AssetItem[] = [
    { id: "a-chk", category: "cash", name: "Checking", amount: 1_850 },
    { id: "a-brk", category: "brokerage", name: "Brokerage (index ETFs)", amount: 3_200 },
    { id: "a-401", category: "retirement", name: "401(k)", amount: 38_500 },
    { id: "a-roth", category: "retirement", name: "Roth IRA", amount: 6_800 },
    { id: "a-car", category: "vehicle", name: "2021 SUV", amount: 17_000 },
  ];
  // Debts live in the Debt Freedom Tracker and the emergency fund in its builder; both sync into net worth.
  const liabilities: LiabilityItem[] = [];
  const properties: Property[] = [{ id: "p-home", name: "Home", value: 285_000, mortgage: 231_000 }];

  // Twelve past months of steady progress: assets up, debts down. Current numbers are not yet saved for this month.
  const now = monthKey(today);
  const snapshots: Snapshot[] = [];
  for (let i = 12; i >= 1; i--) {
    const k = 12 - i; // 0..11
    const assets = Math.round(331_400 + k * 1_930 + (k % 3 === 1 ? -1_100 : 0));
    const liabilities = Math.round(287_600 - k * 1_340);
    snapshots.push({ id: `s-${k}`, month: addMonths(now, -i), assets, liabilities });
  }

  return {
    version: 1,
    mode: "sample",
    onboarded: true,
    name: "The Rivera Family (sample)",
    paycheck: {
      frequency: "biweekly",
      netPay: 2_450,
      expenses: { housing: 1_650, transportation: 420, utilities: 260, groceries: 720, insurance: 210, other: 380 },
      debtFromTracker: true,
      debtPayments: 0,
      savings: 250,
      investing: 300,
    },
    debt: { debts, extra: 150, strategy: "avalanche" },
    emergency: { current: 2_400, essentialsFromPaycheck: true, essentials: 0, contribution: 125, frequency: "biweekly", starterGoal: 1000, goal: "three", syncToNetWorth: true, contributionFromPaycheck: true },
    investing: { start: 0, monthly: 0, returnPct: 7, years: 25, inflationPct: 3, showReal: false, startFromNetWorth: true, monthlyFromPaycheck: true },
    benefits: {
      federal: false,
      items: {
        "401k-match": { status: "using", note: "Employer matches 100% of the first 4%. Contributing 6%." },
        "roth-traditional": { status: "reviewed", note: "" },
        health: { status: "using", note: "" },
        "hsa-fsa": { status: "follow-up", note: "Ask HR whether our plan is HSA-eligible." },
        "life-disability": { status: "follow-up", note: "Group life is 1x salary. Check if that is enough." },
        eap: { status: "available", note: "" },
      },
    },
    reset: {
      done: { "w1-numbers": true, "w1-networth": true, "w1-snapshot": true, "w2-paycheck": true },
      move: {
        priority: "Pay off the store card",
        commitment: "Send an extra $150 to the store card every payday until it is gone.",
        measure: "Balance reaches $0 and the card stays in the drawer.",
        deadline: "",
      },
    },
    netWorth: { assets, liabilities, properties, snapshots, goal: 100_000, debtsFromTracker: true },
  };
}

/** Accepts anything read back from storage and returns a complete, valid state (or null). */
export function normalizeState(raw: unknown): ToolkitState | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Partial<ToolkitState>;
  if (r.version !== 1) return null;
  const base = blankState();
  return {
    ...base,
    ...r,
    paycheck: { ...base.paycheck, ...r.paycheck, expenses: { ...base.paycheck.expenses, ...r.paycheck?.expenses } },
    debt: { ...base.debt, ...r.debt, debts: Array.isArray(r.debt?.debts) ? r.debt.debts : [] },
    emergency: { ...base.emergency, ...r.emergency },
    investing: { ...base.investing, ...r.investing },
    benefits: { ...base.benefits, ...r.benefits, items: { ...r.benefits?.items } },
    reset: { done: { ...r.reset?.done }, move: { ...base.reset.move, ...r.reset?.move } },
    netWorth: {
      ...base.netWorth,
      ...r.netWorth,
      assets: Array.isArray(r.netWorth?.assets) ? r.netWorth.assets : [],
      liabilities: Array.isArray(r.netWorth?.liabilities) ? r.netWorth.liabilities : [],
      properties: Array.isArray(r.netWorth?.properties) ? r.netWorth.properties : [],
      snapshots: Array.isArray(r.netWorth?.snapshots) ? r.netWorth.snapshots : [],
    },
  };
}
