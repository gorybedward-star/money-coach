"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Check, Flame, PartyPopper, Trophy, X } from "lucide-react";
import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { durationLabel, milestones, monthLabel, nextBestMove, projectNetWorth, resetProgress, toolkitSummary, type Milestone } from "@/lib/toolkit/calc";
import type { ToolkitState } from "@/lib/toolkit/model";
import { cn } from "@/lib/utils";
import { useToolkit } from "./store";
import { C, Card, ChartTooltip, Eyebrow, usd, usdCompact } from "./ui";

type Summary = ReturnType<typeof toolkitSummary>;

/* ------------------------------------------------------------------ Your Next Best Move */

export function NextMoveCard({ state, t }: { state: ToolkitState; t: Summary }) {
  const move = nextBestMove(state, t);
  return (
    <section className="mt-4 overflow-hidden rounded-2xl border border-[#167d68]/25 bg-white shadow-[0_1px_2px_rgba(11,31,58,0.04)]">
      <div className="grid gap-0 lg:grid-cols-[1fr_300px]">
        <div className="p-5 sm:p-6">
          <Eyebrow className="text-[#167d68]">Your Next Best Move</Eyebrow>
          <h2 className="mt-1.5 font-display text-2xl font-semibold leading-snug" style={{ textWrap: "balance" }}>{move.title}</h2>
          <p className="mt-2 max-w-2xl text-[14.5px] leading-relaxed text-[#33475f]">{move.detail}</p>
          <a href={`#/${move.href}`} className="mt-4 inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-[#0b1f3a] px-4 text-sm font-semibold text-white hover:bg-[#1d3a63]">
            {move.cta} <ArrowRight className="size-4" />
          </a>
        </div>
        <div className="border-t border-[#eef1f5] bg-[#f8faf9] p-5 sm:p-6 lg:border-l lg:border-t-0">
          <Eyebrow>Your path, step by step</Eyebrow>
          <ol className="mt-3 space-y-2">
            {move.path.map((p, i) => {
              const isCurrent = p.id === move.id;
              return (
                <li key={p.id} className="flex items-center gap-2.5 text-[13px]">
                  <span className={cn("grid size-5 shrink-0 place-items-center rounded-full border text-[10px] font-semibold tabular-nums", p.done ? "border-[#167d68] bg-[#167d68] text-white" : isCurrent ? "border-[#0b1f3a] bg-[#0b1f3a] text-white" : "border-[#c9d5e4] text-[#5f6f86]")}>
                    {p.done ? <Check className="size-3" strokeWidth={3} /> : i + 1}
                  </span>
                  <span className={cn(p.done ? "text-[#5f6f86]" : isCurrent ? "font-semibold text-[#0b1f3a]" : "text-[#5f6f86]")}>{p.label}</span>
                  {isCurrent && <span className="ml-auto rounded-full bg-[#eef6f3] px-2 py-0.5 text-[10.5px] font-semibold text-[#167d68]">Now</span>}
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Today's step + streak */

export function TodayStepCard({ state, t }: { state: ToolkitState; t: Summary }) {
  const rp = resetProgress(state, t);
  const step = rp.todayStep;
  return (
    <a href="#/reset" className="group flex h-full flex-col justify-between gap-3 rounded-2xl border border-[#e3e8ef] bg-white p-5 transition hover:border-[#0b1f3a]/30">
      <div className="flex items-center justify-between gap-3">
        <Eyebrow>30-Day Reset · Day {rp.day} of 30</Eyebrow>
        <span className="inline-flex items-center gap-1 rounded-full bg-[#fbf6ea] px-2 py-0.5 text-xs font-semibold text-[#8a6a22]"><Flame className="size-3.5" /> {rp.streak}</span>
      </div>
      {step ? (
        <div>
          <p className="text-xs text-[#5f6f86]">{step.day <= rp.day ? "Today's step" : "Up next"} · Day {step.day}</p>
          <p className="mt-0.5 font-display text-lg font-semibold leading-snug">{step.label}</p>
        </div>
      ) : (
        <p className="font-display text-lg font-semibold">All 30 steps done. See your results.</p>
      )}
      <div className="flex items-center justify-between text-xs text-[#5f6f86]">
        <span>{rp.completed} of {rp.total} steps done</span>
        <span className="inline-flex items-center gap-1 font-semibold text-[#167d68]">Open <ArrowRight className="size-3" /></span>
      </div>
    </a>
  );
}

/* ------------------------------------------------------------------ Goal date + what-if */

export function goalDate(state: ToolkitState, t: Summary) {
  const p = projectNetWorth(state, 0, t);
  return p.goalMonth;
}

export function GoalDateCard({ state, t }: { state: ToolkitState; t: Summary }) {
  const [extra, setExtra] = useState(100);
  const base = useMemo(() => projectNetWorth(state, 0, t), [state, t]);
  const what = useMemo(() => projectNetWorth(state, extra, t), [state, t, extra]);
  const goal = state.netWorth.goal;
  const horizon = Math.min(600, Math.max(36, (base.goalMonth ?? 240) + 12));
  const step = horizon > 180 ? 6 : horizon > 72 ? 3 : 1;
  const tickEvery = horizon > 240 ? 60 : horizon > 120 ? 24 : 12;
  const ticks = Array.from({ length: Math.floor(horizon / tickEvery) + 1 }, (_, i) => i * tickEvery);
  const data = [];
  for (let m = 0; m <= horizon; m += step) data.push({ m, base: base.series[m]?.nw ?? base.series.at(-1)!.nw, what: what.series[m]?.nw ?? what.series.at(-1)!.nw });
  const sooner = base.goalMonth !== null && what.goalMonth !== null ? base.goalMonth - what.goalMonth : null;
  const debtSooner = base.debtFreeMonth !== null && what.debtFreeMonth !== null ? base.debtFreeMonth - what.debtFreeMonth : null;
  const goalLabel = goal >= 1_000_000 ? `$${goal / 1_000_000}M` : usd(goal);

  return (
    <Card title={`When will you reach ${goalLabel}?`} eyebrow="Goal date">
      <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
        <div>
          <p className="text-[13px] text-[#5f6f86]">At your current plan</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums tracking-tight">
            {base.goalMonth === 0 ? "Reached" : base.goalMonth === null ? "50+ years" : monthLabel(base.goalMonth)}
          </p>
          {base.goalMonth ? <p className="text-sm text-[#5f6f86]">About {durationLabel(base.goalMonth)} from now</p> : null}

          <div className="mt-6">
            <label htmlFor="whatif" className="flex items-baseline justify-between gap-3 text-sm font-medium">
              What if I put an extra
              <span className="text-lg font-semibold tabular-nums text-[#167d68]">{usd(extra)}/mo</span>
            </label>
            <input id="whatif" type="range" min={0} max={1000} step={25} value={extra} onChange={(e) => setExtra(Number(e.target.value))} className="mt-2 w-full" />
            <div className="flex justify-between text-[11px] text-[#9aa7b8]"><span>$0</span><span>$1,000</span></div>
          </div>

          <div className="mt-4 space-y-2 rounded-xl bg-[#eef6f3] p-4 text-sm">
            {extra === 0 ? (
              <p className="text-[#33475f]">Move the slider to see how a little more each month changes your dates.</p>
            ) : (
              <>
                <p><span className="text-[#5f6f86]">Goal reached </span><span className="font-semibold tabular-nums">{what.goalMonth === 0 ? "now" : what.goalMonth === null ? "50+ years" : monthLabel(what.goalMonth)}</span>{sooner ? <span className="font-semibold text-[#167d68]"> · {durationLabel(sooner)} sooner</span> : null}</p>
                {what.debtFreeMonth !== null && <p><span className="text-[#5f6f86]">Debt-free </span><span className="font-semibold tabular-nums">{monthLabel(what.debtFreeMonth)}</span>{debtSooner ? <span className="font-semibold text-[#167d68]"> · {durationLabel(debtSooner)} sooner</span> : null}</p>}
              </>
            )}
          </div>
        </div>

        <div>
          <div style={{ height: 260 }} className="w-full">
            <ResponsiveContainer>
              <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid vertical={false} stroke={C.grid} />
                <XAxis dataKey="m" type="number" domain={[0, horizon]} ticks={ticks} tick={{ fontSize: 11, fill: C.muted }} tickLine={false} axisLine={false} tickFormatter={(m) => (m === 0 ? "Now" : `${m / 12} yr`)} />
                <YAxis tickFormatter={usdCompact} tick={{ fontSize: 11, fill: C.muted }} tickLine={false} axisLine={false} width={56} domain={[(min: number) => Math.max(0, Math.floor((min * 0.85) / 10_000) * 10_000), "auto"]} />
                <Tooltip content={<ChartTooltip labelFormat={(l) => (Number(l) === 0 ? "Now" : monthLabel(Number(l)))} />} />
                <Legend iconType="plainline" wrapperStyle={{ fontSize: 12, color: C.muted }} />
                <ReferenceLine y={goal} stroke={C.gold} strokeDasharray="4 4" label={{ value: `Goal ${goalLabel}`, position: "insideTopLeft", fill: C.gold, fontSize: 11 }} />
                <Line type="monotone" dataKey="base" name="Current plan" stroke={C.navy} strokeWidth={2} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="what" name={`+${usd(extra)}/mo`} stroke={C.green} strokeWidth={2.25} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-[#5f6f86]">
            Hypothetical estimate from your own numbers: debts paid on your current plan, your Savings line added each month, and invested balances growing at {state.investing.returnPct}% a year with your monthly investing. When debts are paid off, those payments go to investing. Home, vehicle and mortgage values are held flat. Returns aren&rsquo;t guaranteed.
          </p>
        </div>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ Milestones */

export function WinsStrip({ state, t }: { state: ToolkitState; t: Summary }) {
  const wins = milestones(state, t);
  if (!wins.length) return null;
  return (
    <section className="mt-4 rounded-2xl border border-[#e3e8ef] bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <Eyebrow className="flex items-center gap-1.5"><Trophy className="size-3.5 text-[#b8954a]" /> Your wins</Eyebrow>
        <span className="text-xs text-[#5f6f86]">{wins.length} milestone{wins.length === 1 ? "" : "s"}</span>
      </div>
      <ul className="mt-3 flex flex-wrap gap-2">
        {[...wins].reverse().map((w) => (
          <li key={w.id} title={w.detail} className="inline-flex items-center gap-1.5 rounded-full border border-[#b8954a]/30 bg-[#fbf6ea] px-3 py-1 text-[12.5px] font-medium text-[#5c4a1f]">
            <Check className="size-3.5 text-[#b8954a]" strokeWidth={3} /> {w.title}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Confetti() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const c = ref.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    const w = (c.width = c.offsetWidth * devicePixelRatio);
    const h = (c.height = c.offsetHeight * devicePixelRatio);
    const colors = [C.green, C.greenSoft, C.gold, C.navy2, "#ffffff"];
    const bits = Array.from({ length: 90 }, () => ({ x: Math.random() * w, y: -Math.random() * h * 0.6, vx: (Math.random() - 0.5) * 2, vy: 2 + Math.random() * 3, s: (4 + Math.random() * 5) * devicePixelRatio, r: Math.random() * 6, c: colors[Math.floor(Math.random() * colors.length)] }));
    let frame = 0;
    let raf = 0;
    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      for (const b of bits) {
        b.x += b.vx * devicePixelRatio;
        b.y += b.vy * devicePixelRatio;
        b.r += 0.08;
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(b.r);
        ctx.fillStyle = b.c;
        ctx.fillRect(-b.s / 2, -b.s / 4, b.s, b.s / 2);
        ctx.restore();
      }
      if (++frame < 200) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} aria-hidden className="pointer-events-none absolute inset-0 size-full" />;
}

/** Celebrates new milestones once, the first time the numbers show them. */
export function Celebration() {
  const { state, update } = useToolkit();
  const t = toolkitSummary(state);
  const fresh: Milestone[] = state.onboarded ? milestones(state, t).filter((m) => !state.celebrated.includes(m.id)) : [];
  const freshKey = fresh.map((m) => m.id).join("|");
  const close = () => update((s) => ({ ...s, celebrated: [...new Set([...s.celebrated, ...milestones(s).map((m) => m.id)])] }));
  // Wait until the person stops typing, so clearing a field to retype it never sets off a celebration.
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(false);
    if (!freshKey) return;
    const editing = () => {
      const el = document.activeElement;
      return !!el && ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName);
    };
    let timer = 0;
    const arm = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => !editing() && setReady(true), 900);
    };
    arm();
    document.addEventListener("focusout", arm);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("focusout", arm);
    };
  }, [freshKey]);
  useEffect(() => {
    if (!ready || !freshKey) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });
  if (!ready) return null;
  if (!fresh.length) return null;
  const top = fresh.slice(-3).reverse();
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4 print:hidden" role="dialog" aria-modal="true" aria-labelledby="celebrate-title">
      <button type="button" aria-label="Close" className="absolute inset-0 bg-[#0b1f3a]/60" onClick={close} />
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-[#0b1f3a] p-7 text-center text-white shadow-2xl">
        <Confetti />
        <button type="button" aria-label="Close" onClick={close} className="absolute right-3 top-3 grid size-9 place-items-center rounded-lg text-white/70 hover:bg-white/10"><X className="size-5" /></button>
        <div className="relative">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#167d68]"><PartyPopper className="size-7" /></span>
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8cc7b5]">Milestone reached</p>
          <h2 id="celebrate-title" className="mt-1 font-display text-2xl font-semibold leading-snug">{top[0].title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-white/75">{top[0].detail}</p>
          {top.length > 1 && (
            <ul className="mt-4 space-y-1.5 text-left text-sm">
              {top.slice(1).map((m) => (
                <li key={m.id} className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2"><Check className="size-4 text-[#8cc7b5]" /> {m.title}</li>
              ))}
            </ul>
          )}
          <button type="button" onClick={close} className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-white text-sm font-semibold text-[#0b1f3a] hover:bg-[#eef6f3]">Keep going</button>
        </div>
      </div>
    </div>
  );
}
