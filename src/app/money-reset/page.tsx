import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BellRing, Check, ClipboardCheck, Flag, LineChart, MessageCircleQuestion, Smartphone } from "lucide-react";
import { features, formatOfferPrice, getOffer, site } from "@/config/site";
import {
  closingQuestions,
  commitmentCardExample,
  fiveStandards,
  recurringQuestion,
  resetFaqs,
  resetFramework,
  resetOutcomes,
  resetPositioning,
  resetPrinciples,
  resetWeeks,
  scorecardRows,
  sessionFlow,
} from "@/content/money-reset";
import { PageHero, Section, SectionHeading } from "@/components/section";
import { ButtonLink } from "@/components/ui/button";
import { Disclosure } from "@/components/disclosure";
import { CtaBand } from "@/components/cta-band";

export const metadata: Metadata = {
  title: "The 7-Week Money Reset",
  description:
    "One-on-one financial coaching for working families: better money habits, less costly debt, more from your workplace benefits, and a practical path toward financial independence.",
};

const included = [
  { icon: ClipboardCheck, text: "Seven 50-minute one-on-one coaching sessions by video or phone" },
  { icon: Smartphone, text: "Your own private, mobile-friendly client portal" },
  { icon: Flag, text: "One clear Money Move each week, with a weekly checklist" },
  { icon: BellRing, text: "Friendly accountability reminders before each deadline" },
  { icon: LineChart, text: "Your Personal Financial Freedom Roadmap and 90-day priority" },
];

export default function MoneyResetPage() {
  const offer = getOffer("reset")!;
  const monthly = getOffer("coaching");
  const cta = `/get-started?service=reset#contact`;

  return (
    <>
      <PageHero eyebrow="Mindset + Action + Accountability" title="The 7-Week Money Reset" intro={resetPositioning.replace(/^I help/, "We help")}>
        <p className="mb-8 font-display text-xl text-gold">One week. One objective. One money move.</p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <ButtonLink href={cta} size="lg" variant="gold">
            Apply for the Money Reset <ArrowRight />
          </ButtonLink>
          <ButtonLink href="#weeks" size="lg" variant="outlineLight">
            See the seven weeks
          </ButtonLink>
        </div>
      </PageHero>

      {/* Sell the outcome */}
      <Section tone="white">
        <SectionHeading
          eyebrow="What you walk away with"
          title="A clearer picture, better habits, and a plan that's yours."
          intro="This isn't seven hours of talking about budgets. It's seven weeks of steady, measurable change, one move at a time."
        />
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {resetOutcomes.map((o) => (
            <li key={o} className="flex gap-3 rounded-2xl bg-ivory p-5">
              <Check className="mt-0.5 size-5 shrink-0 text-emerald" aria-hidden />
              <span className="font-medium">{o}</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* Mindset + Action + Accountability */}
      <Section>
        <SectionHeading eyebrow="How it works" title="Why, what, and actually doing it." />
        <ol className="mt-10 grid gap-6 md:grid-cols-3">
          {resetFramework.map((f, i) => (
            <li key={f.label} className="relative rounded-[var(--radius-card)] border border-navy/10 bg-white p-7 shadow-soft">
              <span className="font-display text-5xl font-bold text-gold/60">{i + 1}</span>
              <h3 className="mt-2 text-2xl font-bold">{f.label}</h3>
              <p className="mt-1 text-sm font-semibold text-emerald">{f.source}</p>
              <p className="mt-3 leading-relaxed text-slate-600">{f.body}</p>
            </li>
          ))}
        </ol>
        <p className="mt-8 max-w-3xl text-slate-600">
          The Baby Steps are a progression, not a race. Some clients spend several months paying off debt, and that&rsquo;s perfectly
          reasonable. The seven weeks give you the skills, the plan, and the momentum to keep going.
        </p>
      </Section>

      {/* The journey */}
      <Section tone="white" id="weeks">
        <SectionHeading eyebrow="The client journey" title="Seven weeks, from awareness to independence." />
        <ol className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7" aria-label="Journey overview">
          {resetWeeks.map((w) => (
            <li key={w.n} className="rounded-2xl bg-navy p-4 text-ivory">
              <p className="font-display text-2xl font-bold text-gold">{String(w.n).padStart(2, "0")}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-ivory/70">{w.theme}</p>
              <p className="mt-2 text-sm font-semibold leading-snug">{w.title}</p>
            </li>
          ))}
        </ol>

        <ol className="mt-12 space-y-5">
          {resetWeeks.map((w) => (
            <li key={w.n} className="rounded-[var(--radius-card)] border border-navy/10 bg-ivory p-6 sm:p-8">
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-600">
                  Week {w.n} · {w.theme}
                </p>
                <h3 className="text-2xl font-bold">{w.title}</h3>
              </div>
              <dl className="mt-5 grid gap-5 md:grid-cols-3">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-slate-600">Mindset</dt>
                  <dd className="mt-1">{w.mindset}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-slate-600">Action step</dt>
                  <dd className="mt-1">{w.babyStep}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-slate-600">Your call to action</dt>
                  <dd className="mt-1">{w.action}</dd>
                </div>
              </dl>
              <div className="mt-5 flex flex-col gap-3 border-t border-navy/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="flex items-start gap-2 italic text-slate-600">
                  <MessageCircleQuestion className="mt-0.5 size-5 shrink-0 text-emerald" aria-hidden />
                  &ldquo;{w.question}&rdquo;
                </p>
                <p className="shrink-0 text-sm">
                  <span className="font-semibold text-emerald">You receive:</span> {w.deliverable}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      {/* Five standards */}
      <Section>
        <SectionHeading eyebrow="Our coaching standard" title="Every call. Five ones." intro="One week. One objective. One money move. Measurable progress." />
        <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {fiveStandards.map((st, i) => (
            <li key={st.title} className="rounded-2xl border border-navy/10 bg-white p-6 shadow-soft">
              <span className="flex size-9 items-center justify-center rounded-full bg-gold text-sm font-bold text-navy">{i + 1}</span>
              <h3 className="mt-4 text-lg font-bold">{st.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{st.question}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* What makes it different */}
      <Section tone="navy">
        <SectionHeading light eyebrow="What makes it different" title="Not budgeting lessons. Real behavior change." />
        <ul className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-5">
          {resetPrinciples.map((p) => (
            <li key={p.title} className="rounded-2xl border border-ivory/15 bg-white/5 p-6">
              <h3 className="text-lg font-bold text-gold">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ivory/80">{p.body}</p>
            </li>
          ))}
        </ul>
      </Section>

      {/* Session + price */}
      <Section tone="white">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
          <div>
            <SectionHeading eyebrow="Every session" title="The same focused 50 minutes, every week." />
            <ol className="mt-8 space-y-3">
              {sessionFlow.map((s, i) => (
                <li key={s.label} className="flex items-center gap-4 rounded-2xl bg-ivory px-5 py-4">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald text-sm font-semibold text-white">{i + 1}</span>
                  <span className="flex-1 font-medium">{s.label}</span>
                  <span className="text-sm text-slate-600">{s.minutes} min</span>
                </li>
              ))}
            </ol>
            <p className="mt-8 font-display text-xl leading-snug">&ldquo;{recurringQuestion}&rdquo;</p>
            <p className="mt-3 text-slate-600">
              Every call ends with that question. Your answer covers three things: {closingQuestions.map((q) => q.toLowerCase().replace("?", "")).join("; ")}. It becomes your
              commitment card for the week.
            </p>
            <figure className="mt-6 overflow-hidden rounded-[var(--radius-card)] border border-navy/10 bg-white shadow-soft">
              <div className="bg-navy px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-gold">Money Coach · Weekly commitment</div>
              <div className="space-y-4 p-6">
                <p className="font-display text-2xl font-bold">My One Money Move</p>
                <Card label="This week's priority" value={commitmentCardExample.priority} />
                <Card label="My commitment" value={commitmentCardExample.commitment} />
                <Card label="How we'll measure success" value={commitmentCardExample.measure} />
              </div>
              <figcaption className="border-t border-navy/8 bg-ivory px-6 py-3 text-sm font-semibold text-emerald">
                One action. One deadline. One measurable result.
              </figcaption>
            </figure>
            <p className="mt-2 text-xs text-slate-600">Example from Week 1.</p>
          </div>

          <div id="price" className="scroll-mt-24 rounded-[var(--radius-card)] border-2 border-gold bg-navy p-8 text-ivory shadow-lift sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">What&rsquo;s included</p>
            <h2 className="mt-3 text-3xl font-bold">{offer.name}</h2>
            <p className="mt-5 flex items-baseline gap-2">
              <span className="font-display text-6xl font-bold">{formatOfferPrice(offer)}</span>
              <span className="text-ivory/70">for all seven weeks</span>
            </p>
            <ul className="mt-8 space-y-4">
              {included.map(({ icon: Icon, text }) => (
                <li key={text} className="flex gap-3">
                  <Icon className="mt-0.5 size-5 shrink-0 text-gold" aria-hidden />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
            <ButtonLink href={cta} size="lg" variant="gold" className="mt-10 w-full">
              Apply for the Money Reset <ArrowRight />
            </ButtonLink>
            <p className="mt-4 text-center text-sm text-ivory/70">
              {features.paymentsEnabled ? "Secure online payment." : "No payment today. We'll talk first to make sure it's the right fit."}
            </p>
            {monthly && (
              <p className="mt-6 border-t border-ivory/15 pt-5 text-sm text-ivory/80">
                <strong className="text-ivory">After you graduate:</strong> keep your momentum with optional monthly accountability
                coaching ({formatOfferPrice(monthly)}/month, cancel anytime). No need to repeat the program.
              </p>
            )}
          </div>
        </div>
      </Section>

      {/* Scorecard */}
      <Section>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <SectionHeading
            eyebrow="How we measure success"
            title="Your Money Coach Scorecard."
            intro="At graduation you receive a personal scorecard showing where you started, where you are now, and your next steps. The goal isn't to promise debt freedom or wealth in seven weeks. It's seven weeks of clarity, behavior change, and consistent action."
          />
          <div className="overflow-x-auto rounded-[var(--radius-card)] border border-navy/10 bg-white shadow-soft">
            <table className="w-full min-w-[22rem] text-left">
              <thead className="bg-navy text-ivory">
                <tr>
                  <th scope="col" className="p-4 font-semibold">Measurement</th>
                  <th scope="col" className="p-4 font-semibold">Starting</th>
                  <th scope="col" className="p-4 font-semibold">Week 7</th>
                </tr>
              </thead>
              <tbody>
                {scorecardRows.map((r) => (
                  <tr key={r.measure} className="border-t border-navy/8">
                    <th scope="row" className="p-4 font-medium">{r.measure}</th>
                    <td className="p-4 text-slate-600">{r.start}</td>
                    <td className="p-4 font-semibold text-emerald">{r.end}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="border-t border-navy/8 px-4 py-3 text-xs text-slate-600">We note which numbers you reported and which we verified together.</p>
          </div>
        </div>
      </Section>

      {/* Fit */}
      <Section tone="white">
        <SectionHeading eyebrow="Is it right for you?" title="Built for working individuals and families." />
        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {[
            "You earn a living but still feel stretched paycheck to paycheck.",
            "You didn't learn about money growing up and want a clear starting point.",
            "You want to get rid of costly debt and build a real emergency fund.",
            "You have workplace benefits and aren't sure you're using them well.",
            "You've tried budgeting before and want someone to keep you accountable.",
            "You want a practical path toward financial independence, not just tips.",
          ].map((t) => (
            <li key={t} className="flex gap-3 rounded-2xl bg-white p-5 shadow-soft">
              <Check className="mt-0.5 size-5 shrink-0 text-emerald" aria-hidden />
              <span>{t}</span>
            </li>
          ))}
        </ul>
        <p className="mt-8 max-w-3xl text-slate-600">
          Your coach is {site.founder.name}, a {site.founder.background} who believes you don&rsquo;t have to be wealthy to start building
          wealth. You just have to start. <Link href="/about" className="text-emerald underline underline-offset-2">Meet Gory</Link>.
        </p>
      </Section>

      <Section>
        <SectionHeading eyebrow="Questions" title="Frequently asked questions" />
        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          {resetFaqs.map((f) => (
            <details key={f.q} className="group rounded-2xl border border-navy/10 bg-ivory p-6 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold">
                {f.q}
                <span aria-hidden className="text-2xl text-emerald transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 leading-relaxed text-slate-600">{f.a}</p>
            </details>
          ))}
        </div>
        <Disclosure className="mt-10">
          Financial education and coaching only, not individualized investment, tax, or legal advice. We don&rsquo;t recommend specific
          securities or manage money. Results depend on your circumstances and are not guaranteed. Money Coach is independent and is
          not affiliated with or endorsed by Morgan Housel, Dave Ramsey, or Ramsey Solutions. The Psychology of Money and the Baby Steps
          are referenced for educational purposes.
        </Disclosure>
      </Section>

      <CtaBand
        title="Ready for your Money Reset?"
        intro="Tell us a little about where you are. We'll follow up to talk it through, with no pressure and no payment required to apply."
        primary={{ href: cta, label: "Apply for the Money Reset" }}
        secondary={{ href: "/tools/scorecard", label: "Take the Free Scorecard first" }}
      />
    </>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">{label}</p>
      <p className="mt-1 text-lg">{value}</p>
    </div>
  );
}
