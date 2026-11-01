"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PAY_PERIODS, formatUSD, payYourselfFirst, validatePayYourselfFirst, type Frequency } from "@/lib/calculators";
import { Label, Select } from "@/components/ui/input";
import { Assumptions, ErrorList, NumberField, Stat, ToolLayout } from "./fields";

export function PayYourselfFirstCalculator() {
  const [income, setIncome] = useState("55000");
  const [pct, setPct] = useState("10");
  const [frequency, setFrequency] = useState<Frequency>("biweekly");
  const [rate, setRate] = useState("6");

  const input = { annualIncome: Number(income), contributionPct: Number(pct), frequency, hypotheticalReturnPct: Number(rate) };
  const errors = validatePayYourselfFirst(input);
  const result = useMemo(() => (errors.length ? null : payYourselfFirst(input)), [income, pct, frequency, rate]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <ToolLayout
      form={
        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          <h2 className="text-xl font-bold">Your numbers</h2>
          <NumberField label="Annual income (before taxes)" prefix="$" value={income} onChange={setIncome} min={0} step={1000} invalid={errors.some((e) => e.includes("income"))} hint="Use gross yearly pay, or your best estimate." />
          <div>
            <NumberField label="Pay yourself first" suffix="%" value={pct} onChange={setPct} min={0} max={100} step={0.5} invalid={errors.some((e) => e.includes("percentage"))} />
            <input type="range" min={1} max={30} step={1} value={Number(pct) || 0} onChange={(e) => setPct(e.target.value)} className="mt-3 w-full" aria-label="Savings percentage slider" />
            <div className="flex justify-between text-xs text-slate-600"><span>1%</span><span>15%</span><span>30%</span></div>
          </div>
          <div>
            <Label htmlFor="freq">How often you&rsquo;re paid</Label>
            <Select id="freq" value={frequency} onChange={(e) => setFrequency(e.target.value as Frequency)}>
              {Object.entries(PAY_PERIODS).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </Select>
          </div>
          <NumberField label="Hypothetical annual return (for growth illustration)" suffix="%" value={rate} onChange={setRate} min={0} max={15} step={0.5} hint="Used only for the long-term illustration below. Try 0% to see savings alone." />
        </form>
      }
      results={
        <div className="space-y-6">
          <ErrorList errors={errors} />
          {result && (
            <>
              <div className="grid gap-4 sm:grid-cols-3">
                <Stat label="Per paycheck" value={formatUSD(result.perPaycheck, true)} emphasis />
                <Stat label="Per month" value={formatUSD(result.monthly)} />
                <Stat label="Per year" value={formatUSD(result.annual)} />
              </div>
              <p className="text-lg leading-relaxed">
                Setting aside <strong>{pct}%</strong> means about <strong>{formatUSD(result.perPaycheck, true)}</strong> from each paycheck goes to your future
                before anything else.
              </p>

              <div className="rounded-2xl border border-navy/10 bg-white p-5 sm:p-6">
                <h3 className="font-semibold">What consistency could add up to</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Saving the same monthly amount, with a hypothetical {rate}% annual return compounded monthly.
                </p>
                <div className="mt-5 overflow-x-auto">
                  <table className="w-full min-w-[22rem] text-left text-sm">
                    <thead>
                      <tr className="border-b border-navy/10 text-slate-600">
                        <th scope="col" className="py-2 font-medium">After</th>
                        <th scope="col" className="py-2 font-medium">You saved</th>
                        <th scope="col" className="py-2 font-medium">Hypothetical value</th>
                      </tr>
                    </thead>
                    <tbody className="tabular-nums">
                      {result.projections.map((p) => {
                        const share = p.value > 0 ? (p.contributed / p.value) * 100 : 100;
                        return (
                          <tr key={p.years} className="border-b border-navy/5 last:border-0">
                            <th scope="row" className="py-3 font-semibold">{p.years} {p.years === 1 ? "year" : "years"}</th>
                            <td className="py-3">{formatUSD(p.contributed)}</td>
                            <td className="py-3">
                              <span className="font-semibold">{formatUSD(p.value)}</span>
                              <span aria-hidden className="mt-1.5 flex h-1.5 w-full max-w-40 overflow-hidden rounded-full bg-ivory-200">
                                <span className="bg-emerald" style={{ width: `${share}%` }} />
                                <span className="bg-gold" style={{ width: `${100 - share}%` }} />
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <p className="mt-3 flex gap-4 text-xs text-slate-600">
                  <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-emerald" /> Your savings</span>
                  <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-gold" /> Hypothetical growth</span>
                </p>
              </div>

              <div className="rounded-2xl bg-emerald-50 p-5 text-sm leading-relaxed">
                <strong>Next step:</strong> set an automatic transfer or payroll deduction for this amount on payday. If your employer offers a retirement match,{" "}
                <Link href="/employee-benefits" className="font-semibold text-emerald underline">make sure you&rsquo;re receiving it</Link>. Then see{" "}
                <Link href="/tools/cost-of-waiting" className="font-semibold text-emerald underline">the cost of waiting</Link>.
              </div>
            </>
          )}
          <Assumptions
            items={[
              "Savings are calculated on gross (before-tax) income. Your take-home amount depends on taxes and deductions.",
              "Per-paycheck amounts assume equal paychecks. Monthly figures are annual savings divided by 12.",
              "Growth illustrations assume level monthly contributions and a constant hypothetical return, compounded monthly. Real returns vary, can be negative, and are never guaranteed.",
              "Taxes, fees, inflation, and raises are not included.",
              "This is an educational illustration, not a financial plan or advice.",
            ]}
          />
        </div>
      }
    />
  );
}
