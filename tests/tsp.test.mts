// Federal Employee Wealth Center calculations. Run with: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { agencyMatch, fersMatchPct, tspGrowth, rothVsTraditional, fedCostOfWaiting } from "../src/lib/tsp.ts";
import { getLimits, catchUpFor } from "../src/config/federal-rules.ts";
import { scoreTspCheckup, tspCheckupQuestions, type TspAnswer } from "../src/content/federal/checkup.ts";

const close = (a: number, b: number, tol = 0.01) => assert.ok(Math.abs(a - b) < tol, `${a} != ${b}`);

test("2026 limits match IRS/TSP published values", () => {
  const l = getLimits(2026);
  assert.equal(l.electiveDeferral, 24500);
  assert.equal(l.catchUp50, 8000);
  assert.equal(l.catchUp60to63, 11250);
  assert.equal(l.annualAdditions, 72000);
  assert.equal(catchUpFor(49), 0);
  assert.equal(catchUpFor(50), 8000);
  assert.equal(catchUpFor(60), 11250);
  assert.equal(catchUpFor(63), 11250);
  assert.equal(catchUpFor(64), 8000);
  assert.throws(() => getLimits(2099));
});

test("FERS match formula: 100% of first 3%, 50% of next 2%", () => {
  close(fersMatchPct(0), 0);
  close(fersMatchPct(1), 1);
  close(fersMatchPct(3), 3);
  close(fersMatchPct(4), 3.5);
  close(fersMatchPct(5), 4);
  close(fersMatchPct(10), 4);
});

test("FERS at 5% of $65,000 receives full 5% agency contributions", () => {
  const r = agencyMatch({ annualBasicPay: 65000, employeeRatePct: 5, system: "fers" });
  close(r.employee, 3250);
  close(r.automatic, 650);
  close(r.matching, 2600);
  close(r.agencyTotal, 3250);
  close(r.total, 6500);
  assert.equal(r.limitReachedInPeriod, null);
  close(r.matchMissedBelowFive, 0);
});

test("FERS at 0% still receives the 1% automatic contribution", () => {
  const r = agencyMatch({ annualBasicPay: 50000, employeeRatePct: 0, system: "fers" });
  close(r.employee, 0);
  close(r.automatic, 500);
  close(r.matching, 0);
  close(r.matchMissedBelowFive, 2000);
});

test("FERS at 2% misses part of the match", () => {
  const r = agencyMatch({ annualBasicPay: 80000, employeeRatePct: 2, system: "fers" });
  close(r.matching, 1600);
  close(r.matchMissedBelowFive, 3200 - 1600);
});

test("CSRS and ineligible get no agency contributions", () => {
  for (const system of ["csrs", "none"] as const) {
    const r = agencyMatch({ annualBasicPay: 90000, employeeRatePct: 10, system });
    close(r.agencyTotal, 0);
    close(r.employee, 9000);
  }
});

test("Front-loading: hitting the limit early forfeits matching for remaining pay periods", () => {
  // $200,000 pay at 30% = $2,307.69/period -> $24,500 reached in period 11
  const r = agencyMatch({ annualBasicPay: 200000, employeeRatePct: 30, system: "fers", ageAtYearEnd: 40 });
  close(r.employee, 24500);
  assert.equal(r.limitReachedInPeriod, 11);
  assert.ok(r.matching < 8000);
  assert.ok(r.matchLostToLimit > 0);
  close(r.matching + r.matchLostToLimit, 8000);
  close(r.automatic, 2000);
  assert.equal(r.maxEvenRatePct, 12);
});

test("Catch-up (spillover) is matched and extends the limit for 50+", () => {
  const r = agencyMatch({ annualBasicPay: 200000, employeeRatePct: 17, system: "fers", ageAtYearEnd: 55 });
  close(r.employeeLimit, 32500);
  close(r.employee, 32500);
  assert.equal(r.limitReachedInPeriod, 25);
  // 24 full periods at 17% + partial period 25 still >= 5% -> matched; period 26 has nothing
  assert.ok(r.matchLostToLimit > 0);
});

test("tspGrowth splits balance into start, employee, agency, growth", () => {
  const r = tspGrowth({ currentBalance: 10000, annualEmployee: 3000, annualAgency: 3000, years: 10, annualReturnPct: 0 });
  close(r.finalBalance, 70000);
  close(r.growth, 0);
  const g = tspGrowth({ currentBalance: 10000, annualEmployee: 3000, annualAgency: 3000, years: 10, annualReturnPct: 6 });
  close(g.startingBalance + g.employeeContributions + g.agencyContributions + g.growth, g.finalBalance);
  assert.equal(g.series.length, 11);
});

test("rothVsTraditional is equal when tax rates are equal", () => {
  const r = rothVsTraditional({ annualAmount: 6000, years: 25, annualReturnPct: 6, taxNowPct: 22, taxRetirementPct: 22 });
  close(r.difference, 0, 0.5);
  assert.equal(r.higherUnderTheseAssumptions, "equal");
  close(r.traditional.takeHomeCostPerYear, r.roth.takeHomeCostPerYear);
  assert.equal(rothVsTraditional({ annualAmount: 6000, years: 25, annualReturnPct: 6, taxNowPct: 12, taxRetirementPct: 22 }).higherUnderTheseAssumptions, "roth");
  assert.equal(rothVsTraditional({ annualAmount: 6000, years: 25, annualReturnPct: 6, taxNowPct: 32, taxRetirementPct: 22 }).higherUnderTheseAssumptions, "traditional");
});

test("fedCostOfWaiting: delay keeps 1% automatic and loses match", () => {
  const r = fedCostOfWaiting({ annualBasicPay: 60000, employeeRatePct: 5, system: "fers", currentAge: 30, delayYears: 5, retirementAge: 60, annualReturnPct: 0 });
  close(r.startNow.employeeContributions, 3000 * 30);
  close(r.startNow.agencyContributions, 3000 * 30);
  close(r.delay.employeeContributions, 3000 * 25);
  close(r.delay.agencyContributions, 600 * 5 + 3000 * 25);
  close(r.agencyForgone, 2400 * 5);
  close(r.startNow.growth, 0);
  assert.equal(r.series.length, 31);
  const g = fedCostOfWaiting({ annualBasicPay: 60000, employeeRatePct: 5, system: "fers", currentAge: 30, delayYears: 5, retirementAge: 60, annualReturnPct: 6 });
  assert.ok(g.difference > g.startNow.employeeContributions - g.delay.employeeContributions + g.agencyForgone);
});

test("TSP Checkup: 10 questions, scoring, three follow-ups", () => {
  assert.equal(tspCheckupQuestions.length, 10);
  const all = (a: TspAnswer) => Object.fromEntries(tspCheckupQuestions.map((q) => [q.id, a]));
  assert.equal(scoreTspCheckup(all("yes")).score, 100);
  assert.equal(scoreTspCheckup(all("somewhat")).score, 50);
  const none = scoreTspCheckup(all("no"));
  assert.equal(none.score, 0);
  assert.equal(none.actions.length, 3);
  assert.ok(none.modules.length >= 3);
  assert.equal(scoreTspCheckup(all("yes")).actions.length, 3);
});
