import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Mail, Phone } from "lucide-react";
import { requireCoach } from "@/lib/auth";
import { recordProgress, resendOnboardingLink, sendReminder, updateClientSettings } from "@/lib/actions/coach";
import { formatAppointment, formatMoney } from "@/lib/coaching/time";
import {
  clientStatusLabel,
  commitmentStatusLabel,
  type Client,
  type Commitment,
  type CurriculumWeek,
  type EmailLogRow,
  type Intake,
  type ProgressSnapshot,
  type Session,
} from "@/lib/coaching/types";
import { Card, CardContent } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { ActionForm } from "@/components/app/action-form";
import { SubmitButton } from "@/components/app/submit-button";
import type { ReactNode } from "react";

function Panel({ title, id, children, aside }: { title: string; id?: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <Card id={id} className="scroll-mt-6">
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

const sourceLabel = { self_reported: "Self-reported", verified: "Verified by coach" } as const;

export default async function ClientProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireCoach();
  const { data: clientData } = await supabase.from("clients").select("*").eq("id", id).maybeSingle();
  if (!clientData) notFound();
  const client = clientData as Client;

  const [{ data: intakeData }, { data: weeksData }, { data: sessionsData }, { data: commitmentsData }, { data: progressData }, { data: emailsData }] =
    await Promise.all([
      supabase.from("intakes").select("*").eq("client_id", id).maybeSingle(),
      supabase.from("curriculum_weeks").select("week_number, title, published").order("week_number"),
      supabase.from("sessions").select("*").eq("client_id", id),
      supabase.from("commitments").select("*").eq("client_id", id).order("week_number"),
      supabase.from("progress_snapshots").select("*").eq("client_id", id).order("recorded_at"),
      supabase.from("email_log").select("*").eq("client_id", id).order("created_at", { ascending: false }).limit(25),
    ]);
  const intake = intakeData as Intake | null;
  const weeks = (weeksData ?? []) as Pick<CurriculumWeek, "week_number" | "title" | "published">[];
  const sessions = (sessionsData ?? []) as Session[];
  const commitments = (commitmentsData ?? []) as Commitment[];
  const progress = (progressData ?? []) as ProgressSnapshot[];
  const emails = (emailsData ?? []) as EmailLogRow[];
  const start = progress[0];
  const latest = progress.at(-1);
  const week = Math.min(client.current_week, 7);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Link href="/coach" className="text-sm text-emerald underline underline-offset-2">← Dashboard</Link>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold sm:text-4xl">
            {client.first_name} {client.last_name}
          </h1>
          <p className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-600">
            <span className="inline-flex items-center gap-1.5"><Mail className="size-4" aria-hidden />{client.email}</span>
            {client.phone && <span className="inline-flex items-center gap-1.5"><Phone className="size-4" aria-hidden />{client.phone}</span>}
            <span>Prefers {client.preferred_contact === "text" ? "text messages" : client.preferred_contact}</span>
          </p>
          <p className="mt-2 text-sm">
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-700">{clientStatusLabel[client.status]}</span>
            <span className="ml-3">{client.current_week > 7 ? "All 7 weeks complete" : `Week ${client.current_week} of 7`}</span>
            {client.automation_paused && <span className="ml-3 rounded-full bg-gold-50 px-2.5 py-1">Emails paused</span>}
          </p>
        </div>
        <ButtonLink href={`/coach/clients/${id}/week/${week}`}>
          Open Week {week} workspace <ArrowRight />
        </ButtonLink>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <Panel title="Seven-week plan">
            <ol className="divide-y divide-navy/8">
              {weeks.map((w) => {
                const s = sessions.find((x) => x.week_number === w.week_number);
                const c = commitments.find((x) => x.week_number === w.week_number);
                return (
                  <li key={w.week_number} className="flex flex-wrap items-center justify-between gap-2 py-3">
                    <div>
                      <p className="font-semibold">
                        Week {w.week_number}: {w.title}
                        {!w.published && <span className="ml-2 text-xs font-normal text-slate-600">(content in Phase 3)</span>}
                      </p>
                      <p className="text-sm text-slate-600">
                        {s?.status === "completed"
                          ? `Session completed ${s.completed_at ? new Date(s.completed_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}`
                          : s?.scheduled_at
                            ? formatAppointment(s.scheduled_at)
                            : "Not scheduled"}
                        {c?.approved_at && ` · Move: ${commitmentStatusLabel[c.status]}`}
                      </p>
                    </div>
                    {w.published && (
                      <Link href={`/coach/clients/${id}/week/${w.week_number}`} className="text-sm font-semibold text-emerald underline-offset-4 hover:underline">
                        Workspace
                      </Link>
                    )}
                  </li>
                );
              })}
            </ol>
          </Panel>

          <Panel title="Intake">
            {intake ? (
              <dl className="grid gap-4 text-sm sm:grid-cols-2">
                <Field label="Primary goals" value={intake.primary_goals} wide />
                <Field label="Concerns" value={intake.concerns} wide />
                <Field label="Money story" value={intake.money_story} wide />
                <Field label="Habit to change" value={intake.habit_to_change} />
                <Field label="Best time to reach" value={intake.best_time} />
                <Field label="Monthly take-home income" value={formatMoney(intake.monthly_income)} />
                <Field label="Monthly spending" value={formatMoney(intake.monthly_expenses)} />
                <Field label="Emergency savings" value={formatMoney(intake.emergency_savings)} />
                <Field label="Consumer debt" value={formatMoney(intake.consumer_debt)} />
                <Field label="Debt notes" value={intake.debt_notes} wide />
                <Field label="Retirement" value={intake.retirement_overview} />
                <Field label="Contribution rate" value={intake.retirement_contribution_pct != null ? `${intake.retirement_contribution_pct}%` : null} />
                <Field label="Work benefits" value={intake.employee_benefits} wide />
                <Field label="Insurance protection" value={intake.insurance_coverage} wide />
                <p className="text-xs text-slate-600 sm:col-span-2">
                  Submitted {new Date(intake.submitted_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} · consent to
                  privacy notice and coaching emails recorded. All figures are self-reported.
                </p>
              </dl>
            ) : (
              <div className="space-y-4 text-sm">
                <p className="text-slate-600">Waiting for {client.first_name} to set a password and complete the intake.</p>
                <ActionForm action={resendOnboardingLink} submitLabel="Send a new onboarding link" variant="outline" pendingText="Sending…">
                  <input type="hidden" name="client_id" value={id} />
                </ActionForm>
              </div>
            )}
          </Panel>

          <Panel title="Financial progress">
            {progress.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-left text-sm">
                  <thead className="text-xs uppercase tracking-wider text-slate-600">
                    <tr>
                      <th className="py-2 pr-3 font-semibold">Measure</th>
                      <th className="py-2 pr-3 font-semibold">Starting</th>
                      <th className="py-2 font-semibold">Latest</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy/8">
                    <ProgressRow label="Emergency savings" a={formatMoney(start?.emergency_savings)} b={formatMoney(latest?.emergency_savings)} />
                    <ProgressRow label="Consumer debt" a={formatMoney(start?.consumer_debt)} b={formatMoney(latest?.consumer_debt)} />
                    <ProgressRow label="Monthly cash flow" a={formatMoney(start?.monthly_cash_flow)} b={formatMoney(latest?.monthly_cash_flow)} />
                    <ProgressRow
                      label="Retirement contribution"
                      a={start?.retirement_contribution_pct != null ? `${start.retirement_contribution_pct}%` : "—"}
                      b={latest?.retirement_contribution_pct != null ? `${latest.retirement_contribution_pct}%` : "—"}
                    />
                    <ProgressRow
                      label="Employer benefits reviewed"
                      a={start?.employer_benefits_reviewed == null ? "—" : start.employer_benefits_reviewed ? "Yes" : "No"}
                      b={latest?.employer_benefits_reviewed == null ? "—" : latest.employer_benefits_reviewed ? "Yes" : "No"}
                    />
                    <tr>
                      <td className="py-2 pr-3 text-xs text-slate-600">Source</td>
                      <td className="py-2 pr-3 text-xs text-slate-600">{start && sourceLabel[start.source]}</td>
                      <td className="py-2 text-xs text-slate-600">{latest && `${sourceLabel[latest.source]}, ${new Date(latest.recorded_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-slate-600">The starting point is recorded automatically when the intake is submitted.</p>
            )}
            <details className="mt-6">
              <summary className="cursor-pointer text-sm font-semibold text-emerald">Record updated numbers</summary>
              <ActionForm action={recordProgress} submitLabel="Save progress" className="mt-4">
                <input type="hidden" name="client_id" value={id} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <NumberField name="emergency_savings" label="Emergency savings ($)" />
                  <NumberField name="consumer_debt" label="Consumer debt ($)" />
                  <NumberField name="monthly_cash_flow" label="Monthly cash flow ($, can be negative)" />
                  <NumberField name="retirement_contribution_pct" label="Retirement contribution (%)" />
                  <div>
                    <Label htmlFor="employer_benefits_reviewed">Employer benefits reviewed?</Label>
                    <Select id="employer_benefits_reviewed" name="employer_benefits_reviewed" defaultValue="">
                      <option value="">Not discussed</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="source">How do you know?</Label>
                    <Select id="source" name="source" defaultValue="self_reported" required>
                      <option value="self_reported">Client told me (self-reported)</option>
                      <option value="verified">I saw a statement (verified)</option>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="note">Note (optional)</Label>
                  <Input id="note" name="note" maxLength={1000} />
                </div>
              </ActionForm>
            </details>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Accountability">
            <p className="text-sm text-slate-600">
              Reminders go out automatically 2 days before a commitment deadline or within 48 hours of the next session. You can
              also send one now.
            </p>
            <ActionForm action={sendReminder} submitLabel="Send accountability reminder now" variant="outline" pendingText="Sending…" className="mt-4">
              <input type="hidden" name="client_id" value={id} />
            </ActionForm>
          </Panel>

          <Panel title="Settings">
            <form action={updateClientSettings} className="space-y-4 text-sm">
              <input type="hidden" name="client_id" value={id} />
              <div>
                <Label htmlFor="status">Enrollment status</Label>
                <Select id="status" name="status" defaultValue={client.status}>
                  {Object.entries(clientStatusLabel).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </Select>
              </div>
              <label className="flex items-start gap-3">
                <input type="checkbox" name="automation_paused" defaultChecked={client.automation_paused} className="mt-0.5 size-4 accent-[var(--color-emerald)]" />
                <span><strong>Pause coaching emails.</strong> Post-session emails and reminders are skipped and logged.</span>
              </label>
              <label className="flex items-start gap-3">
                <input type="checkbox" name="email_opt_in" defaultChecked={client.email_opt_in} className="mt-0.5 size-4 accent-[var(--color-emerald)]" />
                <span><strong>Client accepts coaching emails.</strong> Untick if they asked not to be emailed.</span>
              </label>
              <SubmitButton size="sm" variant="outline">Save settings</SubmitButton>
            </form>
          </Panel>

          <Panel title="Email history" id="emails">
            {emails.length ? (
              <ul className="space-y-3 text-sm">
                {emails.map((e) => (
                  <li key={e.id} className="rounded-xl bg-ivory px-3 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold">{templateName[e.template_key] ?? e.template_key}</span>
                      <span className={statusClass[e.status]}>{e.status}</span>
                    </div>
                    <div className="text-xs text-slate-600">
                      {new Date(e.updated_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                      {e.attempts > 1 && ` · ${e.attempts} attempts`}
                    </div>
                    {e.detail && <div className="mt-1 text-xs text-slate-600">{e.detail}</div>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-600">No emails yet.</p>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}

const templateName: Record<string, string> = { welcome: "Welcome", post_session: "Post-session", reminder: "Reminder" };
const statusClass: Record<string, string> = {
  sent: "rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700",
  failed: "rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-800",
  skipped: "rounded-full bg-gold-50 px-2 py-0.5 text-xs font-semibold",
  pending: "rounded-full bg-navy/5 px-2 py-0.5 text-xs font-semibold",
};

function Field({ label, value, wide }: { label: string; value: string | null | undefined; wide?: boolean }) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <dt className="text-xs font-semibold uppercase tracking-wider text-slate-600">{label}</dt>
      <dd className="mt-0.5 whitespace-pre-line">{value || "—"}</dd>
    </div>
  );
}

function ProgressRow({ label, a, b }: { label: string; a: string; b: string }) {
  return (
    <tr>
      <td className="py-2 pr-3">{label}</td>
      <td className="py-2 pr-3">{a}</td>
      <td className="py-2 font-semibold">{b}</td>
    </tr>
  );
}

function NumberField({ name, label }: { name: string; label: string }) {
  return (
    <div>
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} inputMode="decimal" />
    </div>
  );
}

