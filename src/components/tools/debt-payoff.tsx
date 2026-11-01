"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { formatUSD, payoffPlan, validateDebts, type Debt, type PayoffResult } from "@/lib/calculators";
import { inputClass } from "@/components/ui/input";
import { Assumptions, ErrorList, NumberField, PrintButton } from "./fields";
import { GrowthChart } from "./growth-chart";
import { cn } from "@/lib/utils";

type Row = { id: string; name: string; balance: string; apr: string; minPayment: string };

let nextId = 4;
const START: Row[] = [
  { id: "1", name: "Store card", balance: "900", apr: "26.99", minPayment: "35" },
  { id: "2", name: "Visa", balance: "5200", apr: "22.9", minPayment: "130" },
  { id: "3", name: "Personal loan", balance: "3800", apr: "12.5", minPayment: "120" },
];

function years(m: number) {
  const y = Math.floor(m / 12);
  const mo = m % 12;
  return [y ? `${y} yr` : "", mo ? `${mo} mo` : ""].filter(Boolean).join(" ") || "0 mo";
}

export function DebtPayoffCalculator() {
  const [rows, setRows] = useState<Row[]>(START);
  const [extra, setExtra] = useState("150");

  const debts: Debt[] = rows.map((r) => ({ id: r.id, name: r.name.trim() || "Debt", balance: Number(r.balance), apr: Number(r.apr), minPayment: Number(r.minPayment) }));
  const errors = validateDebts(debts, Number(extra));
  const res = useMemo(() => {
    if (errors.length) return null;
    return { snowball: payoffPlan(debts, Number(extra), "snowball"), avalanche: payoffPlan(debts, Number(extra), "avalanche") };
  }, [JSON.stringify(rows), extra]); // eslint-disable-line react-hooks/exhaustive-deps

  const update = (id: string, key: keyof Row, v: string) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, [key]: v } : r)));

  const saved = res ? res.snowball.totalInterest - res.avalanche.totalInterest : 0;

  return (
    <div className="space-y-8">
      <div className="rounded-[var(--radius-card)] border border-navy/10 bg-white p-5 shadow-soft sm:p-8">
        <h2 className="text-xl font-bold">Your debts</h2>
        <p className="mt-1 text-sm text-slate-600">Credit cards and personal loans. Use the balance, APR, and minimum payment from your latest statement.</p>
        <div className="mt-6 space-y-4">
          <div className="hidden grid-cols-[1.4fr_1fr_0.8fr_1fr_auto] gap-3 px-1 text-xs font-semibold uppercase tracking-wider text-slate-600 md:grid">
            <span>Name</span><span>Balance</span><span>APR</span><span>Minimum / mo</span><span className="w-11" />
          </div>
          {rows.map((r, i) => (
            <fieldset key={r.id} className="grid grid-cols-2 gap-3 rounded-2xl bg-ivory p-4 md:grid-cols-[1.4fr_1fr_0.8fr_1fr_auto] md:bg-transparent md:p-0">
              <legend className="sr-only">Debt {i + 1}</legend>
              <label className="col-span-2 md:col-span-1">
                <span className="mb-1 block text-xs font-semibold md:sr-only">Name</span>
                <input className={inputClass} value={r.name} onChange={(e) => update(r.id, "name", e.target.value)} aria-label={`Debt ${i + 1} name`} maxLength={40} />
              </label>
              <Money label="Balance" prefix="$" value={r.balance} onChange={(v) => update(r.id, "balance", v)} />
              <Money label="APR" suffix="%" value={r.apr} onChange={(v) => update(r.id, "apr", v)} />
              <Money label="Minimum / mo" prefix="$" value={r.minPayment} onChange={(v) => update(r.id, "minPayment", v)} />
              <div className="flex items-end justify-end">
                <button
                  type="button"
                  onClick={() => setRows((rs) => rs.filter((x) => x.id !== r.id))}
                  disabled={rows.length === 1}
                  className="inline-flex size-11 items-center justify-center rounded-full text-slate-600 hover:bg-red-50 hover:text-red-700 disabled:opacity-30"
                  aria-label={`Remove ${r.name || `debt ${i + 1}`}`}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </fieldset>
          ))}
        </div>
        <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <button
            type="button"
            onClick={() => setRows((rs) => [...rs, { id: String(nextId++), name: `Debt ${rs.length + 1}`, balance: "", apr: "", minPayment: "" }])}
            disabled={rows.length >= 10}
            className="inline-flex items-center gap-2 self-start rounded-full border-2 border-dashed border-emerald/40 px-4 py-2 text-sm font-semibold text-emerald hover:border-emerald disabled:opacity-40"
          >
            <Plus className="size-4" /> Add a debt
          </button>
          <div className="sm:w-64">
            <NumberField label="Extra paid each month" prefix="$" value={extra} onChange={setExtra} min={0} step={25} hint="On top of all minimums." />
          </div>
        </div>
      </div>

      <div aria-live="polite" className="space-y-6">
        <ErrorList errors={errors} />
        {res && (
          <>
            {(res.snowball.neverPaysOff || res.avalanche.neverPaysOff) && (
              <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                At these payments, at least one balance isn&rsquo;t paid off within 50 years because interest is growing faster than payments. Try a larger
                extra payment.
              </p>
            )}
            <div className="grid gap-5 md:grid-cols-2">
              <MethodCard r={res.snowball} title="Debt snowball" blurb="Smallest balance first. Quick wins build momentum." better={res.snowball.totalInterest < res.avalanche.totalInterest - 1 || res.snowball.months < res.avalanche.months} />
              <MethodCard r={res.avalanche} title="Debt avalanche" blurb="Highest interest rate first. Usually the least interest overall." better={saved > 1} />
            </div>
            <p className="text-lg leading-relaxed">
              {saved > 1 ? (
                <>The avalanche method saves about <strong>{formatUSD(saved)}</strong> in interest here. The snowball pays off your first debt sooner. The best plan is the one you&rsquo;ll stick with.</>
              ) : (
                <>Both methods cost about the same here, so choose the one that keeps you motivated.</>
              )}
            </p>
            <div className="max-w-3xl">
            <GrowthChart
              title="Total balance remaining"
              xLabels={res.avalanche.balances.length >= res.snowball.balances.length ? res.avalanche.balances.map((_, i) => `M${i}`) : res.snowball.balances.map((_, i) => `M${i}`)}
              series={[
                { key: "s", label: "Snowball", color: "#C9A45C", values: res.snowball.balances },
                { key: "a", label: "Avalanche", color: "#167D68", values: res.avalanche.balances },
              ]}
            />
            </div>
            <PrintButton />
          </>
        )}
        <Assumptions
          items={[
            "Interest is calculated monthly at APR ÷ 12. Card issuers may compute interest daily, so real results differ slightly.",
            "Assumes no new charges, fixed APRs, and minimum payments that stay the same. Real minimums often fall as balances drop.",
            "When a debt is paid off, its minimum payment rolls into the next debt on the list.",
            "Educational estimate only. Contact your lenders for exact payoff amounts.",
          ]}
        />
      </div>
    </div>
  );
}

function Money({ label, value, onChange, prefix, suffix }: { label: string; value: string; onChange: (v: string) => void; prefix?: string; suffix?: string }) {
  return (
    <label className="relative block">
      <span className="mb-1 block text-xs font-semibold md:sr-only">{label}</span>
      <span className="relative block">
        {prefix && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-600">{prefix}</span>}
        <input type="number" inputMode="decimal" min={0} step="any" value={value} onChange={(e) => onChange(e.target.value)} className={cn(inputClass, prefix && "pl-7", suffix && "pr-8", "tabular-nums")} />
        {suffix && <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-600">{suffix}</span>}
      </span>
    </label>
  );
}

function MethodCard({ r, title, blurb, better }: { r: PayoffResult; title: string; blurb: string; better: boolean }) {
  return (
    <div className={cn("rounded-[var(--radius-card)] border p-6", better ? "border-emerald bg-emerald-50" : "border-navy/10 bg-white")}>
      <p className="text-lg font-bold">{title}</p>
      <p className="mt-1 text-sm text-slate-600">{blurb}</p>
      <dl className="mt-5 grid grid-cols-2 gap-4">
        <div><dt className="text-sm text-slate-600">Debt-free in</dt><dd className="font-display text-2xl font-bold tabular-nums">{r.neverPaysOff ? "50+ yr" : years(r.months)}</dd></div>
        <div><dt className="text-sm text-slate-600">Total interest</dt><dd className="font-display text-2xl font-bold tabular-nums">{formatUSD(r.totalInterest)}</dd></div>
      </dl>
      <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-slate-600">Payoff order</p>
      <ol className="mt-2 space-y-1.5 text-sm">
        {r.order.map((o, i) => (
          <li key={o.id} className="flex justify-between gap-3">
            <span>{i + 1}. {o.name}</span>
            <span className="tabular-nums text-slate-600">month {o.month}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
