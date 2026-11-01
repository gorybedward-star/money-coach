import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Lightbulb, Wrench } from "lucide-react";
import { articles, getArticle } from "@/content/articles";
import { site } from "@/config/site";
import { ArticleCard } from "@/components/article-card";
import { Disclosure } from "@/components/disclosure";
import { CtaBand } from "@/components/cta-band";

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const a = getArticle(slug);
  if (!a) return {};
  return { title: a.title, description: a.excerpt, openGraph: { type: "article", title: a.title, description: a.excerpt } };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = getArticle(slug);
  if (!a) notFound();
  const related = articles.filter((x) => x.slug !== a.slug && x.category === a.category).concat(articles.filter((x) => x.category !== a.category)).slice(0, 3);

  return (
    <>
      <article>
        <header className="bg-navy text-ivory">
          <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
            <Link href="/learn" className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold hover:underline">
              <ArrowLeft className="size-4" aria-hidden /> Learn library
            </Link>
            <h1 className="mt-6 text-balance text-4xl font-bold leading-tight sm:text-5xl">{a.title}</h1>
            <p className="mt-5 text-lg text-ivory/80">{a.excerpt}</p>
            <p className="mt-6 text-sm text-ivory/60">By {site.founder.name} · {a.readMinutes} min read</p>
          </div>
        </header>

        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="prose-mc">
            {a.body.map((b, i) => {
              if (b.h) return <h2 key={i}>{b.h}</h2>;
              if (b.ul) return <ul key={i}>{b.ul.map((li) => <li key={li}>{li}</li>)}</ul>;
              if (b.quote) return <blockquote key={i}>{b.quote}</blockquote>;
              return <p key={i}>{b.p}</p>;
            })}
          </div>

          <aside className="mt-12 rounded-[var(--radius-card)] border-l-4 border-gold bg-gold-50 p-6 sm:p-8">
            <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gold-600"><Lightbulb className="size-4" aria-hidden /> The takeaway</p>
            <p className="mt-3 font-display text-xl font-bold leading-snug sm:text-2xl">{a.takeaway}</p>
          </aside>

          <div className="mt-8 rounded-2xl border border-navy/10 bg-white p-6">
            <p className="flex items-center gap-2 font-semibold"><Wrench className="size-4 text-emerald" aria-hidden /> Put it into practice</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {a.tools.map((t) => (
                <li key={t.label}>
                  <Link href={t.href} className="inline-flex rounded-full border border-emerald/30 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 hover:border-emerald">{t.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {a.sources && a.sources.length > 0 && (
            <div className="mt-8 rounded-2xl border border-navy/10 bg-white p-6">
              <p className="font-semibold">Official sources</p>
              <ul className="mt-3 space-y-2 text-sm">
                {a.sources.map((s) => (
                  <li key={s.href}>
                    <a href={s.href} target="_blank" rel="noopener noreferrer" className="text-emerald underline underline-offset-2">{s.label}<span className="sr-only"> (opens in a new tab)</span></a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Disclosure className="mt-8">
            {a.disclosure ? `${a.disclosure} ` : ""}This article is general financial education, not individualized financial, investment, insurance, legal, or tax advice.
          </Disclosure>
        </div>
      </article>

      <section className="border-t border-navy/8 bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold">Keep learning</h2>
          <ul className="mt-6 grid gap-5 md:grid-cols-3">
            {related.map((r) => <li key={r.slug}><ArticleCard article={r} /></li>)}
          </ul>
        </div>
      </section>
      <CtaBand />
    </>
  );
}
