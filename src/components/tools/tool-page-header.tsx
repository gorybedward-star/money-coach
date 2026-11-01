import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";

export function ToolPageHeader({ title, intro, related }: { title: string; intro: string; related?: { href: string; label: string } }) {
  return (
    <section className="border-b border-navy/8 bg-ivory-200">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald hover:underline">
          <ArrowLeft className="size-4" aria-hidden /> All free tools
        </Link>
        <h1 className="mt-5 text-4xl font-bold sm:text-5xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-600">{intro}</p>
        {related && (
          <Link href={related.href} className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-navy hover:text-emerald">
            <BookOpen className="size-4" aria-hidden /> {related.label}
          </Link>
        )}
      </div>
    </section>
  );
}
