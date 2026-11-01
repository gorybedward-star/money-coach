import Link from "next/link";
import { roadmapStages } from "@/content/roadmap";
import { Reveal } from "@/components/reveal";

export function RoadmapStepper({ light = false }: { light?: boolean }) {
  return (
    <ol className="relative grid gap-4 md:grid-cols-3 lg:grid-cols-6">
      <span aria-hidden className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-gold/0 via-gold/60 to-gold/0 lg:block" />
      {roadmapStages.map((s, i) => (
        <Reveal as="li" key={s.id} delay={i * 70} className="relative">
          <Link
            href={`/roadmap#${s.id}`}
            className={`group block h-full rounded-2xl p-5 transition-colors ${light ? "hover:bg-white/5" : "hover:bg-white"}`}
          >
            <span className="relative z-10 flex size-14 items-center justify-center rounded-full border-2 border-gold bg-navy font-display text-xl font-bold text-gold transition-transform group-hover:scale-105">
              {s.n}
            </span>
            <h3 className={`mt-5 text-lg font-bold leading-snug ${light ? "text-ivory" : "text-navy"}`}>{s.title}</h3>
            <p className={`mt-2 text-sm leading-relaxed ${light ? "text-ivory/75" : "text-slate-600"}`}>{s.summary}</p>
          </Link>
        </Reveal>
      ))}
    </ol>
  );
}
