# Federal Employee Wealth Center

An independent educational section for civilian federal employees, focused on the Thrift Savings Plan (TSP).

## What's included

| URL | What it is |
| --- | --- |
| `/federal-employees` | Landing page, with the headline, both CTAs, the independence statement, an explanatory FERS match chart, a FERS vs. CSRS table, module and article grids, and the $149 Checkup |
| `/federal-employees/tsp-checkup` | Free TSP Checkup: 10 questions, an education score, matched modules, and three follow-up actions |
| `/federal-employees/calculators` | Calculator hub |
| `/federal-employees/calculators/agency-match` | TSP Agency Match Calculator |
| `/federal-employees/calculators/growth` | TSP Growth Calculator |
| `/federal-employees/calculators/roth-vs-traditional` | Traditional vs. Roth Education Calculator |
| `/federal-employees/calculators/cost-of-waiting` | Cost of Waiting: Federal Edition |
| `/federal-employees/tsp-education` | TSP Education Center (11 modules) |
| `/federal-employees/benefits` | Federal Benefits Education (7 modules) |
| `/federal-employees/learn/[slug]` | Individual module pages |
| `/learn/[slug]` | 7 federal articles, also listed in the Learn library under "Federal employees" |

"Federal Employees" was added to the main navigation and the footer. The `/tools` page has a new federal tools section, and `/employee-benefits` links to the Wealth Center.

## Where things live

- **`src/config/federal-rules.ts`** holds every annual limit and time-sensitive rule, with its official source, the date it was last reviewed, and the independence statement. **This is the only file you edit when rules change.**
- **`src/lib/tsp.ts`** holds the pure calculation functions. They are unit-tested in `tests/tsp.test.mts`.
- **`src/content/federal/`** holds the checkup questions and scoring, the modules, the articles, and the tool list.
- **`src/components/federal/`** holds the UI components.

## Updating limits each year

1. The IRS announces next year's 401(k)/TSP limits in October or November. Read the official IRS notice and the tsp.gov contribution limits page.
2. In `src/config/federal-rules.ts`, add a `limitsByYear` entry with `status: "verified"`, set `activeLimitYear`, and update `lastReviewed`.
3. Update the 2026 assertions in `tests/tsp.test.mts`, or add new ones for the new year.
4. Run `npm test && npm run build`.

The tools refuse to run on a year without verified limits (`getLimits` throws an error), so unofficial projections can't slip in.

## How the Agency Match Calculator models FERS

- **Agency Automatic (1%):** 1% of basic pay is paid every pay period, regardless of the employee's own contributions.
- **Agency Matching:** 100% on the first 3% of pay the employee contributes, then 50% on the next 2%. The maximum match is 4%, so the agency maximum is 5% in total.
- **Per pay period:** the match is calculated on each of 26 biweekly pay periods, with no true-up. When contributions hit the annual limit early, the tool shows the pay period where that happens, the matching lost as a result, and the highest even whole-percent election that avoids it.
- **Catch-up:** catch-up contributions for ages 50+ (with the higher limit at ages 60 to 63) spill over and are matched, up to the same 5% of pay.
- **CSRS, CSRS Offset, and other ineligible statuses:** no agency contributions.
- **Not modeled:** the Blended Retirement System (uniformed services).

## Privacy and positioning guardrails

- No tool asks for TSP account numbers, passwords, SSNs, statements, or personnel records. Every calculator states this.
- The optional email form sends only the score and the band.
- The $149 Checkup is described as an educational review. The copy explicitly excludes fund recommendations, allocations, investment management, and regulated advice.
- Every Wealth Center page shows the statement that MONEY COACH is not affiliated with the federal government, the TSP, FRTIB, or OPM.

## Rules requiring verification before launch

Each of these is marked `verify: true` in `federal-rules.ts` or noted in the content.

1. **2026 limits:** the $24,500 deferral, the $8,000 catch-up, the $11,250 catch-up at ages 60–63, the $72,000 415(c) limit, and the $150,000 Roth catch-up wage threshold. Check them against tsp.gov and irs.gov. When the IRS publishes the **2027** limits, add them as described above.
2. **Catch-up spillover is matched** up to 5% of pay. Confirm on the tsp.gov contribution limits page.
3. **The Roth catch-up requirement for higher earners**, and how the TSP applies it automatically.
4. **FERS agency formula, auto-enrollment, and vesting:** the formula (1% plus 3% plus 2% at half), auto-enrollment at 5% for hires on or after Oct 1, 2020, and 3-year vesting (2 years for some positions) on the 1% automatic contribution.
5. **The I Fund description** (developed and emerging markets outside the U.S.) and the current list of L Funds (L Income through L 2075).
6. **TSP loans:** the $1,000 minimum, the $50,000 maximum, the loan fee, the limits on the number of loans, and the tax treatment after separation.
7. **Withdrawal rules:** the 59½ age-based in-service withdrawal, the separation exception at 55 (50 for public safety), RMD age 73 (75 if born in 1960 or later), and no lifetime RMDs on Roth TSP since 2024.
8. **Roth TSP qualified-withdrawal rule** (5 years plus age 59½, disability, or death), and the in-plan Roth conversion launch in January 2026.
9. **FERS rules:** the 1.0% and 1.1% multipliers, the MRA table, the immediate retirement combinations, the employee contribution rates (0.8%, 3.1%, 4.4%), and the FERS supplement earnings test.
10. **FEGLI Basic formula:** pay rounded up to the next $1,000, plus $2,000.
11. **FEHB:** the five-year rule for continuing coverage, the Open Season dates, and the separate Postal Service Health Benefits (PSHB) program for USPS.
12. **FSAFEDS 2026 limits:** $3,400 for health care and limited expense FSAs, and $7,500 per household for dependent care.
13. **FEDVIP:** retirees can enroll without a prior-coverage requirement.
14. **External links:** every link in `SOURCES` should resolve. Several government sites reorganize their URLs. These links were checked against tsp.gov and opm.gov page listings in November 2026, but the build environment could not load them directly.
15. **Legal review:** have an attorney review the independence statement, the $149 service description, and the article disclaimers, especially the description of what the Checkup does not include.

## Implementation

Nothing extra to configure. The section uses the existing design system, `offers` pricing (the $149 `benefits` offer), the lead form (new `tsp-checkup` type), and Web3Forms delivery. Merging to `main` deploys on Vercel.

```bash
npm ci
npm test          # 28 tests, including 12 for the federal tools
npm run lint
npm run build
npm run preview:build   # optional single-file preview
```
