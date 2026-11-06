# MONEY COACH — Website (Phase 1)

*Building Wealth. Protecting Families. Creating Legacies.*

Mobile-first, education-first website for MONEY COACH, founded by Gory Bedward. Built with Next.js (App Router), TypeScript, Tailwind CSS v4, shadcn/ui-style components, and Lucide icons. No database and no paid services required.

The plan (sitemap, visual system, homepage structure, conversion journey) is in [`docs/PLAN.md`](docs/PLAN.md).

## What's included

| Area | Status |
|---|---|
| Home, Our Philosophy, Money Roadmap, Employee Benefits, Free Tools, Coaching & Pricing, Learn, About Gory, Get Started | Built |
| Family Budget Builder (5 steps, any pay frequency, live checkup, saved in browser) | Working |
| Family Money Scorecard (10 questions, scoring, interpretation, 3 next steps, optional email) | Working |
| Pay Yourself First Calculator | Working |
| Cost of Waiting Calculator (with chart and catch-up amount) | Working |
| Employee Benefits Checklist → printable question list for HR | Working (bonus) |
| Learn library: 12 original introductory articles with takeaways, tool links, disclosures | Built |
| Privacy Policy, Terms of Use, Financial Education Disclaimer | Drafts, marked for legal review |
| SEO metadata, Open Graph, `sitemap.xml`, `robots.txt`, 404 | Built |
| Compound Growth, Emergency Fund, Debt Payoff (snowball vs. avalanche), Employer Match, Life Insurance Needs calculators | Working (Phase 2) |
| Interactive Money Roadmap: check off steps, progress saved in the visitor's browser | Working (Phase 2) |
| Printable / save-as-PDF results on every calculator | Working (Phase 2) |

## Financial Reset Toolkit ($39), Stage 1 prototype

A synchronized personal finance dashboard at `/toolkit`: Net Worth Tracker (flagship), Paycheck Planner, Debt Freedom Tracker, Emergency Fund Builder, Investing Calculator, Employee Benefits Checklist and a 30-Day Money Reset with a scorecard. Numbers are entered once and flow across modules. Prototype only: fictional sample data and browser storage, no login or payments yet. Details, calculation notes and the Stage 2-4 plan: [`docs/TOOLKIT.md`](docs/TOOLKIT.md).

## 7-Week Client Success System (coach dashboard and client portal)

Phase 1 and the Week 1 pilot live at `/coach` and `/portal`, backed by Supabase (logins + database with row-level security) and Resend (email). Setup, security model and the step-by-step test guide are in [`docs/CLIENT-SUCCESS-SYSTEM.md`](docs/CLIENT-SUCCESS-SYSTEM.md). Until the Supabase environment variables are set, these pages show an "almost ready" notice and the public site is unaffected.

## Needs founder approval or external setup

| Item | Where | Current behavior |
|---|---|---|
| Prices and service descriptions | `src/config/site.ts` → `offers` | Shown as "proposed launch pricing" until `features.pricingApproved = true` |
| Founder milestones ($500K, 800 credit, etc.) | `src/config/site.ts` → `founderMilestones` | Shown with a "founder-reported, pending confirmation" note until `features.milestonesConfirmed = true` |
| About page and founder story copy | `src/app/about/page.tsx` | Draft in Gory's voice; please edit to taste |
| Founder and family photos | `ImagePlaceholder` usages | Labeled placeholders |
| Contact email | `NEXT_PUBLIC_CONTACT_EMAIL` | bedwardghllc@outlook.com |
| Form delivery (email) | Web3Forms key in `src/lib/send-lead.ts` | Connected: forms email bedwardghllc@outlook.com |
| Booking | `NEXT_PUBLIC_BOOKING_URL` | "Coming soon" note |
| Payments | `features.paymentsEnabled` | Disabled. Services are requested through the contact form |
| Legal pages | `src/app/{privacy,terms,disclaimer}` | Drafts with `[BRACKETED]` gaps; attorney review required |
| Benefits document uploads | `features.documentUploadsEnabled` | Deliberately not built |

## Getting started

Requirements: Node.js 20+.

```bash
npm install
cp .env.example .env.local   # then edit values
npm run dev                  # http://localhost:3000
```

Other scripts:

```bash
npm test          # calculator and scorecard unit tests (Node's built-in test runner)
npm run lint
npm run typecheck
npm run build && npm start
```

## Editing content

| What | File |
|---|---|
| Prices, services, contact, feature flags, founder milestones, navigation | `src/config/site.ts` |
| Scorecard questions, scoring bands, next steps | `src/content/scorecard.ts` |
| Six pillars | `src/content/pillars.ts` |
| Roadmap stages | `src/content/roadmap.ts` |
| Benefits list and HR questions | `src/content/benefits.ts` |
| Philosophy principles | `src/content/principles.ts` |
| Articles | `src/content/articles.ts` |
| Tools list | `src/content/tools.ts` |
| Calculator math | `src/lib/calculators.ts` |
| Brand colors and fonts | `src/app/globals.css` (`@theme`) and `src/app/layout.tsx` |

## Connecting form delivery

**Already connected:** the Web3Forms key for bedwardghllc@outlook.com is set in `src/lib/send-lead.ts` (Web3Forms keys are public by design). To use a different inbox, create a new key and set `NEXT_PUBLIC_WEB3FORMS_KEY` in Vercel, which overrides it.

**Setting up a new key (free, about 2 minutes):**

1. Go to https://web3forms.com, enter `bedwardghllc@outlook.com`, and click **Create Access Key**. The key arrives by email.
2. In Vercel → your project → **Settings → Environment Variables**, add `NEXT_PUBLIC_WEB3FORMS_KEY` with that key.
3. Redeploy. Every form (Roadmap requests, Scorecard results, Benefits Checklist, contact) now arrives in that inbox, including whether the visitor opted in to marketing emails.

**Alternative (webhook):**

All forms post to `/api/lead`, which validates input and, if `LEAD_WEBHOOK_URL` is set, forwards JSON like:

```json
{ "type": "scorecard", "email": "...", "name": "...", "marketingConsent": false,
  "service": "benefits", "message": "...", "context": { "score": 70 },
  "submittedAt": "2026-11-01T12:00:00Z", "source": "money-coach-website" }
```

The simplest no-code option: create a Zapier or Make "Catch Hook" webhook, paste its URL into `LEAD_WEBHOOK_URL`, and route submissions to Gmail, a Google Sheet, or your email marketing tool. Only add people to marketing lists when `marketingConsent` is `true`.

## Deploying to Vercel

1. Push this repository to GitHub.
2. In Vercel, **Add New → Project** and import the repo. The framework is detected automatically.
3. Add the environment variables from `.env.example`.
4. Deploy, then add your custom domain under **Settings → Domains** and update `NEXT_PUBLIC_SITE_URL`.

## Folder structure

```
src/
  app/                  # routes (one folder per page), API route, sitemap, robots
  components/
    ui/                 # shadcn/ui-style primitives (button, card, input, badge)
    layout/             # header, footer, logo
    home/               # homepage sections (pillars, roadmap stepper)
    tools/              # scorecard, calculators, benefits checklist, chart
  config/site.ts        # single source of truth for pricing and flags
  content/              # all editable copy and data
  lib/                  # calculator math, lead validation, utils
tests/                  # unit tests
docs/PLAN.md            # sitemap, visual system, homepage structure, conversion journey
```

## Compliance notes

MONEY COACH is positioned as education-first. The site does not claim any license or credential, does not give individualized investment, insurance, legal, or tax advice, shows all calculator results as hypothetical, never requires an email to see results, keeps marketing consent as a separate unchecked box, and does not collect SSNs, account credentials, medical information, or documents. There are no testimonials or client results. Keep it that way unless credentials and real, approved testimonials exist and a compliance review has been done.
