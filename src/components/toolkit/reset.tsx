"use client";

import { ArrowRight, Award, Check, Flame, Target } from "lucide-react";
import { CLOSING_QUESTION, MODULES, PROTECTION_DISCLAIMER, RESET_WEEKS, type ResetTask } from "@/content/toolkit";
import { benefitIdsFor, resetProgress, scorecard } from "@/lib/toolkit/calc";
import { dayKey } from "@/lib/toolkit/model";
import { cn } from "@/lib/utils";
import { useToolkit } from "./store";
import { Btn, Card, SyncBadge, Eyebrow, PageHeader, Progress, Ring, TextField, Tip, pct } from "./ui";

function stepLink(t: ResetTask) {
  if (!t.module) return null;
  if (t.module === "results") return { href: "#/results", label: "Open My Results" };
  const mod = MODULES.find((m) => m.id === t.module)!;
  return { href: `#/${mod.id}`, label: `Open ${mod.title}` };
}

export function MoneyReset() {
  const { state, update } = useToolkit();
  const rp = resetProgress(state);
  const { auto, done } = rp;
  const move = state.reset.move;
  const card = scorecard(state, benefitIdsFor(state));
  const toggle = (id: string) =>
    update((s) => {
      const on = !s.reset.done[id];
      const doneAt = { ...s.reset.doneAt };
      if (on) doneAt[id] = dayKey();
      else delete doneAt[id];
      return { ...s, reset: { ...s.reset, done: { ...s.reset.done, [id]: on }, doneAt } };
    });
  const setMove = (patch: Partial<typeof move>) => update((s) => ({ ...s, reset: { ...s.reset, move: { ...s.reset.move, ...patch } } }));
  const currentWeek = RESET_WEEKS.find((w) => w.tasks.some((t) => t.day >= rp.day))?.n ?? 4;
  const today = rp.todayStep;
  const todayLink = today ? stepLink(today) : null;

  return (
    <div>
      <PageHeader n={6} title="30-Day Money Reset" intro="One small step a day for 30 days. Steps check themselves off as you fill in the other modules, so the plan and your numbers always agree.">
        <div className="flex items-center gap-3 rounded-2xl bg-[#0b1f3a] p-3 pr-5 text-white">
          <Ring value={rp.completed / rp.total} size={64} stroke={7} label="30-Day Reset progress">
            <span className="text-xs font-semibold tabular-nums">{pct(rp.completed / rp.total)}</span>
          </Ring>
          <div>
            <p className="text-sm font-semibold">Day {rp.day} of 30</p>
            <p className="text-xs text-white/60">{rp.completed} of {rp.total} steps done</p>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-[#8cc7b5]"><Flame className="size-3.5" /> {rp.streak}-day streak</p>
          </div>
        </div>
      </PageHeader>

      {today ? (
        <Card className="mb-6 border-[#167d68]/30" pad={false}>
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex items-start gap-4">
              <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[#0b1f3a] text-center text-white">
                <span>
                  <span className="block text-[10px] uppercase tracking-[0.14em] text-white/60">Day</span>
                  <span className="block text-xl font-semibold leading-none tabular-nums">{today.day}</span>
                </span>
              </div>
              <div>
                <Eyebrow className="text-[#167d68]">{today.day <= rp.day ? "Today's step" : "Up next"}</Eyebrow>
                <p className="mt-0.5 font-display text-xl font-semibold leading-snug">{today.label}</p>
                <p className="mt-1 text-[13.5px] leading-relaxed text-[#5f6f86]">{today.detail}</p>
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              {todayLink && <a href={todayLink.href} className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-[#d5dde8] px-4 text-sm font-semibold hover:border-[#0b1f3a]/40">{todayLink.label}</a>}
              {!auto[today.id] && <Btn onClick={() => toggle(today.id)}><Check className="size-4" /> Mark done</Btn>}
            </div>
          </div>
        </Card>
      ) : (
        <Card className="mb-6 border-[#167d68]/30">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-display text-xl font-semibold">All 30 steps are done. Well done.</p>
            <a href="#/results" className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-[#0b1f3a] px-4 text-sm font-semibold text-white"><Award className="size-4" /> See my results</a>
          </div>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {RESET_WEEKS.map((w) => {
          const wDone = w.tasks.filter((t) => done[t.id]).length;
          const complete = wDone === w.tasks.length;
          return (
            <Card key={w.n} className={cn(w.n === currentWeek && !complete && "ring-2 ring-[#167d68]/25")}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Eyebrow className={complete ? "text-[#167d68]" : undefined}>Week {w.n} · Days {w.tasks[0].day}&ndash;{w.tasks.at(-1)!.day}{complete ? " · Complete" : w.n === currentWeek ? " · This week" : ""}</Eyebrow>
                  <h2 className="mt-1 font-display text-xl font-semibold">{w.title}</h2>
                </div>
                <span className="shrink-0 text-sm tabular-nums text-[#5f6f86]">{wDone}/{w.tasks.length}</span>
              </div>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-[#5f6f86]">{w.focus}</p>
              <Progress className="mt-4" value={wDone / w.tasks.length} label={`Week ${w.n} progress`} />
              <ul className="mt-4 space-y-0.5">
                {w.tasks.map((t) => {
                  const link = stepLink(t);
                  const isToday = today?.id === t.id;
                  return (
                    <li key={t.id} className={cn("flex items-start gap-3 rounded-xl px-2 py-2 hover:bg-[#f4f6f9]", isToday && "bg-[#eef6f3] hover:bg-[#eef6f3]")}>
                      <span className={cn("mt-0.5 w-12 shrink-0 whitespace-nowrap text-[11px] font-semibold tabular-nums uppercase tracking-wide", t.day <= rp.day ? "text-[#0b1f3a]" : "text-[#9aa7b8]")}>Day {t.day}</span>
                      <button type="button" role="checkbox" aria-checked={!!done[t.id]} aria-label={`Day ${t.day}: ${t.label}`} disabled={!!auto[t.id]} title={auto[t.id] ? "Checked automatically from your toolkit data" : undefined} onClick={() => toggle(t.id)} className={cn("mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border transition", done[t.id] ? "border-[#167d68] bg-[#167d68] text-white" : "border-[#b8c4d4] bg-white")}>
                        {done[t.id] && <Check className="size-3.5" strokeWidth={3} />}
                      </button>
                      <div className="min-w-0 flex-1 text-sm">
                        <p className={cn("font-medium leading-snug", done[t.id] && "text-[#5f6f86] line-through decoration-[#5f6f86]/40")}>{t.label}</p>
                        <p className="mt-0.5 text-[12.5px] leading-snug text-[#5f6f86]">{t.detail}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                          {auto[t.id] && <SyncBadge>Done automatically</SyncBadge>}
                          {link && (
                            <a href={link.href} className="inline-flex items-center gap-1 text-xs font-medium text-[#167d68] hover:underline">
                              {link.label} <ArrowRight className="size-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Card>
          );
        })}
      </div>

      {/* My One Money Move */}
      <Card className="mt-6 border-[#167d68]/30" pad={false}>
        <div className="flex items-center gap-3 rounded-t-2xl bg-[#eef6f3] px-5 py-4 sm:px-6">
          <Target className="size-5 text-[#167d68]" />
          <div>
            <p className="font-display text-lg font-semibold">My One Money Move</p>
            <p className="text-xs text-[#5f6f86]">One action. One deadline. One measurable result.</p>
          </div>
        </div>
        <div className="p-5 sm:p-6">
          <p className="text-[15px] italic text-[#33475f]">&ldquo;{CLOSING_QUESTION}&rdquo;</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <TextField label="This week's priority" placeholder="e.g. Build my starter emergency fund" value={move.priority} onChange={(v) => setMove({ priority: v })} />
            <TextField label="Deadline" type="date" value={move.deadline} onChange={(v) => setMove({ deadline: v })} />
            <TextField label="My commitment" placeholder="e.g. Move $50 to savings every payday" value={move.commitment} onChange={(v) => setMove({ commitment: v })} />
            <TextField label="How I'll measure success" placeholder="e.g. Savings balance reaches $1,000" value={move.measure} onChange={(v) => setMove({ measure: v })} />
          </div>
        </div>
      </Card>

      {/* Scorecard */}
      <section className="mt-8">
        <div className="mb-4">
          <Eyebrow>Your results</Eyebrow>
          <h2 className="mt-1 font-display text-2xl font-semibold">Money Coach Scorecard</h2>
          <p className="mt-1 text-sm text-[#5f6f86]">Calculated from what you&rsquo;ve entered across the toolkit. It updates as your numbers improve.</p>
        </div>
        <Card pad={false}>
          <div className="grid lg:grid-cols-[260px_1fr]">
            <div className="flex flex-col items-center justify-center gap-3 rounded-t-2xl bg-[#0b1f3a] p-6 text-center text-white lg:rounded-l-2xl lg:rounded-tr-none">
              <Ring value={card.total / 100} size={128} stroke={11} label="Overall score">
                <span>
                  <span className="block text-3xl font-semibold tabular-nums">{card.total}</span>
                  <span className="text-[11px] uppercase tracking-[0.14em] text-white/60">of 100</span>
                </span>
              </Ring>
              <p className="font-display text-lg font-semibold">{card.label}</p>
            </div>
            <ul className="divide-y divide-[#eef1f5]">
              {card.rows.map((r) => (
                <li key={r.id}>
                  <a href={`#/${r.href}`} className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 px-5 py-4 hover:bg-[#f9fafc] sm:grid-cols-[150px_1fr_3rem] sm:px-6">
                    <span className="font-medium">{r.label}</span>
                    <span className="text-right text-sm font-semibold tabular-nums sm:order-last">{r.score}</span>
                    <span className="col-span-2 sm:col-span-1">
                      <Progress value={r.score / 100} label={`${r.label} score`} tone={r.score >= 75 ? "green" : r.score >= 45 ? "navy" : "gold"} />
                      <span className="mt-1.5 block text-xs text-[#5f6f86]">{r.detail}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </Card>
        <p className="mt-3 text-xs leading-relaxed text-[#5f6f86]">The scorecard is an educational self-check, not a credit score or financial rating. {PROTECTION_DISCLAIMER}</p>
      </section>

      <div className="mt-6">
        <Tip title="Repeat it">When you finish all four weeks, run the reset again next quarter. Update your net worth snapshot, raise your savings rate by 1% and pick a new One Money Move.</Tip>
      </div>
    </div>
  );
}
