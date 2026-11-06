/**
 * Financial Reset Toolkit calculations. Pure functions, unit tested in tests/toolkit.test.mts.
 * Everything is an educational estimate in today's dollars unless noted.
 */
import { BENEFIT_ITEMS, RESET_STEPS, RESET_WEEKS } from "../../content/toolkit.ts";
import {
  EXPENSES,
  addDays,
  dayKey,
  type Baseline,
  FREQUENCIES,
  addMonths,
  monthKey,
  monthsBetween,
  type Debt,
  type Emergency,
  type Frequency,
  type Investing,
  type LiabilityCategory,
  type NetWorth,
  type Paycheck,
  type Snapshot,
  type Strategy,
  type ToolkitState,
} from "./model.ts";

const pos = (n: number) => (Number.isFinite(n) && n > 0 ? n : 0);

export function toMonthly(amount: number, frequency: Frequency) {
  return (pos(amount) * FREQUENCIES[frequency].perYear) / 12;
}

// ---------------------------------------------------------------- Paycheck Planner

export function debtTrackerMonthly(debts: Debt[], extra: number) {
  return debts.filter((d) => d.balance > 0).reduce((s, d) => s + pos(d.minPayment), 0) + pos(extra);
}

export function paycheckSummary(p: Paycheck, trackerDebtMonthly: number) {
  const income = toMonthly(p.netPay, p.frequency);
  const byKey = EXPENSES.map((e) => ({ ...e, amount: pos(p.expenses[e.key]) }));
  const expenses = byKey.reduce((s, e) => s + e.amount, 0);
  const essentials = byKey.filter((e) => e.essential).reduce((s, e) => s + e.amount, 0);
  const debt = p.debtFromTracker ? trackerDebtMonthly : pos(p.debtPayments);
  const savings = pos(p.savings);
  const investing = pos(p.investing);
  const available = income - expenses - debt;
  const remaining = available - savings - investing;
  const savingsRate = income > 0 ? (savings + investing) / income : 0;
  const slices = [
    ...byKey.filter((e) => e.amount > 0).map((e) => ({ key: e.key, label: e.label, amount: e.amount, kind: "expense" as const })),
    ...(debt > 0 ? [{ key: "debt", label: "Debt payments", amount: debt, kind: "debt" as const }] : []),
    ...(savings > 0 ? [{ key: "savings", label: "Savings", amount: savings, kind: "save" as const }] : []),
    ...(investing > 0 ? [{ key: "investing", label: "Investing", amount: investing, kind: "save" as const }] : []),
    ...(remaining > 0 ? [{ key: "remaining", label: "Not yet assigned", amount: remaining, kind: "left" as const }] : []),
  ];
  return { income, expenses, essentials, debt, savings, investing, available, remaining, savingsRate, slices };
}

// ---------------------------------------------------------------- Debt Freedom Tracker

export type DebtSim = {
  months: number;
  totalInterest: number;
  totalPaid: number;
  /** Month number (1 = next month) each debt reaches $0, plus interest paid on it. */
  perDebt: Record<string, { month: number | null; interest: number }>;
  order: string[];
  /** Total balance at the end of each month (index 0 = today). */
  balances: number[];
  /** Total paid in each month (index 0 = month 1). */
  payments: number[];
  neverPaysOff: boolean;
};

const MAX_MONTHS = 600;

export function priorityOrder(debts: Debt[], strategy: Strategy) {
  const live = debts.filter((d) => d.balance > 0);
  const sorted = [...live].sort(
    strategy === "snowball"
      ? (a, b) => a.balance - b.balance || b.apr - a.apr
      : (a, b) => b.apr - a.apr || a.balance - b.balance,
  );
  return sorted.map((d) => d.id);
}

/**
 * Month-by-month amortization. Each month: interest accrues on every balance at APR / 12, every open debt gets
 * its minimum, then the extra payment goes to the top-priority debt. With `rollover`, a paid-off debt's minimum
 * joins the extra payment (the classic snowball/avalanche); without it, each debt only ever gets its own minimum.
 */
export function simulateDebts(debts: Debt[], extra: number, strategy: Strategy, rollover = true): DebtSim {
  const live = debts.filter((d) => d.balance > 0).map((d) => ({ id: d.id, bal: d.balance, apr: pos(d.apr), min: pos(d.minPayment) }));
  const order = priorityOrder(debts, strategy);
  const perDebt: DebtSim["perDebt"] = Object.fromEntries(live.map((d) => [d.id, { month: null, interest: 0 }]));
  const totalMin = live.reduce((s, d) => s + d.min, 0);
  const budget = totalMin + pos(extra);
  const balances = [live.reduce((s, d) => s + d.bal, 0)];
  const payments: number[] = [];
  let month = 0;
  let totalInterest = 0;
  let totalPaid = 0;

  while (live.some((d) => d.bal > 0.005) && month < MAX_MONTHS) {
    month++;
    const paidBefore = totalPaid;
    for (const d of live) {
      if (d.bal <= 0) continue;
      const i = (d.bal * d.apr) / 100 / 12;
      d.bal += i;
      totalInterest += i;
      perDebt[d.id].interest += i;
    }
    let available = rollover ? budget : pos(extra);
    if (!rollover) {
      for (const d of live) {
        if (d.bal <= 0) continue;
        const pay = Math.min(d.min, d.bal);
        d.bal -= pay;
        totalPaid += pay;
      }
    } else {
      for (const d of live) {
        if (d.bal <= 0) continue;
        const pay = Math.min(d.min, d.bal, available);
        d.bal -= pay;
        available -= pay;
        totalPaid += pay;
      }
    }
    for (const id of order) {
      if (available <= 0.005) break;
      const d = live.find((x) => x.id === id)!;
      if (d.bal <= 0) continue;
      const pay = Math.min(d.bal, available);
      d.bal -= pay;
      available -= pay;
      totalPaid += pay;
    }
    for (const d of live) {
      if (d.bal <= 0.005 && perDebt[d.id].month === null) {
        d.bal = 0;
        perDebt[d.id].month = month;
      }
    }
    balances.push(live.reduce((s, d) => s + Math.max(0, d.bal), 0));
    payments.push(totalPaid - paidBefore);
  }
  return { months: month, totalInterest, totalPaid, perDebt, order, balances, payments, neverPaysOff: live.some((d) => d.bal > 0.005) };
}

/** Debts whose minimum payment doesn't cover the first month's interest. */
export function underwaterDebts(debts: Debt[]) {
  return debts.filter((d) => d.balance > 0 && pos(d.minPayment) <= (d.balance * pos(d.apr)) / 1200);
}

export function debtProgress(debts: Debt[]) {
  const current = debts.reduce((s, d) => s + pos(d.balance), 0);
  const start = debts.reduce((s, d) => s + Math.max(pos(d.startBalance), pos(d.balance)), 0);
  const paid = start - current;
  return { current, start, paid, progress: start > 0 ? paid / start : 0 };
}

export function validateDebt(d: Debt): string[] {
  const e: string[] = [];
  if (!Number.isFinite(d.balance) || d.balance < 0) e.push("Balance must be $0 or more.");
  if (!Number.isFinite(d.apr) || d.apr < 0 || d.apr > 100) e.push("Interest rate should be between 0% and 100%.");
  if (d.balance > 0 && !(d.minPayment > 0)) e.push("Enter the minimum monthly payment.");
  return e;
}

/** A month number from now as a readable date, e.g. 3 -> "Feb 2027". */
export function monthLabel(n: number, from = new Date()) {
  const d = new Date(from.getFullYear(), from.getMonth() + n, 1);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

// ---------------------------------------------------------------- Emergency Fund Builder

export function emergencySummary(e: Emergency, paycheckEssentials: number, trackerMinimums: number, paycheckSavings = 0) {
  const essentials = e.essentialsFromPaycheck ? paycheckEssentials + trackerMinimums : pos(e.essentials);
  const current = pos(e.current);
  const monthly = e.contributionFromPaycheck ? pos(paycheckSavings) : toMonthly(e.contribution, e.frequency);
  const starter = pos(e.starterGoal) || 1000;
  const three = essentials * 3;
  const six = essentials * 6;
  const months = essentials > 0 ? current / essentials : null;
  const reach = (target: number) => {
    if (target <= 0) return null;
    if (current >= target) return 0;
    if (monthly <= 0) return Infinity;
    return Math.ceil((target - current) / monthly);
  };
  const goals = [
    { id: "starter" as const, label: "Starter fund", target: starter, months: reach(starter) },
    { id: "three" as const, label: "3 months of essentials", target: three, months: reach(three) },
    { id: "six" as const, label: "6 months of essentials", target: six, months: reach(six) },
  ];
  const selected = goals.find((g) => g.id === e.goal) ?? goals[0];
  const progress = selected.target > 0 ? Math.min(1, current / selected.target) : 0;
  return { essentials, current, monthly, months, goals, selected, progress };
}

// ---------------------------------------------------------------- Investing Calculator

export type GrowthRow = { year: number; contributions: number; balance: number; growth: number; real: number };

/** Monthly compounding at (annual / 12), contributions added at the end of each month. */
export function projectGrowth(i: Investing) {
  const r = pos(i.returnPct) / 100 / 12;
  const infl = pos(i.inflationPct) / 100;
  const years = Math.min(60, Math.max(0, Math.round(pos(i.years))));
  let balance = pos(i.start);
  let contributions = balance;
  const rows: GrowthRow[] = [{ year: 0, contributions, balance, growth: 0, real: balance }];
  for (let y = 1; y <= years; y++) {
    for (let m = 0; m < 12; m++) {
      balance = balance * (1 + r) + pos(i.monthly);
      contributions += pos(i.monthly);
    }
    rows.push({ year: y, contributions, balance, growth: balance - contributions, real: balance / Math.pow(1 + infl, y) });
  }
  const last = rows.at(-1)!;
  return { rows, final: last.balance, contributions: last.contributions, growth: last.growth, real: last.real };
}

// ---------------------------------------------------------------- Net Worth Tracker

export function netWorthSummary(nw: NetWorth) {
  const otherAssets = nw.assets.reduce((s, a) => s + pos(a.amount), 0);
  const propertyValue = nw.properties.reduce((s, p) => s + pos(p.value), 0);
  const mortgages = nw.properties.reduce((s, p) => s + pos(p.mortgage), 0);
  const otherDebts = nw.liabilities.reduce((s, l) => s + pos(l.amount), 0);
  const assets = otherAssets + propertyValue;
  const liabilities = otherDebts + mortgages;
  const homeEquity = propertyValue - mortgages;
  const netWorth = assets - liabilities;
  return { assets, liabilities, netWorth, otherAssets, propertyValue, mortgages, otherDebts, homeEquity };
}

export const snapNW = (s: Snapshot) => s.assets - s.liabilities;

export function sortSnapshots(s: Snapshot[]) {
  return [...s].sort((a, b) => a.month.localeCompare(b.month));
}

/** Breaks a change in net worth into what assets did and what paying down debt did. */
export function attribute(from: Snapshot, to: Snapshot) {
  const assetChange = to.assets - from.assets;
  const debtReduction = from.liabilities - to.liabilities;
  return { change: assetChange + debtReduction, assetChange, debtReduction };
}

/**
 * Monthly and annual changes from saved snapshots. "Monthly" compares the latest snapshot with the one before it;
 * "annual" compares it with the snapshot from 12 months earlier (or the closest one before that).
 */
export function netWorthHistory(snapshots: Snapshot[]) {
  const s = sortSnapshots(snapshots);
  if (s.length < 2) return { sorted: s, monthly: null, annual: null, sinceStart: null };
  const latest = s.at(-1)!;
  const prev = s.at(-2)!;
  const monthly = { from: prev, to: latest, gap: monthsBetween(prev.month, latest.month), ...attribute(prev, latest) };
  const yearAgo = [...s].reverse().find((x) => monthsBetween(x.month, latest.month) >= 12);
  const annual = yearAgo ? { from: yearAgo, to: latest, gap: monthsBetween(yearAgo.month, latest.month), ...attribute(yearAgo, latest) } : null;
  const first = s[0];
  const sinceStart = { from: first, to: latest, gap: monthsBetween(first.month, latest.month), ...attribute(first, latest) };
  return { sorted: s, monthly, annual, sinceStart };
}

/** Saves (or replaces) the snapshot for a month. */
export function upsertSnapshot(snapshots: Snapshot[], snap: Snapshot) {
  const rest = snapshots.filter((s) => s.month !== snap.month && s.id !== snap.id);
  return sortSnapshots([...rest, snap]);
}

export function goalProgress(netWorth: number, goal: number) {
  if (!(goal > 0)) return 0;
  return Math.max(0, Math.min(1, netWorth / goal));
}

export function formatMonth(month: string) {
  const [y, m] = month.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export { monthKey, addMonths };

// ---------------------------------------------------------------- Whole-toolkit summary + Money Coach Scorecard

export const PROTECTION_ITEMS = ["health", "life-disability"];

// ---------------------------------------------------------------- Sync: one number, entered once, used everywhere

export function guessCategory(name: string): LiabilityCategory {
  const n = name.toLowerCase();
  if (/card|visa|master|amex|discover|store/.test(n)) return "credit-card";
  if (/auto|car|truck|vehicle/.test(n)) return "auto";
  if (/student|school|college/.test(n)) return "student";
  if (/personal/.test(n)) return "personal";
  return "other";
}

export const SYNCED_EMERGENCY_ID = "sync-emergency";
export const isSynced = (id: string) => id.startsWith("sync-");

/**
 * The net worth sheet as the customer sees it: their own entries plus the numbers that sync in from other modules
 * (the emergency fund as cash, every Debt Freedom Tracker balance as a liability). Synced rows are read-only here
 * and edited in their home module, so nothing is ever entered or counted twice.
 */
export function effectiveNetWorth(s: ToolkitState): NetWorth {
  const nw = s.netWorth;
  const assets = s.emergency.syncToNetWorth && pos(s.emergency.current) > 0
    ? [{ id: SYNCED_EMERGENCY_ID, category: "cash" as const, name: "Emergency savings", amount: pos(s.emergency.current) }, ...nw.assets]
    : nw.assets;
  const liabilities = nw.debtsFromTracker
    ? [...s.debt.debts.filter((d) => d.balance > 0).map((d) => ({ id: `sync-${d.id}`, category: guessCategory(d.name), name: d.name || "Debt", amount: pos(d.balance) })), ...nw.liabilities]
    : nw.liabilities;
  return { ...nw, assets, liabilities };
}

export function investedAssets(nw: NetWorth) {
  return nw.assets.filter((a) => a.category === "brokerage" || a.category === "retirement").reduce((t, a) => t + pos(a.amount), 0);
}

export function effectiveInvesting(s: ToolkitState, paycheckInvesting: number, nw: NetWorth): Investing {
  const i = s.investing;
  return { ...i, start: i.startFromNetWorth ? investedAssets(nw) : i.start, monthly: i.monthlyFromPaycheck ? pos(paycheckInvesting) : i.monthly };
}

export function toolkitSummary(s: ToolkitState) {
  const trackerMonthly = debtTrackerMonthly(s.debt.debts, s.debt.extra);
  const trackerMinimums = debtTrackerMonthly(s.debt.debts, 0);
  const pay = paycheckSummary(s.paycheck, trackerMonthly);
  const emergency = emergencySummary(s.emergency, pay.essentials, trackerMinimums, pay.savings);
  const plan = simulateDebts(s.debt.debts, s.debt.extra, s.debt.strategy);
  const progress = debtProgress(s.debt.debts);
  const sheet = effectiveNetWorth(s);
  const nw = netWorthSummary(sheet);
  const investing = effectiveInvesting(s, pay.investing, sheet);
  return { pay, emergency, plan, progress, nw, sheet, investing, trackerMonthly, trackerMinimums };
}

/** 30-Day Reset steps that the toolkit can confirm from the customer's own data. */
export function autoTasks(s: ToolkitState, t = toolkitSummary(s)): Record<string, boolean> {
  const st = (id: string) => s.benefits.items[id]?.status ?? "not-started";
  const reviewed = Object.values(s.benefits.items).filter((b) => b.status !== "not-started").length;
  const hasDebt = s.debt.debts.some((d) => d.balance > 0);
  return {
    "w1-networth": t.nw.assets > 0,
    "w1-snapshot": s.netWorth.snapshots.length > 0,
    "w1-move": s.reset.move.commitment.trim().length > 0,
    "w2-paycheck": t.pay.income > 0 && t.pay.expenses > 0,
    "w2-zero": t.pay.income > 0 && t.pay.remaining >= 0,
    "w2-debts": hasDebt,
    "w2-method": hasDebt && s.debt.extra > 0,
    "w3-auto": t.emergency.monthly > 0,
    "w3-benefits": reviewed >= 5,
    "w3-match": ["401k-match", "tsp"].some((id) => st(id) === "using" || st(id) === "not-offered"),
    "w3-protection": PROTECTION_ITEMS.every((id) => st(id) !== "not-started"),
    "w4-invest": t.investing.monthly > 0,
    "w4-snapshot2": s.netWorth.snapshots.length >= 2,
  };
}

export const taskDone = (s: ToolkitState, auto: Record<string, boolean>, id: string) => !!(s.reset.done[id] || auto[id]);

export type ScoreRow = { id: string; label: string; score: number; detail: string; href: string };

const band = (v: number, steps: [number, number][], floor: number) => {
  for (const [min, score] of steps) if (v >= min) return score;
  return floor;
};

export function scorecard(s: ToolkitState, benefitIds: string[]): { rows: ScoreRow[]; total: number; label: string } {
  const t = toolkitSummary(s);
  const rows: ScoreRow[] = [];
  const pct = (n: number) => `${Math.round(n * 100)}%`;

  const em = t.emergency.months ?? 0;
  const savingsScore = Math.round((band(t.pay.savingsRate, [[0.15, 100], [0.1, 80], [0.05, 60], [0.0001, 40]], 10) + band(em, [[6, 100], [3, 80], [1, 60], [0.25, 40]], 10)) / 2);
  rows.push({ id: "savings", label: "Savings", score: savingsScore, detail: `Saving ${pct(t.pay.savingsRate)} of take-home pay; emergency fund covers ${em.toFixed(1)} months.`, href: "emergency" });

  const hasDebt = t.progress.current > 0;
  const debtScore = !hasDebt ? 100 : t.plan.neverPaysOff ? 10 : band(-t.plan.months, [[-12, 90], [-24, 75], [-48, 55], [-84, 40]], 25);
  rows.push({ id: "debt", label: "Debt", score: debtScore, detail: hasDebt ? (t.plan.neverPaysOff ? "Payments don't keep up with interest yet." : `Debt-free in about ${t.plan.months} months on your plan; ${pct(t.progress.progress)} paid off so far.`) : "No consumer debt entered.", href: "debt" });

  const cashScore = t.pay.income <= 0 ? 0 : t.pay.remaining < 0 ? 20 : t.pay.available > 0 ? 100 : 50;
  rows.push({ id: "cashflow", label: "Cash flow", score: cashScore, detail: t.pay.income <= 0 ? "Add your paycheck to see your cash flow." : t.pay.remaining < 0 ? "Your plan spends more than you bring home." : "Every dollar has a job and the plan balances.", href: "paycheck" });

  const invRate = t.pay.income > 0 ? t.pay.investing / t.pay.income : 0;
  const retirementUsing = ["401k-match", "tsp"].some((id) => s.benefits.items[id]?.status === "using");
  const retScore = Math.min(100, band(invRate, [[0.15, 100], [0.1, 80], [0.05, 60], [0.0001, 40]], 10) + (retirementUsing ? 20 : 0));
  rows.push({ id: "retirement", label: "Retirement", score: retScore, detail: `Investing ${pct(invRate)} of take-home pay${retirementUsing ? " and using your workplace plan" : ""}.`, href: "investing" });

  const reviewed = benefitIds.filter((id) => (s.benefits.items[id]?.status ?? "not-started") !== "not-started").length;
  const benScore = benefitIds.length ? Math.round((reviewed / benefitIds.length) * 100) : 0;
  rows.push({ id: "benefits", label: "Benefits", score: benScore, detail: `${reviewed} of ${benefitIds.length} benefits reviewed.`, href: "benefits" });

  const protReviewed = PROTECTION_ITEMS.filter((id) => (s.benefits.items[id]?.status ?? "not-started") !== "not-started").length + (s.reset.done["w3-beneficiaries"] ? 1 : 0);
  const protScore = Math.round((protReviewed / (PROTECTION_ITEMS.length + 1)) * 100);
  rows.push({ id: "protection", label: "Protection", score: protScore, detail: `${protReviewed} of ${PROTECTION_ITEMS.length + 1} protection checks done: health coverage, life and disability coverage, beneficiaries.`, href: "benefits" });

  const snaps = s.netWorth.snapshots.length;
  const nwScore = Math.round((snaps > 0 ? 40 : 0) + (s.netWorth.goal > 0 ? 20 : 0) + 40 * goalProgress(t.nw.netWorth, s.netWorth.goal));
  rows.push({ id: "networth", label: "Net worth goal", score: nwScore, detail: `${pct(goalProgress(t.nw.netWorth, s.netWorth.goal))} of the way to your goal; ${snaps} monthly snapshot${snaps === 1 ? "" : "s"} saved.`, href: "net-worth" });

  const total = Math.round(rows.reduce((a, r) => a + r.score, 0) / rows.length);
  const label = total >= 80 ? "Strong foundation" : total >= 55 ? "Building momentum" : "Getting started";
  return { rows, total, label };
}

export function nextMonths(n: number, from = monthKey()) {
  return Array.from({ length: n }, (_, i) => addMonths(from, i));
}

// ---------------------------------------------------------------- Next Best Move

export const HIGH_INTEREST_APR = 8;

export function benefitIdsFor(s: ToolkitState) {
  return BENEFIT_ITEMS.filter((i) => !i.federal || s.benefits.federal).map((i) => i.id);
}

export type PathStep = { id: string; label: string; done: boolean };
export type NextMove = { id: string; title: string; detail: string; href: string; cta: string; path: PathStep[] };

const usd0 = (n: number) => Math.round(n).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const usd2 = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });

/**
 * The one thing to do next. The order follows Dave Ramsey's 7 Baby Steps with two Money Coach additions (keep the
 * full employer match, review protection early): a plan that balances, a $1,000 starter fund, the employer match,
 * protection, every non-mortgage debt (snowball or avalanche order, with its cost per day), 3+ months saved,
 * investing 15%, then the mortgage. Uses only what's entered.
 */
export function nextBestMove(s: ToolkitState, t = toolkitSummary(s)): NextMove {
  const st = (id: string) => s.benefits.items[id]?.status ?? "not-started";
  const retirementIds = s.benefits.federal ? ["tsp", "401k-match"] : ["401k-match"];
  const matchStatus = retirementIds.map(st);
  const matchDone = matchStatus.some((x) => x === "using" || x === "not-offered");
  const debts = s.debt.debts.filter((d) => d.balance > 0);
  const protectionDone = PROTECTION_ITEMS.every((id) => st(id) !== "not-started") && !!s.reset.done["w3-beneficiaries"];
  const em = t.emergency;
  const starter = em.goals[0];
  const three = em.goals[1];
  const invRate = t.pay.income > 0 ? t.pay.investing / t.pay.income : 0;
  const mortgage = s.netWorth.properties.reduce((a, p) => a + pos(p.mortgage), 0);

  const path: PathStep[] = [
    { id: "plan", label: "Plan that balances", done: t.pay.income > 0 && t.pay.remaining >= 0 },
    { id: "starter", label: `${usd0(starter.target)} starter fund`, done: em.current >= starter.target },
    { id: "match", label: "Full employer match", done: matchDone },
    { id: "protect", label: "Family protected", done: protectionDone },
    { id: "debt", label: "Debt free except the house", done: debts.length === 0 },
    { id: "three", label: "3 to 6 months saved", done: three.target > 0 && em.current >= three.target },
    { id: "invest", label: "Investing 15%", done: invRate >= 0.15 },
    { id: "mortgage", label: "Home paid off", done: mortgage === 0 },
  ];
  const mk = (id: string, title: string, detail: string, href: string, cta: string): NextMove => ({ id, title, detail, href, cta, path });

  if (t.pay.income <= 0) return mk("plan", "Start with your paycheck", "Enter your take-home pay and monthly bills. Every other recommendation builds on it.", "paycheck", "Open Paycheck Planner");
  if (t.pay.remaining < 0) return mk("plan", `Close the ${usd0(-t.pay.remaining)} gap in your plan`, `Your plan spends ${usd0(-t.pay.remaining)} a month more than you bring home. Trim one expense or lower an allocation until it balances, so new debt doesn't fill the gap.`, "paycheck", "Balance my plan");
  if (em.current < starter.target) {
    const left = starter.target - em.current;
    const when = em.monthly > 0 ? ` At ${usd0(em.monthly)} a month you'll get there in about ${Math.ceil(left / em.monthly)} month${Math.ceil(left / em.monthly) === 1 ? "" : "s"}.` : " Set up an automatic transfer on payday to get there.";
    return mk("starter", `Build your ${usd0(starter.target)} starter emergency fund`, `${usd0(left)} to go.${when} This keeps a flat tire or a doctor's bill from becoming new debt.`, "emergency", "Open Emergency Fund");
  }
  if (!matchDone) {
    const name = s.benefits.federal ? "TSP agency match" : "employer match";
    return mk("match", `Capture your full ${name}`, s.benefits.federal ? "Contributing at least 5% of basic pay gets you the full 5% from your agency under FERS. Keep it going while you pay off debt, then mark it in your Benefits Checklist." : "Matching dollars are an instant return you can't get anywhere else, so keep them coming while you pay off debt. Ask HR what you need to contribute to get all of it, then mark it in your Benefits Checklist.", "benefits", "Check my benefits");
  }
  if (!protectionDone) return mk("protect", "Protect what you're building", "Review your health, life and disability coverage and confirm your beneficiaries. One illness, injury or loss shouldn't undo your progress. Insurance is regulated by each state; talk with a licensed professional before buying coverage.", "benefits", "Review my protection");
  if (debts.length) {
    const order = priorityOrder(debts, s.debt.strategy);
    const target = debts.find((d) => d.id === order[0])!;
    const perDay = (target.balance * target.apr) / 100 / 365;
    const extra = s.debt.extra > 0 ? `Put your extra ${usd0(s.debt.extra)} a month here` : "Add even $50 a month extra here";
    const why = s.debt.strategy === "snowball" ? "It's your smallest balance, so it's your quickest win." : "It has your highest rate.";
    const cost = perDay >= 0.01 ? ` At ${target.apr}% it costs you about ${usd2(perDay)} a day in interest.` : "";
    return mk("debt", `Pay off your ${target.name || "highest-priority debt"}`, `${why}${cost} ${extra}, and it's gone around ${monthLabel(t.plan.perDebt[target.id]?.month ?? t.plan.months)}. Then roll its payment into the next one.`, "debt", "Open Debt Tracker");
  }
  if (three.target > 0 && em.current < three.target) {
    const left = three.target - em.current;
    return mk("three", "Grow your emergency fund to 3 to 6 months", `${usd0(left)} to go to cover 3 months of essentials${em.monthly > 0 ? `, about ${Math.ceil(left / em.monthly)} months at your current pace` : ""}. Your old debt payments can go here now.`, "emergency", "Open Emergency Fund");
  }
  if (invRate < 0.15) {
    const add = Math.max(0, 0.15 * t.pay.income - t.pay.investing);
    return mk("invest", "Invest 15% for retirement", `You're investing ${(invRate * 100).toFixed(0)}% of take-home pay now. Adding about ${usd0(add)} a month gets you to 15%. Raising it 1% at a time works too.`, "investing", "See what it grows to");
  }
  if (mortgage > 0) return mk("mortgage", "Pay off your home early", `You owe ${usd0(mortgage)} on your home. Extra payments toward principal, even one a year, can take years off. If you have children, saving for college fits here too.`, "net-worth", "Open Net Worth");
  return mk("grow", "Build wealth and give", `Your foundation is complete. Keep investing every month, give generously, and save a net worth snapshot each month on your way to ${usd0(s.netWorth.goal)}.`, "net-worth", "Open Net Worth");
}

// ---------------------------------------------------------------- Goal date + what-if

/**
 * Month-by-month net worth projection from what's already entered: debts paid on the current plan, the Savings line
 * added as cash, invested balances growing at the Investing Calculator's hypothetical return with monthly investing.
 * When debts are paid off, their payments roll into investing. Home, vehicle and mortgage values are held flat.
 * `extra` is a what-if amount added each month (to debt while any remains, then to investing).
 */
export function projectNetWorth(s: ToolkitState, extra = 0, t = toolkitSummary(s), maxMonths = 600) {
  const plan = simulateDebts(s.debt.debts, s.debt.extra + pos(extra), s.debt.strategy);
  const capacity = debtTrackerMonthly(s.debt.debts, s.debt.extra + pos(extra));
  const r = pos(s.investing.returnPct) / 100 / 12;
  const i0 = investedAssets(t.sheet);
  const d0 = plan.balances[0] ?? 0;
  const goal = s.netWorth.goal;
  let inv = i0;
  let cash = 0;
  const series: { m: number; nw: number }[] = [{ m: 0, nw: t.nw.netWorth }];
  let goalMonth: number | null = t.nw.netWorth >= goal ? 0 : null;
  for (let m = 1; m <= maxMonths; m++) {
    const paid = plan.payments[m - 1] ?? 0;
    const freed = Math.max(0, capacity - paid);
    inv = inv * (1 + r) + t.investing.monthly + freed;
    cash += t.pay.savings;
    const debt = plan.balances[Math.min(m, plan.balances.length - 1)] ?? 0;
    const nw = t.nw.netWorth + cash + (inv - i0) + (d0 - debt);
    series.push({ m, nw });
    if (goalMonth === null && nw >= goal) goalMonth = m;
    if (goalMonth !== null && m >= goalMonth + 12 && m >= 60) break;
  }
  return { series, goalMonth, debtFreeMonth: plan.balances[0] > 0 && !plan.neverPaysOff ? plan.months : null };
}

export function durationLabel(months: number) {
  if (months <= 0) return "now";
  const y = Math.floor(months / 12);
  const m = months % 12;
  return [y ? `${y} yr` : "", m ? `${m} mo` : ""].filter(Boolean).join(" ");
}

// ---------------------------------------------------------------- 30-Day Reset: days, streak, baseline

export function resetDay(startedAt: string, today = dayKey()) {
  if (!startedAt) return 1;
  const [y1, m1, d1] = startedAt.split("-").map(Number);
  const [y2, m2, d2] = today.split("-").map(Number);
  const diff = Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86_400_000);
  return Math.max(1, Math.min(30, diff + 1));
}

/** Consecutive days with at least one step checked off, ending today (or yesterday, if nothing yet today). */
export function streak(doneAt: Record<string, string>, today = dayKey()) {
  const days = new Set(Object.values(doneAt));
  let cur = days.has(today) ? today : addDays(today, -1);
  let n = 0;
  while (days.has(cur)) {
    n++;
    cur = addDays(cur, -1);
  }
  return n;
}

export function resetProgress(s: ToolkitState, t = toolkitSummary(s), today = dayKey()) {
  const auto = autoTasks(s, t);
  const done = Object.fromEntries(RESET_STEPS.map((x) => [x.id, taskDone(s, auto, x.id)])) as Record<string, boolean>;
  const day = resetDay(s.reset.startedAt, today);
  const completed = RESET_STEPS.filter((x) => done[x.id]).length;
  const todayStep = RESET_STEPS.find((x) => !done[x.id] && x.day <= day) ?? RESET_STEPS.find((x) => !done[x.id]) ?? null;
  return { auto, done, day, completed, total: RESET_STEPS.length, todayStep, streak: streak(s.reset.doneAt, today) };
}

export function captureBaseline(s: ToolkitState, today = dayKey()): Baseline {
  const t = toolkitSummary(s);
  const card = scorecard(s, benefitIdsFor(s));
  return {
    date: today,
    netWorth: t.nw.netWorth,
    debt: t.progress.current,
    emergency: t.emergency.current,
    monthsCovered: t.emergency.months,
    savingsRate: t.pay.savingsRate,
    investingMonthly: t.investing.monthly,
    score: card.total,
    rows: Object.fromEntries(card.rows.map((r) => [r.id, r.score])),
  };
}

/** Starts a fresh 30 days: Day 1 is today and today's numbers become the baseline. */
export function startReset(s: ToolkitState, today = dayKey(), clearSteps = false): ToolkitState {
  const reset = { ...s.reset, startedAt: today, ...(clearSteps ? { done: {}, doneAt: {} } : {}) };
  const next = { ...s, reset };
  return { ...next, reset: { ...reset, baseline: captureBaseline(next, today) } };
}

// ---------------------------------------------------------------- Milestones

export type Milestone = { id: string; title: string; detail: string };
const NW_LEVELS = [10_000, 25_000, 50_000, 100_000, 250_000, 500_000, 1_000_000, 2_000_000, 5_000_000];

export function milestones(s: ToolkitState, t = toolkitSummary(s)): Milestone[] {
  const out: Milestone[] = [];
  const em = t.emergency;
  if (s.netWorth.snapshots.length) out.push({ id: "first-snapshot", title: "First snapshot saved", detail: "Your starting line is on record. Every month from here shows your progress." });
  if (t.nw.netWorth > 0 && (t.nw.assets > 0 || t.nw.liabilities > 0)) out.push({ id: "nw-positive", title: "You own more than you owe", detail: "Positive net worth. Now grow it a little every month." });
  for (const lvl of NW_LEVELS) if (t.nw.netWorth >= lvl) out.push({ id: `nw-${lvl}`, title: `Net worth passed ${usd0(lvl)}`, detail: "A real milestone. Keep doing what got you here." });
  if (s.netWorth.goal > 0 && t.nw.netWorth >= s.netWorth.goal) out.push({ id: `goal-${s.netWorth.goal}`, title: `You reached your ${usd0(s.netWorth.goal)} goal`, detail: "Set your next goal on the Net Worth page." });
  if (em.goals[0].target > 0 && em.current >= em.goals[0].target) out.push({ id: `starter-${em.goals[0].target}`, title: "Starter emergency fund complete", detail: `${usd0(em.goals[0].target)} set aside for life's surprises.` });
  if (em.months !== null && em.months >= 3) out.push({ id: "ef-3", title: "Three months of essentials saved", detail: "A solid safety net for your family." });
  if (em.months !== null && em.months >= 6) out.push({ id: "ef-6", title: "Six months of essentials saved", detail: "A full emergency fund. Few households get here." });
  for (const d of s.debt.debts) if (d.balance <= 0 && d.startBalance > 0) out.push({ id: `debt-${d.id}`, title: `${d.name || "A debt"} is paid off`, detail: `${usd0(d.startBalance)} gone for good. Roll that payment into the next one.` });
  const had = s.debt.debts.some((d) => d.startBalance > 0);
  if (had && s.debt.debts.every((d) => d.balance <= 0)) out.push({ id: "debt-free", title: "Consumer debt free", detail: "Every card and loan in your tracker is at $0." });
  if (t.pay.savingsRate >= 0.15) out.push({ id: "save-15", title: "Saving 15% or more", detail: "You're paying yourself first in a big way." });
  const rp = resetProgress(s, t);
  for (const w of RESET_WEEKS) if (w.tasks.every((x) => rp.done[x.id])) out.push({ id: `reset-week-${w.n}-${s.reset.startedAt}`, title: `Week ${w.n} of your reset complete`, detail: w.title + ". Done." });
  if (rp.completed === rp.total) out.push({ id: `reset-complete-${s.reset.startedAt}`, title: "30-Day Money Reset complete", detail: "All 30 steps done. Open your results report." });
  if (rp.streak >= 7) out.push({ id: `streak-7-${s.reset.startedAt}`, title: "7-day streak", detail: "A week of showing up for your money, every day." });
  return out;
}

/** Marks everything already achieved as celebrated (used for the sample family). */
export function primeCelebrations(s: ToolkitState): ToolkitState {
  return { ...s, celebrated: milestones(s).map((m) => m.id) };
}
