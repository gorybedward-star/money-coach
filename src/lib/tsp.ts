/**
 * Pure, framework-free TSP calculations for the Federal Employee Wealth Center.
 * All results are hypothetical, educational illustrations, not predictions or advice.
 * Rules and limits come from src/config/federal-rules.ts.
 */
import { catchUpFor, fersAgency, FEDERAL_PAY_PERIODS, getLimits, activeLimitYear } from "../config/federal-rules.ts";
import { futureValue } from "./calculators.ts";

export type RetirementSystem = "fers" | "csrs" | "none";

export const RETIREMENT_SYSTEMS: Record<RetirementSystem, { label: string; agencyEligible: boolean; note: string }> = {
  fers: {
    label: "FERS (Federal Employees Retirement System)",
    agencyEligible: true,
    note: "FERS employees generally receive Agency Automatic (1%) Contributions plus matching on up to 5% of basic pay.",
  },
  csrs: {
    label: "CSRS or CSRS Offset",
    agencyEligible: false,
    note: "CSRS and CSRS Offset employees can contribute to the TSP but do not receive agency automatic or matching contributions.",
  },
  none: {
    label: "Not eligible for agency contributions / not sure",
    agencyEligible: false,
    note: "Some appointments (for example, certain temporary positions) are not covered by FERS and do not receive agency contributions. Confirm your status with your agency's HR or benefits office.",
  },
};

/** FERS matching % of pay for a given employee contribution % in one pay period. */
export function fersMatchPct(employeePct: number): number {
  const p = Math.max(0, employeePct);
  return Math.min(p, 3) * 1.0 + Math.min(Math.max(p - 3, 0), 2) * 0.5;
}

export type AgencyMatchInput = {
  annualBasicPay: number;
  employeeRatePct: number;
  system: RetirementSystem;
  /** Age you reach by Dec 31 of the limit year (used for catch-up). Omit to ignore catch-up. */
  ageAtYearEnd?: number;
  payPeriods?: number;
  limitYear?: number;
};

export type AgencyMatchResult = {
  periodPay: number;
  employee: number;
  automatic: number;
  matching: number;
  agencyTotal: number;
  total: number;
  /** Employee annual limit applied (elective deferral + catch-up). */
  employeeLimit: number;
  catchUp: number;
  /** Pay period (1-based) in which the employee limit was reached, or null. */
  limitReachedInPeriod: number | null;
  /** Matching that would have been received at this rate if the limit had not cut contributions off early. */
  matchLostToLimit: number;
  /** Additional matching available by contributing 5% (0 if already at 5%+ or not eligible). */
  matchMissedBelowFive: number;
  /** Highest whole-percent election that spreads contributions across all pay periods without hitting the limit. */
  maxEvenRatePct: number;
  /** True if employee (excluding catch-up) + agency contributions would exceed the IRC 415(c) limit. */
  exceedsAnnualAdditions: boolean;
  limitYear: number;
};

export function agencyMatch(input: AgencyMatchInput): AgencyMatchResult {
  const year = input.limitYear ?? activeLimitYear;
  const limits = getLimits(year);
  const periods = input.payPeriods ?? FEDERAL_PAY_PERIODS;
  const periodPay = input.annualBasicPay / periods;
  const catchUp = input.ageAtYearEnd !== undefined ? catchUpFor(input.ageAtYearEnd, year) : 0;
  const employeeLimit = limits.electiveDeferral + catchUp;
  const eligible = RETIREMENT_SYSTEMS[input.system].agencyEligible;
  const rate = Math.max(0, input.employeeRatePct);

  let employee = 0;
  let automatic = 0;
  let matching = 0;
  let uncappedMatching = 0;
  let limitReachedInPeriod: number | null = null;

  for (let i = 1; i <= periods; i++) {
    const desired = (rate / 100) * periodPay;
    const room = Math.max(0, employeeLimit - employee);
    const actual = Math.min(desired, room);
    if (limitReachedInPeriod === null && desired > 0 && actual < desired - 1e-9) limitReachedInPeriod = i;
    employee += actual;
    if (eligible) {
      automatic += (fersAgency.automaticPct / 100) * periodPay;
      // Matching is calculated on what you actually contributed this pay period.
      // Catch-up (spillover) contributions are matched, up to the same 5% of pay.
      const actualPct = periodPay > 0 ? (actual / periodPay) * 100 : 0;
      matching += (fersMatchPct(actualPct) / 100) * periodPay;
      uncappedMatching += (fersMatchPct(rate) / 100) * periodPay;
    }
  }

  const maxMatch = eligible ? (fersAgency.maxMatchPct / 100) * input.annualBasicPay : 0;
  const agencyTotal = automatic + matching;
  const regularEmployee = Math.min(employee, limits.electiveDeferral);
  const maxEvenRatePct = input.annualBasicPay > 0 ? Math.floor((employeeLimit / input.annualBasicPay) * 100) : 0;

  return {
    periodPay,
    employee,
    automatic,
    matching,
    agencyTotal,
    total: employee + agencyTotal,
    employeeLimit,
    catchUp,
    limitReachedInPeriod,
    matchLostToLimit: Math.max(0, uncappedMatching - matching),
    matchMissedBelowFive: eligible && rate < fersAgency.fullMatchAtPct ? Math.max(0, maxMatch - uncappedMatching) : 0,
    maxEvenRatePct,
    exceedsAnnualAdditions: regularEmployee + agencyTotal > limits.annualAdditions,
    limitYear: year,
  };
}

export function validateAgencyMatch(i: { annualBasicPay: number; employeeRatePct: number; ageAtYearEnd?: number }): string[] {
  const e: string[] = [];
  if (!Number.isFinite(i.annualBasicPay) || i.annualBasicPay <= 0 || i.annualBasicPay > 1_000_000)
    e.push("Enter annual basic pay between $1 and $1,000,000.");
  if (!Number.isFinite(i.employeeRatePct) || i.employeeRatePct < 0 || i.employeeRatePct > 100)
    e.push("Enter a contribution rate between 0% and 100%.");
  if (i.ageAtYearEnd !== undefined && (!Number.isFinite(i.ageAtYearEnd) || i.ageAtYearEnd < 16 || i.ageAtYearEnd > 100))
    e.push("Enter an age between 16 and 100.");
  return e;
}

// ---------- TSP Growth ----------

export type TspGrowthInput = {
  currentBalance: number;
  annualEmployee: number;
  annualAgency: number;
  years: number;
  annualReturnPct: number;
};

export type TspGrowthResult = {
  finalBalance: number;
  startingBalance: number;
  employeeContributions: number;
  agencyContributions: number;
  growth: number;
  series: { year: number; contributions: number; balance: number }[];
};

/** Contributions are spread evenly by month and compounded monthly. Pay and contributions stay level. */
export function tspGrowth(i: TspGrowthInput): TspGrowthResult {
  const monthly = (i.annualEmployee + i.annualAgency) / 12;
  const fv = (years: number) =>
    futureValue({ startingBalance: i.currentBalance, monthlyContribution: monthly, annualReturnPct: i.annualReturnPct, months: years * 12 });
  const series = [];
  for (let y = 0; y <= i.years; y++) {
    series.push({ year: y, contributions: i.currentBalance + monthly * 12 * y, balance: fv(y) });
  }
  const employeeContributions = i.annualEmployee * i.years;
  const agencyContributions = i.annualAgency * i.years;
  const finalBalance = fv(i.years);
  return {
    finalBalance,
    startingBalance: i.currentBalance,
    employeeContributions,
    agencyContributions,
    growth: finalBalance - i.currentBalance - employeeContributions - agencyContributions,
    series,
  };
}

export function validateTspGrowth(i: TspGrowthInput & { annualBasicPay?: number }): string[] {
  const e: string[] = [];
  if (!Number.isFinite(i.currentBalance) || i.currentBalance < 0 || i.currentBalance > 50_000_000) e.push("Enter a current balance between $0 and $50,000,000.");
  if (!Number.isFinite(i.years) || i.years < 1 || i.years > 60 || !Number.isInteger(i.years)) e.push("Enter whole years until retirement between 1 and 60.");
  if (!Number.isFinite(i.annualReturnPct) || i.annualReturnPct < -5 || i.annualReturnPct > 12) e.push("Enter a hypothetical return between -5% and 12%.");
  return e;
}

// ---------- Traditional vs. Roth ----------

export type RothVsTraditionalInput = {
  /** Amount of pre-tax pay you would direct to the TSP each year (the Traditional contribution). */
  annualAmount: number;
  years: number;
  annualReturnPct: number;
  /** Assumed combined marginal tax rate today (federal + state), as a %. */
  taxNowPct: number;
  /** Assumed tax rate on withdrawals in retirement, as a %. */
  taxRetirementPct: number;
};

export type RothVsTraditionalResult = {
  traditional: { contributed: number; takeHomeCostPerYear: number; balance: number; taxOnWithdrawal: number; afterTax: number };
  roth: { contributed: number; takeHomeCostPerYear: number; balance: number; taxOnWithdrawal: number; afterTax: number };
  difference: number;
  /** "traditional" | "roth" | "equal" under these assumptions only. */
  higherUnderTheseAssumptions: "traditional" | "roth" | "equal";
};

/**
 * Compares Traditional and Roth at the SAME take-home cost.
 * Traditional: the full amount goes in pre-tax; your take-home pay drops by amount × (1 − tax now).
 * Roth: you contribute that same take-home cost after tax; qualified withdrawals are tax-free.
 */
export function rothVsTraditional(i: RothVsTraditionalInput): RothVsTraditionalResult {
  const tNow = i.taxNowPct / 100;
  const tRet = i.taxRetirementPct / 100;
  const months = i.years * 12;
  const fv = (annual: number) => futureValue({ monthlyContribution: annual / 12, annualReturnPct: i.annualReturnPct, months });

  const tradBal = fv(i.annualAmount);
  const tradTax = tradBal * tRet;
  const rothAnnual = i.annualAmount * (1 - tNow);
  const rothBal = fv(rothAnnual);
  const traditional = {
    contributed: i.annualAmount * i.years,
    takeHomeCostPerYear: i.annualAmount * (1 - tNow),
    balance: tradBal,
    taxOnWithdrawal: tradTax,
    afterTax: tradBal - tradTax,
  };
  const roth = { contributed: rothAnnual * i.years, takeHomeCostPerYear: rothAnnual, balance: rothBal, taxOnWithdrawal: 0, afterTax: rothBal };
  const difference = roth.afterTax - traditional.afterTax;
  return {
    traditional,
    roth,
    difference,
    higherUnderTheseAssumptions: Math.abs(difference) < 0.5 ? "equal" : difference > 0 ? "roth" : "traditional",
  };
}

export function validateRothVsTraditional(i: RothVsTraditionalInput): string[] {
  const e: string[] = [];
  if (!Number.isFinite(i.annualAmount) || i.annualAmount <= 0 || i.annualAmount > 100_000) e.push("Enter an annual amount between $1 and $100,000.");
  if (!Number.isFinite(i.years) || i.years < 1 || i.years > 60 || !Number.isInteger(i.years)) e.push("Enter whole years between 1 and 60.");
  if (!Number.isFinite(i.annualReturnPct) || i.annualReturnPct < 0 || i.annualReturnPct > 12) e.push("Enter a hypothetical return between 0% and 12%.");
  for (const [v, label] of [[i.taxNowPct, "today's"], [i.taxRetirementPct, "retirement"]] as const)
    if (!Number.isFinite(v) || v < 0 || v > 60) e.push(`Enter a ${label} tax rate between 0% and 60%.`);
  return e;
}

// ---------- Cost of Waiting: Federal Edition ----------

export type FedCostOfWaitingInput = {
  annualBasicPay: number;
  employeeRatePct: number;
  system: RetirementSystem;
  currentAge: number;
  delayYears: number;
  retirementAge: number;
  annualReturnPct: number;
};

export type FedScenario = {
  employeeContributions: number;
  agencyContributions: number;
  growth: number;
  balance: number;
};

export type FedCostOfWaitingResult = {
  startNow: FedScenario;
  delay: FedScenario;
  difference: number;
  agencyForgone: number;
  series: { age: number; startNow: number; delay: number }[];
};

/**
 * Start now vs. delay. While delaying, a FERS employee still receives the 1% automatic
 * contribution (it does not require employee contributions), but no matching.
 * Pay stays level; annual contribution limits are not applied in this projection.
 */
export function fedCostOfWaiting(i: FedCostOfWaitingInput): FedCostOfWaitingResult {
  const eligible = RETIREMENT_SYSTEMS[i.system].agencyEligible;
  const pay = i.annualBasicPay;
  const emp = (i.employeeRatePct / 100) * pay;
  const agencyActive = eligible ? ((fersAgency.automaticPct + fersMatchPct(i.employeeRatePct)) / 100) * pay : 0;
  const agencyIdle = eligible ? (fersAgency.automaticPct / 100) * pay : 0;
  const totalYears = Math.max(0, i.retirementAge - i.currentAge);
  const delayYears = Math.min(Math.max(0, i.delayYears), totalYears);
  const r = i.annualReturnPct / 100 / 12;

  type Acc = { bal: number; emp: number; ag: number };
  const step = (a: Acc, monthlyEmp: number, monthlyAg: number) => {
    a.bal = a.bal * (1 + r) + monthlyEmp + monthlyAg;
    a.emp += monthlyEmp;
    a.ag += monthlyAg;
  };
  const now: Acc = { bal: 0, emp: 0, ag: 0 };
  const late: Acc = { bal: 0, emp: 0, ag: 0 };
  const series = [{ age: i.currentAge, startNow: 0, delay: 0 }];
  for (let y = 0; y < totalYears; y++) {
    for (let m = 0; m < 12; m++) {
      step(now, emp / 12, agencyActive / 12);
      if (y < delayYears) step(late, 0, agencyIdle / 12);
      else step(late, emp / 12, agencyActive / 12);
    }
    series.push({ age: i.currentAge + y + 1, startNow: now.bal, delay: late.bal });
  }
  const sc = (a: Acc): FedScenario => ({ employeeContributions: a.emp, agencyContributions: a.ag, growth: a.bal - a.emp - a.ag, balance: a.bal });
  const startNow = sc(now);
  const delay = sc(late);
  return {
    startNow,
    delay,
    difference: startNow.balance - delay.balance,
    agencyForgone: startNow.agencyContributions - delay.agencyContributions,
    series,
  };
}

export function validateFedCostOfWaiting(i: FedCostOfWaitingInput): string[] {
  const e = validateAgencyMatch({ annualBasicPay: i.annualBasicPay, employeeRatePct: i.employeeRatePct });
  if (!Number.isFinite(i.currentAge) || i.currentAge < 16 || i.currentAge > 80) e.push("Enter a current age between 16 and 80.");
  if (!Number.isFinite(i.retirementAge) || i.retirementAge <= i.currentAge || i.retirementAge > 85) e.push("Retirement age must be after your current age and no later than 85.");
  if (!Number.isFinite(i.delayYears) || i.delayYears < 1 || i.delayYears >= i.retirementAge - i.currentAge) e.push("Years of delay must be at least 1 and less than your years until retirement.");
  if (!Number.isFinite(i.annualReturnPct) || i.annualReturnPct < 0 || i.annualReturnPct > 12) e.push("Enter a hypothetical return between 0% and 12%.");
  return e;
}
