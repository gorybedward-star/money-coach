import type { Metadata } from "next";
import { PageHero, Section } from "@/components/section";
import { ToolCard } from "@/components/tool-card";
import { Disclosure } from "@/components/disclosure";
import { CtaBand } from "@/components/cta-band";
import { tools } from "@/content/tools";
import { fedTools } from "@/content/federal/tools";

export const metadata: Metadata = {
  title: "Free Money Tools",
  description: "Free financial calculators and assessments for working families: Family Money Scorecard, Pay Yourself First, Cost of Waiting, and more.",
};

export default function ToolsPage() {
  const live = tools.filter((t) => t.available);
  const soon = tools.filter((t) => !t.available);
  return (
    <>
      <PageHero eyebrow="Free money tools" title="Clear numbers. No email required." intro="Simple calculators that explain their assumptions and show hypothetical illustrations, never guarantees." />
      <Section>
        <h2 className="sr-only">Available tools</h2>
        <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {live.map((t) => <li key={t.title}><ToolCard tool={t} /></li>)}
        </ul>
        <h2 className="mt-16 text-2xl font-bold">For federal employees</h2>
        <p className="mt-2 text-slate-600">TSP and FERS tools from the Federal Employee Wealth Center.</p>
        <ul className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {fedTools.map((t) => <li key={t.title}><ToolCard tool={t} /></li>)}
        </ul>
        {soon.length > 0 && (
          <>
            <h2 className="mt-16 text-2xl font-bold">Coming soon</h2>
            <ul className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {soon.map((t) => <li key={t.title}><ToolCard tool={t} /></li>)}
            </ul>
          </>
        )}
        <Disclosure className="mt-12" />
      </Section>
      <CtaBand />
    </>
  );
}
