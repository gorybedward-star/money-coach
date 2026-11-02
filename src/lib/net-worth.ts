/** Net Worth logic: pure functions, no UI. Educational estimates only. */

export type AssetGroupId = "cash" | "invest" | "property" | "belongings";
export type DebtGroupId = "costly" | "loans" | "mortgage";
export type GroupId = AssetGroupId | DebtGroupId;

export const ASSET_GROUPS: AssetGroupId[] = ["cash", "invest", "property", "belongings"];
export const DEBT_GROUPS: DebtGroupId[] = ["costly", "loans", "mortgage"];

/** `apr` is only used on debt lines (optional, percent). */
export type Line = { id: string; label: string; amount: string; apr?: string };
export type Sheet = Record<GroupId, Line[]>;

export type Snapshot = { date: string; assets: number; debts: number; netWorth: number };

/** A debt at or above this APR is treated as high-interest ("costly"). */
export const HIGH_INTEREST_APR = 8;

const num = (s: string | undefined) => {
  const n = Number(s);
  return Number.isFinite(n) && n > 0 ? n : 0;
};

/** Costly-group debts count as high-interest unless an APR under the threshold is entered; other debts only when their APR is at or above it. */
export function isHighInterest(group: DebtGroupId, line: Line) {
  const apr = Number(line.apr);
  const hasApr = line.apr !== undefined && line.apr !== "" && Number.isFinite(apr);
  if (group === "costly") return !hasApr || apr >= HIGH_INTEREST_APR;
  return hasApr && apr >= HIGH_INTEREST_APR;
}

export type Check = { tone: "good" | "watch" | "info"; title: string; detail: string; href?: string; cta?: string };
export type NextStep = { stage: number; title: string; detail: string; href: string; cta: string };

/**
 * Wealth levels. A client only sees the level they are working on now, so someone focused on their first
 * $100K is never shown a $500K or $1M tracker. Levels unlock one at a time.
 */
export type WealthLevel = { n: number; name: string; start: number; goal: number; tagline: string };

export const WEALTH_LEVELS: WealthLevel[] = [
  { n: 0, name: "The Starting Line", start: -Infinity, goal: 0, tagline: "Own more than you owe. Every dollar of debt paid moves you forward." },
  { n: 1, name: "First $100K", start: 0, goal: 100_000, tagline: "The hardest one. After this, compound growth starts doing real work for you." },
  { n: 2, name: "Half a Million", start: 100_000, goal: 500_000, tagline: "Your money is working as hard as you are. Stay consistent and protect it." },
  { n: 3, name: "Millionaire", start: 500_000, goal: 1_000_000, tagline: "Seven figures. Keep investing, keep it protected, and plan your legacy." },
  { n: 4, name: "Legacy Builder", start: 1_000_000, goal: 5_000_000, tagline: "Building wealth that can outlast you. Estate planning matters most here." },
];

export type LevelStatus = {
  level: WealthLevel | null; // null once every level is complete
  completed: WealthLevel[];
  progress: number; // 0-1 within the current level
  toGo: number;
  checkpoints: { value: number; reached: boolean }[];
  /** For the starting line, progress is measured from the deepest point recorded. */
  from: number;
};

/** The client's current wealth level. `low` is the lowest net worth on record (used only for the starting line). */
export function wealthLevel(nw: number, low = nw): LevelStatus {
  const idx = WEALTH_LEVELS.findIndex((l) => nw < l.goal);
  if (idx === -1) {
    return { level: null, completed: WEALTH_LEVELS.slice(1), progress: 1, toGo: 0, checkpoints: [], from: WEALTH_LEVELS.at(-1)!.goal };
  }
  const level = WEALTH_LEVELS[idx];
  const from = level.n === 0 ? Math.min(low, nw) : level.start;
  const span = level.goal - from;
  const progress = span > 0 ? Math.max(0, Math.min(1, (nw - from) / span)) : 0;
  const checkpoints = level.n === 0
    ? []
    : [0.25, 0.5, 0.75].map((f) => {
        const value = level.start + (level.goal - level.start) * f;
        return { value, reached: nw >= value };
      });
  const completed = WEALTH_LEVELS.slice(1, idx);
  return { level, completed, progress, toGo: level.goal - nw, checkpoints, from };
}

/**
 * Projects when the current goal is reached at the pace shown by saved snapshots (straight-line, first to last).
 * Needs at least two snapshots 3+ weeks apart and an upward trend. Not a forecast of investment returns.
 */
export function projectArrival(history: Snapshot[], goal: number, now = new Date()) {
  if (history.length < 2) return null;
  const first = history[0];
  const last = history.at(-1)!;
  const days = (Date.parse(last.date) - Date.parse(first.date)) / 86_400_000;
  if (!(days >= 21)) return null;
  const perMonth = ((last.netWorth - first.netWorth) / days) * 30.44;
  if (perMonth <= 0) return { perMonth, months: null, date: null };
  const remaining = goal - last.netWorth;
  if (remaining <= 0) return { perMonth, months: 0, date: now };
  const months = remaining / perMonth;
  const date = new Date(now.getTime() + months * 30.44 * 86_400_000);
  return { perMonth, months, date };
}

const usd = (n: number) => Math.round(n).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export function summarize(sheet: Sheet, monthlyEssentials = 0) {
  const sum = (g: GroupId) => sheet[g].reduce((s, l) => s + num(l.amount), 0);
  const groups = Object.fromEntries([...ASSET_GROUPS, ...DEBT_GROUPS].map((g) => [g, sum(g)])) as Record<GroupId, number>;
  const assets = ASSET_GROUPS.reduce((s, g) => s + groups[g], 0);
  const debts = DEBT_GROUPS.reduce((s, g) => s + groups[g], 0);
  const netWorth = assets - debts;

  const highInterest = DEBT_GROUPS.reduce(
    (s, g) => s + sheet[g].filter((l) => isHighInterest(g, l)).reduce((t, l) => t + num(l.amount), 0),
    0,
  );
  const cash = groups.cash;
  const invested = groups.invest;
  const essentials = monthlyEssentials > 0 ? monthlyEssentials : 0;
  const monthsCovered = essentials > 0 ? cash / essentials : null;
  /** Assets that can grow over time (investments and property) vs. those that usually lose value. */
  const growing = groups.invest + groups.property;
  const growingPct = assets > 0 ? (growing / assets) * 100 : 0;
  const debtRatio = assets > 0 ? (debts / assets) * 100 : debts > 0 ? Infinity : 0;
  /** Net worth without the home and belongings: what you could reach without selling where you live or what you drive. */
  const financialNetWorth = cash + invested - (debts - groups.mortgage);

  const checks: Check[] = [];
  if (assets <= 0 && debts <= 0) {
    checks.push({ tone: "info", title: "Start with what you own", detail: "Add your checking and savings balances first. Round numbers are fine." });
  } else {
    if (netWorth > 0) checks.push({ tone: "good", title: `You own more than you owe: ${usd(netWorth)}`, detail: "That's positive net worth. The goal now is to grow it a little every month." });
    else if (netWorth < 0) checks.push({ tone: "watch", title: `You owe ${usd(-netWorth)} more than you own`, detail: "This is common, especially early on or with student loans. Every dollar of debt you pay down moves this number up." });
    else checks.push({ tone: "info", title: "You're at exactly $0", detail: "Right at the starting line. Your next dollar saved or debt paid makes it positive." });

    if (monthsCovered === null) checks.push({ tone: "info", title: "Add your monthly essentials", detail: "We'll show how many months your cash could cover if income stopped." });
    else if (monthsCovered >= 3) checks.push({ tone: "good", title: `Cash covers ${monthsCovered.toFixed(1)} months of essentials`, detail: "A solid safety net. Many families aim for three to six months." });
    else if (monthsCovered >= 1) checks.push({ tone: "watch", title: `Cash covers ${monthsCovered.toFixed(1)} months of essentials`, detail: "You have a starter cushion. Keep building toward three months.", href: "/tools/emergency-fund", cta: "Plan your emergency fund" });
    else checks.push({ tone: "watch", title: `Cash covers ${monthsCovered.toFixed(1)} months of essentials`, detail: "Less than one month. A starter emergency fund keeps surprises from becoming new debt.", href: "/tools/emergency-fund", cta: "Plan your emergency fund" });

    if (highInterest > 0) checks.push({ tone: "watch", title: `${usd(highInterest)} in high-interest debt`, detail: `Balances at ${HIGH_INTEREST_APR}% APR or more cost you money every month. Paying them off is a guaranteed win.`, href: "/tools/debt-payoff", cta: "Build a payoff plan" });
    else if (debts > 0) checks.push({ tone: "good", title: "No high-interest debt", detail: "Your remaining debts are lower-rate. Stay on schedule and avoid new card balances." });

    if (invested > 0) checks.push({ tone: "good", title: `${usd(invested)} invested for the future`, detail: `${growingPct.toFixed(0)}% of what you own can grow over time. Time and consistency do the heavy lifting.` });
    else checks.push({ tone: "info", title: "Nothing invested yet", detail: "Once your safety net and costly debt are handled, investing early and often lets compound growth work for you.", href: "/tools/cost-of-waiting", cta: "See the cost of waiting" });

    checks.push({ tone: "info", title: "Protect what you've built", detail: "Life and disability coverage and up-to-date beneficiaries help keep this number intact for your family. Review them at least once a year.", href: "/tools/life-insurance", cta: "Estimate life insurance needs" });
  }

  return { groups, assets, debts, netWorth, highInterest, cash, invested, monthsCovered, growing, growingPct, debtRatio, financialNetWorth, checks };
}

export type Summary = ReturnType<typeof summarize>;

/**
 * Where this snapshot points on the Money Roadmap. Follows the coaching order:
 * starter safety net, then high-interest debt, then a full safety net, then invest, then build and transfer wealth.
 */
export function nextRoadmapStep(s: Summary): NextStep {
  if (s.assets <= 0 && s.debts <= 0) {
    return { stage: 1, title: "Know your numbers", detail: "Fill in what you own and what you owe to see your starting line.", href: "/tools/budget", cta: "Build your budget" };
  }
  if (s.monthsCovered !== null && s.monthsCovered < 1) {
    return { stage: 2, title: "Build a starter safety net", detail: "Set aside one month of essentials first so a surprise bill doesn't become new debt.", href: "/tools/emergency-fund", cta: "Plan your emergency fund" };
  }
  if (s.highInterest > 0) {
    return { stage: 4, title: "Eliminate costly debt", detail: `Clearing ${usd(s.highInterest)} of high-interest debt raises your net worth dollar for dollar and frees cash every month.`, href: "/tools/debt-payoff", cta: "Build a payoff plan" };
  }
  if (s.monthsCovered !== null && s.monthsCovered < 3) {
    return { stage: 2, title: "Finish your safety net", detail: "Grow your cash to about three months of essentials before investing more aggressively.", href: "/tools/emergency-fund", cta: "Plan your emergency fund" };
  }
  if (s.invested <= 0 || s.growingPct < 25) {
    return { stage: 5, title: "Invest consistently", detail: "Start with any employer match, then invest a set amount every paycheck in diversified, low-cost funds.", href: "/tools/employer-match", cta: "Check your employer match" };
  }
  return { stage: 6, title: "Build and transfer wealth", detail: "Keep investing, update your protection and beneficiaries, and start teaching the next generation.", href: "/roadmap#build-and-transfer-wealth", cta: "See stage 6" };
}

/** Adds or replaces today's snapshot (one per calendar day), keeping the most recent `max`. Sorted oldest first. */
export function addSnapshot(list: Snapshot[], snap: Snapshot, max = 60): Snapshot[] {
  const day = snap.date.slice(0, 10);
  const next = list.filter((s) => s.date.slice(0, 10) !== day).concat(snap);
  next.sort((a, b) => a.date.localeCompare(b.date));
  return next.slice(-max);
}

let seq = 0;
export const newLine = (label = "", amount = "", apr?: string): Line => ({ id: `n${Date.now().toString(36)}${seq++}`, label, amount, ...(apr !== undefined ? { apr } : {}) });

export function blankSheet(): Sheet {
  const L = newLine;
  return {
    cash: [L("Checking"), L("Savings and emergency fund")],
    invest: [L("Workplace retirement (401(k), 403(b), TSP)"), L("IRA or Roth IRA"), L("Brokerage or other investments")],
    property: [L("Home (estimated value)"), L("Rental or other real estate")],
    belongings: [L("Vehicle"), L("Other valuables")],
    costly: [L("Credit cards", "", ""), L("Personal or payday loans", "", "")],
    loans: [L("Car loan", "", ""), L("Student loans", "", "")],
    mortgage: [L("Mortgage", "", ""), L("Home equity loan or HELOC", "", "")],
  };
}

export function exampleSheet(): Sheet {
  const L = newLine;
  return {
    cash: [L("Checking", "2400"), L("Savings and emergency fund", "3500")],
    invest: [L("Workplace retirement (401(k), 403(b), TSP)", "28000"), L("IRA or Roth IRA", "6500"), L("Brokerage or other investments", "0")],
    property: [L("Home (estimated value)", "285000"), L("Rental or other real estate", "0")],
    belongings: [L("Vehicle", "14000"), L("Second vehicle", "6000")],
    costly: [L("Credit cards", "6200", "22.9"), L("Personal or payday loans", "0", "")],
    loans: [L("Car loan", "16500", "6.9"), L("Student loans", "21000", "5.5")],
    mortgage: [L("Mortgage", "238000", "6.5"), L("Home equity loan or HELOC", "0", "")],
  };
}

/** Monthly essentials in the example, matching the Family Budget Builder's example family. */
export const EXAMPLE_ESSENTIALS = "4540";
