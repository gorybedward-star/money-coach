import Link from "next/link";
import { Clock } from "lucide-react";
import type { Article } from "@/content/articles";
import { Badge } from "@/components/ui/badge";

const categoryLabels: Record<Article["category"], string> = {
  Keep: "Keep your money",
  Protect: "Protect your family",
  Debt: "Eliminate debt",
  Grow: "Grow your money",
  Own: "Own assets",
  Legacy: "Build a legacy",
};

export function ArticleCard({ article: a }: { article: Article }) {
  return (
    <Link
      href={`/learn/${a.slug}`}
      className="group flex h-full flex-col rounded-[var(--radius-card)] border border-navy/8 bg-white p-7 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
    >
      <div className="flex items-center justify-between gap-3">
        <Badge variant="emerald">{categoryLabels[a.category]}</Badge>
        <span className="inline-flex items-center gap-1 text-xs text-slate-600">
          <Clock className="size-3.5" aria-hidden /> {a.readMinutes} min
        </span>
      </div>
      <h3 className="mt-5 text-xl font-bold leading-snug group-hover:text-emerald">{a.title}</h3>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">{a.excerpt}</p>
      <span className="mt-6 text-sm font-semibold text-emerald">Read article →</span>
    </Link>
  );
}
