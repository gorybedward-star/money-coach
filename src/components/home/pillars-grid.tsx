import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { pillars } from "@/content/pillars";
import { Reveal } from "@/components/reveal";

export function PillarsGrid({ detailed = false }: { detailed?: boolean }) {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {pillars.map((p, i) => {
        const Icon = p.icon;
        return (
          <Reveal as="li" key={p.n} delay={i * 60}>
            <Link
              href={p.href}
              className="group flex h-full flex-col rounded-[var(--radius-card)] border border-navy/8 bg-white p-7 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
            >
              <div className="flex items-center justify-between">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald">
                  <Icon className="size-6" aria-hidden />
                </span>
                <span className="font-display text-4xl font-bold text-gold/50">0{p.n}</span>
              </div>
              <h3 className="mt-6 text-2xl font-bold">{p.title}</h3>
              <p className="mt-1 font-medium text-emerald">{p.short}</p>
              <p className="mt-3 flex-1 leading-relaxed text-slate-600">{p.body}</p>
              {detailed && (
                <ul className="mt-5 flex flex-wrap gap-2">
                  {p.topics.map((t) => (
                    <li key={t} className="rounded-full bg-ivory-200 px-3 py-1 text-xs font-medium text-navy/80">{t}</li>
                  ))}
                </ul>
              )}
              <span className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-navy group-hover:text-emerald">
                Learn more <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
              </span>
            </Link>
          </Reveal>
        );
      })}
    </ul>
  );
}
