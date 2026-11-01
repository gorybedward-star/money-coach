"use client";

import { useId, useState } from "react";
import { formatUSD } from "@/lib/calculators";
import { fedCostOfWaiting, RETIREMENT_SYSTEMS, validateFedCostOfWaiting, type FedScenario, type RetirementSystem } from "@/lib/tsp";
import { SOURCES } from "@/config/federal-rules";
import { Label, Select } from "@/components/ui/input";
import { Assumptions, ErrorList, NumberField, PrintButton, Stat, ToolLayout } from "@/components/tools/fields";
import { GrowthChart } from "@/components/tools/growth-chart";
import { NoSensitiveInfo, SourceList } from "./shared";

export function FedCostOfWaitingCalculator() {
  const sysId = useId();
  const [pay, setPay] = useState("55000");
  const [rate, setRate] = useState("5");
  const [system, setSystem] = useState<RetirementSystem>("fers");
  const [age, setAge] = useState("28");
  const [delay, setDelay] = useState("5");
  const [retire, setRetire] = useState("62");
  const [ret, setRet] = useState("6");

  const input = {
    annualBasicPay: Number(pay),
    employeeRatePct: Number(rate),
    system,
    currentAge: Number(age),
    delayYears: Number(delay),
    retirementAge: Number(retire),
    annualReturnPct: Number(ret),
  };
  const errors = validateFedCostOfWaiting(input);
  const r = errors.length ? null : fedCostOfWaiting(input);
  const eligible = RETIREMENT_SYSTEMS[system].agencyEligible;

  return (
    <ToolLayout
      form={
        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          <h2 className="text-xl font-bold">Your numbers</h2>
          <NumberField label="Annual basic pay" prefix="$" value={pay} onChange={setPay} min={0} step={1000} />
          <NumberField label="Contribution you would make" suffix="% of pay" value={rate} onChange={setRate} min={0} max={100} step={1} />
          <div>
            <Label htmlFor={sysId}>Agency contributions</Label>
            <Select id={sysId} value={system} onChange={(e) => setSystem(e.target.value as RetirementSystem)}>
              {Object.entries(RETIREMENT_SYSTEMS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <NumberField label="Current age" value={age} onChange={setAge} min={16} max={80} step={1} />
            <NumberField label="Retirement age" value={retire} onChange={setRetire} min={17} max={85} step={1} />
          </div>
          <NumberField label="Years you might wait" value={delay} onChange={setDelay} min={1} max={40} step={1} />
          <NumberField label="Hypothetical annual return" suffix="%" value={ret} onChange={setRet} min={0} max={12} step={0.5} hint="For illustration only. Actual returns vary and can be negative." />
          <NoSensitiveInfo />
        </form>
      }
      results={
        <div className="space-y-6">
          <ErrorList errors={errors} />
          {r && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Stat label={`Illustrative difference at age ${retire}`} value={formatUSD(r.difference)} emphasis sub={`From waiting ${delay} year${Number(delay) === 1 ? "" : "s"}`} />
                <Stat label="Agency contributions given up" value={formatUSD(r.agencyForgone)} sub={eligible ? "Matching you would not receive while waiting" : "No agency contributions for this status"} />
              </div>

              <div className="overflow-x-auto rounded-2xl border border-navy/10 bg-white">
                <table className="w-full min-w-[30rem] text-left text-sm">
                  <caption className="px-5 pt-4 text-left font-semibold">Contributions vs. modeled growth</caption>
                  <thead>
                    <tr className="border-b border-navy/10">
                      <th scope="col" className="px-5 py-3"></th>
                      <th scope="col" className="px-5 py-3">Start at {age}</th>
                      <th scope="col" className="px-5 py-3">Start at {Number(age) + Number(delay)}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <Row label="Your contributions" a={r.startNow} b={r.delay} k="employeeContributions" />
                    <Row label="Agency contributions" a={r.startNow} b={r.delay} k="agencyContributions" />
                    <Row label="Modeled investment growth" a={r.startNow} b={r.delay} k="growth" />
                    <Row label="Illustrative balance" a={r.startNow} b={r.delay} k="balance" strong />
                  </tbody>
                </table>
              </div>

              <div className="rounded-2xl bg-emerald-50 p-5 leading-relaxed">
                <p>
                  Waiting means putting in <strong>{formatUSD(r.startNow.employeeContributions - r.delay.employeeContributions)}</strong> less of your own money,
                  {eligible && <> receiving <strong>{formatUSD(r.agencyForgone)}</strong> less from your agency,</>} and giving up about{" "}
                  <strong>{formatUSD(r.startNow.growth - r.delay.growth)}</strong> in modeled growth under these assumptions.
                </p>
                {eligible && <p className="mt-2 text-sm text-slate-600">Under FERS, the 1% Agency Automatic Contribution continues even while you wait. The matching does not.</p>}
              </div>

              <GrowthChart
                title="Illustrative balance by age"
                xLabels={r.series.map((s) => s.age)}
                series={[
                  { key: "now", label: `Start at ${age}`, color: "#167D68", values: r.series.map((s) => s.startNow) },
                  { key: "wait", label: `Start at ${Number(age) + Number(delay)}`, color: "#C9A45C", values: r.series.map((s) => s.delay) },
                ]}
              />
              <PrintButton />
            </>
          )}
          <Assumptions
            items={[
              "Pay and contribution rate stay level. Raises, step increases, and inflation are not modeled.",
              "Contributions are spread monthly and growth compounds monthly at one constant hypothetical rate. Real returns vary and can be negative.",
              "Under FERS, the waiting scenario still receives the 1% Agency Automatic Contribution but no matching.",
              "Annual contribution limits, catch-up contributions, fees, taxes, and withdrawals are not modeled.",
              "This is a hypothetical educational comparison, not a prediction or recommendation.",
            ]}
          />
          <SourceList sources={[SOURCES.tspContributionTypes, SOURCES.tspCalculators]} />
        </div>
      }
    />
  );
}

function Row({ label, a, b, k, strong }: { label: string; a: FedScenario; b: FedScenario; k: keyof FedScenario; strong?: boolean }) {
  return (
    <tr className={strong ? "bg-ivory font-semibold" : "border-b border-navy/6"}>
      <th scope="row" className="px-5 py-2.5 font-medium">{label}</th>
      <td className="px-5 py-2.5 tabular-nums">{formatUSD(a[k])}</td>
      <td className="px-5 py-2.5 tabular-nums">{formatUSD(b[k])}</td>
    </tr>
  );
}
