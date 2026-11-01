"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Printer, RotateCcw } from "lucide-react";
import { scoreScorecard, scorecardQuestions, type Answer } from "@/content/scorecard";
import { getOffer } from "@/config/site";
import { Button, ButtonLink } from "@/components/ui/button";
import { LeadForm } from "@/components/lead-form";
import { cn } from "@/lib/utils";

const OPTIONS: { value: Answer; label: string }[] = [
  { value: "yes", label: "Yes" },
  { value: "sometimes", label: "Sometimes" },
  { value: "no", label: "No" },
];

export function Scorecard() {
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const total = scorecardQuestions.length;
  const q = scorecardQuestions[step];

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, [step, done]);

  function choose(a: Answer) {
    const next = { ...answers, [q.id]: a };
    setAnswers(next);
    // Advance automatically after a short beat so the selection is visible.
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
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-emerald">
            Question {step + 1} of {total}
          </span>
          <span className="text-slate-600">{q.topic}</span>
        </div>
        <div
          className="mt-3 h-2 overflow-hidden rounded-full bg-ivory-200"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={Object.keys(answers).length}
          aria-label="Scorecard progress"
        >
          <div className="h-full rounded-full bg-emerald transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>

        <fieldset className="mt-8">
          <legend className="contents">
            <h2 ref={headingRef} tabIndex={-1} className="font-display text-2xl font-bold leading-snug outline-none sm:text-3xl">
              {q.question}
            </h2>
          </legend>
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
                    selected
                      ? "border-emerald bg-emerald-50 text-emerald-700"
                      : "border-navy/10 hover:border-emerald/50 hover:bg-ivory",
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
    </div>
  );
}

function Results({
  answers,
  onRestart,
  headingRef,
}: {
  answers: Record<string, Answer>;
  onRestart: () => void;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
}) {
  const { score, max, band, nextSteps } = scoreScorecard(answers);
  const checkup = getOffer("benefits")!;
  const clarity = getOffer("clarity")!;
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
              <circle
                cx="60"
                cy="60"
                r={R}
                fill="none"
                stroke="#C9A45C"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={C}
                strokeDashoffset={C - (pct / 100) * C}
                className="transition-[stroke-dashoffset] duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-5xl font-bold text-gold">{score}</span>
              <span className="text-sm text-ivory/70">out of {max}</span>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Your Family Money Score</p>
            <h2 ref={headingRef} tabIndex={-1} className="mt-3 text-3xl font-bold text-ivory outline-none sm:text-4xl">
              {band.title}
            </h2>
            <p className="mt-4 leading-relaxed text-ivory/80">{band.summary}</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-2xl font-bold">Your three recommended next steps</h3>
        <ol className="mt-5 grid gap-4 md:grid-cols-3">
          {nextSteps.map((s, i) => (
            <li key={s.title} className="flex flex-col rounded-[var(--radius-card)] border border-navy/10 bg-white p-6 shadow-soft">
              <span className="flex size-9 items-center justify-center rounded-full bg-emerald font-semibold text-white">{i + 1}</span>
              <p className="mt-4 text-lg font-bold leading-snug">{s.title}</p>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{s.detail}</p>
              <Link href={s.href} className="mt-4 text-sm font-semibold text-emerald underline-offset-4 hover:underline">
                {s.linkLabel} →
              </Link>
            </li>
          ))}
        </ol>
      </div>

      <details className="rounded-2xl border border-navy/10 bg-white p-5">
        <summary className="cursor-pointer font-semibold">See all of your answers</summary>
        <ul className="mt-4 divide-y divide-navy/8 text-sm">
          {scorecardQuestions.map((q) => (
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
            type="scorecard"
            context={{ score, band: band.title }}
            title="Want your free Money Roadmap?"
            description="Optional. We'll email your score along with a personalized educational Money Roadmap based on your answers."
            submitLabel="Email my Roadmap"
          />
        </div>
        <div className="no-print flex flex-col rounded-[var(--radius-card)] bg-gold-50 p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">Want a coach in your corner?</p>
          <p className="mt-3 font-display text-2xl font-bold">
            Start with the {checkup.name}, ${checkup.price}
          </p>
          <p className="mt-3 flex-1 leading-relaxed text-slate-600">
            Most working families leave value on the table at work. We&rsquo;ll walk through your benefits together and
            give you a Benefits Opportunity Report. Prefer to talk through everything? A {clarity.name} is ${clarity.price}.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={checkup.href}>Request a Checkup</ButtonLink>
            <ButtonLink href="/pricing" variant="outline">Compare services</ButtonLink>
          </div>
        </div>
      </div>

      <div className="no-print flex flex-wrap justify-center gap-3">
        <Button variant="outline" onClick={() => window.print()}>
          <Printer /> Print or save as PDF
        </Button>
        <Button variant="ghost" onClick={onRestart}>
          <RotateCcw /> Retake the Scorecard
        </Button>
      </div>

      <p className="text-center text-xs leading-relaxed text-slate-600">
        The Scorecard is a general educational self-assessment, not a financial plan or professional advice. Your score
        reflects only your answers to these ten questions.
      </p>
    </div>
  );
}
