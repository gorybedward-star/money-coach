import Link from "next/link";
import { AlertTriangle, CalendarClock, ClipboardList, MailWarning, MessageSquareText, UserPlus } from "lucide-react";
import { requireCoach } from "@/lib/auth";
import { formatAppointment, formatDate, todayInZone } from "@/lib/coaching/time";
import { clientStatusLabel, commitmentStatusLabel, type Client, type Commitment, type Session } from "@/lib/coaching/types";
import { Card, CardContent } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { PageHeader } from "@/components/app/app-shell";
import type { ReactNode } from "react";

type Attention = { client: Client; icon: ReactNode; text: string; href: string; priority: number };

export default async function CoachDashboard() {
  const { supabase } = await requireCoach();
  const weekAgo = new Date(Date.now() - 7 * 86_400_000).toISOString();
  const [{ data: clientsData }, { data: sessionsData }, { data: commitmentsData }, { data: intakesData }, { data: failedData }] = await Promise.all([
    supabase.from("clients").select("*").neq("status", "withdrawn").order("first_name"),
    supabase.from("sessions").select("*"),
    supabase.from("commitments").select("*"),
    supabase.from("intakes").select("client_id"),
    supabase.from("email_log").select("client_id, template_key").eq("status", "failed").gte("updated_at", weekAgo),
  ]);
  const clients = (clientsData ?? []) as Client[];
  const sessions = (sessionsData ?? []) as Session[];
  const commitments = (commitmentsData ?? []) as Commitment[];
  const intakeDone = new Set((intakesData ?? []).map((i) => i.client_id as string));
  const today = todayInZone();
  const now = Date.now();

  const attention: Attention[] = [];
  const rows = clients.map((c) => {
    const mine = sessions.filter((s) => s.client_id === c.id);
    const next = mine
      .filter((s) => s.status === "scheduled" && s.scheduled_at && Date.parse(s.scheduled_at) > now)
      .sort((a, b) => Date.parse(a.scheduled_at!) - Date.parse(b.scheduled_at!))[0];
    const move = commitments.filter((m) => m.client_id === c.id && m.approved_at).sort((a, b) => b.week_number - a.week_number)[0];
    const weekHref = `/coach/clients/${c.id}/week/${Math.min(c.current_week, 7)}`;

    if (c.status === "invited" && !intakeDone.has(c.id))
      attention.push({ client: c, priority: 3, icon: <ClipboardList className="size-4" />, text: "Hasn't completed the intake yet", href: `/coach/clients/${c.id}` });
    const overdueSession = mine.find((s) => s.status === "scheduled" && s.scheduled_at && Date.parse(s.scheduled_at) < now);
    if (overdueSession)
      attention.push({ client: c, priority: 1, icon: <AlertTriangle className="size-4" />, text: `Week ${overdueSession.week_number} session time has passed but isn't marked complete`, href: `/coach/clients/${c.id}/week/${overdueSession.week_number}` });
    if (next && Date.parse(next.scheduled_at!) - now < 7 * 86_400_000)
      attention.push({ client: c, priority: 2, icon: <CalendarClock className="size-4" />, text: `Week ${next.week_number} session ${formatAppointment(next.scheduled_at)}`, href: `/coach/clients/${c.id}/week/${next.week_number}` });
    if (move && move.status !== "completed" && move.deadline && move.deadline < today)
      attention.push({ client: c, priority: 1, icon: <AlertTriangle className="size-4" />, text: `One Money Move overdue (was due ${formatDate(move.deadline)})`, href: weekHref });
    if (move && move.status === "completed" && !move.coach_feedback)
      attention.push({ client: c, priority: 2, icon: <MessageSquareText className="size-4" />, text: "Reported their One Money Move done. Review and add feedback", href: `/coach/clients/${c.id}/week/${move.week_number}` });
    if ((failedData ?? []).some((f) => f.client_id === c.id))
      attention.push({ client: c, priority: 1, icon: <MailWarning className="size-4" />, text: "An email failed to send this week", href: `/coach/clients/${c.id}#emails` });

    return { c, next, move };
  });
  attention.sort((a, b) => a.priority - b.priority);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageHeader eyebrow="Coach dashboard" title="Who needs my attention" />
        <ButtonLink href="/coach/clients/new" className="mb-8">
          <UserPlus /> Enroll a client
        </ButtonLink>
      </div>

      <Card>
        <CardContent>
          {attention.length ? (
            <ul className="divide-y divide-navy/8">
              {attention.map((a, i) => (
                <li key={i}>
                  <Link href={a.href} className="flex items-start gap-3 py-3 hover:bg-ivory/60 sm:items-center">
                    <span className={a.priority === 1 ? "text-red-700" : "text-gold-600"} aria-hidden>{a.icon}</span>
                    <span className="font-semibold">{a.client.first_name} {a.client.last_name}</span>
                    <span className="text-slate-600">{a.text}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-600">Nothing needs your attention right now.</p>
          )}
        </CardContent>
      </Card>

      <h2 className="mt-12 text-2xl font-bold">Clients</h2>
      {rows.length ? (
        <div className="mt-4 overflow-x-auto rounded-[var(--radius-card)] border border-navy/8 bg-white shadow-soft">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-navy/8 text-xs uppercase tracking-wider text-slate-600">
              <tr>
                <th className="px-5 py-3 font-semibold">Client</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Week</th>
                <th className="px-5 py-3 font-semibold">Next session</th>
                <th className="px-5 py-3 font-semibold">One Money Move</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy/8">
              {rows.map(({ c, next, move }) => (
                <tr key={c.id} className="hover:bg-ivory/60">
                  <td className="px-5 py-3">
                    <Link href={`/coach/clients/${c.id}`} className="font-semibold text-navy underline-offset-4 hover:underline">
                      {c.first_name} {c.last_name}
                    </Link>
                    <div className="text-xs text-slate-600">{c.email}</div>
                  </td>
                  <td className="px-5 py-3">
                    {clientStatusLabel[c.status]}
                    {c.automation_paused && <span className="ml-2 rounded-full bg-gold-50 px-2 py-0.5 text-xs">Emails paused</span>}
                  </td>
                  <td className="px-5 py-3">{c.current_week > 7 ? "Done" : `${c.current_week} of 7`}</td>
                  <td className="px-5 py-3">{next ? formatAppointment(next.scheduled_at) : <span className="text-slate-600">Not scheduled</span>}</td>
                  <td className="px-5 py-3">{move ? `${commitmentStatusLabel[move.status]} · due ${formatDate(move.deadline)}` : <span className="text-slate-600">None yet</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mt-4 text-slate-600">No clients yet. <Link className="text-emerald underline" href="/coach/clients/new">Enroll your first client</Link>.</p>
      )}
    </div>
  );
}
