import Link from "next/link";
import { Clock } from "lucide-react";
import type { FedModule } from "@/content/federal/modules";
import { Badge } from "@/components/ui/badge";

export function FedModuleCard({ module: m, index }: { module: FedModule; index?: number }) {
  return (
    <Link
      href={`/federal-employees/learn/${m.slug}`}
      className="group flex h-full flex-col rounded-[var(--radius-card)] border border-navy/8 bg-white p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
    >
      <div className="flex items-center justify-between gap-3">
        <Badge variant={m.group === "tsp" ? "emerald" : "gold"}>
          {index !== undefined ? `Module ${index + 1}` : m.group === "tsp" ? "TSP" : "Federal benefits"}
        </Badge>
        <span className="inline-flex items-center gap-1 text-xs text-slate-600"><Clock className="size-3.5" aria-hidden /> {m.minutes} min</span>
      </div>
      <h3 className="mt-4 text-lg font-bold leading-snug group-hover:text-emerald">{m.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{m.summary}</p>
      <span className="mt-5 text-sm font-semibold text-emerald">Start module →</span>
    </Link>
  );
}

/** Explanatory chart: what goes into a FERS TSP at each contribution rate. */
export function FersMatchChart() {
  const rows = [0, 1, 2, 3, 4, 5].map((p) => {
    const match = Math.min(p, 3) + Math.min(Math.max(p - 3, 0), 2) * 0.5;
    return { p, you: p, auto: 1, match };
  });
  const max = 10;
  return (
    <figure className="rounded-[var(--radius-card)] border border-navy/10 bg-white p-6 shadow-soft sm:p-8">
      <figcaption>
        <p className="font-semibold">Under FERS, what goes into your TSP (% of basic pay)</p>
        <p className="mt-1 flex flex-wrap gap-4 text-xs text-slate-600">
          <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-navy" /> You</span>
          <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-gold" /> Agency Automatic (1%)</span>
          <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-emerald" /> Agency Matching</span>
        </p>
      </figcaption>
      <ul className="mt-6 space-y-3">
        {rows.map((r) => (
          <li key={r.p} className="grid grid-cols-[4.5rem_1fr_3rem] items-center gap-3 text-sm">
            <span className="font-medium text-slate-600">You {r.p}%</span>
            <span className="flex h-6 overflow-hidden rounded-full bg-ivory-200" role="img" aria-label={`You ${r.p}%, automatic 1%, matching ${r.match}%, total ${r.you + r.auto + r.match}%`}>
              <span className="bg-navy" style={{ width: `${(r.you / max) * 100}%` }} />
              <span className="bg-gold" style={{ width: `${(r.auto / max) * 100}%` }} />
              <span className="bg-emerald" style={{ width: `${(r.match / max) * 100}%` }} />
            </span>
            <span className="text-right font-display text-lg font-bold tabular-nums">{r.you + r.auto + r.match}%</span>
          </li>
        ))}
      </ul>
      <p className="mt-5 text-xs leading-relaxed text-slate-600">
        Contributing 5% of basic pay turns into 10% going into the TSP. CSRS and CSRS Offset employees do not receive agency contributions.
      </p>
    </figure>
  );
}
