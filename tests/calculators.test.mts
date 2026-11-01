// Run with: npm test  (uses Node's built-in test runner and type stripping, no extra dependencies)
import { test } from "node:test";
import assert from "node:assert/strict";
import { futureValue, payYourselfFirst, costOfWaiting, validateCostOfWaiting } from "../src/lib/calculators.ts";
import { scoreScorecard, scorecardQuestions, type Answer } from "../src/content/scorecard.ts";

const close = (a: number, b: number, tol = 0.01) => assert.ok(Math.abs(a - b) < tol, `${a} != ${b}`);

test("futureValue with 0% return is simple sum", () => {
  close(futureValue({ monthlyContribution: 100, annualReturnPct: 0, months: 12 }), 1200);
});

test("futureValue matches known annuity value", () => {
  // $100/mo, 12% annual (1%/mo), 12 months: 100 * ((1.01^12 - 1) / 0.01) = 1268.25
  close(futureValue({ monthlyContribution: 100, annualReturnPct: 12, months: 12 }), 1268.25);
});

test("futureValue grows a starting balance", () => {
  close(futureValue({ startingBalance: 1000, monthlyContribution: 0, annualReturnPct: 12, months: 12 }), 1126.83);
});

test("payYourselfFirst splits by pay frequency", () => {
  const r = payYourselfFirst({ annualIncome: 52000, contributionPct: 10, frequency: "biweekly", hypotheticalReturnPct: 0 });
  close(r.annual, 5200);
  close(r.perPaycheck, 200);
  close(r.monthly, 433.33);
  close(r.projections.find((p) => p.years === 10)!.value, 52000);
});

test("costOfWaiting: starting earlier always wins with positive return", () => {
  const r = costOfWaiting({ currentAge: 25, waitAge: 35, retirementAge: 65, monthlyInvestment: 200, annualReturnPct: 7 });
  assert.ok(r.startNow.balance > r.wait.balance);
  close(r.startNow.contributions, 200 * 12 * 40);
  close(r.wait.contributions, 200 * 12 * 30);
  close(r.costOfWaiting, r.startNow.balance - r.wait.balance);
  assert.equal(r.series.length, 41);
  assert.equal(r.series[0].startNow, 0);
  close(r.series.at(-1)!.startNow, r.startNow.balance);
  // Catch-up contribution should reproduce start-now balance over the shorter period
  close(futureValue({ monthlyContribution: r.monthlyNeededToCatchUp, annualReturnPct: 7, months: 360 }), r.startNow.balance, 1);
});

test("validateCostOfWaiting catches bad ages", () => {
  assert.ok(validateCostOfWaiting({ currentAge: 40, waitAge: 30, retirementAge: 65, monthlyInvestment: 100, annualReturnPct: 6 }).length > 0);
  assert.equal(validateCostOfWaiting({ currentAge: 30, waitAge: 40, retirementAge: 65, monthlyInvestment: 100, annualReturnPct: 6 }).length, 0);
});

test("scorecard scoring and next steps", () => {
  const all = (a: Answer) => Object.fromEntries(scorecardQuestions.map((q) => [q.id, a]));
  assert.equal(scoreScorecard(all("yes")).score, 100);
  assert.equal(scoreScorecard(all("sometimes")).score, 50);
  assert.equal(scoreScorecard(all("no")).score, 0);
  assert.equal(scoreScorecard(all("yes")).band.title, "Strong foundation");
  assert.equal(scoreScorecard(all("sometimes")).band.title, "Building momentum");
  assert.equal(scoreScorecard(all("yes")).nextSteps.length, 3);

  const mixed = { ...all("yes"), match: "sometimes" as Answer, debt: "no" as Answer };
  const r = scoreScorecard(mixed);
  assert.equal(r.score, 85);
  assert.equal(r.nextSteps[0].title, scorecardQuestions.find((q) => q.id === "debt")!.nextStep.title);
  assert.equal(r.nextSteps[1].title, scorecardQuestions.find((q) => q.id === "match")!.nextStep.title);
});

import { compoundGrowth, emergencyFund, payoffPlan, employerMatch, lifeInsuranceNeeds } from "../src/lib/calculators.ts";

test("compoundGrowth series and totals", () => {
  const r = compoundGrowth({ startingBalance: 1000, monthlyContribution: 100, annualReturnPct: 0, years: 10 });
  close(r.finalValue, 13000);
  close(r.totalContributions, 13000);
  assert.equal(r.series.length, 11);
  const g = compoundGrowth({ startingBalance: 1000, monthlyContribution: 100, annualReturnPct: 6, years: 10 });
  assert.ok(g.growth > 0);
});

test("emergencyFund target, gap, timeline", () => {
  const r = emergencyFund({ monthlyEssentials: 3000, currentSavings: 2000, targetMonths: 3, monthlySaving: 500 });
  close(r.target, 9000);
  close(r.gap, 7000);
  assert.equal(r.monthsToGoal, 14);
  assert.equal(emergencyFund({ monthlyEssentials: 3000, currentSavings: 2000, targetMonths: 3, monthlySaving: 0 }).monthsToGoal, null);
  assert.equal(emergencyFund({ monthlyEssentials: 1000, currentSavings: 5000, targetMonths: 3, monthlySaving: 0 }).gap, 0);
});

test("payoffPlan: single 0% debt pays off exactly", () => {
  const r = payoffPlan([{ id: "a", name: "A", balance: 1000, apr: 0, minPayment: 100 }], 0, "snowball");
  assert.equal(r.months, 10);
  close(r.totalInterest, 0);
  close(r.totalPaid, 1000);
});

test("payoffPlan: avalanche never costs more interest than snowball", () => {
  const debts = [
    { id: "a", name: "Small low", balance: 800, apr: 9, minPayment: 30 },
    { id: "b", name: "Big high", balance: 6000, apr: 26, minPayment: 150 },
    { id: "c", name: "Mid", balance: 2500, apr: 18, minPayment: 75 },
  ];
  const s = payoffPlan(debts, 200, "snowball");
  const a = payoffPlan(debts, 200, "avalanche");
  assert.ok(a.totalInterest <= s.totalInterest + 0.01);
  assert.equal(s.order[0].id, "a");
  assert.equal(a.order.at(-1)!.id !== "b" || a.order.length === 3, true);
  assert.ok(!s.neverPaysOff && !a.neverPaysOff);
  // Extra payments speed payoff
  assert.ok(payoffPlan(debts, 0, "avalanche").months > a.months);
});

test("payoffPlan: flags debts that never pay off", () => {
  const r = payoffPlan([{ id: "a", name: "A", balance: 10000, apr: 30, minPayment: 100 }], 0, "avalanche");
  assert.ok(r.neverPaysOff);
});

test("employerMatch tiers", () => {
  const tiers = [{ matchPct: 100, onUpToPct: 3 }, { matchPct: 50, onUpToPct: 2 }];
  const r = employerMatch({ salary: 50000, employeeRatePct: 4, tiers });
  close(r.employee, 2000);
  close(r.employer, 1750); // 3% + 0.5%
  assert.equal(r.fullMatchAt, 5);
  close(r.maxEmployer, 2000);
  close(r.missed, 250);
  close(employerMatch({ salary: 50000, employeeRatePct: 10, tiers }).employer, 2000);
});

test("lifeInsuranceNeeds gap", () => {
  const r = lifeInsuranceNeeds({ annualIncome: 50000, yearsToReplace: 10, dependents: 2, educationPerChild: 25000, mortgageBalance: 150000, otherDebts: 10000, finalExpenses: 15000, existingCoverage: 100000, availableAssets: 20000 });
  close(r.totalNeeds, 725000);
  close(r.gap, 605000);
});
