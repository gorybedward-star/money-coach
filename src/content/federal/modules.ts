/**
 * Federal Employee Wealth Center education modules.
 * Time-sensitive numbers are read from src/config/federal-rules.ts. Never hardcode them here.
 */
import { SOURCES, getLimits, fersAgency, fersRules, otherRules, type Source } from "../../config/federal-rules.ts";

export type ModuleBlock =
  | { h: string }
  | { p: string }
  | { ul: string[] }
  | { table: { caption: string; head: string[]; rows: string[][] } }
  | { callout: string; tone?: "caution" | "info" };

export type FedModule = {
  slug: string;
  group: "tsp" | "benefits";
  title: string;
  summary: string;
  minutes: number;
  blocks: ModuleBlock[];
  keyPoints: string[];
  tools?: { href: string; label: string }[];
  sources: Source[];
};

const L = getLimits();
const usd = (n: number) => `$${n.toLocaleString("en-US")}`;

const RISK_NOTE =
  "Market-based TSP funds (F, C, S, I, and the L Funds) can lose value, including in the years right before or during retirement. Past performance does not guarantee future results, and retirement outcomes are not guaranteed.";

export const fedModules: FedModule[] = [
  // ---------------- TSP Education Center ----------------
  {
    slug: "traditional-vs-roth-tsp",
    group: "tsp",
    title: "Traditional vs. Roth TSP",
    summary: "Pay the tax now or pay it later. How each option is taxed going in, growing, and coming out.",
    minutes: 6,
    blocks: [
      { p: "The TSP offers two tax treatments for your own contributions. You can choose either one or split your contributions between them. Both share the same annual elective deferral limit, so a dollar in Roth counts the same as a dollar in Traditional toward that limit." },
      {
        table: {
          caption: "How the two tax treatments compare",
          head: ["", "Traditional TSP", "Roth TSP"],
          rows: [
            ["Contributions", "Made before federal income tax, which lowers your taxable income today", "Made after tax; no tax break today"],
            ["Growth", "Tax-deferred", "Tax-free if the withdrawal is qualified"],
            ["Withdrawals", "Contributions and earnings are taxed as ordinary income", `Qualified withdrawals are tax-free: ${otherRules.rothQualifiedYears} years since your first Roth contribution and age 59½, disability, or death`],
            ["Required minimum distributions", `Required starting at age ${otherRules.rmdAge}`, `Not required during your lifetime for Roth TSP balances (starting in ${otherRules.rothNoLifetimeRmdSince})`],
            ["Agency contributions", "Always deposited as Traditional", "Not available as Roth; agency money is Traditional even if you choose Roth"],
          ],
        },
      },
      { h: "The question behind the choice" },
      { p: "The main difference is when you pay income tax. If your tax rate in retirement turns out to be lower than it is today, Traditional often comes out ahead. If it turns out to be higher, Roth often comes out ahead. If the rates are the same, the outcomes are mathematically similar. Nobody knows future tax rates for certain, which is why many people use a mix." },
      { ul: [
        "Things that can point toward Traditional: a higher tax bracket today, or an expectation of lower taxable income in retirement.",
        "Things that can point toward Roth: a lower tax bracket today, many years of potential tax-free growth ahead, or a desire for tax-free income in retirement.",
        "Things people often forget: your FERS annuity and part of Social Security may be taxable in retirement, which affects your retirement bracket.",
      ] },
      { callout: `Catch-up rule for higher earners: starting in 2026, if your prior-year FICA wages from your current employer were above ${usd(L.rothCatchUpWageThreshold)}, any catch-up contributions must be Roth. Check tsp.gov for how this applies to you.`, tone: "info" },
      { p: `Since ${otherRules.inPlanRothConversionStart}, the TSP also allows in-plan Roth conversions of eligible Traditional balances. A conversion is a taxable event in the year you make it, so it deserves careful review with a tax professional.` },
    ],
    keyPoints: [
      "Neither option is universally better. The answer depends on tax rates you cannot know for certain.",
      "Both share one annual limit, and agency contributions are always Traditional.",
      "Splitting contributions is a common way to diversify your future tax picture.",
    ],
    tools: [{ href: "/federal-employees/calculators/roth-vs-traditional", label: "Traditional vs. Roth Education Calculator" }],
    sources: [SOURCES.tspRoth, SOURCES.tspRothConversion, SOURCES.tspLimits, SOURCES.irsRmd],
  },
  {
    slug: "tsp-contribution-limits",
    group: "tsp",
    title: "TSP contribution limits and catch-up rules",
    summary: `How much you can put in for ${L.year}, how catch-up contributions work, and why pacing matters for FERS employees.`,
    minutes: 5,
    blocks: [
      { p: `The IRS sets the TSP's annual limits, and they usually change each year. These are the ${L.year} figures.` },
      {
        table: {
          caption: `${L.year} TSP limits`,
          head: ["Limit", L.year.toString(), "What it covers"],
          rows: [
            ["Elective deferral limit", usd(L.electiveDeferral), "Your own Traditional + Roth contributions combined"],
            ["Catch-up, age 50+", usd(L.catchUp50), "Extra contributions if you turn 50 or older this year (also ages 64+)"],
            ["Catch-up, ages 60–63", usd(L.catchUp60to63), "Higher catch-up if you turn 60, 61, 62, or 63 this year"],
            ["Annual additions limit", usd(L.annualAdditions), "Your regular contributions plus agency contributions (catch-up not counted)"],
          ],
        },
      },
      { h: "How catch-up works in the TSP" },
      { p: "If you are eligible, you do not need a separate catch-up election. Once your contributions reach the elective deferral limit, additional contributions automatically \"spill over\" into catch-up, up to the catch-up limit." },
      { h: "Why pacing matters under FERS" },
      { p: `Agency matching is calculated each pay period, on what you contribute that pay period. If you contribute so much early in the year that you hit the limit before your last paycheck, you stop contributing and the matching stops with it. There is no year-end "true-up" to restore it. Many FERS employees spread contributions across all ${26} pay periods for this reason.` },
      { callout: "If you also contribute to another employer's 401(k) or 403(b) in the same year, the elective deferral limit is shared across plans. You are responsible for staying under it.", tone: "caution" },
    ],
    keyPoints: [
      `${L.year} elective deferral limit: ${usd(L.electiveDeferral)}. Catch-up: ${usd(L.catchUp50)} (age 50+) or ${usd(L.catchUp60to63)} (ages 60–63).`,
      "Limits change most years. Confirm the current year's figures on tsp.gov.",
      "Under FERS, hitting the limit early can cost you matching for the rest of the year.",
    ],
    tools: [{ href: "/federal-employees/calculators/agency-match", label: "TSP Agency Match Calculator" }],
    sources: [SOURCES.tspLimits, SOURCES.irsCola],
  },
  {
    slug: "agency-contributions",
    group: "tsp",
    title: "Agency automatic and matching contributions",
    summary: "How FERS agency contributions work, who receives them, and how to make sure you get the full amount.",
    minutes: 5,
    blocks: [
      { p: "If you are covered by FERS, your agency can contribute to your TSP in two ways. If you are covered by CSRS or CSRS Offset, you can contribute to the TSP but you do not receive agency contributions." },
      {
        table: {
          caption: "FERS agency contributions by your contribution rate (percent of basic pay)",
          head: ["You contribute", "Agency Automatic (1%)", "Agency Matching", "Total going in"],
          rows: [0, 1, 2, 3, 4, 5].map((p) => {
            const m = Math.min(p, 3) + Math.min(Math.max(p - 3, 0), 2) * 0.5;
            return [`${p}%`, `${fersAgency.automaticPct}%`, `${m}%`, `${p + fersAgency.automaticPct + m}%`];
          }),
        },
      },
      { ul: [
        "Agency Automatic (1%) Contributions: 1% of your basic pay every pay period, even if you contribute nothing.",
        "Agency Matching Contributions: dollar for dollar on the first 3% of basic pay you contribute, then 50 cents per dollar on the next 2%.",
        `Contributing at least ${fersAgency.fullMatchAtPct}% of basic pay each pay period is what it takes to receive the full 4% match.`,
        `FERS employees hired on or after October 1, 2020 are automatically enrolled at ${fersAgency.autoEnrollPct}% unless they choose a different amount.`,
      ] },
      { callout: "Agency contributions are calculated on basic pay, which generally excludes things like overtime, bonuses, and most allowances. Your Leave and Earnings Statement shows your basic pay and your agency contributions each pay period.", tone: "info" },
      { p: "Agency Automatic (1%) Contributions are subject to a vesting requirement, typically 3 years of service (2 years for certain positions). Your contributions and agency matching contributions are always yours. Ask your HR office how vesting applies to you." },
    ],
    keyPoints: [
      "FERS: up to 5% of basic pay from your agency when you contribute 5%.",
      "CSRS and CSRS Offset: no agency contributions.",
      "Matching happens each pay period, so steady contributions all year protect your full match.",
    ],
    tools: [{ href: "/federal-employees/calculators/agency-match", label: "TSP Agency Match Calculator" }],
    sources: [SOURCES.tspContributionTypes],
  },
  {
    slug: "tsp-individual-funds",
    group: "tsp",
    title: "The G, F, C, S, and I Funds",
    summary: "What each of the five individual TSP funds invests in, and the different kinds of risk each one carries.",
    minutes: 7,
    blocks: [
      { p: "The TSP offers five individual funds. Each has a different job, and each carries different risks. Understanding them is the first step to understanding your own account." },
      {
        table: {
          caption: "The five individual TSP funds",
          head: ["Fund", "What it holds", "Main risks"],
          rows: [
            ["G Fund", "Specially issued U.S. Treasury securities available only to the TSP", "Inflation risk: returns may not keep up with rising prices over long periods"],
            ["F Fund", "A broad index of U.S. investment-grade bonds", "Interest-rate risk and credit risk; can lose value when rates rise"],
            ["C Fund", "Stocks of large U.S. companies (tracks the S&P 500 index)", "Stock market risk; can lose significant value in downturns"],
            ["S Fund", "Stocks of small and mid-sized U.S. companies not in the S&P 500", "Stock market risk, often with larger swings than the C Fund"],
            ["I Fund", "Stocks of companies in developed and emerging markets outside the U.S. (per its current index)", "Stock market risk plus currency and international risks"],
          ],
        },
      },
      { h: "The G Fund is not a bank savings account" },
      { p: "The G Fund is designed so its value does not fall because of interest-rate changes, and the federal government backs the payment of principal and interest. But it is not a bank deposit and it is not FDIC-insured. Its return is set by a formula and can be low. Over long periods, inflation can erode its purchasing power, which is a real risk for money meant to last decades." },
      { callout: RISK_NOTE, tone: "caution" },
      { p: "The TSP also offers a mutual fund window for participants who want more choices. It comes with additional fees and requirements. Review tsp.gov before using it." },
    ],
    keyPoints: [
      "Every fund carries some kind of risk. The G Fund's main risk is inflation; the others can lose value.",
      "The C, S, and I Funds together cover a broad range of U.S. and international stocks.",
      "Check fund details, indexes, and expense ratios on tsp.gov because they can change.",
    ],
    sources: [SOURCES.tspFunds],
  },
  {
    slug: "lifecycle-funds",
    group: "tsp",
    title: "Lifecycle (L) Funds and diversification",
    summary: "How L Funds mix the five individual funds and gradually shift toward a more conservative mix over time.",
    minutes: 5,
    blocks: [
      { p: "Each Lifecycle Fund is a pre-set mix of the G, F, C, S, and I Funds, built around a target date when you expect to start withdrawing money. Funds with later dates hold more stocks. As the target date approaches, the mix automatically becomes more conservative." },
      { ul: [
        "The TSP offers L Funds in five-year increments plus L Income, for people already withdrawing.",
        "Each L Fund is rebalanced for you, so you do not have to adjust the mix yourself.",
        "New participants who do not choose investments are generally placed in an age-appropriate L Fund by default.",
      ] },
      { h: "Diversification, in plain English" },
      { p: "Diversification means not putting all your eggs in one basket. Spreading money across different types of investments can reduce the impact of any one of them doing poorly. It does not eliminate risk and it does not guarantee a profit or protect against loss." },
      { callout: "An L Fund's date is a planning assumption, not a promise. An L Fund can still lose value, including near or after its target date.", tone: "caution" },
      { p: "Choosing between an L Fund and building your own mix from individual funds depends on your goals, time horizon, and comfort with risk. MONEY COACH does not recommend specific funds or allocations." },
    ],
    keyPoints: [
      "L Funds combine the five individual funds into one diversified, automatically adjusted choice.",
      "A later target date means more stocks and more potential ups and downs.",
      "Diversification can reduce risk but never removes it.",
    ],
    sources: [SOURCES.tspLFunds, SOURCES.tspFunds],
  },
  {
    slug: "how-compound-growth-works",
    group: "tsp",
    title: "How compound growth works in your TSP",
    summary: "Why time in the account matters, and how contributions, agency money, and growth build on each other.",
    minutes: 4,
    blocks: [
      { p: "Compound growth means earnings can generate their own earnings over time. In a TSP account, three things add to your balance: your contributions, agency contributions if you are under FERS, and any investment growth." },
      { p: "In the early years, most of a balance comes from contributions. Over decades, investment growth can become a larger share. That is why the number of years your money stays invested matters so much." },
      { ul: ["Time: the years your money stays invested.", "Consistency: contributing every pay period.", "Agency money: under FERS, contributing 5% can roughly double what goes in from your own 5%."] },
      { callout: "Growth is never guaranteed. Investment returns vary from year to year and can be negative.", tone: "caution" },
    ],
    keyPoints: ["Growth needs time to work.", "Regular contributions plus agency contributions are the engine you control.", "Calculators show illustrations, not predictions."],
    tools: [{ href: "/federal-employees/calculators/growth", label: "TSP Growth Calculator" }, { href: "/federal-employees/calculators/cost-of-waiting", label: "Cost of Waiting: Federal Edition" }],
    sources: [SOURCES.tspCalculators],
  },
  {
    slug: "tsp-loans",
    group: "tsp",
    title: "TSP loans and their tradeoffs",
    summary: "How TSP loans work, what they can cost you beyond the interest rate, and what happens if you leave federal service.",
    minutes: 5,
    blocks: [
      { p: `While you are employed, you may be able to borrow from your own TSP contributions and their earnings. There are two types: general purpose loans and residential loans for buying or building a primary residence. Loans are generally between ${usd(otherRules.loanMin)} and ${usd(otherRules.loanMax)}, and the amount you can borrow depends on your balance and any loans you already have.` },
      { h: "Tradeoffs to understand first" },
      { ul: [
        "Borrowed money is out of the market. If markets rise while you repay, you miss that growth.",
        "You repay with after-tax pay, and Traditional money is taxed again when withdrawn in retirement.",
        "Loan payments can crowd out new contributions. If you lower your contribution rate to afford payments, you may also lose agency matching.",
        "If you separate from federal service with an unpaid balance and do not repay it within the allowed time, it can become a taxable distribution and may be subject to the IRS 10% additional tax if you are under 59½.",
        "There is a loan fee, and you can generally have only a limited number of loans at one time.",
      ] },
      { callout: "A TSP loan is not free money. Compare it with other options, such as an emergency fund, before borrowing from your retirement.", tone: "caution" },
    ],
    keyPoints: ["Loans pause the growth of the borrowed money.", "Keep contributing enough to receive your full match while repaying if you can.", "Leaving federal service with a loan outstanding can create taxes."],
    sources: [SOURCES.tspLoans, SOURCES.irsEarlyDist],
  },
  {
    slug: "withdrawals-and-rollovers",
    group: "tsp",
    title: "TSP withdrawals and rollovers",
    summary: "Your options while working and after separation, the tax rules, and what to consider before moving money.",
    minutes: 6,
    blocks: [
      { h: "While you are still working" },
      { ul: [
        `Age-based in-service withdrawals are available starting at age ${otherRules.penaltyFreeAge}.`,
        "Financial hardship in-service withdrawals may be available in limited situations, and may be taxable and subject to the IRS 10% additional tax.",
      ] },
      { h: "After you separate from federal service" },
      { ul: [
        "Leave your money in the TSP and keep it invested.",
        "Take installment payments, single or partial withdrawals, or purchase a life annuity, or combine options.",
        "Roll eligible money to an IRA or another employer's plan, or roll money from those accounts into the TSP.",
      ] },
      { h: "Tax rules to know" },
      { ul: [
        "Traditional withdrawals are taxed as ordinary income. Qualified Roth withdrawals are tax-free.",
        `Withdrawals before ${otherRules.penaltyFreeAge} may face the IRS 10% additional tax unless an exception applies. One exception covers people who separate in or after the year they turn ${otherRules.separationAge} (${otherRules.publicSafetySeparationAge} for certain public safety employees).`,
        `Required minimum distributions generally begin at age ${otherRules.rmdAge}.`,
      ] },
      { callout: "Before a rollover, compare fees, investment choices, protections, and how each account is taxed. Moving TSP money out is usually difficult to undo. A qualified, licensed professional can help with your specific situation.", tone: "caution" },
    ],
    keyPoints: ["You have options, including leaving money in the TSP.", "Taxes and timing rules differ for Traditional and Roth balances.", "Rollovers deserve a careful comparison of costs and protections."],
    sources: [SOURCES.tspWithdrawals, SOURCES.irsEarlyDist, SOURCES.irsRmd],
  },
  {
    slug: "tsp-beneficiaries",
    group: "tsp",
    title: "TSP beneficiary designations",
    summary: "Who receives your TSP if you die, why your will does not control it, and when to review it.",
    minutes: 4,
    blocks: [
      { p: "Your TSP account passes according to a valid beneficiary designation on file with the TSP. If you have not designated anyone, the TSP pays your account in a legally set order of precedence, generally starting with your spouse, then your children, then your parents, and so on. That default may not match what you want." },
      { ul: [
        "A TSP designation is separate from your FEGLI, FERS, and other benefits designations. Each has its own form.",
        "A will generally does not override a valid TSP beneficiary designation.",
        "Review your designation after marriage, divorce, a birth or adoption, or a death in the family.",
        "Court orders, such as in a divorce, can affect TSP accounts. Ask the TSP or an attorney if this applies to you.",
      ] },
      { callout: "MONEY COACH will never ask for your TSP account number, password, or beneficiary details. Review them directly on tsp.gov.", tone: "info" },
    ],
    keyPoints: ["Designate beneficiaries on tsp.gov rather than relying on the default order.", "Each federal benefit has its own designation.", "Review after every major life event."],
    sources: [SOURCES.tspBeneficiaries],
  },
  {
    slug: "common-tsp-mistakes",
    group: "tsp",
    title: "Common TSP misunderstandings and mistakes",
    summary: "Ten misunderstandings that can quietly cost federal employees, and how to check yourself.",
    minutes: 5,
    blocks: [
      { ul: [
        "Contributing less than 5% under FERS and leaving agency matching on the table.",
        "Front-loading contributions and hitting the limit before the last pay period of the year, which ends matching for the remaining pay periods.",
        "Believing the G Fund is the same as a bank savings account. It is not FDIC-insured, and inflation can erode it.",
        "Assuming market-based funds cannot lose value close to retirement. They can.",
        "Moving money between funds after big market moves, which can lock in losses.",
        "Never updating beneficiary designations after marriage, divorce, or a new child.",
        "Forgetting that agency contributions are always Traditional, even if you elect Roth.",
        "Taking a TSP loan without understanding the tax risk if you leave federal service.",
        "Not knowing which retirement system you are in (FERS, FERS-RAE, FERS-FRAE, or CSRS).",
        "Not checking the Leave and Earnings Statement to confirm contributions are actually happening.",
      ] },
      { callout: "None of these are signs of failure. They are just easy to miss because nobody explains them. A short review each year can catch most of them.", tone: "info" },
    ],
    keyPoints: ["Check your contribution rate and match every year.", "Know what your funds actually hold.", "Keep beneficiaries current."],
    tools: [{ href: "/federal-employees/tsp-checkup", label: "Free TSP Checkup" }],
    sources: [SOURCES.tspContributionTypes, SOURCES.tspFunds, SOURCES.tspBeneficiaries],
  },
  {
    slug: "fers-retirement-fundamentals",
    group: "tsp",
    title: "FERS retirement fundamentals",
    summary: "The three parts of FERS: a basic annuity, Social Security, and the TSP, and how they work together.",
    minutes: 6,
    blocks: [
      { p: "Most civilian federal employees hired after 1983 are covered by the Federal Employees Retirement System. FERS is designed as a three-part system." },
      {
        table: {
          caption: "The three parts of FERS",
          head: ["Part", "What it is", "What you control"],
          rows: [
            ["FERS basic annuity", "A monthly pension based on your high-3 average salary and years of creditable service", "Years of service and when you retire"],
            ["Social Security", "Benefits based on your lifetime earnings record", "When you claim, and how long you work"],
            ["Thrift Savings Plan", "Your personal retirement savings account", "How much you contribute, Traditional vs. Roth, and how it is invested"],
          ],
        },
      },
      { p: `Your FERS employee contribution rate depends on when you were hired: ${fersRules.employeeContributionRates.map((r) => `${r.pct}% for ${r.group}`).join("; ")}.` },
      { p: "Because the FERS annuity is designed to replace only part of your pay, the TSP is often an important part of a FERS retirement. That is also why the agency match matters so much." },
    ],
    keyPoints: ["FERS = annuity + Social Security + TSP.", "The TSP is the part you control most directly.", "Your eligibility and amounts depend on your service history and individual circumstances."],
    tools: [{ href: "/federal-employees/learn/fers-basic-benefit", label: "Module: The FERS basic benefit" }],
    sources: [SOURCES.opmFers, SOURCES.tspContributionTypes],
  },

  // ---------------- Federal Benefits Education ----------------
  {
    slug: "fers-basic-benefit",
    group: "benefits",
    title: "The FERS basic retirement benefit",
    summary: "How the FERS annuity is calculated, in plain English, with the factors that affect it.",
    minutes: 6,
    blocks: [
      { p: `The FERS basic annuity is generally calculated as ${fersRules.multiplier}% of your high-3 average salary for each year of creditable service. If you retire at age ${fersRules.enhancedAge} or older with at least ${fersRules.enhancedYears} years of service, the multiplier is generally ${fersRules.enhancedMultiplier}%.` },
      {
        table: {
          caption: "Illustration only: high-3 of $80,000",
          head: ["Service", "At 1.0%", "At 1.1% (62+ with 20+ years)"],
          rows: [20, 25, 30].map((y) => [`${y} years`, `${usd(80000 * 0.01 * y)}/yr`, `${usd(80000 * 0.011 * y)}/yr`]),
        },
      },
      { ul: [
        "High-3 means your highest average basic pay over any three consecutive years of service.",
        "Survivor benefit elections, early retirement reductions, and other factors can reduce the amount you receive.",
        "Some retirees may receive a FERS annuity supplement until age 62, subject to rules including an earnings test.",
      ] },
      { callout: "Your actual annuity is determined by OPM based on your official records. Use your agency's retirement estimate or OPM resources for a personalized figure.", tone: "info" },
    ],
    keyPoints: ["Formula: multiplier × high-3 × years of service.", "Age 62 with 20+ years generally increases the multiplier.", "Reductions and elections can change the final amount."],
    sources: [SOURCES.opmFersComputation, SOURCES.opmFersEligibility],
  },
  {
    slug: "social-security-coordination",
    group: "benefits",
    title: "Social Security and your federal retirement",
    summary: "How Social Security fits with FERS and the TSP, and why claiming age matters.",
    minutes: 4,
    blocks: [
      { p: "FERS employees pay into Social Security and generally earn benefits like private-sector workers. CSRS employees generally do not earn Social Security through their federal service, although they may have earned it through other work." },
      { ul: [
        "You can start Social Security retirement benefits as early as 62, with a permanent reduction. Waiting until full retirement age, or later up to 70, increases your monthly benefit.",
        "The FERS annuity supplement, if you qualify, is meant to bridge the gap until 62 and generally ends at 62.",
        "Review your earnings record and estimates with a my Social Security account at ssa.gov.",
      ] },
      { callout: "Social Security rules change from time to time. Confirm current rules at ssa.gov, especially if you have CSRS service or a government pension.", tone: "caution" },
    ],
    keyPoints: ["Social Security is one of the three FERS parts.", "Claiming age has a lasting effect on your benefit.", "Check your earnings record every year."],
    sources: [SOURCES.ssa, SOURCES.ssaRetirement, SOURCES.opmFers],
  },
  {
    slug: "fegli-life-insurance",
    group: "benefits",
    title: "FEGLI life insurance",
    summary: "What Basic and Optional FEGLI coverage is, and what to think about as costs change with age.",
    minutes: 5,
    blocks: [
      { p: `The Federal Employees' Group Life Insurance program offers Basic coverage, generally equal to your annual basic pay rounded up to the next $1,000 plus ${usd(otherRules.fegliBasicAddOn)}, and Optional coverage you can add. Most employees are enrolled in Basic automatically unless they waive it.` },
      {
        table: {
          caption: "FEGLI coverage types",
          head: ["Coverage", "What it is"],
          rows: [
            ["Basic", "Salary-based coverage. The government pays part of the premium."],
            ["Option A (Standard)", "A flat additional amount"],
            ["Option B (Additional)", "Multiples of your annual basic pay. Premiums rise with age."],
            ["Option C (Family)", "Coverage on your spouse and eligible children"],
          ],
        },
      },
      { ul: [
        "Optional coverage premiums increase in five-year age bands, and can become expensive later in life.",
        "Keeping FEGLI into retirement has its own requirements, including prior years of coverage.",
        "Your FEGLI beneficiary designation is separate from your TSP designation.",
      ] },
      { p: "How much life insurance a family needs is a personal decision. Compare FEGLI with other options and your family's actual needs." },
    ],
    keyPoints: ["Basic FEGLI is salary-based and partly paid by the government.", "Option B costs rise with age.", "Review beneficiaries separately for FEGLI."],
    tools: [{ href: "/tools/life-insurance", label: "Life Insurance Needs Estimator" }],
    sources: [SOURCES.opmFegli],
  },
  {
    slug: "fehb-health-insurance",
    group: "benefits",
    title: "FEHB health insurance",
    summary: "Choosing an FEHB plan during Open Season, and keeping coverage into retirement.",
    minutes: 4,
    blocks: [
      { p: "The Federal Employees Health Benefits program offers a range of plans, and the government pays a share of the premium. You can change plans each year during Open Season, which usually runs from mid-November to mid-December, and after qualifying life events." },
      { ul: [
        "Compare total cost, not just the premium: deductibles, copays, out-of-pocket maximums, and networks.",
        "Some plans pair with a health savings account (HSA) or a health reimbursement arrangement (HRA).",
        `To continue FEHB into retirement, you generally must be enrolled for the ${otherRules.fehbFiveYearRule} years immediately before retirement, or since first eligible.`,
        "Postal Service employees and annuitants are covered by the separate Postal Service Health Benefits program.",
      ] },
    ],
    keyPoints: ["Review your plan every Open Season.", "Look at total yearly cost, not only premiums.", "The five-year rule matters for retirement planning."],
    sources: [SOURCES.opmFehb],
  },
  {
    slug: "fedvip-dental-vision",
    group: "benefits",
    title: "FEDVIP dental and vision",
    summary: "Separate dental and vision plans that many federal families overlook.",
    minutes: 3,
    blocks: [
      { p: "The Federal Employees Dental and Vision Insurance Program offers standalone dental and vision plans. Unlike FEHB, employees generally pay the full premium, usually with pre-tax pay." },
      { ul: [
        "You can enroll or change plans during Open Season or after a qualifying life event.",
        "Check how FEDVIP coordinates with any dental or vision coverage in your FEHB plan.",
        "Retirees can generally enroll in FEDVIP without a prior-coverage requirement.",
      ] },
    ],
    keyPoints: ["FEDVIP is separate from FEHB.", "Compare it with what your FEHB plan already covers.", "Open Season is the main chance to change."],
    sources: [SOURCES.opmFedvip],
  },
  {
    slug: "fsafeds",
    group: "benefits",
    title: "FSAFEDS flexible spending accounts",
    summary: "Use pre-tax dollars for health care and dependent care expenses.",
    minutes: 4,
    blocks: [
      { p: "FSAFEDS lets eligible employees set aside pre-tax pay for certain expenses. You must re-enroll every year during Open Season; elections do not carry over automatically." },
      {
        table: {
          caption: "FSAFEDS account types (confirm current limits on fsafeds.gov)",
          head: ["Account", "Used for", "Annual limit"],
          rows: [
            ["Health Care FSA", "Eligible medical, dental, and vision costs", usd(otherRules.healthFsaLimit)],
            ["Limited Expense Health Care FSA", "Dental and vision costs, for people with an HSA", usd(otherRules.healthFsaLimit)],
            ["Dependent Care FSA", "Eligible child and adult care so you can work", `${usd(otherRules.dependentCareFsaLimit)} per household`],
          ],
        },
      },
      { callout: "Health care FSAs have use-it-or-lose-it rules with a limited carryover. Estimate your expenses conservatively.", tone: "caution" },
    ],
    keyPoints: ["Re-enroll every Open Season.", "FSA dollars come out before tax.", "Plan carefully because unused money can be forfeited."],
    sources: [SOURCES.fsafeds, SOURCES.irsFsa],
  },
  {
    slug: "retirement-eligibility-milestones",
    group: "benefits",
    title: "Federal retirement eligibility and planning milestones",
    summary: "Minimum Retirement Age, immediate retirement combinations, and key dates to plan around.",
    minutes: 5,
    blocks: [
      {
        table: {
          caption: "FERS immediate retirement eligibility",
          head: ["Age", "Years of service", "Benefit"],
          rows: fersRules.immediateEligibility.map((r) => [r.age, r.service, r.note]),
        },
      },
      {
        table: {
          caption: "FERS Minimum Retirement Age (MRA) by year of birth",
          head: ["Born", "MRA"],
          rows: fersRules.mra.map((r) => [r.born, r.age]),
        },
      },
      { h: "Planning milestones to put on your calendar" },
      { ul: [
        "Every year: confirm your TSP contribution rate, beneficiaries, and Open Season choices.",
        "Age 50: catch-up contributions become available.",
        "Ages 60–63: the higher catch-up limit applies.",
        "5 years before retirement: confirm FEHB and FEGLI continuation requirements.",
        "1–3 years before retirement: request a retirement estimate from your agency and review your service history.",
        `Age ${otherRules.penaltyFreeAge}: TSP age-based in-service withdrawals become available.`,
        `Age ${otherRules.rmdAge}: required minimum distributions generally begin for Traditional balances.`,
      ] },
      { callout: "Eligibility depends on your service history, retirement system, special provisions (such as for law enforcement or firefighters), and individual circumstances. Confirm with your agency's HR office and OPM.", tone: "info" },
    ],
    keyPoints: ["Know your MRA.", "Your earliest unreduced retirement date depends on age and service together.", "Start planning at least five years out."],
    sources: [SOURCES.opmFersEligibility, SOURCES.tspWithdrawals],
  },
];

export function getFedModule(slug: string) {
  return fedModules.find((m) => m.slug === slug);
}
