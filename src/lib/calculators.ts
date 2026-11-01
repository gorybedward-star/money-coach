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
