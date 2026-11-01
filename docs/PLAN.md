# MONEY COACH — Website Plan (Phase 1)

_Building Wealth. Protecting Families. Creating Legacies._

This is the blueprint the Phase 1 build follows. Anything marked **[Founder approval]** or **[External setup]** is not live until Gory signs off or the integration is connected.

---

## 1. Sitemap

| # | Page | Route | Phase 1 status |
|---|------|-------|----------------|
| 1 | Home | `/` | Full build |
| 2 | Our Philosophy | `/philosophy` | Full build (8 principles + 6 pillars) |
| 3 | Money Roadmap | `/roadmap` | Overview of 6 stages with links; interactive checklists in Phase 2 |
| 4 | Employee Benefits | `/employee-benefits` | Full landing page for the $149 Checkup + free checklist |
| 5 | Free Tools | `/tools` | Hub page |
|   | ↳ Family Money Scorecard | `/tools/scorecard` | Fully functional |
|   | ↳ Pay Yourself First Calculator | `/tools/pay-yourself-first` | Fully functional |
|   | ↳ Cost of Waiting Calculator | `/tools/cost-of-waiting` | Fully functional |
|   | ↳ 5 other calculators | listed on hub | "Coming soon" (Phase 2) |
| 6 | Coaching & Pricing | `/pricing` | Full build, prices from one config file |
| 7 | Learn | `/learn` | Library of 12 topics; 3 starter articles written, rest marked Phase 2 |
| 8 | About Gory | `/about` | Full build |
| 9 | Get Started | `/get-started` | Free Roadmap request + contact form + booking placeholder |
| — | Privacy Policy | `/privacy` | Draft, needs legal review |
| — | Terms of Use | `/terms` | Draft, needs legal review |
| — | Financial Education Disclaimer | `/disclaimer` | Draft, needs legal review |

Also: `sitemap.xml`, `robots.txt`, per-page SEO metadata, and a custom 404.

## 2. Visual system

**Colors** (all text pairs checked for WCAG AA contrast)

| Token | Hex | Use |
|---|---|---|
| Navy | `#10243A` | Headlines, dark sections, footer, primary text |
| Ivory | `#FAF8F2` | Page background |
| Emerald | `#167D68` | Primary buttons, links, positive results |
| Gold | `#C9A45C` | Accents, highlights, "featured" badges, rules (decorative on navy; never small text on ivory) |
| Slate | `#64748B` | Secondary text, captions |

**Type:** Fraunces (serif display, bold, warm and premium) for headlines; Inter for body and UI. Both free Google Fonts, self-hosted by Next.js, so no extra requests.

**Shape and spacing:** generous section padding (96px desktop / 64px mobile), 16–24px rounded cards, soft shadows, thin gold rules as section accents.

**Motion:** subtle fade-up on scroll, button hover lift, animated result bars in tools. All motion turns off for people who set "reduce motion".

**Imagery:** placeholders sized and labeled for authentic, diverse family photography plus a professional founder portrait. **[Founder approval]** Real photos are needed before launch.

**Components:** shadcn/ui-style Button, Card, Input, Label, Select, Badge, Accordion; Lucide icons.

## 3. Homepage structure

1. **Hero:** "Your Family Deserves More Than a Paycheck." + subheadline, CTAs "Get My Free Money Roadmap" / "Explore Free Money Tools", trust line "No shame. No jargon. No pressure.", family photo placeholder.
2. **Meet Gory:** portrait placeholder, founder intro quote, milestone strip (started at 18, ~$500K net worth, ~800 credit, rental properties, family protected), labeled as founder-reported and not typical.
3. **Six Pillars of Family Wealth:** Keep, Protect, Eliminate Debt, Grow, Own, Legacy.
4. **Your Paycheck Is Only Part of Your Compensation:** benefits teaser, leads to the $149 Checkup.
5. **Free Family Money Scorecard:** teaser with sample question, "Take the 3-minute Scorecard".
6. **Six-Stage Money Roadmap:** horizontal stepper.
7. **Featured calculators:** Pay Yourself First, Cost of Waiting, plus a "more coming" card.
8. **Affordable coaching:** five offers, Benefits Checkup featured.
9. **Learn:** three article cards.
10. **Final CTA:** "You don't have to be wealthy to start building wealth. You just have to start."

## 4. Customer conversion journey

```
Free Education  →  Free Money Scorecard  →  Personalized Money Roadmap  →  Optional Coaching Session  →  Ongoing Relationship
 (Learn, tools)     (results, no email)      (optional email + consent)     ($149 Benefits Checkup,        ($79/mo coaching)
                                                                              $99 Clarity, $299 Roadmap)
```

- **Lead magnet:** Free Family Money Roadmap, offered at the end of the Scorecard, on every calculator, and on Get Started.
- **Primary paid offer:** $149 Employee Benefits Checkup, featured on Home, Benefits, and Pricing.
- **Every page ends with one clear next step**, never more than two CTAs per section.
- **Email capture** always has a separate, unchecked marketing-consent box. Results never require an email.

## 5. What needs founder approval or external setup

| Item | Type | Phase 1 behavior |
|---|---|---|
| Prices and service descriptions | Founder approval | Shown as "proposed launch pricing" from `src/config/site.ts` |
| Founder milestones ($500K, 800 credit, etc.) | Founder approval | Shown with "founder-reported" note |
| Founder and family photos | Founder approval | Labeled placeholders |
| Email delivery / newsletter (e.g. Resend, ConvertKit) | External setup | Forms validate and post to an API route that logs only; the UI says "we'll follow up" honestly. Wire a provider by setting env vars |
| Booking (e.g. Cal.com, Calendly) | External setup | Placeholder that links to the contact form |
| Payments (e.g. Stripe) | Founder approval + External | Disabled. "Request this service" goes to the contact form |
| Privacy, Terms, Disclaimer | Legal review | Drafts, clearly marked |
| Domain, analytics | External setup | Not included |
| Benefits document uploads | Deliberately disabled | Not built until a secure handling process exists |
