/**
 * Pure, framework-free calculation functions used by the free tools.
 * All results are hypothetical, educational illustrations, not predictions.
 */

export type Frequency = "weekly" | "biweekly" | "semimonthly" | "monthly";

export const PAY_PERIODS: Record<Frequency, { perYear: number; label: string }> = {
  weekly: { perYear: 52, label: "Weekly (52 paychecks)" },
  biweekly: { perYear: 26, label: "Every two weeks (26 paychecks)" },
  semimonthly: { perYear: 24, label: "Twice a month (24 paychecks)" },
  monthly: { perYear: 12, label: "Monthly (12 paychecks)" },
};

/** Future value of level monthly contributions plus a starting balance, compounded monthly. */
export function futureValue(opts: {
  startingBalance?: number;
  monthlyContribution: number;
  annualReturnPct: number;
  months: number;
}): number {
  const { startingBalance = 0, monthlyContribution, annualReturnPct, months } = opts;
  if (months <= 0) return startingBalance;
  const i = annualReturnPct / 100 / 12;
  if (i === 0) return startingBalance + monthlyContribution * months;
  const growth = Math.pow(1 + i, months);
  return startingBalance * growth + monthlyContribution * ((growth - 1) / i);
}

// ---------- Pay Yourself First ----------

export type PayYourselfFirstInput = {
  annualIncome: number;
  contributionPct: number;
  frequency: Frequency;
  hypotheticalReturnPct: number;
};

export type PayYourselfFirstResult = {
  perPaycheck: number;
  monthly: number;
  annual: number;
  projections: { years: number; contributed: number; value: number }[];
};

export function payYourselfFirst(input: PayYourselfFirstInput): PayYourselfFirstResult {
  const annual = input.annualIncome * (input.contributionPct / 100);
  const perPaycheck = annual / PAY_PERIODS[input.frequency].perYear;
  const monthly = annual / 12;
  const projections = [1, 5, 10, 20].map((years) => ({
    years,
    contributed: monthly * 12 * years,
    value: futureValue({
      monthlyContribution: monthly,
      annualReturnPct: input.hypotheticalReturnPct,
      months: years * 12,
    }),
  }));
  return { perPaycheck, monthly, annual, projections };
}

// ---------- Cost of Waiting ----------

export type CostOfWaitingInput = {
  currentAge: number;
  waitAge: number; // age you would start if you wait
  retirementAge: number;
  monthlyInvestment: number;
  annualReturnPct: number;
};

export type Scenario = {
  startAge: number;
  years: number;
  contributions: number;
  growth: number;
  balance: number;
};

export type CostOfWaitingResult = {
  startNow: Scenario;
  wait: Scenario;
  costOfWaiting: number;
  /** Monthly amount the "wait" saver would need to reach the "start now" balance. */
  monthlyNeededToCatchUp: number;
  /** Balance by age for both scenarios, for charting. */
  series: { age: number; startNow: number; wait: number }[];
};

function scenario(startAge: number, retirementAge: number, monthly: number, rate: number): Scenario {
  const years = Math.max(0, retirementAge - startAge);
  const balance = futureValue({ monthlyContribution: monthly, annualReturnPct: rate, months: years * 12 });
  const contributions = monthly * 12 * years;
  return { startAge, years, contributions, growth: balance - contributions, balance };
}

export function costOfWaiting(input: CostOfWaitingInput): CostOfWaitingResult {
  const { currentAge, waitAge, retirementAge, monthlyInvestment, annualReturnPct } = input;
  const startNow = scenario(currentAge, retirementAge, monthlyInvestment, annualReturnPct);
  const wait = scenario(waitAge, retirementAge, monthlyInvestment, annualReturnPct);

  const perDollar = futureValue({
    monthlyContribution: 1,
    annualReturnPct,
    months: wait.years * 12,
  });
  const monthlyNeededToCatchUp = perDollar > 0 ? startNow.balance / perDollar : 0;

  const series: CostOfWaitingResult["series"] = [];
  for (let age = currentAge; age <= retirementAge; age++) {
    series.push({
      age,
      startNow: futureValue({
        monthlyContribution: monthlyInvestment,
        annualReturnPct,
        months: (age - currentAge) * 12,
      }),
      wait:
        age <= waitAge
          ? 0
          : futureValue({
              monthlyContribution: monthlyInvestment,
              annualReturnPct,
              months: (age - waitAge) * 12,
            }),
    });
  }

  return {
    startNow,
    wait,
    costOfWaiting: startNow.balance - wait.balance,
    monthlyNeededToCatchUp,
    series,
  };
}

export function validateCostOfWaiting(input: CostOfWaitingInput): string[] {
  const errors: string[] = [];
  const { currentAge, waitAge, retirementAge, monthlyInvestment, annualReturnPct } = input;
  if (!Number.isFinite(currentAge) || currentAge < 14 || currentAge > 90)
    errors.push("Enter a current age between 14 and 90.");
  if (!Number.isFinite(waitAge) || waitAge <= currentAge)
    errors.push("The “if I wait” age must be later than your current age.");
  if (!Number.isFinite(retirementAge) || retirementAge <= waitAge)
    errors.push("Retirement age must be later than the “if I wait” age.");
  if (retirementAge > 100) errors.push("Enter a retirement age of 100 or less.");
  if (!Number.isFinite(monthlyInvestment) || monthlyInvestment <= 0 || monthlyInvestment > 100000)
    errors.push("Enter a monthly investment between $1 and $100,000.");
  if (!Number.isFinite(annualReturnPct) || annualReturnPct < 0 || annualReturnPct > 15)
    errors.push("Enter a hypothetical return between 0% and 15%.");
  return errors;
}

export function validatePayYourselfFirst(input: PayYourselfFirstInput): string[] {
  const errors: string[] = [];
  if (!Number.isFinite(input.annualIncome) || input.annualIncome <= 0 || input.annualIncome > 10_000_000)
    errors.push("Enter an annual income between $1 and $10,000,000.");
  if (!Number.isFinite(input.contributionPct) || input.contributionPct <= 0 || input.contributionPct > 100)
    errors.push("Enter a savings percentage between 0.1% and 100%.");
  if (!Number.isFinite(input.hypotheticalReturnPct) || input.hypotheticalReturnPct < 0 || input.hypotheticalReturnPct > 15)
    errors.push("Enter a hypothetical return between 0% and 15%.");
  return errors;
}

// ---------- Formatting ----------

const usd0 = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const usd2 = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function formatUSD(n: number, cents = false) {
  if (!Number.isFinite(n)) return "—";
  return cents ? usd2.format(n) : usd0.format(Math.round(n));
}

export function formatCompactUSD(n: number) {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `$${Math.round(n / 1_000)}K`;
  return usd0.format(Math.round(n));
}

// ---------- Compound Growth ----------

export type CompoundGrowthInput = { startingBalance: number; monthlyContribution: number; annualReturnPct: number; years: number };

export function compoundGrowth(input: CompoundGrowthInput) {
  const { startingBalance, monthlyContribution, annualReturnPct, years } = input;
  const series = Array.from({ length: years + 1 }, (_, y) => ({
    year: y,
    contributions: startingBalance + monthlyContribution * 12 * y,
    value: futureValue({ startingBalance, monthlyContribution, annualReturnPct, months: y * 12 }),
  }));
  const last = series[series.length - 1];
  return { finalValue: last.value, totalContributions: last.contributions, growth: last.value - last.contributions, series };
}

export function validateCompoundGrowth(i: CompoundGrowthInput): string[] {
  const e: string[] = [];
  if (!Number.isFinite(i.startingBalance) || i.startingBalance < 0 || i.startingBalance > 100_000_000) e.push("Enter a starting balance between $0 and $100,000,000.");
  if (!Number.isFinite(i.monthlyContribution) || i.monthlyContribution < 0 || i.monthlyContribution > 1_000_000) e.push("Enter a monthly contribution between $0 and $1,000,000.");
  if (i.startingBalance === 0 && i.monthlyContribution === 0) e.push("Enter a starting balance or a monthly contribution.");
  if (!Number.isFinite(i.annualReturnPct) || i.annualReturnPct < 0 || i.annualReturnPct > 15) e.push("Enter a hypothetical return between 0% and 15%.");
  if (!Number.isInteger(i.years) || i.years < 1 || i.years > 70) e.push("Enter a whole number of years between 1 and 70.");
  return e;
}

// ---------- Emergency Fund ----------

export type EmergencyFundInput = { monthlyEssentials: number; currentSavings: number; targetMonths: number; monthlySaving: number };

export function emergencyFund(i: EmergencyFundInput) {
  const target = i.monthlyEssentials * i.targetMonths;
  const gap = Math.max(0, target - i.currentSavings);
  const monthsCovered = i.monthlyEssentials > 0 ? i.currentSavings / i.monthlyEssentials : 0;
  const monthsToGoal = gap === 0 ? 0 : i.monthlySaving > 0 ? Math.ceil(gap / i.monthlySaving) : null;
  const starterTarget = i.monthlyEssentials; // one month
  const progressPct = target > 0 ? Math.min(100, (i.currentSavings / target) * 100) : 0;
  return { target, gap, monthsCovered, monthsToGoal, starterTarget, progressPct };
}

export function validateEmergencyFund(i: EmergencyFundInput): string[] {
  const e: string[] = [];
  if (!Number.isFinite(i.monthlyEssentials) || i.monthlyEssentials <= 0 || i.monthlyEssentials > 1_000_000) e.push("Enter monthly essential expenses between $1 and $1,000,000.");
  if (!Number.isFinite(i.currentSavings) || i.currentSavings < 0) e.push("Enter current emergency savings of $0 or more.");
  if (!Number.isFinite(i.targetMonths) || i.targetMonths < 1 || i.targetMonths > 24) e.push("Choose a target between 1 and 24 months.");
  if (!Number.isFinite(i.monthlySaving) || i.monthlySaving < 0) e.push("Enter a monthly savings amount of $0 or more.");
  return e;
}

// ---------- Debt Payoff ----------

export type Debt = { id: string; name: string; balance: number; apr: number; minPayment: number };
export type PayoffMethod = "snowball" | "avalanche";

export type PayoffResult = {
  method: PayoffMethod;
  months: number;
  totalInterest: number;
  totalPaid: number;
  order: { id: string; name: string; month: number }[];
  /** Total remaining balance at the end of each month (index 0 = start). */
  balances: number[];
  /** True if payments can't keep up with interest within the limit. */
  neverPaysOff: boolean;
};

const MAX_MONTHS = 600;

export function payoffPlan(debts: Debt[], extraMonthly: number, method: PayoffMethod): PayoffResult {
  const live = debts.filter((d) => d.balance > 0).map((d) => ({ ...d }));
  const sortFn =
    method === "snowball"
      ? (a: Debt, b: Debt) => a.balance - b.balance || b.apr - a.apr
      : (a: Debt, b: Debt) => b.apr - a.apr || a.balance - b.balance;
  // Priority order is fixed at the start (classic snowball/avalanche).
  const priority = [...live].sort(sortFn).map((d) => d.id);
  const budget = live.reduce((s, d) => s + d.minPayment, 0) + extraMonthly;

  let month = 0;
  let totalInterest = 0;
  let totalPaid = 0;
  const order: PayoffResult["order"] = [];
  const balances = [live.reduce((s, d) => s + d.balance, 0)];

  while (live.some((d) => d.balance > 0.005) && month < MAX_MONTHS) {
    month++;
    // 1. Interest accrues.
    for (const d of live) {
      if (d.balance <= 0) continue;
      const interest = (d.balance * d.apr) / 100 / 12;
      d.balance += interest;
      totalInterest += interest;
    }
    // 2. Minimums on every open debt.
    let available = budget;
    for (const d of live) {
      if (d.balance <= 0) continue;
      const pay = Math.min(d.minPayment, d.balance, available);
      d.balance -= pay;
      available -= pay;
      totalPaid += pay;
    }
    // 3. Everything left (extra + freed-up minimums) goes to the top-priority debt, then the next.
    for (const id of priority) {
      if (available <= 0) break;
      const d = live.find((x) => x.id === id)!;
      if (d.balance <= 0) continue;
      const pay = Math.min(d.balance, available);
      d.balance -= pay;
      available -= pay;
      totalPaid += pay;
    }
    for (const d of live) {
      if (d.balance <= 0.005 && !order.some((o) => o.id === d.id)) {
        d.balance = 0;
        order.push({ id: d.id, name: d.name, month });
      }
    }
    balances.push(live.reduce((s, d) => s + d.balance, 0));
  }

  return { method, months: month, totalInterest, totalPaid, order, balances, neverPaysOff: live.some((d) => d.balance > 0.005) };
}

export function validateDebts(debts: Debt[], extraMonthly: number): string[] {
  const e: string[] = [];
  const active = debts.filter((d) => d.balance > 0);
  if (!active.length) e.push("Add at least one debt with a balance.");
  debts.forEach((d, i) => {
    const label = d.name || `Debt ${i + 1}`;
    if (!Number.isFinite(d.balance) || d.balance < 0) e.push(`${label}: enter a balance of $0 or more.`);
    if (!Number.isFinite(d.apr) || d.apr < 0 || d.apr > 100) e.push(`${label}: enter an APR between 0% and 100%.`);
    if (!Number.isFinite(d.minPayment) || d.minPayment < 0) e.push(`${label}: enter a minimum payment of $0 or more.`);
    if (d.balance > 0 && d.minPayment <= 0) e.push(`${label}: enter the minimum monthly payment.`);
  });
  if (!Number.isFinite(extraMonthly) || extraMonthly < 0) e.push("Enter an extra monthly payment of $0 or more.");
  return e;
}

// ---------- Employer Match ----------

export type MatchTier = { matchPct: number; onUpToPct: number };

export type EmployerMatchInput = {
  salary: number;
  employeeRatePct: number;
  /** Tiers apply in order to successive slices of pay, e.g. 100% on first 3%, then 50% on next 2%. */
  tiers: MatchTier[];
};

export function employerMatch(i: EmployerMatchInput) {
  const employee = (i.salary * i.employeeRatePct) / 100;
  let remaining = i.employeeRatePct;
  let employerPct = 0;
  let fullMatchAt = 0;
  let maxEmployerPct = 0;
  for (const t of i.tiers) {
    const slice = Math.min(remaining, t.onUpToPct);
    employerPct += (slice * t.matchPct) / 100;
    remaining = Math.max(0, remaining - t.onUpToPct);
    fullMatchAt += t.onUpToPct;
    maxEmployerPct += (t.onUpToPct * t.matchPct) / 100;
  }
  const employer = (i.salary * employerPct) / 100;
  const maxEmployer = (i.salary * maxEmployerPct) / 100;
  return {
    employee,
    employer,
    total: employee + employer,
    employerPct,
    fullMatchAt,
    maxEmployer,
    missed: Math.max(0, maxEmployer - employer),
  };
}

// ---------- Life Insurance Needs (educational DIME-style estimate) ----------

export type LifeInsuranceInput = {
  annualIncome: number;
  yearsToReplace: number;
  dependents: number;
  educationPerChild: number;
  mortgageBalance: number;
  otherDebts: number;
  finalExpenses: number;
  existingCoverage: number;
  availableAssets: number;
};

export function lifeInsuranceNeeds(i: LifeInsuranceInput) {
  const income = i.annualIncome * i.yearsToReplace;
  const education = i.dependents * i.educationPerChild;
  const needs = [
    { label: "Income replacement", value: income },
    { label: "Mortgage payoff", value: i.mortgageBalance },
    { label: "Other debts", value: i.otherDebts },
    { label: "Children's education", value: education },
    { label: "Final expenses", value: i.finalExpenses },
  ];
  const totalNeeds = needs.reduce((s, n) => s + n.value, 0);
  const resources = [
    { label: "Existing life insurance", value: i.existingCoverage },
    { label: "Savings and investments available", value: i.availableAssets },
  ];
  const totalResources = resources.reduce((s, r) => s + r.value, 0);
  return { needs, totalNeeds, resources, totalResources, gap: Math.max(0, totalNeeds - totalResources), surplus: Math.max(0, totalResources - totalNeeds) };
}
