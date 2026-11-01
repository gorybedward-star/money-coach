import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Lock, X } from "lucide-react";
import { getOffer } from "@/config/site";
import { getLimits, SOURCES } from "@/config/federal-rules";
import { PageHero, Section, SectionHeading } from "@/components/section";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/reveal";
import { ToolCard } from "@/components/tool-card";
import { ArticleCard } from "@/components/article-card";
import { CtaBand } from "@/components/cta-band";
import { FedModuleCard, FersMatchChart } from "@/components/federal/module-card";
import { DataTable, IndependenceNotice, SourceList } from "@/components/federal/shared";
import { fedModules } from "@/content/federal/modules";
import { fedTools } from "@/content/federal/tools";
import { federalArticles } from "@/content/federal/articles";

export const metadata: Metadata = {
  title: "Federal Employee Wealth Center",
  description:
    "Independent, plain-English education for federal employees: understand your TSP, agency matching, Traditional vs. Roth, FERS, and your federal benefits. Not affiliated with the TSP, FRTIB, or OPM.",
};

const included = [
  "TSP fundamentals: contribution rate, agency matching, Traditional vs. Roth, and limits",
  "How your FERS annuity, Social Security, and TSP fit together",
  "FEGLI, FEHB, FEDVIP, and FSAFEDS awareness review",
  "Beneficiary and Open Season reminders",
  "A written Benefits Opportunity Report with questions for your HR office",
];

const notIncluded = [
  "Recommendations to buy, sell, or hold specific TSP funds or securities",
  "Personalized TSP fund allocations or investment management",
  "Tax, legal, or regulated retirement advice",
  "Logging into or handling your TSP or agency accounts",
];

export default function FederalEmployeesPage() {
  const checkup = getOffer("benefits")!;
  const L = getLimits();
  const tspModules = fedModules.filter((m) => m.group === "tsp");
  const benefitModules = fedModules.filter((m) => m.group === "benefits");

  return (
    <>
      <PageHero
        eyebrow="Federal Employee Wealth Center"
        title="Your Federal Benefits Are Part of Your Wealth."
        intro="Understand your TSP, maximize eligible employer contributions, learn how your federal retirement benefits work together, and protect your family's financial future."
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/federal-employees/tsp-checkup" size="lg" variant="gold">
            Get My Free TSP Checkup <ArrowRight />
          </ButtonLink>
          <ButtonLink href="/federal-employees/calculators" size="lg" variant="outlineLight">
            Explore TSP Calculators
          </ButtonLink>
        </div>
        <IndependenceNotice tone="dark" className="mt-8" />
      </PageHero>

      <Section tone="white">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="Start here"
              title="Is your 5% turning into 10%?"
              intro="Under FERS, your agency contributes 1% of basic pay automatically and matches up to another 4% when you contribute 5%. Many employees never confirm they are receiving all of it."
            />
            <ul className="mt-8 space-y-3">
              {[
                "Find your contribution rate on your Leave and Earnings Statement",
                "Make sure your contributions last through every pay period",
                `Know your ${L.year} limit: $${L.electiveDeferral.toLocaleString()} plus catch-up if eligible`,
              ].map((t) => (
                <li key={t} className="flex items-start gap-3"><Check className="mt-0.5 size-5 shrink-0 text-emerald" aria-hidden /> {t}</li>
              ))}
            </ul>
            <ButtonLink href="/federal-employees/calculators/agency-match" className="mt-8">Check my agency match <ArrowRight /></ButtonLink>
          </div>
          <FersMatchChart />
        </div>
      </Section>

      <Section id="calculators">
        <SectionHeading eyebrow="Free tools" title="TSP calculators and the free TSP Checkup" intro="Every tool runs in your browser, shows its assumptions, and never asks for account numbers, passwords, or personal records." />
        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {fedTools.map((t, i) => (
            <Reveal as="li" key={t.href} delay={(i % 3) * 60}><ToolCard tool={t} /></Reveal>
          ))}
        </ul>
      </Section>

      <Section tone="white" id="tsp-education">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading eyebrow="TSP Education Center" title="Eleven short modules on how the TSP works" intro="Plain English, official sources, and the risks spelled out. No jargon, no sales pitch." />
          <ButtonLink href="/federal-employees/tsp-education" variant="outline" className="shrink-0">View all TSP modules</ButtonLink>
        </div>
        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {tspModules.slice(0, 6).map((m, i) => (
            <Reveal as="li" key={m.slug} delay={(i % 3) * 60}><FedModuleCard module={m} index={i} /></Reveal>
          ))}
        </ul>
        <div className="mt-10 rounded-[var(--radius-card)] border border-gold/50 bg-gold-50 p-6 leading-relaxed sm:p-8">
          <p className="font-display text-xl font-bold">Three things every TSP participant should know</p>
          <ul className="mt-4 grid gap-4 md:grid-cols-3">
            <li><strong>The G Fund is not a bank savings account.</strong> It is not FDIC-insured, and over long periods inflation can erode what it can buy.</li>
            <li><strong>Market-based funds can lose value.</strong> The F, C, S, I, and L Funds can decline, including near retirement.</li>
            <li><strong>Outcomes are not guaranteed.</strong> Calculators show illustrations based on assumptions, not predictions.</li>
          </ul>
        </div>
      </Section>

      <Section>
        <SectionHeading eyebrow="At a glance" title="FERS and CSRS: who receives agency contributions?" />
        <div className="mt-10">
          <DataTable
            caption="TSP features by retirement system (civilian employees)"
            head={["", "FERS", "CSRS / CSRS Offset"]}
            rows={[
              ["Your own contributions", "Yes, Traditional and/or Roth", "Yes, Traditional and/or Roth"],
              ["Agency Automatic (1%)", "Yes, every pay period", "No"],
              ["Agency Matching", "Up to 4% when you contribute 5%", "No"],
              [`${L.year} elective deferral limit`, `$${L.electiveDeferral.toLocaleString()}`, `$${L.electiveDeferral.toLocaleString()}`],
              ["Catch-up (age 50+)", `$${L.catchUp50.toLocaleString()} ($${L.catchUp60to63.toLocaleString()} at ages 60–63)`, `$${L.catchUp50.toLocaleString()} ($${L.catchUp60to63.toLocaleString()} at ages 60–63)`],
              ["Retirement benefit", "FERS annuity + Social Security + TSP", "CSRS annuity + TSP (Offset also includes Social Security)"],
            ]}
          />
        </div>
        <SourceList className="mt-6" sources={[SOURCES.tspContributionTypes, SOURCES.tspLimits, SOURCES.opmFers]} />
      </Section>

      <Section tone="sand" id="benefits">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading eyebrow="Federal Benefits Education" title="Your benefits work together" intro="Introductory modules on FERS, Social Security, FEGLI, FEHB, FEDVIP, FSAFEDS, and retirement milestones. Eligibility and coverage depend on applicable rules and your individual circumstances." />
          <ButtonLink href="/federal-employees/benefits" variant="outline" className="shrink-0">View all benefits modules</ButtonLink>
        </div>
        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {benefitModules.slice(0, 4).map((m, i) => (
            <Reveal as="li" key={m.slug} delay={(i % 4) * 60}><FedModuleCard module={m} /></Reveal>
          ))}
        </ul>
      </Section>

      <Section tone="navy" id="coaching">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <SectionHeading
              light
              eyebrow="Optional, affordable coaching"
              title={`${checkup.name} for federal employees`}
              intro="An educational review of your federal benefits, including TSP fundamentals, retirement benefit awareness, and overlooked benefit opportunities. One focused conversation and a written report you can act on."
            />
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-gold">What we cover</p>
                <ul className="mt-4 space-y-3 text-ivory/90">
                  {included.map((t) => <li key={t} className="flex items-start gap-3"><Check className="mt-0.5 size-5 shrink-0 text-gold" aria-hidden /> {t}</li>)}
                </ul>
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-gold">What it is not</p>
                <ul className="mt-4 space-y-3 text-ivory/75">
                  {notIncluded.map((t) => <li key={t} className="flex items-start gap-3"><X className="mt-0.5 size-5 shrink-0 text-ivory/50" aria-hidden /> {t}</li>)}
                </ul>
              </div>
            </div>
          </div>
          <div className="h-fit rounded-[var(--radius-card)] bg-ivory p-8 text-navy shadow-lift">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald">{checkup.deliverable}</p>
            <p className="mt-3 font-display text-5xl font-bold">${checkup.price}</p>
            <p className="mt-1 text-sm text-slate-600">One-time · education only</p>
            <p className="mt-5 leading-relaxed text-slate-600">
              Start with the free TSP Checkup. If you want a coach to walk through your benefits with you, request a Checkup and we&rsquo;ll follow up by email.
            </p>
            <div className="mt-6 grid gap-3">
              <ButtonLink href={checkup.href}>Request a ${checkup.price} Checkup</ButtonLink>
              <ButtonLink href="/federal-employees/tsp-checkup" variant="outline">Take the free TSP Checkup first</ButtonLink>
            </div>
            <p className="mt-5 flex items-start gap-2 text-xs leading-relaxed text-slate-600">
              <Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden />
              We never ask for TSP passwords, Social Security numbers, account statements, or federal personnel records.
            </p>
          </div>
        </div>
      </Section>

      <Section tone="white" id="articles">
        <SectionHeading eyebrow="Content library" title="Articles for federal employees" intro="Original, plain-English articles with links to tsp.gov, opm.gov, and irs.gov." />
        <ul className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {federalArticles.map((a, i) => (
            <Reveal as="li" key={a.slug} delay={(i % 3) * 60}><ArticleCard article={a} /></Reveal>
          ))}
        </ul>
        <p className="mt-8 text-sm text-slate-600">
          Looking for official tools? The TSP offers its own calculators at{" "}
          <a href={SOURCES.tspCalculators.href} target="_blank" rel="noopener noreferrer" className="font-medium text-emerald underline underline-offset-2">tsp.gov</a>.
          You can find more MONEY COACH articles in the <Link href="/learn" className="font-medium text-emerald underline underline-offset-2">Learn library</Link>.
        </p>
      </Section>

      <Section className="!py-10">
        <IndependenceNotice />
      </Section>

      <CtaBand
        title="Your TSP is part of your pay. Make sure you're receiving all of it."
        intro="Take the free TSP Checkup in about three minutes. No account details, no email required to see your results."
        primary={{ href: "/federal-employees/tsp-checkup", label: "Get My Free TSP Checkup" }}
        secondary={{ href: "/federal-employees/calculators", label: "Explore TSP Calculators" }}
      />
    </>
  );
}
