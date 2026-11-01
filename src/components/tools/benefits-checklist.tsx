"use client";

import { useState } from "react";
import { CalendarClock, CheckCircle2, HelpCircle, Lightbulb, Printer, RotateCcw } from "lucide-react";
import { benefitGroups, benefitItems } from "@/content/benefits";
import { Button } from "@/components/ui/button";
import { LeadForm } from "@/components/lead-form";
import { cn } from "@/lib/utils";

type Status = "have" | "unsure" | "no" | "na";

const STATUS: { value: Status; label: string }[] = [
  { value: "have", label: "I use it" },
  { value: "unsure", label: "Not sure" },
  { value: "no", label: "Don't use it" },
  { value: "na", label: "Not offered" },
];

const DEADLINE_IDS = ["open-enrollment", "fsa", "hsa", "beneficiaries", "match", "vesting", "supp-life"];

export function BenefitsChecklist() {
  const [status, setStatus] = useState<Record<string, Status>>({});
  const [showReport, setShowReport] = useState(false);
  const answered = Object.keys(status).length;

  const have = benefitItems.filter((b) => status[b.id] === "have");
  const opportunities = benefitItems.filter((b) => status[b.id] === "unsure" || status[b.id] === "no");
  const deadlines = benefitItems.filter((b) => DEADLINE_IDS.includes(b.id) && status[b.id] !== "na");

  return (
    <div className="space-y-8">
      <div className="no-print space-y-8">
        {benefitGroups.map((g) => (
          <fieldset key={g} className="rounded-[var(--radius-card)] border border-navy/10 bg-white p-5 shadow-soft sm:p-7">
            <legend className="sr-only">{g}</legend>
            <h3 className="text-xl font-bold" aria-hidden>{g}</h3>
            <ul className="mt-4 divide-y divide-navy/8">
              {benefitItems.filter((b) => b.group === g).map((b) => (
                <li key={b.id} className="grid gap-3 py-4 md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <p className="font-semibold" id={`b-${b.id}`}>{b.name}</p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">{b.whyItMatters}</p>
                  </div>
                  <div role="radiogroup" aria-labelledby={`b-${b.id}`} className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {STATUS.map((s) => {
                      const on = status[b.id] === s.value;
                      return (
                        <button
                          key={s.value}
                          type="button"
                          role="radio"
                          aria-checked={on}
                          onClick={() => setStatus({ ...status, [b.id]: s.value })}
                          className={cn(
                            "rounded-xl border px-3 py-2 text-xs font-semibold transition-colors sm:text-sm",
                            on ? "border-emerald bg-emerald text-white" : "border-navy/12 bg-ivory hover:border-emerald/50",
                          )}
                        >
                          {s.label}
                        </button>
                      );
                    })}
                  </div>
                </li>
              ))}
            </ul>
          </fieldset>
        ))}

        <div className="sticky bottom-4 z-10 flex flex-col items-center justify-between gap-3 rounded-2xl bg-navy p-4 text-ivory shadow-lift sm:flex-row sm:px-6">
          <p className="text-sm">
            <strong className="text-gold">{answered}</strong> of {benefitItems.length} reviewed
          </p>
          <div className="flex gap-2">
            {answered > 0 && (
              <Button variant="ghost" size="sm" className="text-ivory hover:bg-white/10" onClick={() => { setStatus({}); setShowReport(false); }}>
                <RotateCcw /> Reset
              </Button>
            )}
            <Button variant="gold" size="sm" disabled={answered === 0} onClick={() => { setShowReport(true); setTimeout(() => document.getElementById("benefits-report")?.scrollIntoView({ behavior: "smooth" }), 50); }}>
              Build my question list
            </Button>
          </div>
        </div>
      </div>

      {showReport && answered > 0 && (
        <section id="benefits-report" aria-labelledby="report-title" className="scroll-mt-24 rounded-[var(--radius-card)] border border-gold/40 bg-white p-6 shadow-lift sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">Free self-check</p>
          <h3 id="report-title" className="mt-2 text-3xl font-bold">Your Benefits Question List</h3>
          <p className="mt-3 max-w-2xl leading-relaxed text-slate-600">
            Bring this list to HR or your benefits portal. It&rsquo;s a starting point for conversation, not a determination of what you&rsquo;re eligible for.
          </p>

          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            <ReportBlock icon={<CheckCircle2 className="text-emerald" />} title="Benefits you’re using" empty="None marked yet.">
              {have.map((b) => <li key={b.id}>{b.name}</li>)}
            </ReportBlock>
            <ReportBlock icon={<Lightbulb className="text-gold-600" />} title="Potential opportunities to explore" empty="Nothing flagged. Nice work.">
              {opportunities.map((b) => <li key={b.id}><strong>{b.name}.</strong> {b.whyItMatters}</li>)}
            </ReportBlock>
            <ReportBlock icon={<HelpCircle className="text-emerald" />} title="Questions to ask HR" empty="No open questions.">
              {opportunities.map((b) => <li key={b.id}>{b.askHR}</li>)}
            </ReportBlock>
            <ReportBlock icon={<CalendarClock className="text-gold-600" />} title="Deadlines and details to confirm" empty="None.">
              {deadlines.map((b) => <li key={b.id}>{b.name}: confirm dates, limits, and current elections.</li>)}
            </ReportBlock>
          </div>

          <div className="no-print mt-8 flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => window.print()}>
              <Printer /> Print or save as PDF
            </Button>
          </div>

          <div className="no-print mt-10 grid gap-8 border-t border-navy/10 pt-8 lg:grid-cols-2">
            <div>
              <p className="font-display text-2xl font-bold">Want help making sense of it?</p>
              <p className="mt-3 leading-relaxed text-slate-600">
                The $149 Employee Benefits Checkup turns this list into a guided review and a written Benefits Opportunity Report, with
                practical next steps.
              </p>
              <a href="/get-started?service=benefits" className="mt-5 inline-flex font-semibold text-emerald underline underline-offset-4">
                Request a Benefits Checkup →
              </a>
            </div>
            <LeadForm
              type="benefits-checklist"
              context={{ reviewed: answered, opportunities: opportunities.length }}
              title="Email me this list"
              submitLabel="Email my list"
              showName={false}
            />
          </div>
          <p className="mt-8 text-xs leading-relaxed text-slate-600">
            Educational only. Employer plan documents and administrators determine actual benefits, eligibility, and deadlines. MONEY COACH does not
            guarantee eligibility or savings.
          </p>
        </section>
      )}
    </div>
  );
}

function ReportBlock({ icon, title, empty, children }: { icon: React.ReactNode; title: string; empty: string; children: React.ReactNode[] }) {
  return (
    <div>
      <p className="flex items-center gap-2 text-lg font-bold [&_svg]:size-5">
        {icon} <span>{title}</span>
      </p>
      {children.length ? (
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed">{children}</ul>
      ) : (
        <p className="mt-3 text-sm text-slate-600">{empty}</p>
      )}
    </div>
  );
}
