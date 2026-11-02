import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Scale } from "lucide-react";
import { PageHero, Section } from "@/components/section";
import { ToolCard } from "@/components/tool-card";
import { Disclosure } from "@/components/disclosure";
import { CtaBand } from "@/components/cta-band";
import { Badge } from "@/components/ui/badge";
import { tools, type ToolInfo } from "@/content/tools";
import { fedTools } from "@/content/federal/tools";
import { roadmapStages } from "@/content/roadmap";

export const metadata: Metadata = {
  title: "Free Money Tools",
  description: "Free calculators and assessments for working families, organized by the six stages of the Money Roadmap: net worth, budget, emergency fund, protection, debt payoff, and investing.",
};

/** Stage 6 is about growing and passing on what you build, so it reuses the net worth tracker and points to the Learn library. */
const stageSixTools: ToolInfo[] = [
  { href: "/tools/net-worth", title: "Track Your Net Worth", description: "Save a snapshot each month and watch what you own grow faster than what you owe.", icon: Scale, available: true, time: "2 min" },
  { href: "/learn", title: "Learn Library", description: "Short, plain-English articles on estate planning basics, beneficiaries, and teaching kids about money.", icon: BookOpen, available: true },
];

export default function ToolsPage() {
  const live = tools.filter((t) => t.available);
  const start = live.filter((t) => (t.stage ?? 0) === 0);
  const soon = tools.filter((t) => !t.available);
  const forStage = (n: number) => (n === 6 ? stageSixTools : live.filter((t) => t.stage === n));

  return (
    <>
      <PageHero
        eyebrow="Free money tools"
        title="The right tool for every stage."
        intro="Organized in the same order as the Money Roadmap. Start by seeing where you stand, then work through each stage. Simple calculators that explain their assumptions, with no email required."
      />

      <nav aria-label="Jump to a roadmap stage" className="sticky top-18 z-20 border-b border-navy/8 bg-ivory/95 backdrop-blur no-print">
        <ol className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-3 sm:px-6 lg:px-8">
          <li><Link href="#start-here" className="inline-flex whitespace-nowrap rounded-full bg-navy px-4 py-1.5 text-sm font-semibold text-ivory">Start here</Link></li>
          {roadmapStages.map((s) => (
            <li key={s.id}>
              <Link href={`#tools-${s.id}`} className="inline-flex whitespace-nowrap rounded-full border border-navy/15 bg-white px-4 py-1.5 text-sm font-semibold text-navy hover:border-emerald hover:text-emerald">
                {s.n}. {s.title}
              </Link>
            </li>
          ))}
        </ol>
      </nav>

      <Section id="start-here" className="scroll-mt-32 !pb-6">
        <Badge variant="gold">Start here</Badge>
        <h2 className="mt-4 text-3xl font-bold sm:text-4xl">See where you stand</h2>
        <p className="mt-3 max-w-2xl leading-relaxed text-slate-600">
          Two quick checkups before anything else: your money habits, and your starting line. Your net worth tracker also points to your next stage on the Roadmap.
        </p>
        <ul className="mt-8 grid gap-5 md:grid-cols-2">
          {start.map((t) => <li key={t.title}><ToolCard tool={t} /></li>)}
        </ul>
      </Section>

      {roadmapStages.map((s) => (
        <Section key={s.id} id={`tools-${s.id}`} className="scroll-mt-32 !py-10">
          <div className="border-t border-navy/10 pt-10">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-emerald">Stage {s.n}</p>
                <h2 className="mt-1 text-2xl font-bold sm:text-3xl">{s.title}</h2>
                <p className="mt-2 max-w-2xl text-slate-600">{s.summary}</p>
              </div>
              <Link href={`/roadmap#${s.id}`} className="shrink-0 text-sm font-semibold text-emerald hover:underline">Stage {s.n} checklist →</Link>
            </div>
            <ul className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {forStage(s.n).map((t) => <li key={t.title}><ToolCard tool={t} /></li>)}
            </ul>
          </div>
        </Section>
      ))}

      <Section className="!pt-10">
        <div className="border-t border-navy/10 pt-10">
          <h2 className="text-2xl font-bold sm:text-3xl">For federal employees</h2>
          <p className="mt-2 text-slate-600">TSP and FERS tools from the Federal Employee Wealth Center.</p>
          <ul className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {fedTools.map((t) => <li key={t.title}><ToolCard tool={t} /></li>)}
          </ul>
        </div>
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
