import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { appUrl } from "@/lib/supabase/config";
import { sendTemplatedEmail, type SendResult } from "@/lib/email/send";
import { formatAppointment, formatDate, todayInZone } from "./time";
import { isReminderDue } from "./reminder-rules";
import type { Client, Commitment, Session } from "./types";

function reminderVars(client: Pick<Client, "first_name">, c: Pick<Commitment, "action" | "deadline">, next: Pick<Session, "scheduled_at"> | null) {
  return {
    first_name: client.first_name,
    action: c.action,
    deadline: formatDate(c.deadline),
    appointment: next?.scheduled_at ? `Our next session: ${formatAppointment(next.scheduled_at)}.` : "",
    portal_link: `${appUrl()}/portal`,
  };
}

async function nextSession(clientId: string) {
  const db = createAdminClient();
  const { data } = await db
    .from("sessions")
    .select("scheduled_at")
    .eq("client_id", clientId)
    .eq("status", "scheduled")
    .gt("scheduled_at", new Date().toISOString())
    .order("scheduled_at")
    .limit(1)
    .maybeSingle();
  return (data as Pick<Session, "scheduled_at"> | null) ?? null;
}

/** Coach presses "Send reminder now". Limited to one manual reminder per commitment per day. */
export async function sendReminderNow(client: Client, commitment: Commitment): Promise<SendResult> {
  const next = await nextSession(client.id);
  return sendTemplatedEmail({
    clientId: client.id,
    to: client.email,
    templateKey: "reminder",
    dedupeKey: `reminder-manual:${commitment.id}:${todayInZone()}`,
    vars: reminderVars(client, commitment, next),
    kind: "coaching",
  });
}

/** Daily job: sends each due reminder once. Returns a summary for the cron log. */
export async function runDueReminders(now = new Date()) {
  const db = createAdminClient();
  const today = todayInZone(undefined, now);
  const { data: rows, error } = await db
    .from("commitments")
    .select("id, client_id, action, deadline, status, approved_at, client:clients!inner(id, first_name, email, status, automation_paused, email_opt_in)")
    .not("approved_at", "is", null)
    .neq("status", "completed");
  if (error) throw new Error(error.message);

  const summary = { checked: 0, sent: 0, skipped: 0, failed: 0, duplicate: 0 };
  for (const row of rows ?? []) {
    summary.checked++;
    const client = (Array.isArray(row.client) ? row.client[0] : row.client) as Client;
    if (!client || client.status !== "active") continue;
    const next = await nextSession(client.id);
    const { due } = isReminderDue({
      approvedAt: row.approved_at,
      status: row.status,
      deadline: row.deadline,
      nextSessionAt: next?.scheduled_at ?? null,
      today,
      now,
    });
    if (!due) continue;
    // Don't double up if the coach already sent one by hand.
    const { count } = await db
      .from("email_log")
      .select("id", { count: "exact", head: true })
      .like("dedupe_key", `reminder-manual:${row.id}:%`)
      .eq("status", "sent");
    if (count) continue;

    const result = await sendTemplatedEmail({
      clientId: client.id,
      to: client.email,
      templateKey: "reminder",
      dedupeKey: `reminder:${row.id}`,
      vars: reminderVars(client, { action: row.action, deadline: row.deadline }, next),
      kind: "coaching",
    });
    summary[result.status]++;
  }
  return summary;
}
