"use client";

import { useId, useState } from "react";
import { formatUSD } from "@/lib/calculators";
import { agencyMatch, fersMatchPct, RETIREMENT_SYSTEMS, validateAgencyMatch, type RetirementSystem } from "@/lib/tsp";
import { activeLimitYear, fersAgency, FEDERAL_PAY_PERIODS, getLimits, SOURCES } from "@/config/federal-rules";
import { Label, Select } from "@/components/ui/input";
import { Assumptions, ErrorList, NumberField, PrintButton, Stat, ToolLayout } from "@/components/tools/fields";
import { NoSensitiveInfo, SourceList } from "./shared";

export function AgencyMatchCalculator() {
  const sysId = useId();
  const [pay, setPay] = useState("65000");
  const [rate, setRate] = useState("5");
  const [system, setSystem] = useState<RetirementSystem>("fers");
  const [age, setAge] = useState("40");
  const limits = getLimits(activeLimitYear);

  const input = { annualBasicPay: Number(pay), employeeRatePct: Number(rate), ageAtYearEnd: Number(age) };
  const errors = validateAgencyMatch(input);
  const r = errors.length ? null : agencyMatch({ ...input, system });
  const eligible = RETIREMENT_SYSTEMS[system].agencyEligible;

  return (
    <ToolLayout
      form={
        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          <h2 className="text-xl font-bold">Your numbers</h2>
          <NumberField label="Annual basic pay" prefix="$" value={pay} onChange={setPay} min={0} step={1000} hint="Basic pay generally excludes overtime, bonuses, and most allowances. See your LES." />
          <div>
            <NumberField label="Your TSP contribution" suffix="% of pay" value={rate} onChange={setRate} min={0} max={100} step={1} hint="Traditional and Roth combined." />
            <input type="range" min={0} max={30} step={1} value={Number(rate) || 0} onChange={(e) => setRate(e.target.value)} className="mt-3 w-full" aria-label="Contribution rate slider" />
          </div>
          <div>
            <Label htmlFor={sysId}>Retirement system and matching eligibility</Label>
            <Select id={sysId} value={system} onChange={(e) => setSystem(e.target.value as RetirementSystem)}>
              {Object.entries(RETIREMENT_SYSTEMS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </Select>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{RETIREMENT_SYSTEMS[system].note}</p>
          </div>
          <NumberField label={`Your age on December 31, ${limits.year}`} value={age} onChange={setAge} min={16} max={100} step={1} hint="Used only to apply the catch-up limit (age 50+, higher at 60–63)." />
          <div className="rounded-xl bg-ivory-200 p-4 text-xs leading-relaxed text-slate-600">
            <p className="font-semibold text-navy">Plan rules applied ({limits.year})</p>
            <p className="mt-1">
              Elective deferral limit {formatUSD(limits.electiveDeferral)} · catch-up {formatUSD(limits.catchUp50)} (50+) or {formatUSD(limits.catchUp60to63)} (60–63) · {FEDERAL_PAY_PERIODS} biweekly pay periods
              {eligible && <> · FERS: {fersAgency.automaticPct}% automatic + match of 100% on the first 3% and 50% on the next 2%</>}
            </p>
          </div>
          <NoSensitiveInfo />
        </form>
      }
      results={
        <div className="space-y-6">
          <ErrorList errors={errors} />
          {r && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Stat label="Total going into your TSP / yr" value={formatUSD(r.total)} emphasis sub={`About ${formatUSD(r.total / FEDERAL_PAY_PERIODS)} per pay period`} />
                <Stat label="Your contributions / yr" value={formatUSD(r.employee)} sub={`About ${formatUSD(r.employee / FEDERAL_PAY_PERIODS)} per pay period`} />
                <Stat label="Agency Automatic (1%) / yr" value={formatUSD(r.automatic)} sub={eligible ? "Received even if you contribute 0%" : "Not available for this status"} />
                <Stat label="Agency Matching / yr" value={formatUSD(r.matching)} sub={eligible ? `Maximum possible: ${formatUSD((fersAgency.maxMatchPct / 100) * Number(pay))}` : "Not available for this status"} />
              </div>

              {!eligible && (
                <div className="rounded-2xl border border-navy/10 bg-white p-5 leading-relaxed">
                  <p className="font-semibold">No agency contributions under this status.</p>
                  <p className="mt-1 text-sm text-slate-600">{RETIREMENT_SYSTEMS[system].note} Your own contributions still grow tax-advantaged in the TSP.</p>
                </div>
              )}

              {eligible && r.matchMissedBelowFive > 0.5 && (
                <div className="rounded-2xl border border-gold/50 bg-gold-50 p-5 leading-relaxed">
                  <p className="font-semibold">You may be missing about {formatUSD(r.matchMissedBelowFive)} a year in agency matching.</p>
                  <p className="mt-1 text-sm text-slate-600">
                    Under the FERS formula, contributing at least <strong>{fersAgency.fullMatchAtPct}%</strong> of basic pay every pay period receives the full 4% match.
                    If that is not affordable yet, many people raise their rate by 1% at a time, such as with each raise.
                  </p>
                </div>
              )}

              {eligible && r.limitReachedInPeriod !== null && r.matchLostToLimit > 0.5 && (
                <div role="status" className="rounded-2xl border border-red-200 bg-red-50 p-5 leading-relaxed text-red-900">
                  <p className="font-semibold">At {rate}%, you would reach your {formatUSD(r.employeeLimit)} limit in pay period {r.limitReachedInPeriod} of {FEDERAL_PAY_PERIODS}.</p>
                  <p className="mt-1 text-sm">
                    Contributions stop once you reach the limit, and so does agency matching. That could cost about <strong>{formatUSD(r.matchLostToLimit)}</strong> in matching this year.
                    Electing about <strong>{r.maxEvenRatePct}%</strong> would spread contributions across all {FEDERAL_PAY_PERIODS} pay periods under these assumptions. Confirm your pay schedule with your payroll office.
                  </p>
                </div>
              )}

              {eligible && r.matchMissedBelowFive <= 0.5 && r.matchLostToLimit <= 0.5 && (
                <div className="rounded-2xl bg-emerald-50 p-5 leading-relaxed">
                  <p className="font-semibold">At {rate}%, you would receive the full agency match under these assumptions.</p>
                  <p className="mt-1 text-sm text-slate-600">Check your Leave and Earnings Statement to confirm agency contributions are posting each pay period.</p>
                </div>
              )}

              {r.limitReachedInPeriod !== null && !eligible && (
                <p className="rounded-2xl border border-navy/10 bg-white p-5 text-sm leading-relaxed text-slate-600">
                  At {rate}%, contributions would reach your {formatUSD(r.employeeLimit)} limit in pay period {r.limitReachedInPeriod} and stop for the rest of the year.
                </p>
              )}

              <div className="rounded-2xl border border-navy/10 bg-white p-5">
                <p className="text-sm font-semibold">Where the money comes from</p>
                <div className="mt-3 flex h-4 overflow-hidden rounded-full bg-ivory-200" role="img" aria-label={`You ${formatUSD(r.employee)}, agency automatic ${formatUSD(r.automatic)}, agency matching ${formatUSD(r.matching)}`}>
                  <span className="bg-navy" style={{ width: `${r.total ? (r.employee / r.total) * 100 : 0}%` }} />
                  <span className="bg-gold" style={{ width: `${r.total ? (r.automatic / r.total) * 100 : 0}%` }} />
                  <span className="bg-emerald" style={{ width: `${r.total ? (r.matching / r.total) * 100 : 0}%` }} />
                </div>
                <p className="mt-2 flex flex-wrap gap-4 text-xs text-slate-600">
                  <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-navy" /> You</span>
                  <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-gold" /> Agency Automatic (1%)</span>
                  <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-emerald" /> Agency Matching</span>
                </p>
              </div>

              {eligible && <MatchTable pay={Number(pay)} current={Number(rate)} />}

              <PrintButton />
            </>
          )}
          <Assumptions
            items={[
              `Uses ${limits.year} IRS limits as published by the TSP, and ${FEDERAL_PAY_PERIODS} equal biweekly pay periods. Some years have 27 pay dates, and pay changes during the year are not modeled.`,
              "FERS matching is calculated each pay period on what you contribute that pay period. There is no year-end true-up, so contributions that stop early also stop matching.",
              "Catch-up (spillover) contributions for those 50 and older are included in the employee limit and are matched only up to the same 5% of pay.",
              "If you contribute to another employer's 401(k) or 403(b) in the same year, the elective deferral limit is shared. That is not modeled here.",
              "Uniformed services (Blended Retirement System) rules differ and are not modeled.",
              "Your agency's payroll records and the TSP determine your actual contributions and eligibility. This is an educational estimate, not an official calculation.",
            ]}
          />
          <SourceList sources={[SOURCES.tspContributionTypes, SOURCES.tspLimits, SOURCES.tspCalculators]} />
        </div>
      }
    />
  );
}

function MatchTable({ pay, current }: { pay: number; current: number }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-navy/10 bg-white">
      <table className="w-full min-w-[30rem] text-left text-sm">
        <caption className="px-5 pt-4 text-left font-semibold">FERS agency contributions at each rate (per year, before limits)</caption>
        <thead>
          <tr className="border-b border-navy/10">
            <th scope="col" className="px-5 py-3">You contribute</th>
            <th scope="col" className="px-5 py-3">You</th>
            <th scope="col" className="px-5 py-3">Agency total</th>
            <th scope="col" className="px-5 py-3">Combined</th>
          </tr>
        </thead>
        <tbody>
          {[0, 1, 2, 3, 4, 5].map((p) => {
            const you = (p / 100) * pay;
            const ag = ((fersAgency.automaticPct + fersMatchPct(p)) / 100) * pay;
            const active = Math.min(Math.round(current), 5) === p;
            return (
              <tr key={p} className={active ? "bg-emerald-50 font-semibold" : "border-b border-navy/6 last:border-0"}>
                <th scope="row" className="px-5 py-2.5">{p === 5 ? "5% or more" : `${p}%`}{active && <span className="sr-only"> (your rate)</span>}</th>
                <td className="px-5 py-2.5 tabular-nums">{formatUSD(you)}{p === 5 ? "+" : ""}</td>
                <td className="px-5 py-2.5 tabular-nums">{formatUSD(ag)}</td>
                <td className="px-5 py-2.5 tabular-nums">{formatUSD(you + ag)}{p === 5 ? "+" : ""}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
