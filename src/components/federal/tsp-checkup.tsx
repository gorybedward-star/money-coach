"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, Printer, RotateCcw } from "lucide-react";
import { scoreTspCheckup, tspCheckupQuestions, type TspAnswer } from "@/content/federal/checkup";
import { getFedModule } from "@/content/federal/modules";
import { getOffer } from "@/config/site";
import { Button, ButtonLink } from "@/components/ui/button";
import { LeadForm } from "@/components/lead-form";
import { cn } from "@/lib/utils";
import { NoSensitiveInfo } from "./shared";

const OPTIONS: { value: TspAnswer; label: string }[] = [
  { value: "yes", label: "Yes" },
  { value: "somewhat", label: "Somewhat" },
  { value: "no", label: "No" },
];

export function TspCheckup() {
  const [answers, setAnswers] = useState<Record<string, TspAnswer>>({});
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const started = useRef(false);
  const total = tspCheckupQuestions.length;
  const q = tspCheckupQuestions[step];

  useEffect(() => {
    // Don't steal focus on first load; move it for each later question and for results.
    if (!started.current) {
      started.current = true;
      return;
    }
    headingRef.current?.focus({ preventScroll: true });
  }, [step, done]);

  function choose(a: TspAnswer) {
    setAnswers({ ...answers, [q.id]: a });
    window.setTimeout(() => {
      if (step < total - 1) setStep(step + 1);
      else setDone(true);
    }, 220);
  }

  function restart() {
    setAnswers({});
    setStep(0);
    setDone(false);
  }

  if (done) return <Results answers={answers} onRestart={restart} headingRef={headingRef} />;

  const progress = ((step + (answers[q.id] ? 1 : 0)) / total) * 100;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-[var(--radius-card)] border border-navy/10 bg-white p-6 shadow-lift sm:p-10">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="font-semibold text-emerald">Question {step + 1} of {total}</span>
          <span className="text-right text-slate-600">{q.topic}</span>
        </div>
        <div
          className="mt-3 h-2 overflow-hidden rounded-full bg-ivory-200"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={Object.keys(answers).length}
          aria-label="TSP Checkup progress"
        >
          <div className="h-full rounded-full bg-emerald transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>

        <fieldset className="mt-8">
          <legend className="contents">
            <h2 ref={headingRef} tabIndex={-1} className="font-display text-2xl font-bold leading-snug outline-none sm:text-3xl">
              {q.question}
            </h2>
          </legend>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">{q.help}</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {OPTIONS.map((o) => {
              const selected = answers[q.id] === o.value;
              return (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => choose(o.value)}
                  aria-pressed={selected}
                  className={cn(
                    "rounded-2xl border-2 px-4 py-4 text-lg font-semibold transition-all",
                    selected ? "border-emerald bg-emerald-50 text-emerald-700" : "border-navy/10 hover:border-emerald/50 hover:bg-ivory",
                  )}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-8 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
            <ArrowLeft /> Back
          </Button>
          {answers[q.id] && (
            <Button variant="ghost" size="sm" onClick={() => (step < total - 1 ? setStep(step + 1) : setDone(true))}>
              {step < total - 1 ? "Next" : "See my results"} <ArrowRight />
            </Button>
          )}
        </div>
      </div>
      <p className="mt-4 text-center text-xs text-slate-600">
        Your answers stay in your browser. Nothing is saved or sent unless you choose to email your results.
      </p>
      <NoSensitiveInfo className="mt-1 text-center" />
    </div>
  );
}

function Results({
  answers,
  onRestart,
  headingRef,
}: {
  answers: Record<string, TspAnswer>;
  onRestart: () => void;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
}) {
  const { score, max, band, actions, modules } = scoreTspCheckup(answers);
  const checkup = getOffer("benefits")!;
  const pct = (score / max) * 100;
  const R = 54;
  const C = 2 * Math.PI * R;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="overflow-hidden rounded-[var(--radius-card)] bg-navy text-ivory shadow-lift">
        <div className="grid items-center gap-8 p-6 sm:p-10 md:grid-cols-[auto_1fr]">
          <div className="relative mx-auto size-44">
            <svg viewBox="0 0 120 120" className="size-full -rotate-90" aria-hidden>
              <circle cx="60" cy="60" r={R} fill="none" stroke="rgb(255 255 255 / 0.12)" strokeWidth="10" />
              <circle cx="60" cy="60" r={R} fill="none" stroke="#C9A45C" strokeWidth="10" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C - (pct / 100) * C} className="transition-[stroke-dashoffset] duration-1000" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-5xl font-bold text-gold">{score}</span>
              <span className="text-sm text-ivory/70">out of {max}</span>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Your TSP education score</p>
            <h2 ref={headingRef} tabIndex={-1} className="mt-3 text-3xl font-bold text-ivory outline-none sm:text-4xl">{band.title}</h2>
            <p className="mt-4 leading-relaxed text-ivory/80">{band.summary}</p>
            <p className="mt-4 text-sm leading-relaxed text-ivory/65">
              This score reflects how familiar you feel with TSP basics. It does not measure your investment risk
              tolerance, and it does not determine whether any fund, contribution level, or strategy is suitable for you.
            </p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-2xl font-bold">Three suggested follow-up actions</h3>
        <ol className="mt-5 grid gap-4 md:grid-cols-3">
          {actions.map((s, i) => (
            <li key={s.title} className="flex flex-col rounded-[var(--radius-card)] border border-navy/10 bg-white p-6 shadow-soft">
              <span className="flex size-9 items-center justify-center rounded-full bg-emerald font-semibold text-white">{i + 1}</span>
              <p className="mt-4 text-lg font-bold leading-snug">{s.title}</p>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{s.detail}</p>
              <Link href={s.href} className="mt-4 text-sm font-semibold text-emerald underline-offset-4 hover:underline">{s.linkLabel} →</Link>
            </li>
          ))}
        </ol>
      </div>

      <div>
        <h3 className="text-2xl font-bold">Learning modules for you</h3>
        <p className="mt-2 text-slate-600">Picked from the questions you answered Somewhat or No.</p>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {modules.map((slug) => {
            const m = getFedModule(slug);
            if (!m) return null;
            return (
              <li key={slug}>
                <Link href={`/federal-employees/learn/${slug}`} className="group flex h-full items-start gap-3 rounded-2xl border border-navy/10 bg-white p-5 transition-colors hover:border-emerald/40">
                  <BookOpen className="mt-0.5 size-5 shrink-0 text-emerald" aria-hidden />
                  <span>
                    <span className="block font-semibold group-hover:text-emerald">{m.title}</span>
                    <span className="mt-1 block text-sm text-slate-600">{m.summary}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <details className="rounded-2xl border border-navy/10 bg-white p-5">
        <summary className="cursor-pointer font-semibold">See all of your answers</summary>
        <ul className="mt-4 divide-y divide-navy/8 text-sm">
          {tspCheckupQuestions.map((q) => (
            <li key={q.id} className="flex items-start justify-between gap-4 py-3">
              <span className="text-slate-600">{q.question}</span>
              <span className="shrink-0 font-semibold capitalize">{answers[q.id] ?? "—"}</span>
            </li>
          ))}
        </ul>
      </details>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="no-print rounded-[var(--radius-card)] border border-navy/10 bg-white p-6 sm:p-8">
          <LeadForm
            type="tsp-checkup"
            context={{ score, band: band.title }}
            title="Email me my TSP Checkup results"
            description="Optional. We'll email your score and suggested learning modules. We only receive your score, never your TSP details."
            submitLabel="Email my results"
          />
        </div>
        <div className="no-print flex flex-col rounded-[var(--radius-card)] bg-gold-50 p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">Optional, affordable coaching</p>
          <p className="mt-3 font-display text-2xl font-bold">{checkup.name}, ${checkup.price}</p>
          <p className="mt-3 flex-1 leading-relaxed text-slate-600">
            An educational review of your federal benefits: TSP fundamentals, how your retirement benefits fit together,
            and benefits you may be overlooking. It is education, not investment advice or fund recommendations.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={checkup.href}>Request a Checkup</ButtonLink>
            <ButtonLink href="/federal-employees#coaching" variant="outline">What&rsquo;s included</ButtonLink>
          </div>
        </div>
      </div>

      <div className="no-print flex flex-wrap justify-center gap-3">
        <Button variant="outline" onClick={() => window.print()}><Printer /> Print or save as PDF</Button>
        <Button variant="ghost" onClick={onRestart}><RotateCcw /> Retake the TSP Checkup</Button>
      </div>

      <p className="text-center text-xs leading-relaxed text-slate-600">
        The TSP Checkup is a general educational self-assessment, not a financial plan, investment recommendation, or
        professional advice. MONEY COACH is not affiliated with the TSP, FRTIB, OPM, or any federal agency.
      </p>
    </div>
  );
}
