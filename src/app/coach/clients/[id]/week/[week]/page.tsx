import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Lock } from "lucide-react";
import { requireCoach } from "@/lib/auth";
import {
  addCoachNote,
  approveAndCompleteSession,
  resendPostSessionEmail,
  reviewCommitment,
  saveCommitment,
  scheduleSession,
  toggleChecklistItem,
} from "@/lib/actions/coach";
import { coachTimeZone, formatAppointment, formatDate, utcToLocalInput } from "@/lib/coaching/time";
import { sessionGuide, SESSION_MINUTES } from "@/lib/coaching/session-guide";
import {
  commitmentStatusLabel,
  type Client,
  type Commitment,
  type CurriculumItem,
  type CurriculumWeek,
  type Session,
} from "@/lib/coaching/types";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Checklist } from "@/components/app/checklist";
import { ActionForm } from "@/components/app/action-form";
import { CommitmentForm } from "./commitment-form";
import type { ReactNode } from "react";

function Block({ title, children, tone, aside }: { title: string; children: ReactNode; tone?: "private"; aside?: ReactNode }) {
  return (
    <Card className={tone === "private" ? "border-gold/50 bg-gold-50/40" : undefined}>
      <CardContent>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold">{title}</h2>
          {aside}
        </div>
        <div className="mt-4">{children}</div>
      </CardContent>
    </Card>
  );
}

export default async function WeekWorkspace({ params }: { params: Promise<{ id: string; week: string }> }) {
  const { id, week: weekParam } = await params;
  const weekNumber = Number(weekParam);
  if (!Number.isInteger(weekNumber) || weekNumber < 1 || weekNumber > 7) notFound();
  const { supabase } = await requireCoach();

  const [{ data: clientData }, { data: weekData }, { data: itemsData }, { data: doneData }, { data: sessionData }, { data: commitmentData }, { data: notesData }] =
    await Promise.all([
      supabase.from("clients").select("*").eq("id", id).maybeSingle(),
      supabase.from("curriculum_weeks").select("*").eq("week_number", weekNumber).single(),
      supabase.from("curriculum_items").select("*").eq("week_number", weekNumber).order("position"),
      supabase.from("checklist_progress").select("item_id").eq("client_id", id),
      supabase.from("sessions").select("*").eq("client_id", id).eq("week_number", weekNumber).maybeSingle(),
      supabase.from("commitments").select("*").eq("client_id", id).eq("week_number", weekNumber).maybeSingle(),
      supabase.from("coach_notes").select("*").eq("client_id", id).eq("week_number", weekNumber).order("created_at", { ascending: false }),
    ]);
  if (!clientData || !weekData) notFound();
  const client = clientData as Client;
  const week = weekData as CurriculumWeek;
  const items = (itemsData ?? []) as CurriculumItem[];
  const done = new Set((doneData ?? []).map((d) => d.item_id as string));
  const session = sessionData as Session | null;
  const commitment = commitmentData as Commitment | null;
  const notes = (notesData ?? []) as { id: string; body: string; created_at: string }[];
  const completed = session?.status === "completed";
  const toggle = toggleChecklistItem.bind(null, id);
  const toItems = (aud: "coach" | "client") => items.filter((i) => i.audience === aud).map((i) => ({ id: i.id, label: i.label, done: done.has(i.id) }));

  if (!week.published) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Week {week.week_number}: {week.title}</h1>
        <p className="mt-3 text-slate-600">This week&rsquo;s content arrives in Phase 3 of the build.</p>
        <Link href={`/coach/clients/${id}`} className="mt-6 inline-block text-emerald underline">Back to {client.first_name}</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Link href={`/coach/clients/${id}`} className="text-sm text-emerald underline underline-offset-2">
        ← {client.first_name} {client.last_name}
      </Link>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-600">Week {week.week_number} of 7 · Coaching workspace</p>
          <h1 className="mt-1 text-3xl font-bold sm:text-4xl">{week.title}</h1>
        </div>
        {completed && (
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
            <CheckCircle2 className="size-4" aria-hidden /> Session completed
          </span>
        )}
      </div>

      {/* The objective of the call, at a glance */}
      <Card className="mt-6">
        <CardContent className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">Objective</p>
            <p className="mt-1 text-lg font-semibold">{week.objective}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">Psychology of money</p>
            <p className="mt-1">{week.psychology_principle}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">Baby Step call to action</p>
            <p className="mt-1">{week.baby_step}</p>
            {week.baby_step_note && <p className="mt-1 text-sm text-slate-600">{week.baby_step_note}</p>}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">Deliverable · success measure</p>
            <p className="mt-1">{week.deliverable}</p>
            <p className="mt-1 text-sm text-slate-600">{week.success_measure}</p>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.15fr]">
        <div className="space-y-6">
          <Block title={`Session guide · ${SESSION_MINUTES} minutes`}>
            <ol className="space-y-3">
              {sessionGuide.map((s, i) => (
                <li key={s.title} className="flex gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-navy text-xs font-semibold text-ivory">{i + 1}</span>
                  <div>
                    <p className="font-semibold">
                      {s.title} <span className="font-normal text-slate-600">· {s.minutes} min</span>
                    </p>
                    <p className="text-sm text-slate-600">{s.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Block>

          <Block title="Appointment" aside={<span className="text-sm text-slate-600">{formatAppointment(session?.scheduled_at ?? null)}</span>}>
            {completed ? (
              <p className="text-sm text-slate-600">
                Completed {session?.completed_at && new Date(session.completed_at).toLocaleDateString("en-US", { month: "long", day: "numeric" })}.
              </p>
            ) : (
              <ActionForm action={scheduleSession} submitLabel={session?.scheduled_at ? "Reschedule" : "Save appointment"} variant="outline">
                <input type="hidden" name="client_id" value={id} />
                <input type="hidden" name="week" value={weekNumber} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="scheduled_at">Date and time</Label>
                    <Input id="scheduled_at" name="scheduled_at" type="datetime-local" defaultValue={utcToLocalInput(session?.scheduled_at ?? null)} />
                    <p className="mt-1 text-xs text-slate-600">{coachTimeZone.replace("_", " ")} time</p>
                  </div>
                  <div>
                    <Label htmlFor="meeting_details">Where</Label>
                    <Input id="meeting_details" name="meeting_details" maxLength={500} defaultValue={session?.meeting_details ?? ""} placeholder="Zoom link or phone" />
                  </div>
                </div>
              </ActionForm>
            )}
          </Block>

          <Block title="Coach checklist">
            <Checklist label="Coach checklist" items={toItems("coach")} toggle={toggle} />
          </Block>

          <Block title={`${client.first_name}'s checklist`} aside={<span className="text-xs text-slate-600">The client sees and ticks these too</span>}>
            <Checklist label="Client checklist" items={toItems("client")} toggle={toggle} />
          </Block>
        </div>

        <div className="space-y-6">
          <Block title="My One Money Move" aside={commitment?.approved_at ? <span className="text-sm font-semibold text-emerald-700">Approved</span> : <span className="text-sm text-slate-600">Draft</span>}>
            <CommitmentForm
              clientId={id}
              week={weekNumber}
              firstName={client.first_name}
              defaultObjective={week.objective}
              commitment={commitment}
              completed={completed}
              save={saveCommitment}
              complete={approveAndCompleteSession}
            />
            {completed && commitment?.approved_at && (
              <div className="mt-6 space-y-6 border-t border-navy/10 pt-6">
                <ActionForm action={resendPostSessionEmail} submitLabel="Resend post-session email" variant="ghost" pendingText="Sending…">
                  <input type="hidden" name="client_id" value={id} />
                  <input type="hidden" name="week" value={weekNumber} />
                </ActionForm>
                <div>
                  <h3 className="font-semibold">Progress and feedback</h3>
                  {commitment.client_update && (
                    <p className="mt-2 rounded-xl bg-ivory px-4 py-3 text-sm">
                      <span className="font-semibold">{client.first_name}&rsquo;s update:</span> {commitment.client_update}
                    </p>
                  )}
                  <ActionForm action={reviewCommitment} submitLabel="Save review" className="mt-4">
                    <input type="hidden" name="commitment_id" value={commitment.id} />
                    <div>
                      <Label htmlFor="review_status">Status</Label>
                      <Select id="review_status" name="status" defaultValue={commitment.status}>
                        {Object.entries(commitmentStatusLabel).map(([k, v]) => (
                          <option key={k} value={k}>{v}</option>
                        ))}
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="coach_feedback">Feedback the client will see</Label>
                      <Textarea id="coach_feedback" name="coach_feedback" maxLength={1000} className="min-h-20" defaultValue={commitment.coach_feedback ?? ""} />
                    </div>
                    {commitment.completed_at && (
                      <p className="text-xs text-slate-600">Completed {formatDate(commitment.completed_at.slice(0, 10))}</p>
                    )}
                  </ActionForm>
                </div>
              </div>
            )}
          </Block>

          <Block
            title="Private coaching notes"
            tone="private"
            aside={
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold-600">
                <Lock className="size-3.5" aria-hidden /> Never shown to the client
              </span>
            }
          >
            <ActionForm action={addCoachNote} submitLabel="Save note">
              <input type="hidden" name="client_id" value={id} />
              <input type="hidden" name="week" value={weekNumber} />
              <Label htmlFor="body" className="sr-only">New note</Label>
              <Textarea id="body" name="body" maxLength={10000} placeholder="What stood out? Money beliefs, triggers, follow-ups for next time…" />
            </ActionForm>
            {notes.length > 0 && (
              <ul className="mt-6 space-y-3">
                {notes.map((n) => (
                  <li key={n.id} className="rounded-xl bg-white px-4 py-3 text-sm">
                    <p className="whitespace-pre-line">{n.body}</p>
                    <p className="mt-1 text-xs text-slate-600">
                      {new Date(n.created_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Block>
        </div>
      </div>
    </div>
  );
}
