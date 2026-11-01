import type { Metadata } from "next";
import { features, formatOfferCadence, formatOfferPrice, getOffer, offers } from "@/config/site";
import { ButtonLink } from "@/components/ui/button";
import { PageHero, Section, SectionHeading } from "@/components/section";
import { PricingCards } from "@/components/pricing-cards";
import { ApprovalNote } from "@/components/disclosure";
import { CtaBand } from "@/components/cta-band";

export const metadata: Metadata = {
  title: "Coaching & Pricing",
  description: "Affordable financial coaching for working families. Start free, then choose a Money Clarity Session, Employee Benefits Checkup, the 7-Week Money Reset, or ongoing coaching.",
};

const faqs = [
  { q: "Is this financial advice?", a: "No. MONEY COACH provides financial education and coaching. We don't manage money, sell investments or insurance, or give individualized investment, legal, or tax advice. When you need those, we'll encourage you to work with a licensed professional." },
  { q: "Will you try to sell me insurance or investments?", a: "No. We don't sell financial products and we don't earn commissions. You pay for education and coaching, and that's it." },
  { q: "What do I need to share?", a: "Only what you're comfortable sharing, like general numbers about income, expenses, and debts. We never ask for Social Security numbers, account passwords, or medical information." },
  { q: "How do sessions happen?", a: "Sessions are held by video or phone. After you submit a request, we'll follow up to schedule a time that works for you." },
  { q: "How do I pay?", a: "Online payment isn't available yet. After you request a service, we'll confirm details and next steps with you directly before anything is charged." },
  { q: "Which service should I start with?", a: "Start with the free Scorecard. If you want lasting change with a coach keeping you accountable, the 7-Week Money Reset is our flagship program. If you have workplace benefits, the Employee Benefits Checkup is our most popular first step. If you feel overwhelmed, a Money Clarity Session is a great place to begin." },
];

export default function PricingPage() {
  const reset = getOffer("reset");
  return (
    <>
      <PageHero
        eyebrow="Coaching & pricing"
        title="Affordable help for real families."
        intro="Start free. When you want a coach in your corner, choose the level of support that fits your family and budget."
      >
        {!features.pricingApproved && (
          <ApprovalNote className="bg-white/10 text-ivory border-gold/40">Proposed launch pricing, subject to founder approval.</ApprovalNote>
        )}
      </PageHero>

      <Section tone="white">
        {reset && (
          <div className="mb-12 flex flex-col gap-6 rounded-[var(--radius-card)] border-2 border-gold bg-navy p-7 text-ivory shadow-lift sm:p-9 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Flagship coaching program</p>
              <h2 className="mt-2 text-3xl font-bold">{reset.name}</h2>
              <p className="mt-3 text-ivory/80">{reset.description}</p>
            </div>
            <div className="shrink-0 lg:text-right">
              <p className="font-display text-5xl font-bold">{formatOfferPrice(reset)}</p>
              <p className="text-sm text-ivory/70">for all seven weeks</p>
              <ButtonLink href={reset.href} variant="gold" className="mt-4">{reset.ctaLabel}</ButtonLink>
            </div>
          </div>
        )}
        <PricingCards />
      </Section>

      <Section>
        <SectionHeading eyebrow="Compare" title="At a glance" />
        <div className="mt-8 overflow-x-auto rounded-[var(--radius-card)] border border-navy/10 bg-white shadow-soft">
          <table className="w-full min-w-[36rem] text-left">
            <thead className="bg-navy text-ivory">
              <tr>
                <th scope="col" className="p-4 font-semibold sm:p-5">Service</th>
                <th scope="col" className="p-4 font-semibold sm:p-5">Price</th>
                <th scope="col" className="p-4 font-semibold sm:p-5">What you get</th>
              </tr>
            </thead>
            <tbody>
              {offers.map((o) => (
                <tr key={o.id} className={o.featured ? "bg-gold-50" : "border-t border-navy/8"}>
                  <th scope="row" className="p-4 font-semibold sm:p-5">{o.name}{o.featured && <span className="ml-2 text-xs font-semibold uppercase text-gold-600">Featured</span>}</th>
                  <td className="whitespace-nowrap p-4 sm:p-5">{formatOfferPrice(o)} <span className="text-sm text-slate-600">{formatOfferCadence(o)}</span></td>
                  <td className="p-4 text-slate-600 sm:p-5">{o.deliverable}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section tone="white">
        <SectionHeading eyebrow="Questions" title="Frequently asked questions" />
        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          {faqs.map((f) => (
            <details key={f.q} className="group rounded-2xl border border-navy/10 bg-ivory p-6 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold">
                {f.q}
                <span aria-hidden className="text-2xl text-emerald transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 leading-relaxed text-slate-600">{f.a}</p>
            </details>
          ))}
        </div>
      </Section>
      <CtaBand />
    </>
  );
}
