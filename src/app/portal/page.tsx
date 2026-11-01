import Link from "next/link";
import { CalendarDays, CheckCircle2, ClipboardList, Compass, Flag, Sparkles } from "lucide-react";
import { requireClient } from "@/lib/auth";
import { toggleMyChecklistItem } from "@/lib/actions/client";
import { formatAppointment, formatDate } from "@/lib/coaching/time";
import { commitmentStatusLabel, TOTAL_WEEKS, type Commitment, type CurriculumItem, type CurriculumWeek, type Session } from "@/lib/coaching/types";
import { Card, CardContent } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { Checklist } from "@/components/app/checklist";
import { ProgressTracker } from "@/components/app/progress-tracker";
import { CommitmentUpdateForm } from "./commitment-update-form";

export default async function PortalHome({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const { supabase, client } = await requireClient();
  const sp = await searchParams;

  const [{ data: intake }, { data: weeksData }, { data: sessionsData }, { data: commitmentsData }, { data: progressData }] = await Promise.all([
    supabase.from("intakes").select("client_id").eq("client_id", client.id).maybeSingle(),
    supabase.from("curriculum_weeks").select("*").order("week_number"),
    supabase.from("sessions").select("*").eq("client_id", client.id),
    supabase.from("commitments").select("*").eq("client_id", client.id).order("week_number", { ascending: false }),
    supabase.from("checklist_progress").select("item_id").eq("client_id", client.id),
  ]);
  const weeks = (weeksData ?? []) as CurriculumWeek[];
  const sessions = (sessionsData ?? []) as Session[];
  const commitments = (commitmentsData ?? []) as Commitment[];
  const doneIds = new Set((progressData ?? []).map((p) => p.item_id as string));

  // Not onboarded yet: one clear next step.
  if (!intake) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 sm:py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-600">The 7-Week Money Reset</p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Welcome, {client.first_name}.</h1>
        <Card className="mt-8">
          <CardContent>
            <ClipboardList className="size-8 text-emerald" aria-hidden />
            <h2 className="mt-4 text-xl font-bold">Your first step: complete your confidential intake</h2>
            <p className="mt-2 text-slate-600">
              It takes about 10 minutes. Rough numbers are perfectly fine, and you&rsquo;ll never be asked for account numbers or
              passwords.
            </p>
            <ButtonLink href="/portal/intake" className="mt-6">Start my intake</ButtonLink>
          </CardContent>
        </Card>
      </div>
    );
  }

  const completedWeeks = new Set(sessions.filter((s) => s.status === "completed").map((s) => s.week_number));
  const published = weeks.filter((w) => w.published);
  const focus =
    weeks.find((w) => w.week_number === client.current_week && w.published) ??
    [...published].reverse().find((w) => w.week_number <= client.current_week) ??
    weeks[0];
  const nextWeekPending = client.current_week <= TOTAL_WEEKS && focus.week_number < client.current_week;

  const { data: itemsData } = await supabase
    .from("curriculum_items")
    .select("*")
    .eq("week_number", focus.week_number)
    .eq("audience", "client")
    .order("position");
  const items = ((itemsData ?? []) as CurriculumItem[]).map((i) => ({ id: i.id, label: i.label, done: doneIds.has(i.id) }));

  const move = commitments[0] ?? null; // latest approved (RLS hides drafts)
  const now = Date.now();
  const next = sessions
    .filter((s) => s.status === "scheduled" && s.scheduled_at && Date.parse(s.scheduled_at) > now)
    .sort((a, b) => Date.parse(a.scheduled_at!) - Date.parse(b.scheduled_at!))[0];
  const deliverables = weeks.filter((w) => completedWeeks.has(w.week_number));
  const movesDone = commitments.filter((c) => c.status === "completed").length;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      {sp.intake === "done" && (
        <p role="status" className="mb-6 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle2 className="size-4" aria-hidden /> Thank you. Your intake is saved and your coach can see it.
        </p>
      )}
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-600">My Money Coach Journey</p>
      <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Welcome back, {client.first_name}.</h1>
      <p className="mt-2 text-slate-600">
        {client.current_week > TOTAL_WEEKS
          ? "You've completed all seven coaching weeks."
          : `You're on Week ${client.current_week} of ${TOTAL_WEEKS}. One week, one objective, one money move.`}
      </p>

      <div className="mt-8">
        <ProgressTracker steps={weeks.map((w) => ({ week: w.week_number, title: w.title, done: completedWeeks.has(w.week_number) }))} current={client.current_week} />
      </div>

      {/* 1. What am I working on this week? */}
      <section aria-labelledby="this-week" className="mt-10">
        <Card>
          <CardContent>
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald">
              <Compass className="size-4" aria-hidden /> What I&rsquo;m working on
            </div>
            <h2 id="this-week" className="mt-2 text-2xl font-bold">
              Week {focus.week_number}: {focus.title}
            </h2>
            {nextWeekPending && (
              <p className="mt-3 rounded-xl bg-gold-50 px-4 py-3 text-sm">
                Your Week {focus.week_number} session is complete. Your Week {client.current_week} lesson will appear here before your
                next session. Until then, keep working on your One Money Move below.
              </p>
            )}
            <p className="mt-4 font-medium">{focus.objective}</p>
            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-ivory p-4">
                <dt className="text-xs font-semibold uppercase tracking-wider text-slate-600">Money mindset</dt>
                <dd className="mt-1">{focus.psychology_principle}</dd>
              </div>
              <div className="rounded-xl bg-ivory p-4">
                <dt className="text-xs font-semibold uppercase tracking-wider text-slate-600">Action step</dt>
                <dd className="mt-1">{focus.baby_step}</dd>
                {focus.baby_step_note && <dd className="mt-1 text-sm text-slate-600">{focus.baby_step_note}</dd>}
              </div>
            </dl>
            {focus.lesson && (
              <details className="group mt-6">
                <summary className="cursor-pointer font-semibold text-emerald underline-offset-4 hover:underline">Read this week&rsquo;s lesson</summary>
                <div className="prose-mc mt-4">
                  {focus.lesson.split(/\n\s*\n/).map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </details>
            )}
          </CardContent>
        </Card>
      </section>

      {/* 2. What do I need to do next? */}
      <section aria-labelledby="next" className="mt-8 grid gap-8">
        <h2 id="next" className="sr-only">What I need to do next</h2>
        <Card className="border-emerald/30">
          <CardContent>
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald">
              <Flag className="size-4" aria-hidden /> My One Money Move
            </div>
            {move ? (
              <>
                <p className="mt-3 text-xl font-bold leading-snug">{move.action}</p>
                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                  <div>
                    <dt className="text-slate-600">Deadline</dt>
                    <dd className="font-semibold">{formatDate(move.deadline)}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-600">How we&rsquo;ll measure it</dt>
                    <dd className="font-semibold">{move.success_criteria}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-600">Status</dt>
                    <dd className="font-semibold">{commitmentStatusLabel[move.status]}</dd>
                  </div>
                </dl>
                {move.coach_feedback && (
                  <p className="mt-4 rounded-xl bg-ivory px-4 py-3 text-sm">
                    <span className="font-semibold">Coach feedback:</span> {move.coach_feedback}
                  </p>
                )}
                {move.status !== "completed" && <CommitmentUpdateForm commitment={move} />}
                {move.status === "completed" && move.completed_at && (
                  <p className="mt-4 flex items-center gap-2 text-sm text-emerald-700">
                    <CheckCircle2 className="size-4" aria-hidden /> Completed {new Date(move.completed_at).toLocaleDateString("en-US", { month: "long", day: "numeric" })}
                  </p>
                )}
              </>
            ) : (
              <p className="mt-3 text-slate-600">
                You&rsquo;ll choose your One Money Move together with your coach at the end of your Week {focus.week_number} session.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald">
              <ClipboardList className="size-4" aria-hidden /> My Week {focus.week_number} checklist
            </div>
            <div className="mt-4">
              <Checklist label={`Week ${focus.week_number} checklist`} items={items} toggle={toggleMyChecklistItem} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-start gap-4">
            <CalendarDays className="mt-1 size-6 shrink-0 text-emerald" aria-hidden />
            <div>
              <h3 className="font-bold">Next appointment</h3>
              {next ? (
                <>
                  <p className="mt-1">
                    Week {next.week_number} session · {formatAppointment(next.scheduled_at)}
                  </p>
                  {next.meeting_details && <p className="mt-1 text-sm text-slate-600">{next.meeting_details}</p>}
                </>
              ) : (
                <p className="mt-1 text-slate-600">Your coach will confirm your next session time.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 3. How am I progressing? */}
      <section aria-labelledby="progress" className="mt-8">
        <Card>
          <CardContent>
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald">
              <Sparkles className="size-4" aria-hidden /> How I&rsquo;m progressing
            </div>
            <h2 id="progress" className="sr-only">How I&rsquo;m progressing</h2>
            <dl className="mt-4 grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-ivory p-4">
                <dt className="text-sm text-slate-600">Coaching sessions completed</dt>
                <dd className="mt-1 text-2xl font-bold">
                  {completedWeeks.size} <span className="text-base font-normal text-slate-600">of {TOTAL_WEEKS}</span>
                </dd>
              </div>
              <div className="rounded-xl bg-ivory p-4">
                <dt className="text-sm text-slate-600">Money moves completed</dt>
                <dd className="mt-1 text-2xl font-bold">{movesDone}</dd>
              </div>
            </dl>
            <h3 className="mt-6 font-semibold">Completed deliverables</h3>
            {deliverables.length ? (
              <ul className="mt-2 space-y-1.5 text-sm">
                {deliverables.map((w) => (
                  <li key={w.week_number} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald" aria-hidden />
                    <span>
                      Week {w.week_number}: {w.deliverable}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-slate-600">Your first deliverable arrives after your Week 1 session.</p>
            )}
            <p className="mt-6 text-xs text-slate-600">
              Completing a coaching week is separate from completing a financial milestone. Every plan moves at the pace that fits
              your situation.
            </p>
          </CardContent>
        </Card>
        <p className="mt-6 text-center text-sm">
          <Link href="/portal/intake" className="text-emerald underline underline-offset-2">Review or update my intake</Link>
        </p>
      </section>
    </div>
  );
}
