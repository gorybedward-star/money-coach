import Link from "next/link";
import { ArrowRight, BadgeCheck, CheckCircle2, ClipboardCheck, Quote } from "lucide-react";
import { getOffer, site } from "@/config/site";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Section, SectionHeading, Eyebrow } from "@/components/section";
import { ImagePlaceholder } from "@/components/image-placeholder";
import { FounderPhoto } from "@/components/founder-photo";
import { Reveal } from "@/components/reveal";
import { PillarsGrid } from "@/components/home/pillars-grid";
import { RoadmapStepper } from "@/components/home/roadmap-stepper";
import { PricingCards } from "@/components/pricing-cards";
import { ArticleCard } from "@/components/article-card";
import { ToolCard } from "@/components/tool-card";
import { FounderMilestones } from "@/components/founder-milestones";
import { CtaBand } from "@/components/cta-band";
import { Disclosure } from "@/components/disclosure";
import { articles } from "@/content/articles";
import { tools } from "@/content/tools";
import { scorecardQuestions } from "@/content/scorecard";

const benefitHighlights = [
  "Retirement match and vesting",
  "Life and disability insurance",
  "HSA, FSA, and dependent care",
  "Tuition and student loan help",
  "Beneficiaries and deadlines",
  "Stock purchase plans",
];

export default function HomePage() {
  const checkup = getOffer("benefits")!;
  const featuredArticles = ["pay-yourself-first", "cost-of-waiting", "employee-benefits-you-may-be-missing"]
    .map((s) => articles.find((a) => a.slug === s)!)
    .filter(Boolean);

  return (
    <>
      {/* 1. Hero */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute -right-40 -top-40 size-[36rem] rounded-full bg-emerald/10 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -left-40 top-1/2 size-[28rem] rounded-full bg-gold/15 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-10 sm:px-6 sm:pt-16 lg:grid-cols-[1.15fr_1fr] lg:gap-16 lg:px-8 lg:pb-24">
          <div className="animate-fade-up">
            <Eyebrow>{site.tagline}</Eyebrow>
            <h1 className="mt-6 text-balance text-[2.6rem] font-bold leading-[1.02] sm:text-6xl lg:text-7xl">
              Your Family Deserves More Than a <span className="relative whitespace-nowrap text-emerald">Paycheck.<svg aria-hidden viewBox="0 0 300 12" className="absolute -bottom-2 left-0 w-full text-gold" preserveAspectRatio="none"><path d="M2 9c60-6 160-8 296-3" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" /></svg></span>
            </h1>
            <p className="mt-8 max-w-xl text-pretty text-lg leading-relaxed text-slate-600 sm:text-xl">
              Learn to keep more of what you earn, maximize your employer benefits, eliminate costly debt, protect your
              family, and build wealth that lasts.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/get-started" size="lg">
                Get My Free Money Roadmap <ArrowRight />
              </ButtonLink>
              <ButtonLink href="/tools" size="lg" variant="outline">
                Explore Free Money Tools
              </ButtonLink>
            </div>
            <p className="mt-6 flex items-center gap-2 text-sm font-medium text-navy/80">
              <BadgeCheck className="size-5 text-emerald" aria-hidden />
              No shame. No jargon. No pressure. Just practical financial education.
            </p>
          </div>
          <div className="relative animate-fade-up [animation-delay:150ms]">
            <ImagePlaceholder
              label="Warm, authentic photo of a working family at home, planning together"
              className="aspect-[4/3] w-full shadow-lift sm:aspect-square lg:aspect-[4/5]"
            />
            <div className="absolute -bottom-6 -left-4 max-w-[15rem] rounded-2xl border border-navy/10 bg-white p-4 shadow-lift sm:-left-8">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald">Start free</p>
              <p className="mt-1 font-display text-lg font-bold leading-snug">Family Money Scorecard</p>
              <p className="mt-1 text-xs text-slate-600">10 questions · about 3 minutes · no email needed</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Meet Gory */}
      <Section tone="navy" id="meet-gory">
        <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <Reveal>
            <FounderPhoto className="aspect-[4/5] w-full max-w-md" />
          </Reveal>
          <Reveal delay={100}>
            <Eyebrow light>Meet your coach</Eyebrow>
            <h2 className="mt-4 text-3xl font-bold leading-tight text-ivory sm:text-5xl">
              Hi, I&rsquo;m Gory. Navy veteran, long-term investor, and your money coach.
            </h2>
            <div className="mt-8 space-y-5 text-lg leading-relaxed text-ivory/85">
              <Quote className="size-8 text-gold" aria-hidden />
              <p>
                I started investing in stocks at 18. Over the years, I&rsquo;ve built a net worth of approximately $500,000,
                achieved an 800 credit score, invested in rental properties, and established life insurance protection for
                my family.
              </p>
              <p>
                What I&rsquo;ve learned is that building wealth isn&rsquo;t about chasing the next big thing. It&rsquo;s about
                paying yourself first, eliminating costly debt, investing consistently, and protecting what you&rsquo;re
                building.
              </p>
              <p>
                I created MONEY COACH to help working families understand money, maximize their employee benefits, and
                build a stronger financial future.
              </p>
            </div>
            <p className="mt-6 font-display text-xl text-gold">— {site.founder.name}</p>
            <div className="mt-10">
              <FounderMilestones light />
            </div>
            <ButtonLink href="/about" variant="outlineLight" className="mt-8">
              Read Gory&rsquo;s story
            </ButtonLink>
          </Reveal>
        </div>
      </Section>

      {/* 3. Six Pillars */}
      <Section id="pillars">
        <SectionHeading
          eyebrow="The framework"
          title="Six pillars of building family wealth"
          intro="Wealth is built through consistent decisions, not necessarily extraordinary income. These six pillars are the foundation of everything we teach."
        />
        <div className="mt-12">
          <PillarsGrid />
        </div>
      </Section>

      {/* 4. Employee benefits */}
      <Section tone="white" id="benefits">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <SectionHeading
              eyebrow="Signature service"
              title="Your paycheck is only part of your compensation."
              intro="Retirement matches, insurance, health accounts, and family benefits can be worth thousands of dollars a year. Many families never use them fully because nobody explained them."
            />
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {benefitHighlights.map((b) => (
                <li key={b} className="flex items-center gap-2.5 font-medium">
                  <CheckCircle2 className="size-5 shrink-0 text-emerald" aria-hidden /> {b}
                </li>
              ))}
            </ul>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/employee-benefits" size="lg">
                See the Benefits Checkup
              </ButtonLink>
              <ButtonLink href="/employee-benefits#checklist" size="lg" variant="outline">
                Free Benefits Checklist
              </ButtonLink>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="relative rounded-[var(--radius-card)] bg-navy p-8 text-ivory shadow-lift sm:p-10">
              <Badge variant="light">Introductory offer</Badge>
              <h3 className="mt-5 text-3xl font-bold text-ivory">{checkup.name}</h3>
              <p className="mt-3 flex items-baseline gap-2">
                <span className="font-display text-6xl font-bold text-gold">${checkup.price}</span>
                <span className="text-ivory/70">one-time</span>
              </p>
              <p className="mt-4 leading-relaxed text-ivory/80">{checkup.description}</p>
              <ol className="mt-8 space-y-4">
                {["Complete the Benefits Checklist", "Review your benefits information together", "Identify overlooked opportunities", "Receive your Benefits Opportunity Report"].map((s, i) => (
                  <li key={s} className="flex items-center gap-4">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-gold font-semibold text-gold">{i + 1}</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
              <ButtonLink href={checkup.href} variant="gold" size="lg" className="mt-9 w-full">
                {checkup.ctaLabel}
              </ButtonLink>
              <p className="mt-4 text-xs leading-relaxed text-ivory/60">
                Educational review only. Your employer&rsquo;s plan documents and administrator determine actual eligibility and coverage.
              </p>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* 5. Scorecard teaser */}
      <Section tone="sand" id="scorecard">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <Reveal>
            <SectionHeading
              eyebrow="Free assessment"
              title="How strong is your family's financial foundation?"
              intro="Answer 10 quick questions and get your Family Money Score, a plain-English interpretation, and three practical next steps. Your results appear instantly, with no email required."
            />
            <ButtonLink href="/tools/scorecard" size="lg" className="mt-9">
              <ClipboardCheck /> Take the Free Scorecard
            </ButtonLink>
          </Reveal>
          <Reveal delay={100}>
            <div className="rounded-[var(--radius-card)] border border-navy/10 bg-white p-6 shadow-lift sm:p-8">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-emerald">Question 2 of 10</span>
                <span className="text-slate-600">{scorecardQuestions[1].topic}</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-ivory-200">
                <div className="h-full w-1/5 rounded-full bg-emerald" />
              </div>
              <p className="mt-6 font-display text-2xl font-bold leading-snug">{scorecardQuestions[1].question}</p>
              <div aria-hidden className="mt-6 grid grid-cols-3 gap-3">
                {["Yes", "Sometimes", "No"].map((a, i) => (
                  <span key={a} className={`rounded-xl border-2 py-3 text-center font-semibold ${i === 1 ? "border-emerald bg-emerald-50 text-emerald-700" : "border-navy/10"}`}>
                    {a}
                  </span>
                ))}
              </div>
              <p className="mt-5 text-center text-xs text-slate-600">Preview. Take the real Scorecard for your results.</p>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* 6. Roadmap */}
      <Section tone="navy" id="roadmap">
        <SectionHeading
          light
          eyebrow="The Money Roadmap"
          title="Six stages from paycheck to legacy"
          intro="A clear, step-by-step path. Stages can overlap, and every household's priorities are different, but knowing the path makes the next step easier to see."
        />
        <div className="mt-14">
          <RoadmapStepper light />
        </div>
        <ButtonLink href="/roadmap" variant="outlineLight" className="mt-10">
          Explore the full Roadmap
        </ButtonLink>
      </Section>

      {/* 7. Calculators */}
      <Section id="tools">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            eyebrow="Free money tools"
            title="See what consistent decisions can do"
            intro="Simple, honest calculators that show hypothetical illustrations, explain their assumptions, and never ask for your email."
          />
          <ButtonLink href="/tools" variant="outline" className="shrink-0">All free tools</ButtonLink>
        </div>
        <ul className="mt-12 grid gap-5 md:grid-cols-3">
          {tools.slice(0, 3).map((t, i) => (
            <Reveal as="li" key={t.title} delay={i * 70}>
              <ToolCard tool={t} />
            </Reveal>
          ))}
        </ul>
      </Section>

      {/* 8. Pricing */}
      <Section tone="white" id="pricing">
        <SectionHeading
          center
          eyebrow="Affordable coaching"
          title="Real help, at a price working families can afford"
          intro="Start free. When you want a coach in your corner, choose the level of support that fits."
        />
        <div className="mt-14">
          <PricingCards />
        </div>
        <p className="mt-10 text-center text-sm text-slate-600">
          Proposed launch pricing.{" "}
          <Link href="/pricing" className="font-semibold text-emerald underline underline-offset-2">
            Compare all services
          </Link>
        </p>
      </Section>

      {/* 9. Learn */}
      <Section id="learn">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading eyebrow="Learn" title="Money lessons nobody taught us" intro="Short, practical articles written in plain English." />
          <ButtonLink href="/learn" variant="outline" className="shrink-0">Browse the library</ButtonLink>
        </div>
        <ul className="mt-12 grid gap-5 md:grid-cols-3">
          {featuredArticles.map((a, i) => (
            <Reveal as="li" key={a.slug} delay={i * 70}>
              <ArticleCard article={a} />
            </Reveal>
          ))}
        </ul>
        <Disclosure className="mt-12" />
      </Section>

      {/* 10. Final CTA */}
      <CtaBand />
    </>
  );
}
