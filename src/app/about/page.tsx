import type { Metadata } from "next";
import { Anchor, Heart, Target, TrendingUp } from "lucide-react";
import { site } from "@/config/site";
import { PageHero, Section, SectionHeading } from "@/components/section";
import { FounderPhoto } from "@/components/founder-photo";
import { FounderMilestones } from "@/components/founder-milestones";
import { CtaBand } from "@/components/cta-band";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "About Gory",
  description: "Meet Gory Bedward, U.S. Navy veteran and founder of MONEY COACH, on a mission to make practical financial education affordable for working families.",
};

const habits = [
  { icon: TrendingUp, t: "Started early, stayed consistent", d: "I bought my first stocks at 18. What mattered most was that I kept going, year after year." },
  { icon: Anchor, t: "Discipline from the Navy", d: "Service taught me that results come from routines: show up, do the work, and stay steady when things get hard. Money works the same way." },
  { icon: Target, t: "Kept debt from eating my progress", d: "I avoid carrying costly credit card and personal debt, so more of every paycheck can go toward building, not interest." },
  { icon: Heart, t: "Protected what I was building", d: "I put life insurance protection in place for my family, because a plan isn't complete until the people you love are covered." },
];

export default function AboutPage() {
  return (
    <>
      <PageHero eyebrow="About Gory" title="Wealth isn't about the next big thing. It's about the next right decision." />

      <Section>
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <Reveal>
            <FounderPhoto priority className="aspect-[4/5] w-full max-w-md lg:sticky lg:top-28" />
          </Reveal>
          <div>
            <SectionHeading eyebrow="My story" title={`Hi, I'm ${site.founder.firstName}.`} />
            <div className="prose-mc mt-6">
              <p>
                I&rsquo;m a U.S. Navy veteran, an investor, and the founder of MONEY COACH. I started investing in stocks at 18. Over the
                years, I&rsquo;ve built a net worth of approximately $500,000, achieved an approximately 800 credit score, invested in rental
                properties, and established life insurance protection for my family.
              </p>
              <p>
                I share those numbers for one reason: to show that the principles work. Not because of a lucky break or a huge salary, but
                because of simple habits repeated over a long time. Pay yourself first. Avoid costly debt. Invest consistently in
                diversified, low-cost funds. Protect what you&rsquo;re building.
              </p>
              <p>
                Along the way, I noticed how many hardworking people around me were never taught any of this. Good people, earning real
                paychecks, leaving employer benefits unused, carrying high-interest debt, or waiting to invest because nobody explained how
                it works. Too often, the help that was available was either expensive or came with a product to sell.
              </p>
              <p>
                That&rsquo;s why I created MONEY COACH: practical, affordable, judgment-free financial education for working families,
                especially households that didn&rsquo;t grow up learning about money. Everyone is welcome here.
              </p>
            </div>
            <div className="mt-10">
              <FounderMilestones />
            </div>
          </div>
        </div>
      </Section>

      <Section tone="white">
        <SectionHeading eyebrow="Behind the milestones" title="The habits matter more than the numbers" intro="Here's what actually made the difference for me, and what I teach." />
        <ul className="mt-12 grid gap-5 md:grid-cols-2">
          {habits.map((h, i) => (
            <Reveal as="li" key={h.t} delay={(i % 2) * 80}>
              <div className="flex h-full gap-5 rounded-[var(--radius-card)] border border-navy/8 bg-ivory p-7">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-navy text-gold"><h.icon className="size-6" aria-hidden /></span>
                <div>
                  <h3 className="text-xl font-bold">{h.t}</h3>
                  <p className="mt-2 leading-relaxed text-slate-600">{h.d}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </ul>
      </Section>

      <Section tone="navy">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Our mission</p>
          <p className="mt-6 font-display text-2xl font-bold leading-snug text-ivory sm:text-4xl">
            Help working families, particularly minority and underserved households, keep more of what they earn, maximize employer
            benefits, eliminate costly debt, protect their loved ones, invest consistently, and build generational wealth.
          </p>
          <p className="mt-8 text-ivory/70">Everyone is welcome.</p>
        </div>
      </Section>

      <Section className="!py-12">
        <p className="mx-auto max-w-3xl text-center text-sm leading-relaxed text-slate-600">
          {site.founder.name} is a financial educator and coach. MONEY COACH is not a registered investment adviser, broker-dealer, insurance
          agency, financial planner, law firm, or accounting firm, and Gory does not provide individualized investment, insurance, legal,
          or tax advice. Personal milestones are founder-reported, shared for illustration, and are not typical or guaranteed results.
        </p>
      </Section>
      <CtaBand />
    </>
  );
}
