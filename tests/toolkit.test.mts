import { test } from "node:test";
import assert from "node:assert/strict";
import { blankState, normalizeState, sampleState, type Debt } from "../src/lib/toolkit/model.ts";
import {
  attribute,
  autoTasks,
  effectiveNetWorth,
  investedAssets,
  debtProgress,
  emergencySummary,
  netWorthHistory,
  netWorthSummary,
  paycheckSummary,
  projectGrowth,
  scorecard,
  simulateDebts,
  toMonthly,
  toolkitSummary,
  underwaterDebts,
  upsertSnapshot,
} from "../src/lib/toolkit/calc.ts";

const debt = (p: Partial<Debt> & { id: string }): Debt => ({ name: p.id, balance: 0, apr: 0, minPayment: 0, startBalance: p.balance ?? 0, ...p });
const close = (a: number, b: number, eps = 0.01) => assert.ok(Math.abs(a - b) <= eps, `${a} != ${b}`);

test("pay frequency converts to an exact monthly average", () => {
  close(toMonthly(2000, "biweekly"), (2000 * 26) / 12);
  close(toMonthly(1000, "weekly"), (1000 * 52) / 12);
  close(toMonthly(2500, "semimonthly"), 5000);
  close(toMonthly(4000, "monthly"), 4000);
  assert.equal(toMonthly(-50, "monthly"), 0);
});

test("single-debt amortization matches the closed-form schedule", () => {
  // $1,000 at 12% APR, $100/month: 10 full payments leave $58.40, the 11th payment is $58.99.
  const r = simulateDebts([debt({ id: "a", balance: 1000, apr: 12, minPayment: 100 })], 0, "avalanche");
  assert.equal(r.months, 11);
  close(r.totalInterest, 58.99);
  close(r.totalPaid, 1058.99);
  assert.equal(r.perDebt.a.month, 11);
  assert.equal(r.neverPaysOff, false);
});

test("0% debt pays off in balance / payment months with no interest", () => {
  const r = simulateDebts([debt({ id: "a", balance: 1200, apr: 0, minPayment: 100 })], 0, "snowball");
  assert.equal(r.months, 12);
  assert.equal(r.totalInterest, 0);
});

test("avalanche never costs more interest than snowball; snowball clears the smallest first", () => {
  const debts = [
    debt({ id: "big-high", balance: 8000, apr: 26, minPayment: 200 }),
    debt({ id: "small-low", balance: 900, apr: 6, minPayment: 40 }),
    debt({ id: "mid", balance: 4000, apr: 15, minPayment: 100 }),
  ];
  const av = simulateDebts(debts, 300, "avalanche");
  const sb = simulateDebts(debts, 300, "snowball");
  assert.ok(av.totalInterest <= sb.totalInterest);
  assert.deepEqual(av.order, ["big-high", "mid", "small-low"]);
  assert.deepEqual(sb.order, ["small-low", "mid", "big-high"]);
  assert.ok(sb.perDebt["small-low"].month! < sb.perDebt["big-high"].month!);
});

test("rolling over freed-up minimums is faster and cheaper than minimums only", () => {
  const debts = [debt({ id: "a", balance: 2000, apr: 20, minPayment: 60 }), debt({ id: "b", balance: 6000, apr: 9, minPayment: 120 })];
  const roll = simulateDebts(debts, 0, "avalanche", true);
  const mins = simulateDebts(debts, 0, "avalanche", false);
  assert.ok(roll.months <= mins.months);
  assert.ok(roll.totalInterest < mins.totalInterest);
});

test("a minimum that doesn't cover interest is flagged and never pays off", () => {
  const d = [debt({ id: "a", balance: 10_000, apr: 24, minPayment: 150 })];
  assert.equal(underwaterDebts(d).length, 1);
  assert.equal(simulateDebts(d, 0, "avalanche").neverPaysOff, true);
  assert.equal(simulateDebts(d, 200, "avalanche").neverPaysOff, false);
});

test("debt progress is measured from the starting balance", () => {
  const p = debtProgress([debt({ id: "a", balance: 600, startBalance: 1000 }), debt({ id: "b", balance: 500, startBalance: 500 })]);
  assert.equal(p.paid, 400);
  close(p.progress, 400 / 1500);
});

test("paycheck plan: cash flow, savings rate and what's left", () => {
  const s = sampleState(new Date(2026, 10, 6));
  const t = toolkitSummary(s);
  close(t.pay.income, (2450 * 26) / 12);
  assert.equal(t.pay.expenses, 3640);
  assert.equal(t.pay.debt, 120 + 35 + 389 + 233 + 150);
  close(t.pay.available, t.pay.income - 3640 - 927);
  close(t.pay.remaining, t.pay.available - 550);
  close(t.pay.savingsRate, 550 / t.pay.income);
  // Manual debt entry overrides the tracker
  const manual = paycheckSummary({ ...s.paycheck, debtFromTracker: false, debtPayments: 500 }, 927);
  assert.equal(manual.debt, 500);
});

test("emergency fund targets and time to reach", () => {
  const e = emergencySummary({ current: 1000, essentialsFromPaycheck: false, essentials: 3000, contribution: 500, frequency: "monthly", starterGoal: 1000, goal: "three" }, 0, 0);
  assert.equal(e.months, 1000 / 3000);
  assert.equal(e.goals[0].months, 0); // starter reached
  assert.equal(e.goals[1].target, 9000);
  assert.equal(e.goals[1].months, 16); // 8000 / 500
  assert.equal(e.goals[2].months, 34); // 17000 / 500
  close(e.progress, 1000 / 9000);
  const none = emergencySummary({ current: 0, essentialsFromPaycheck: true, essentials: 0, contribution: 0, frequency: "monthly", starterGoal: 1000, goal: "starter" }, 2000, 500);
  assert.equal(none.essentials, 2500);
  assert.equal(none.goals[0].months, Infinity);
});

test("compound growth: monthly compounding with end-of-month deposits", () => {
  const flat = projectGrowth({ start: 0, monthly: 100, returnPct: 0, years: 10, inflationPct: 0, showReal: false });
  assert.equal(flat.final, 12_000);
  assert.equal(flat.growth, 0);
  const one = projectGrowth({ start: 0, monthly: 100, returnPct: 12, years: 1, inflationPct: 0, showReal: false });
  close(one.final, 100 * ((1.01 ** 12 - 1) / 0.01));
  const lump = projectGrowth({ start: 10_000, monthly: 0, returnPct: 6, years: 10, inflationPct: 3, showReal: true });
  close(lump.final, 10_000 * (1.005 ** 120));
  close(lump.real, lump.final / 1.03 ** 10);
  assert.equal(lump.rows.length, 11);
});

test("net worth counts home equity exactly once", () => {
  const s = sampleState(new Date(2026, 10, 6));
  const n = netWorthSummary(effectiveNetWorth(s));
  assert.equal(n.assets, 1850 + 2400 + 3200 + 38500 + 6800 + 17000 + 285000);
  assert.equal(n.liabilities, 4200 + 900 + 14800 + 21500 + 231000);
  assert.equal(n.netWorth, 82_350);
  assert.equal(n.homeEquity, 54_000);
  assert.equal(n.netWorth, n.otherAssets + n.homeEquity - n.otherDebts);
});

test("history: monthly and annual changes split into debt paydown and asset change", () => {
  const snaps = [
    { id: "1", month: "2025-10", assets: 100_000, liabilities: 60_000 },
    { id: "2", month: "2026-09", assets: 108_000, liabilities: 52_000 },
    { id: "3", month: "2026-10", assets: 107_000, liabilities: 50_000 },
  ];
  const h = netWorthHistory(snaps);
  assert.equal(h.monthly!.change, 1_000);
  assert.equal(h.monthly!.debtReduction, 2_000);
  assert.equal(h.monthly!.assetChange, -1_000);
  assert.equal(h.annual!.from.month, "2025-10");
  assert.equal(h.annual!.change, 17_000);
  const a = attribute(snaps[0], snaps[2]);
  assert.equal(a.assetChange + a.debtReduction, a.change);
  assert.equal(netWorthHistory(snaps.slice(1)).annual, null);
  assert.equal(netWorthHistory([snaps[0]]).monthly, null);
});

test("saving a snapshot for an existing month replaces it and keeps order", () => {
  const s = upsertSnapshot([{ id: "a", month: "2026-10", assets: 1, liabilities: 0 }, { id: "b", month: "2026-08", assets: 1, liabilities: 0 }], { id: "c", month: "2026-10", assets: 5, liabilities: 1 });
  assert.deepEqual(s.map((x) => x.month), ["2026-08", "2026-10"]);
  assert.equal(s[1].assets, 5);
});

test("sample data: 12 months of history ending last month, and a sensible scorecard", () => {
  const s = sampleState(new Date(2026, 10, 6));
  assert.equal(s.netWorth.snapshots.length, 12);
  assert.equal(s.netWorth.snapshots.at(-1)!.month, "2026-10");
  assert.equal(s.netWorth.snapshots[0].month, "2025-11");
  const card = scorecard(s, ["401k-match", "roth-traditional", "health", "hsa-fsa", "life-disability", "eap", "tuition", "other"]);
  assert.equal(card.rows.length, 7);
  for (const r of card.rows) assert.ok(r.score >= 0 && r.score <= 100, `${r.id} ${r.score}`);
  assert.ok(card.rows.some((r) => r.id === "protection"));
});

test("blank state scores low and never crashes", () => {
  const card = scorecard(blankState(), ["health"]);
  assert.ok(card.total < 55);
  const t = toolkitSummary(blankState());
  assert.equal(t.nw.netWorth, 0);
  assert.equal(t.plan.months, 0);
});

test("stored data is validated before use", () => {
  assert.equal(normalizeState(null), null);
  assert.equal(normalizeState({ version: 2 }), null);
  const n = normalizeState({ version: 1, paycheck: { netPay: 1000 }, netWorth: { assets: "nope" } })!;
  assert.equal(n.paycheck.netPay, 1000);
  assert.equal(n.paycheck.frequency, "biweekly");
  assert.deepEqual(n.netWorth.assets, []);
});

test("sync: debts and emergency savings are entered once and flow into net worth", () => {
  const s = sampleState(new Date(2026, 10, 6));
  const sheet = effectiveNetWorth(s);
  assert.equal(sheet.liabilities.filter((l) => l.id.startsWith("sync-")).length, 4);
  assert.equal(sheet.assets.find((a) => a.id === "sync-emergency")!.amount, 2400);
  // Paying down a debt in the tracker raises net worth by the same amount, with no second entry.
  const before = netWorthSummary(sheet).netWorth;
  const paid = { ...s, debt: { ...s.debt, debts: s.debt.debts.map((d) => (d.id === "d-store" ? { ...d, balance: 0 } : d)) } };
  assert.equal(netWorthSummary(effectiveNetWorth(paid)).netWorth, before + 900);
  // Turning the links off removes the synced rows.
  const off = { ...s, emergency: { ...s.emergency, syncToNetWorth: false }, netWorth: { ...s.netWorth, debtsFromTracker: false } };
  const offSheet = effectiveNetWorth(off);
  assert.equal(offSheet.liabilities.length, 0);
  assert.ok(!offSheet.assets.some((a) => a.id.startsWith("sync-")));
});

test("sync: paycheck feeds the emergency fund and investing calculator; net worth feeds the starting balance", () => {
  const s = sampleState(new Date(2026, 10, 6));
  const t = toolkitSummary(s);
  assert.equal(t.emergency.monthly, 250);
  assert.equal(t.investing.monthly, 300);
  assert.equal(t.investing.start, 3200 + 38500 + 6800);
  assert.equal(investedAssets(t.sheet), 48_500);
  const manual = toolkitSummary({ ...s, emergency: { ...s.emergency, contributionFromPaycheck: false, contribution: 100, frequency: "weekly" } });
  close(manual.emergency.monthly, (100 * 52) / 12);
});

test("sync: 30-Day Reset steps check themselves off from real data", () => {
  const s = sampleState(new Date(2026, 10, 6));
  const a = autoTasks(s);
  assert.equal(a["w2-debts"], true);
  assert.equal(a["w2-paycheck"], true);
  assert.equal(a["w4-move"], true);
  assert.equal(a["w3-protection"], true);
  const b = autoTasks(blankState());
  assert.ok(Object.values(b).every((v) => !v));
});
