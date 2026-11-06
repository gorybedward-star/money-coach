/**
 * Financial Reset Toolkit calculations. Pure functions, unit tested in tests/toolkit.test.mts.
 * Everything is an educational estimate in today's dollars unless noted.
 */
import {
  EXPENSES,
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
  let month = 0;
  let totalInterest = 0;
  let totalPaid = 0;

  while (live.some((d) => d.bal > 0.005) && month < MAX_MONTHS) {
    month++;
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
  }
  return { months: month, totalInterest, totalPaid, perDebt, order, balances, neverPaysOff: live.some((d) => d.bal > 0.005) };
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
  return {
    "w1-networth": t.nw.assets > 0,
    "w1-snapshot": s.netWorth.snapshots.length > 0,
    "w2-paycheck": t.pay.income > 0 && t.pay.expenses > 0,
    "w2-debts": s.debt.debts.some((d) => d.balance > 0),
    "w2-method": s.debt.debts.some((d) => d.balance > 0) && s.debt.extra > 0,
    "w3-auto": t.emergency.monthly > 0,
    "w3-benefits": reviewed >= 5,
    "w3-protection": PROTECTION_ITEMS.every((id) => st(id) !== "not-started"),
    "w4-match": ["401k-match", "tsp"].some((id) => st(id) === "using" || st(id) === "not-offered"),
    "w4-invest": t.investing.monthly > 0,
    "w4-move": s.reset.move.commitment.trim().length > 0,
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
