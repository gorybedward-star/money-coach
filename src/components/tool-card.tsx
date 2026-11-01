import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ToolInfo } from "@/content/tools";
import { Badge } from "@/components/ui/badge";

export function ToolCard({ tool: t }: { tool: ToolInfo }) {
  const Icon = t.icon;
  const inner = (
    <>
      <div className="flex items-start justify-between gap-3">
        <span className={`flex size-12 items-center justify-center rounded-2xl ${t.available ? "bg-gold-50 text-gold-600" : "bg-ivory-200 text-slate"}`}>
          <Icon className="size-6" aria-hidden />
        </span>
        {t.available ? (
          t.time && <Badge variant="outline">{t.time}</Badge>
        ) : (
          <Badge variant="outline">Coming soon</Badge>
        )}
      </div>
      <h3 className="mt-5 text-xl font-bold">{t.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{t.description}</p>
      {t.available && (
        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald">
          Open tool <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
        </span>
      )}
    </>
  );
  const cls = "group flex h-full flex-col rounded-[var(--radius-card)] border border-navy/8 bg-white p-7 shadow-soft";
  if (!t.available) return <div className={`${cls} opacity-75`} aria-disabled="true">{inner}</div>;
  return <Link href={t.href} className={`${cls} transition-all duration-300 hover:-translate-y-1 hover:shadow-lift`}>{inner}</Link>;
}
