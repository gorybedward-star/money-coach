import Link from "next/link";
import type { Metadata } from "next";
import { Check, Lock } from "lucide-react";
import { getOffer } from "@/config/site";
import { PageHero, Section, SectionHeading } from "@/components/section";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/reveal";
import { BenefitsChecklist } from "@/components/tools/benefits-checklist";
import { PricingCard } from "@/components/pricing-cards";
import { CtaBand } from "@/components/cta-band";
import { benefitItems } from "@/content/benefits";

export const metadata: Metadata = {
  title: "Employee Benefits Checkup",
  description: "Are you leaving money on the table at work? Learn how to make the most of your 401(k) match, insurance, HSA, FSA, and other employer benefits.",
};

const steps = [
  { t: "Complete the Employee Benefits Checklist", d: "Tell us what you have, what you're unsure about, and what you don't use." },
  { t: "Review your benefits information", d: "We walk through your benefits guide or portal together, on a call. You stay in control of your documents." },
  { t: "Identify potentially overlooked opportunities", d: "Matches, protection gaps, health accounts, family benefits, and deadlines." },
  { t: "Receive your Benefits Opportunity Report", d: "A written summary you can act on." },
];

const report = [
  "Benefits you already have",
  "Potential opportunities to explore",
  "Specific questions to ask HR",
  "Deadlines that need confirmation",
  "Practical educational next steps",
];

export default function EmployeeBenefitsPage() {
  const checkup = getOffer("benefits")!;
  return (
    <>
      <PageHero
        eyebrow="Signature service · Employee Benefits Checkup"
        title="Are You Leaving Money on the Table at Work?"
        intro="You work hard for your benefits. Learn how to make the most of them."
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <ButtonLink href={checkup.href} size="lg" variant="gold">Request a ${checkup.price} Checkup</ButtonLink>
          <ButtonLink href="#checklist" size="lg" variant="outlineLight">Start the free checklist</ButtonLink>
        </div>
      </PageHero>

      <Section tone="white">
        <SectionHeading eyebrow="What we review" title={`${benefitItems.length} benefits many families never fully use`} intro="Your paycheck is only part of your compensation. We look at the whole package." />
        <ul className="mt-12 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          {benefitItems.map((b) => (
            <li key={b.id} className="flex items-start gap-3 border-b border-navy/8 pb-4">
              <Check className="mt-0.5 size-5 shrink-0 text-emerald" aria-hidden />
              <span className="font-medium">{b.name}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section className="!py-10">
        <Link href="/federal-employees" className="flex flex-col justify-between gap-3 rounded-[var(--radius-card)] border border-emerald/30 bg-emerald-50 p-6 transition-colors hover:border-emerald sm:flex-row sm:items-center">
          <span>
            <span className="block font-display text-xl font-bold">Federal employee?</span>
            <span className="mt-1 block text-slate-600">Visit the Federal Employee Wealth Center for TSP, FERS, and federal benefits education.</span>
          </span>
          <span className="shrink-0 font-semibold text-emerald-700">Explore the Wealth Center →</span>
        </Link>
      </Section>

      <Section>
        <SectionHeading eyebrow="How it works" title="Four simple steps" />
        <ol className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <Reveal as="li" key={s.t} delay={i * 70}>
              <div className="h-full rounded-[var(--radius-card)] border border-navy/8 bg-white p-7 shadow-soft">
                <span className="flex size-11 items-center justify-center rounded-full bg-navy font-display text-lg font-bold text-gold">{i + 1}</span>
                <h3 className="mt-5 text-lg font-bold leading-snug">{s.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.d}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </Section>

      <Section tone="navy">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading light eyebrow="Your deliverable" title="The Benefits Opportunity Report" intro="A clear, written summary of what you have and what to look into next." />
            <ul className="mt-8 space-y-3">
              {report.map((r) => (
                <li key={r} className="flex items-center gap-3 text-ivory/90"><Check className="size-5 text-gold" aria-hidden /> {r}</li>
              ))}
            </ul>
            <p className="mt-8 flex gap-3 rounded-2xl bg-white/5 p-4 text-sm leading-relaxed text-ivory/75">
              <Lock className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
              We never ask for Social Security numbers, account passwords, or medical information. Document uploads are not available on this site.
            </p>
          </div>
          <div className="mx-auto w-full max-w-sm">
            <PricingCard offer={checkup} />
          </div>
        </div>
      </Section>

      <Section id="checklist">
        <SectionHeading
          eyebrow="Free tool"
          title="The Employee Benefits Checklist"
          intro="Mark each benefit, then build your personal list of questions to ask HR. It's free, takes about five minutes, and nothing is saved or sent unless you choose to email it."
        />
        <div className="mt-10"><BenefitsChecklist /></div>
      </Section>

      <Section tone="white" className="!py-12">
        <p className="mx-auto max-w-3xl text-center text-sm leading-relaxed text-slate-600">
          The Employee Benefits Checkup is an educational review. MONEY COACH does not guarantee benefit eligibility, coverage, or savings. Your
          employer&rsquo;s plan documents and plan administrators determine actual coverage and eligibility. We do not sell insurance or
          investment products.
        </p>
      </Section>
      <CtaBand title="Open enrollment is the best time to review." intro="Request a Benefits Checkup before your deadline, or start with the free Scorecard." />
    </>
  );
}
