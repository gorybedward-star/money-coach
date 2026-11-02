import { test } from "node:test";
import assert from "node:assert/strict";
import { summarize, nextRoadmapStep, wealthLevel, projectArrival, addSnapshot, isHighInterest, exampleSheet, blankSheet, newLine, EXAMPLE_ESSENTIALS } from "../src/lib/net-worth.ts";

test("example family totals", () => {
  const s = summarize(exampleSheet(), Number(EXAMPLE_ESSENTIALS));
  assert.equal(s.assets, 345_400);
  assert.equal(s.debts, 281_700);
  assert.equal(s.netWorth, 63_700);
  assert.equal(s.highInterest, 6_200);
  assert.ok(Math.abs(s.monthsCovered! - 5900 / 4540) < 1e-9);
});

test("example points to eliminating costly debt", () => {
  const s = summarize(exampleSheet(), Number(EXAMPLE_ESSENTIALS));
  assert.equal(nextRoadmapStep(s).stage, 4);
});

test("blank sheet points to knowing your numbers", () => {
  assert.equal(nextRoadmapStep(summarize(blankSheet())).stage, 1);
});

test("starter safety net comes before debt payoff", () => {
  const sheet = blankSheet();
  sheet.cash = [newLine("Checking", "500")];
  sheet.costly = [newLine("Card", "3000", "24")];
  assert.equal(nextRoadmapStep(summarize(sheet, 3000)).stage, 2);
});

test("no essentials entered skips the cash check", () => {
  const sheet = blankSheet();
  sheet.cash = [newLine("Checking", "500")];
  sheet.costly = [newLine("Card", "3000", "24")];
  const s = summarize(sheet);
  assert.equal(s.monthsCovered, null);
  assert.equal(nextRoadmapStep(s).stage, 4);
});

test("well-funded, debt-free, invested household reaches stage 6", () => {
  const sheet = blankSheet();
  sheet.cash = [newLine("Savings", "20000")];
  sheet.invest = [newLine("401k", "80000")];
  assert.equal(nextRoadmapStep(summarize(sheet, 4000)).stage, 6);
});

test("high-interest classification", () => {
  assert.equal(isHighInterest("costly", newLine("Card", "100", "")), true);
  assert.equal(isHighInterest("costly", newLine("0% promo card", "100", "0")), false);
  assert.equal(isHighInterest("loans", newLine("Car", "100", "")), false);
  assert.equal(isHighInterest("loans", newLine("Private student loan", "100", "11")), true);
  assert.equal(isHighInterest("mortgage", newLine("Mortgage", "100", "6.5")), false);
});

test("wealth levels show only the current goal", () => {
  assert.equal(wealthLevel(63_700).level!.goal, 100_000);
  assert.ok(Math.abs(wealthLevel(63_700).progress - 0.637) < 1e-9);
  assert.deepEqual(wealthLevel(63_700).checkpoints.map((c) => c.reached), [true, true, false]);
  assert.equal(wealthLevel(100_000).level!.goal, 500_000);
  assert.deepEqual(wealthLevel(100_000).checkpoints.map((c) => c.value), [200_000, 300_000, 400_000]);
  assert.equal(wealthLevel(100_000).completed.length, 1);
  assert.equal(wealthLevel(750_000).level!.name, "Millionaire");
  assert.equal(wealthLevel(1_200_000).level!.goal, 5_000_000);
  assert.equal(wealthLevel(5_000_000).level, null);
});

test("starting line measures from the lowest point", () => {
  const st = wealthLevel(-5_000, -20_000);
  assert.equal(st.level!.n, 0);
  assert.equal(st.level!.goal, 0);
  assert.ok(Math.abs(st.progress - 0.75) < 1e-9);
});

test("arrival projection uses snapshot pace", () => {
  const h = [
    { date: "2026-01-01T00:00:00Z", assets: 0, debts: 0, netWorth: 40_000 },
    { date: "2026-07-02T00:00:00Z", assets: 0, debts: 0, netWorth: 52_000 },
  ];
  const p = projectArrival(h, 100_000, new Date("2026-07-02T00:00:00Z"))!;
  assert.ok(p.perMonth > 1_950 && p.perMonth < 2_050);
  assert.ok(p.months! > 23 && p.months! < 25);
  assert.equal(projectArrival(h.slice(0, 1), 100_000), null);
  assert.equal(projectArrival([h[1], { ...h[1], date: "2026-08-02T00:00:00Z", netWorth: 50_000 }], 100_000)!.months, null);
});

test("snapshots keep one per day, sorted, capped", () => {
  let list = addSnapshot([], { date: "2026-10-01T10:00:00Z", assets: 1, debts: 0, netWorth: 1 });
  list = addSnapshot(list, { date: "2026-11-01T10:00:00Z", assets: 2, debts: 0, netWorth: 2 });
  list = addSnapshot(list, { date: "2026-11-01T18:00:00Z", assets: 3, debts: 0, netWorth: 3 });
  assert.equal(list.length, 2);
  assert.equal(list[1].netWorth, 3);
  for (let i = 0; i < 10; i++) list = addSnapshot(list, { date: `2027-01-${String(i + 10)}T00:00:00Z`, assets: 0, debts: 0, netWorth: i }, 5);
  assert.equal(list.length, 5);
});
