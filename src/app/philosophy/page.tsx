import type { Metadata } from "next";
import { PageHero, Section, SectionHeading } from "@/components/section";
import { PillarsGrid } from "@/components/home/pillars-grid";
import { CtaBand } from "@/components/cta-band";
import { Reveal } from "@/components/reveal";
import { Disclosure } from "@/components/disclosure";
import { ButtonLink } from "@/components/ui/button";
import { principles } from "@/content/principles";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Our Philosophy",
  description: "The eight principles and six pillars behind MONEY COACH: pay yourself first, eliminate costly debt, invest consistently, protect your family, and build a legacy.",
};

const assets = [
  { t: "Retirement investments", d: "Workplace plans and IRAs let you own a slice of the economy, often with tax advantages." },
  { t: "Homeownership", d: "A home can build equity over time, and it comes with real costs: maintenance, taxes, insurance, and less flexibility." },
  { t: "Rental properties", d: "Rentals can produce income and appreciation, and they are a business with real risk and responsibility." },
  { t: "Business ownership", d: "Owning a business, even a small side business, can turn skills into an asset." },
];

export default function PhilosophyPage() {
  return (
    <>
      <PageHero
        eyebrow="Our philosophy"
        title="Wealth is built through consistent decisions, not extraordinary income."
        intro={site.promise}
      />

      <Section>
        <SectionHeading eyebrow="What we believe" title="Eight principles we live and teach" intro="Old ideas, proven by time, explained for today's working families." />
        <ol className="mt-12 grid gap-5 md:grid-cols-2">
          {principles.map((p, i) => (
            <Reveal as="li" key={p.title} delay={(i % 2) * 80}>
              <div className="flex h-full gap-5 rounded-[var(--radius-card)] border border-navy/8 bg-white p-7 shadow-soft">
                <span className="font-display text-3xl font-bold text-gold">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="text-xl font-bold leading-snug">{p.title}</h3>
                  <p className="mt-3 leading-relaxed text-slate-600">{p.body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </ol>
      </Section>

      <Section tone="white" id="pillars">
        <SectionHeading eyebrow="The framework" title="Six pillars of family wealth" intro="Every lesson, tool, and coaching session maps back to one of these six pillars." />
        <div className="mt-12"><PillarsGrid detailed /></div>
      </Section>

      <Section tone="sand" id="own-assets">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
          <SectionHeading eyebrow="Pillar 5" title="From earning to owning" intro="A paycheck stops when the work stops. Assets can keep working. Understanding your options, and their risks, is part of building wealth." />
          <ul className="grid gap-4 sm:grid-cols-2">
            {assets.map((a) => (
              <li key={a.t} className="rounded-2xl bg-white p-6 shadow-soft">
                <p className="font-bold">{a.t}</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{a.d}</p>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section>
        <div className="mx-auto max-w-3xl text-center">
          <SectionHeading center eyebrow="How we teach" title="No shame. No jargon. No pressure." intro="Many of us were never taught how money works. That isn't a personal failure, and it's never too late. We meet you where you are, explain things plainly, and never sell you a financial product." />
          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink href="/roadmap" size="lg">See the Money Roadmap</ButtonLink>
            <ButtonLink href="/tools/scorecard" size="lg" variant="outline">Take the Scorecard</ButtonLink>
          </div>
          <Disclosure className="mt-12 text-left" />
        </div>
      </Section>
      <CtaBand />
    </>
  );
}
