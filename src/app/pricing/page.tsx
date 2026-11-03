import type { Metadata } from "next";
import { features, formatOfferCadence, formatOfferPrice, offers, resetGuarantee } from "@/config/site";
import { PageHero, Section, SectionHeading } from "@/components/section";
import { PricingCards } from "@/components/pricing-cards";
import { ClientPath } from "@/components/client-path";
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
  { q: "Which service should I start with?", a: "Start with the free Scorecard, then book a free 15-minute call. If you want lasting change with a coach keeping you accountable, the 7-Week Money Reset is our core program. If you only have one specific question, a Money Clarity Session or Employee Benefits Checkup is a good fit." },
  { q: "What if the Money Reset isn't right for me?", a: resetGuarantee.detail + " The guarantee covers the coaching fee only. Like all coaching, it doesn't promise any specific financial result." },
];

export default function PricingPage() {
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
        <SectionHeading
          eyebrow="Your path"
          title="Four simple steps, one at a time."
          intro="Start free and move up only when you're ready. Most families begin with the Scorecard and a free call, then join the 7-Week Money Reset."
        />
        <div className="mt-10">
          <ClientPath />
        </div>
      </Section>

      <Section>
        <SectionHeading
          eyebrow="Prefer a single session?"
          title="One-time help for a specific question."
          intro="Not ready for seven weeks? These focused sessions are a good fit, and many families use one as a first step."
        />
        <div className="mt-10">
          <PricingCards ids={["clarity", "benefits"]} className="md:grid-cols-2 xl:grid-cols-2 lg:max-w-4xl" />
        </div>
      </Section>

      <Section tone="white">
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

      <Section>
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
