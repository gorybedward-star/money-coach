# Money Coach Financial Reset Toolkit ($39)

**Status: Stage 1, functional prototype.** Fictional sample data and browser storage only. Not ready for real customer financial information or payments.

Live route: `/toolkit` (hidden from search engines with `noindex`, not linked from the public site yet).

## Why it lives inside the existing site

The toolkit is a route in this Next.js app instead of a separate app because it reuses the same brand, fonts, Tailwind setup, Vercel project and (in Stage 3) the same Supabase project that already powers `/coach` and `/portal`. One codebase, one deployment, one bill. It has its own app layout (the marketing header and footer are hidden at `/toolkit`, the same way they are in the coach and client areas), so it feels like a standalone product.

## The centerpiece: one connected financial view

The toolkit's advantage over the free calculators on the website is that every number is entered once and flows to the modules that need it.

| Entered in | Flows to | What |
|---|---|---|
| Debt Freedom Tracker | Paycheck Planner | Monthly debt payments (minimums + extra) |
| Debt Freedom Tracker | Net Worth Tracker | Every balance becomes a liability (read-only there) |
| Paycheck Planner | Emergency Fund Builder | Essential expenses (+ debt minimums) and the Savings line as the monthly contribution |
| Paycheck Planner | Investing Calculator | The Investing line as the monthly contribution |
| Emergency Fund Builder | Net Worth Tracker | Emergency savings counted as cash |
| Net Worth Tracker | Investing Calculator | Brokerage + retirement balances as the starting balance |
| Every module | 30-Day Reset + Scorecard | Steps check themselves off; the Scorecard is calculated from live data |

Each link has a checkbox to turn it off and type a number by hand instead. The rules are in one place, `src/lib/toolkit/calc.ts` (`effectiveNetWorth`, `effectiveInvesting`, `toolkitSummary`, `autoTasks`), and are unit tested.

## Project structure

```
src/app/toolkit/page.tsx            Route (noindex metadata) → <ToolkitApp />
src/components/toolkit/
  app.tsx                           Shell: navy sidebar (desktop), top bar + bottom tabs + drawer (mobile), prototype banner
  store.tsx                         State provider (localStorage key "mc-toolkit-v1") + hash routing (#/debt etc.)
  ui.tsx                            Cards, stats, inputs with validation, progress, ring, sync badges, tooltips
  charts.tsx                        Recharts: net worth area, assets vs. liabilities, donut, growth, payoff lines
  dashboard.tsx                     8 dashboard items + connected view + module grid
  onboarding.tsx                    4-step setup wizard (or "Explore with sample data")
  net-worth.tsx                     Module 7 (flagship)
  paycheck.tsx, debt.tsx, emergency.tsx, investing.tsx, benefits.tsx, reset.tsx   Modules 1-6
  data.tsx                          Export / import JSON, load sample, delete all data
src/lib/toolkit/model.ts            Types, defaults, fictional sample family, input validation of stored data
src/lib/toolkit/calc.ts             All math (pure functions)
src/content/toolkit.ts              Module list, benefits checklist, TSP basics, 30-day plan, disclaimers
tests/toolkit.test.mts              Calculation and sync tests
preview/toolkit-entry.tsx           Single-file shareable preview build
```

Dependencies added: `recharts` only.

## Calculation notes

- **Pay frequency** to monthly: amount × paychecks per year (52, 26, 24, 12) ÷ 12.
- **Debt payoff**: monthly amortization. Interest accrues at APR ÷ 12, every debt gets its minimum, extra goes to the priority debt (avalanche = highest APR, snowball = smallest balance), and paid-off minimums roll over. "Minimums only" baseline gives each debt only its own minimum. Debts whose minimum doesn't cover interest are flagged. Assumes fixed rates and no new charges. Verified against the closed-form schedule in tests.
- **Emergency fund**: months covered = savings ÷ essentials; 3 and 6 month targets; time to reach = remaining ÷ monthly contribution (no interest assumed). Starter milestone defaults to $1,000 and is editable.
- **Investing**: monthly compounding at annual ÷ 12, end-of-month deposits, optional inflation adjustment (÷ (1 + inflation)^years). Clearly labeled hypothetical.
- **Net worth**: assets − liabilities. Real estate is entered as property value + mortgage together so equity is counted once. Changes between snapshots are split into "paying down debt" (drop in liabilities) and "changes in assets"; the two always add up to the total change. Monthly = latest vs. previous snapshot; annual = latest vs. the snapshot 12+ months earlier.
- **Scorecard**: savings, debt, cash flow, retirement, benefits, protection and net worth goal, each 0-100, averaged.

Every plan includes the protection review (health, life, disability, beneficiaries) with the education-only, state-regulated-products disclaimer.

## Run it

```bash
npm install
npm run dev            # http://localhost:3000/toolkit
npm test               # includes tests/toolkit.test.mts
npm run lint && npm run typecheck
```

Shareable single-file preview: `npm run build && npm run preview:toolkit` → `preview/out/toolkit-preview.html`.

## Deploy (prototype)

Nothing extra to configure. Merging to `main` deploys to Vercel as usual, and the toolkit is at `https://<your-domain>/toolkit`. No environment variables, database or payment keys are needed for Stage 1.

## Next stages (not built yet)

**Stage 2, quality assurance.** Manual test pass on iOS Safari and Android Chrome, screen reader pass (VoiceOver), keyboard-only pass, edge cases (very large balances, 0% debts, 50+ year horizons), and cross-module checks.

**Stage 3, secure production storage.** Uses the existing Supabase project:
- Supabase Auth (email + password, password reset already built for `/login`, `/forgot-password`, `/reset-password`).
- One table, `toolkit_data (user_id uuid primary key references auth.users, data jsonb, updated_at)`, with row-level security `user_id = auth.uid()` for select/insert/update/delete. The current state object maps to it 1:1, so only `store.tsx` load/save changes.
- Export (already built) and account deletion via a server action that deletes the row and the auth user with the service role key.
- Never collect SSNs, bank logins or full account numbers.

**Stage 4, payments.** Stripe Checkout in payment mode for a $39 one-time price under Novus Core Holdings, LLC:
- `POST /api/toolkit/checkout` creates the Checkout Session server-side.
- `POST /api/stripe/webhook` verifies the signature with `STRIPE_WEBHOOK_SECRET` and, on `checkout.session.completed` with `payment_status = paid`, writes a `toolkit_purchases` row (RLS: readable by the owner only, writable only by the service role).
- `/toolkit` checks for that row on the server before rendering; client-side "success" pages never unlock access.
- Stripe sends the receipt. Test mode first; live keys only after an end-to-end test.
- Env vars: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, set in Vercel → Project → Settings → Environment Variables.

Running cost stays low: Supabase Pro ($25/mo) and Vercel Pro ($20/mo) are recommended once real customers sign up; Stripe charges per transaction only.
