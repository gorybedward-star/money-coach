import type { Metadata } from "next";
import { PageHero, Section } from "@/components/section";
import { ArticleCard } from "@/components/article-card";
import { Reveal } from "@/components/reveal";
import { CtaBand } from "@/components/cta-band";
import { articles } from "@/content/articles";

export const metadata: Metadata = {
  title: "Learn",
  description: "Plain-English financial education for working families: paying yourself first, compound growth, ETFs, debt payoff, employer benefits, life insurance, and building a legacy.",
};

export default function LearnPage() {
  return (
    <>
      <PageHero eyebrow="The Learn library" title="Money lessons nobody taught us." intro="Short, practical articles in plain English. Each one ends with a clear takeaway and a tool to put it into practice." />
      <Section>
        <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((a, i) => (
            <Reveal as="li" key={a.slug} delay={(i % 3) * 60}>
              <ArticleCard article={a} />
            </Reveal>
          ))}
        </ul>
      </Section>
      <CtaBand />
    </>
  );
}
