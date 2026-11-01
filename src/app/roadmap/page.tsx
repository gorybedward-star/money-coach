import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Flag, Wrench } from "lucide-react";
import { PageHero, Section } from "@/components/section";
import { RoadmapStepper } from "@/components/home/roadmap-stepper";
import { CtaBand } from "@/components/cta-band";
import { Disclosure } from "@/components/disclosure";
import { Badge } from "@/components/ui/badge";
import { roadmapStages } from "@/content/roadmap";

export const metadata: Metadata = {
  title: "Money Roadmap",
  description: "A six-stage journey from knowing your numbers to building and transferring wealth, with milestones, checklists, and free tools.",
};

export default function RoadmapPage() {
  return (
    <>
      <PageHero
        eyebrow="The Money Roadmap"
        title="Six stages from paycheck to legacy."
        intro="A clear, step-by-step path for working families. Stages often overlap, and your priorities may differ from another household's. Use the Roadmap as a guide, not a rulebook."
      />
      <Section tone="white" className="!py-12">
        <RoadmapStepper />
      </Section>

      {roadmapStages.map((s, i) => (
        <Section key={s.id} id={s.id} tone={i % 2 ? "white" : "ivory"}>
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <div>
              <Badge variant="gold">Stage {s.n}</Badge>
              <h2 className="mt-4 text-3xl font-bold sm:text-4xl">{s.title}</h2>
              <p className="mt-4 text-lg font-medium text-emerald">{s.summary}</p>
              <p className="mt-4 leading-relaxed text-slate-600">{s.why}</p>
              <div className="mt-8">
                <p className="flex items-center gap-2 font-semibold"><Wrench className="size-4 text-emerald" aria-hidden /> Helpful tools</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {s.tools.map((t) => (
                    <li key={t.label}>
                      {t.available ? (
                        <Link href={t.href} className="inline-flex rounded-full border border-emerald/30 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 hover:border-emerald">{t.label}</Link>
                      ) : (
                        <span className="inline-flex rounded-full border border-navy/10 px-4 py-2 text-sm text-slate-600">{t.label}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="rounded-[var(--radius-card)] bg-navy p-6 text-ivory">
                <p className="flex items-center gap-2 font-semibold text-gold"><Flag className="size-4" aria-hidden /> Milestones</p>
                <ul className="mt-4 space-y-3 text-sm leading-relaxed">
                  {s.milestones.map((m) => <li key={m} className="border-l-2 border-gold/50 pl-3">{m}</li>)}
                </ul>
              </div>
              <div className="rounded-[var(--radius-card)] border border-navy/10 bg-white p-6 shadow-soft">
                <p className="flex items-center gap-2 font-semibold"><CheckCircle2 className="size-4 text-emerald" aria-hidden /> Checklist</p>
                <ul className="mt-4 space-y-3 text-sm leading-relaxed">
                  {s.checklist.map((c) => (
                    <li key={c} className="flex gap-2.5"><span aria-hidden className="mt-1 size-3.5 shrink-0 rounded border-2 border-emerald/50" />{c}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Section>
      ))}

      <Section>
        <Disclosure>
          The Roadmap is general education. Every household is different, and the right order of priorities depends on your situation. Consider
          speaking with licensed professionals about investment, insurance, legal, and tax decisions.
        </Disclosure>
      </Section>
      <CtaBand title="Not sure which stage you're in?" intro="The free Family Money Scorecard shows where you stand and suggests three next steps in about three minutes." />
    </>
  );
}
