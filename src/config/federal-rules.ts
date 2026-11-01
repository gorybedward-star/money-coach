/**
 * MONEY COACH — Federal Employee Wealth Center rules.
 *
 * Every annual limit and time-sensitive federal rule used by the federal tools
 * lives here, with its source. Components and calculators read from this file;
 * nothing below should be hardcoded anywhere else.
 *
 * HOW TO UPDATE EACH YEAR
 * 1. The IRS usually announces next-year retirement plan limits in October or
 *    November (search irs.gov for "401(k) limit increases"). The TSP uses the
 *    same 402(g) elective deferral and catch-up limits as 401(k) plans.
 * 2. Add a new entry to `limitsByYear` with `status: "verified"` only after you
 *    have read the official IRS notice and the tsp.gov contribution limits page.
 * 3. Change `activeLimitYear` to the new year.
 * 4. Update `lastReviewed` and run `npm test`.
 *
 * Anything marked `verify: true` is a rule we believe is current but that must
 * be re-checked against the linked official source before launch.
 */

export type Source = { label: string; href: string };

export const SOURCES = {
  tspLimits: { label: "TSP: Contribution limits", href: "https://www.tsp.gov/making-contributions/contribution-limits/" },
  tspContributionTypes: { label: "TSP: Contribution types (FERS agency contributions)", href: "https://www.tsp.gov/making-contributions/contribution-types/" },
  tspFunds: { label: "TSP: Investment options", href: "https://www.tsp.gov/investment-options/" },
  tspLFunds: { label: "TSP: Lifecycle (L) Funds", href: "https://www.tsp.gov/what-is-lifecycle-fund/" },
  tspRoth: { label: "TSP: Traditional and Roth contributions", href: "https://www.tsp.gov/traditional-and-roth-contributions/" },
  tspRothConversion: { label: "TSP: Roth in-plan conversions", href: "https://www.tsp.gov/roth-in-plan-conversions/" },
  tspLoans: { label: "TSP: Loans", href: "https://www.tsp.gov/tsp-loans/" },
  tspWithdrawals: { label: "TSP: Withdrawals in retirement", href: "https://www.tsp.gov/withdrawals-in-retirement/" },
  tspBeneficiaries: { label: "TSP: Designating beneficiaries", href: "https://www.tsp.gov/death-beneficiary-support/designating-beneficiaries/" },
  tspCalculators: { label: "TSP: Official calculators", href: "https://www.tsp.gov/calculators/" },
  tspPublications: { label: "TSP: Forms and publications", href: "https://www.tsp.gov/forms-resources/" },
  irsLimits: { label: "IRS: 401(k) limit increases (annual notice)", href: "https://www.irs.gov/newsroom" },
  irsCola: { label: "IRS: COLA increases for dollar limitations on benefits and contributions", href: "https://www.irs.gov/retirement-plans/cola-increases-for-dollar-limitations-on-benefits-and-contributions" },
  irsRmd: { label: "IRS: Required minimum distributions", href: "https://www.irs.gov/retirement-plans/retirement-plan-and-ira-required-minimum-distributions-faqs" },
  irsEarlyDist: { label: "IRS: Exceptions to the 10% additional tax", href: "https://www.irs.gov/retirement-plans/plan-participant-employee/retirement-topics-exceptions-to-tax-on-early-distributions" },
  irsFsa: { label: "IRS: Health FSA and other inflation adjustments", href: "https://www.irs.gov/newsroom" },
  opmFers: { label: "OPM: FERS information", href: "https://www.opm.gov/retirement-center/fers-information/" },
  opmFersComputation: { label: "OPM: FERS basic annuity computation", href: "https://www.opm.gov/retirement-center/fers-information/computation/" },
  opmFersEligibility: { label: "OPM: FERS types of retirement and eligibility", href: "https://www.opm.gov/retirement-center/fers-information/types-of-retirement/" },
  opmFegli: { label: "OPM: FEGLI", href: "https://www.opm.gov/healthcare-insurance/life-insurance/" },
  opmFehb: { label: "OPM: FEHB", href: "https://www.opm.gov/healthcare-insurance/healthcare/" },
  opmFedvip: { label: "OPM: FEDVIP", href: "https://www.opm.gov/healthcare-insurance/dental-vision/" },
  fsafeds: { label: "FSAFEDS", href: "https://www.fsafeds.gov/" },
  ssa: { label: "Social Security: my Social Security account", href: "https://www.ssa.gov/myaccount/" },
  ssaRetirement: { label: "Social Security: Retirement benefits", href: "https://www.ssa.gov/benefits/retirement/" },
} satisfies Record<string, Source>;

export type LimitYear = {
  year: number;
  /** "verified" = read from the official IRS notice and tsp.gov. "pending" = not yet announced; do not use. */
  status: "verified" | "pending";
  /** IRC 402(g) elective deferral limit (traditional + Roth employee contributions combined). */
  electiveDeferral: number;
  /** Catch-up for participants age 50+ (and 64+). */
  catchUp50: number;
  /** SECURE 2.0 higher catch-up for participants who turn 60, 61, 62, or 63 during the year. */
  catchUp60to63: number;
  /** IRC 415(c) annual additions limit (employee + agency contributions; excludes catch-up). */
  annualAdditions: number;
  /** SECURE 2.0: if prior-year FICA wages from your current employer exceed this, catch-up must be Roth. */
  rothCatchUpWageThreshold: number;
  sources: Source[];
};

export const limitsByYear: Record<number, LimitYear> = {
  2026: {
    year: 2026,
    status: "verified",
    electiveDeferral: 24_500,
    catchUp50: 8_000,
    catchUp60to63: 11_250,
    annualAdditions: 72_000,
    rothCatchUpWageThreshold: 150_000,
    sources: [SOURCES.tspLimits, SOURCES.irsCola],
  },
  // 2027: add here once the IRS publishes the official notice (expected Oct–Nov 2026).
  // Published projections (~$25,500 deferral) are NOT official. Do not enter them as verified.
};

/** The limit year the tools use by default. */
export const activeLimitYear = 2026;

export function getLimits(year: number = activeLimitYear): LimitYear {
  const l = limitsByYear[year];
  if (!l || l.status !== "verified") throw new Error(`No verified TSP limits for ${year}`);
  return l;
}

/** Applicable catch-up amount for someone who reaches `ageAtYearEnd` during the limit year. */
export function catchUpFor(ageAtYearEnd: number, year: number = activeLimitYear): number {
  const l = getLimits(year);
  if (ageAtYearEnd >= 60 && ageAtYearEnd <= 63) return l.catchUp60to63;
  if (ageAtYearEnd >= 50) return l.catchUp50;
  return 0;
}

/**
 * FERS agency contribution formula (5 U.S.C. 8432). Stable since 1987, but
 * still sourced: tsp.gov "Contribution types".
 *  - Agency Automatic (1%) Contributions: 1% of basic pay every pay period, whether or not you contribute.
 *  - Agency Matching Contributions: $1 per $1 on the first 3% of basic pay you contribute,
 *    then $0.50 per $1 on the next 2%. Maximum match 4%; maximum agency total 5%.
 *  - Calculated each pay period on that period's basic pay. There is no annual "true-up".
 */
export const fersAgency = {
  automaticPct: 1,
  matchTiers: [
    { matchRate: 1.0, onFirstPct: 3 },
    { matchRate: 0.5, onNextPct: 2 },
  ],
  maxMatchPct: 4,
  /** Contribute at least this % of basic pay each period to receive the full match. */
  fullMatchAtPct: 5,
  /** New FERS hires are automatically enrolled at this rate unless they elect otherwise (hired on/after Oct 1, 2020). */
  autoEnrollPct: 5,
  /**
   * Catch-up (spillover) contributions are matched, but only up to the 5% of pay you are
   * already entitled to. Source: tsp.gov contribution limits. verify: true.
   */
  catchUpIsMatched: true,
  sources: [SOURCES.tspContributionTypes, SOURCES.tspLimits],
  verify: true,
} as const;

/** Federal pay periods per year (most civilian agencies pay biweekly). */
export const FEDERAL_PAY_PERIODS = 26;

/** FERS basic annuity formula and milestones. Source: OPM. verify: true. */
export const fersRules = {
  multiplier: 1.0, // % of high-3 per year of creditable service
  enhancedMultiplier: 1.1, // if retiring at 62+ with 20+ years
  enhancedAge: 62,
  enhancedYears: 20,
  /** Reduction per year under 62 for an MRA+10 retirement. */
  mra10ReductionPerYearPct: 5,
  /** Minimum Retirement Age by birth year (OPM). */
  mra: [
    { born: "Before 1948", age: "55" },
    { born: "1948", age: "55 and 2 months" },
    { born: "1949", age: "55 and 4 months" },
    { born: "1950", age: "55 and 6 months" },
    { born: "1951", age: "55 and 8 months" },
    { born: "1952", age: "55 and 10 months" },
    { born: "1953–1964", age: "56" },
    { born: "1965", age: "56 and 2 months" },
    { born: "1966", age: "56 and 4 months" },
    { born: "1967", age: "56 and 6 months" },
    { born: "1968", age: "56 and 8 months" },
    { born: "1969", age: "56 and 10 months" },
    { born: "1970 and after", age: "57" },
  ],
  immediateEligibility: [
    { age: "62", service: "5 years", note: "Unreduced" },
    { age: "60", service: "20 years", note: "Unreduced" },
    { age: "MRA", service: "30 years", note: "Unreduced" },
    { age: "MRA", service: "10 years", note: "Reduced 5% per year under 62 unless postponed" },
  ],
  /** Employee FERS contribution rates by coverage group. */
  employeeContributionRates: [
    { group: "FERS (generally hired before 2013)", pct: 0.8 },
    { group: "FERS-RAE (generally hired in 2013)", pct: 3.1 },
    { group: "FERS-FRAE (generally hired 2014 or later)", pct: 4.4 },
  ],
  sources: [SOURCES.opmFersComputation, SOURCES.opmFersEligibility],
  verify: true,
} as const;

/** Other time-sensitive rules referenced in education content. verify: true for all. */
export const otherRules = {
  /** Age 59½: TSP age-based in-service withdrawals and no IRS 10% additional tax. */
  penaltyFreeAge: "59½",
  /** Separation in or after the year you turn 55 (50 for qualifying public safety employees). */
  separationAge: 55,
  publicSafetySeparationAge: 50,
  /** RMD starting age under SECURE 2.0 (75 for those born 1960 or later). */
  rmdAge: "73 (75 if born in 1960 or later)",
  /** Roth TSP balances are not subject to RMDs during the participant's lifetime starting in 2024. */
  rothNoLifetimeRmdSince: 2024,
  /** Roth TSP qualified withdrawal: 5 years since first Roth contribution AND age 59½, disability, or death. */
  rothQualifiedYears: 5,
  /** TSP in-plan Roth conversions became available January 28, 2026. */
  inPlanRothConversionStart: "January 2026",
  /** TSP loan minimum and statutory maximum. Actual maximum depends on your balance and any outstanding loans. */
  loanMin: 1_000,
  loanMax: 50_000,
  /** FSAFEDS 2026 limits. */
  healthFsaLimit: 3_400,
  dependentCareFsaLimit: 7_500,
  /** FEGLI Basic: annual basic pay rounded up to the next $1,000, plus $2,000. */
  fegliBasicAddOn: 2_000,
  /** FEHB in retirement: generally enrolled for the 5 years immediately before retirement (or since first eligible). */
  fehbFiveYearRule: 5,
  sources: [SOURCES.tspWithdrawals, SOURCES.irsRmd, SOURCES.irsEarlyDist, SOURCES.tspLoans, SOURCES.fsafeds, SOURCES.opmFegli, SOURCES.opmFehb],
  verify: true,
} as const;

/** Date this file was last reviewed against the sources above. */
export const lastReviewed = "2026-11-01";

/** The required independence statement, used across the Wealth Center. */
export const independenceStatement =
  "MONEY COACH is an independent financial education platform. We are not affiliated with, endorsed by, or sponsored by the federal government, the Thrift Savings Plan (TSP), the Federal Retirement Thrift Investment Board (FRTIB), the Office of Personnel Management (OPM), or any federal agency.";
