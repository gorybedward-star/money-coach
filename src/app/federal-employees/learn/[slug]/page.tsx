import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Lightbulb, Wrench } from "lucide-react";
import { fedModules, getFedModule, type ModuleBlock } from "@/content/federal/modules";
import { Callout, DataTable, FedPageHeader, IndependenceNotice, SourceList } from "@/components/federal/shared";
import { FedModuleCard } from "@/components/federal/module-card";
import { FedCtaBand } from "@/components/federal/fed-cta";

export function generateStaticParams() {
  return fedModules.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const m = getFedModule(slug);
  if (!m) return {};
  return { title: m.title, description: m.summary };
}

function Block({ b }: { b: ModuleBlock }) {
  if ("h" in b) return <h2>{b.h}</h2>;
  if ("ul" in b) return <ul>{b.ul.map((li) => <li key={li}>{li}</li>)}</ul>;
  if ("table" in b) return <div className="not-prose"><DataTable {...b.table} /></div>;
  if ("callout" in b) return <Callout tone={b.tone}>{b.callout}</Callout>;
  return <p>{b.p}</p>;
}

export default async function ModulePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const m = getFedModule(slug);
  if (!m) notFound();
  const group = fedModules.filter((x) => x.group === m.group);
  const idx = group.findIndex((x) => x.slug === m.slug);
  const next = group.slice(idx + 1).concat(group.slice(0, idx)).slice(0, 3);
  const hub = m.group === "tsp" ? { href: "/federal-employees/tsp-education", label: "TSP Education Center" } : { href: "/federal-employees/benefits", label: "Federal Benefits Education" };

  return (
    <>
      <FedPageHeader title={m.title} intro={m.summary} back={hub} eyebrow={`${hub.label} · Module ${idx + 1} of ${group.length} · ${m.minutes} min`} />
      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="prose-mc">
          {m.blocks.map((b, i) => <Block key={i} b={b} />)}
        </div>

        <aside className="mt-12 rounded-[var(--radius-card)] border-l-4 border-gold bg-gold-50 p-6 sm:p-8">
          <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gold-600"><Lightbulb className="size-4" aria-hidden /> Key points</p>
          <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed">
            {m.keyPoints.map((k) => <li key={k}>{k}</li>)}
          </ul>
        </aside>

        {m.tools && (
          <div className="mt-8 rounded-2xl border border-navy/10 bg-white p-6">
            <p className="flex items-center gap-2 font-semibold"><Wrench className="size-4 text-emerald" aria-hidden /> Put it into practice</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {m.tools.map((t) => (
                <li key={t.href}><Link href={t.href} className="inline-flex rounded-full border border-emerald/30 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 hover:border-emerald">{t.label}</Link></li>
              ))}
            </ul>
          </div>
        )}

        <SourceList className="mt-8" sources={m.sources} />
        <IndependenceNotice className="mt-8" />
      </article>

      <section className="border-t border-navy/8 bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold">Keep learning</h2>
          <ul className="mt-6 grid gap-5 md:grid-cols-3">
            {next.map((x) => <li key={x.slug}><FedModuleCard module={x} /></li>)}
          </ul>
        </div>
      </section>
      <FedCtaBand />
    </>
  );
}
