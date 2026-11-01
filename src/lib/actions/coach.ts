"use server";

import { revalidatePath } from "next/cache";
import { requireCoach } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { appUrl } from "@/lib/supabase/config";
import { INVITE_DAYS, hashToken, newToken } from "@/lib/tokens";
import { sendTemplatedEmail, type SendResult } from "@/lib/email/send";
import { sendReminderNow } from "@/lib/coaching/reminders";
import { formatDate, localInputToUtc } from "@/lib/coaching/time";
import { isEmail, isIsoDate, optNumber, optStr, str } from "@/lib/validation";
import type { Client, Commitment, CommitmentStatus } from "@/lib/coaching/types";

export type ActionState =
  | { error?: string; message?: string; ok?: boolean; link?: string; email?: SendResult; clientId?: string }
  | undefined;

const WEEK = (fd: FormData) => {
  const n = Number(fd.get("week"));
  return Number.isInteger(n) && n >= 1 && n <= 7 ? n : null;
};

function emailMessage(result: SendResult, what: string) {
  switch (result.status) {
    case "sent":
      return `${what} sent.`;
    case "duplicate":
      return `${what} was already sent, so it wasn't sent again.`;
    case "skipped":
      return `${what} not sent: ${result.detail}.`;
    case "failed":
      return `${what} failed to send: ${result.detail}. You can retry from the client's page.`;
  }
}

/** Creates a fresh onboarding link (the previous unused ones stop working) and emails it. */
async function issueInvite(client: Pick<Client, "id" | "first_name" | "email">) {
  const db = createAdminClient();
  await db.from("client_invites").delete().eq("client_id", client.id).is("used_at", null);
  const token = newToken();
  const { data: invite, error } = await db
    .from("client_invites")
    .insert({
      client_id: client.id,
      token_hash: hashToken(token),
      expires_at: new Date(Date.now() + INVITE_DAYS * 86_400_000).toISOString(),
    })
    .select("id")
    .single();
  if (error || !invite) throw new Error("Could not create the onboarding link.");
  const link = `${appUrl()}/onboard/${token}`;
  const email = await sendTemplatedEmail({
    clientId: client.id,
    to: client.email,
    templateKey: "welcome",
    dedupeKey: `welcome:${invite.id}`,
    vars: { first_name: client.first_name, link },
    kind: "transactional",
  });
  return { link, email };
}

// ---------------------------------------------------------------------------
// Enrollment
// ---------------------------------------------------------------------------
export async function enrollClient(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const { user } = await requireCoach();
  const first_name = str(fd, "first_name", 80);
  const last_name = str(fd, "last_name", 80);
  const email = str(fd, "email", 254).toLowerCase();
  const phone = optStr(fd, "phone", 40);
  const firstSession = str(fd, "first_session", 20);
  const meeting_details = optStr(fd, "meeting_details", 500);

  if (!first_name) return { error: "Enter the client's first name." };
  if (!isEmail(email)) return { error: "Enter a valid email address." };
  const scheduled_at = firstSession ? localInputToUtc(firstSession) : null;
  if (firstSession && !scheduled_at) return { error: "The first session date and time isn't valid." };

  const db = createAdminClient();
  const { data: existing } = await db.from("clients").select("id").eq("email", email).maybeSingle();
  if (existing) return { error: "A client with that email is already enrolled." };

  // 1. Private login (no password yet; the client sets one from the onboarding link).
  const { data: created, error: authError } = await db.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { first_name },
  });
  if (authError || !created.user) {
    return { error: authError?.message?.includes("already") ? "That email already has a login." : "Could not create the client login." };
  }
  const userId = created.user.id;

  // 2. Profile + client record, Week 1 assigned, first appointment.
  const { data: client, error: clientError } = await db
    .from("clients")
    .insert({ user_id: userId, first_name, last_name, email, phone, created_by: user.id })
    .select("id, first_name, email")
    .single();
  const { error: profileError } = await db.from("profiles").insert({ id: userId, role: "client", full_name: `${first_name} ${last_name}`.trim() });
  if (clientError || profileError || !client) {
    if (client) await db.from("clients").delete().eq("id", client.id);
    await db.auth.admin.deleteUser(userId);
    return { error: "Could not save the client. Nothing was created; please try again." };
  }
  await db.from("sessions").insert({ client_id: client.id, week_number: 1, scheduled_at, meeting_details });

  // 3. Onboarding link + welcome email.
  const { link, email: emailResult } = await issueInvite(client);
  revalidatePath("/coach");
  return {
    ok: true,
    clientId: client.id,
    email: emailResult,
    link: emailResult.status === "sent" ? undefined : link,
    message: `${first_name} is enrolled and assigned Week 1. ${emailMessage(emailResult, "Welcome email")}`,
  };
}

export async function resendOnboardingLink(_prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireCoach();
  const db = createAdminClient();
  const { data: client } = await db.from("clients").select("id, first_name, email, onboarded_at").eq("id", str(fd, "client_id", 64)).single();
  if (!client) return { error: "Client not found." };
  const { link, email } = await issueInvite(client);
  revalidatePath(`/coach/clients/${client.id}`);
  return { ok: true, email, link: email.status === "sent" ? undefined : link, message: `New onboarding link created. ${emailMessage(email, "Welcome email")}` };
}

// ---------------------------------------------------------------------------
// Client settings
// ---------------------------------------------------------------------------
export async function updateClientSettings(fd: FormData) {
  const { supabase } = await requireCoach();
  const id = str(fd, "client_id", 64);
  const status = str(fd, "status", 20);
  const update: Partial<Client> = {
    automation_paused: fd.get("automation_paused") === "on",
    email_opt_in: fd.get("email_opt_in") === "on",
  };
  if (["invited", "active", "paused", "graduated", "withdrawn"].includes(status)) update.status = status as Client["status"];
  await supabase.from("clients").update(update).eq("id", id);
  revalidatePath(`/coach/clients/${id}`);
  revalidatePath("/coach");
}

// ---------------------------------------------------------------------------
// Sessions
// ---------------------------------------------------------------------------
export async function scheduleSession(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const { supabase } = await requireCoach();
  const client_id = str(fd, "client_id", 64);
  const week = WEEK(fd);
  if (!week) return { error: "Invalid week." };
  const raw = str(fd, "scheduled_at", 20);
  const scheduled_at = raw ? localInputToUtc(raw) : null;
  if (raw && !scheduled_at) return { error: "Enter a valid date and time." };
  const meeting_details = optStr(fd, "meeting_details", 500);

  const { data: existing } = await supabase.from("sessions").select("id, status").eq("client_id", client_id).eq("week_number", week).maybeSingle();
  const { error } = existing
    ? await supabase.from("sessions").update({ scheduled_at, meeting_details }).eq("id", existing.id)
    : await supabase.from("sessions").insert({ client_id, week_number: week, scheduled_at, meeting_details });
  if (error) return { error: "Could not save the appointment." };
  revalidatePath(`/coach/clients/${client_id}`, "layout");
  return { ok: true, message: scheduled_at ? "Appointment saved. Reminder timing follows the new date automatically." : "Appointment cleared." };
}

// ---------------------------------------------------------------------------
// Checklists and notes
// ---------------------------------------------------------------------------
export async function toggleChecklistItem(clientId: string, itemId: string, done: boolean) {
  const { supabase } = await requireCoach();
  if (done) await supabase.from("checklist_progress").upsert({ client_id: clientId, item_id: itemId }, { ignoreDuplicates: true });
  else await supabase.from("checklist_progress").delete().eq("client_id", clientId).eq("item_id", itemId);
  revalidatePath(`/coach/clients/${clientId}`, "layout");
}

export async function addCoachNote(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const { supabase } = await requireCoach();
  const client_id = str(fd, "client_id", 64);
  const body = str(fd, "body", 10000);
  if (!body) return { error: "Write a note first." };
  const { error } = await supabase.from("coach_notes").insert({ client_id, week_number: WEEK(fd), body });
  if (error) return { error: "Could not save the note." };
  revalidatePath(`/coach/clients/${client_id}`, "layout");
  return { ok: true, message: "Private note saved." };
}

// ---------------------------------------------------------------------------
// My One Money Move
// ---------------------------------------------------------------------------
function readCommitment(fd: FormData) {
  return {
    objective: str(fd, "objective", 500),
    action: str(fd, "action", 500),
    deadline: str(fd, "deadline", 10) || null,
    success_criteria: str(fd, "success_criteria", 500),
    session_summary: optStr(fd, "session_summary", 1000),
  };
}

async function saveCommitmentRow(fd: FormData) {
  const { supabase } = await requireCoach();
  const client_id = str(fd, "client_id", 64);
  const week = WEEK(fd);
  if (!week) return { error: "Invalid week." } as const;
  const fields = readCommitment(fd);
  if (fields.deadline && !isIsoDate(fields.deadline)) return { error: "Enter a valid deadline." } as const;
  const { data, error } = await supabase
    .from("commitments")
    .upsert({ client_id, week_number: week, ...fields }, { onConflict: "client_id,week_number" })
    .select("*")
    .single();
  if (error || !data) return { error: "Could not save the One Money Move." } as const;
  return { supabase, client_id, week, commitment: data as Commitment } as const;
}

export async function saveCommitment(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const r = await saveCommitmentRow(fd);
  if ("error" in r) return { error: r.error };
  revalidatePath(`/coach/clients/${r.client_id}`, "layout");
  return { ok: true, message: "Draft saved. The client sees it once you approve it." };
}

async function sendPostSession(client: Client, commitment: Commitment, weekTitle: string) {
  return sendTemplatedEmail({
    clientId: client.id,
    to: client.email,
    templateKey: "post_session",
    dedupeKey: `post_session:${commitment.id}`,
    vars: {
      first_name: client.first_name,
      week_number: String(commitment.week_number),
      week_title: weekTitle,
      session_summary: commitment.session_summary ?? "",
      action: commitment.action,
      deadline: formatDate(commitment.deadline),
      success_criteria: commitment.success_criteria,
      portal_link: `${appUrl()}/portal`,
    },
    kind: "coaching",
  });
}

/** Saves the One Money Move, approves it, completes the session, advances the week, emails the client. */
export async function approveAndCompleteSession(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const r = await saveCommitmentRow(fd);
  if ("error" in r) return { error: r.error };
  const { supabase, client_id, week } = r;
  const missing = (["action", "deadline", "success_criteria"] as const).filter((k) => !r.commitment[k]?.toString().trim());
  if (missing.length) return { error: "Every session ends with a One Money Move: fill in the action, deadline, and success criteria." };

  const { error } = await supabase.rpc("coach_complete_session", { p_client_id: client_id, p_week: week });
  if (error) return { error: error.message };

  const [{ data: client }, { data: wk }, { data: commitment }] = await Promise.all([
    supabase.from("clients").select("*").eq("id", client_id).single(),
    supabase.from("curriculum_weeks").select("title").eq("week_number", week).single(),
    supabase.from("commitments").select("*").eq("id", r.commitment.id).single(),
  ]);
  const email = await sendPostSession(client as Client, commitment as Commitment, wk?.title ?? "");
  revalidatePath(`/coach/clients/${client_id}`, "layout");
  revalidatePath("/coach");
  return { ok: true, email, message: `Session completed and One Money Move approved. ${emailMessage(email, "Post-session email")}` };
}

export async function resendPostSessionEmail(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const { supabase } = await requireCoach();
  const client_id = str(fd, "client_id", 64);
  const week = WEEK(fd);
  const [{ data: client }, { data: commitment }, { data: wk }] = await Promise.all([
    supabase.from("clients").select("*").eq("id", client_id).single(),
    supabase.from("commitments").select("*").eq("client_id", client_id).eq("week_number", week).single(),
    supabase.from("curriculum_weeks").select("title").eq("week_number", week).single(),
  ]);
  if (!client || !commitment?.approved_at) return { error: "Approve the commitment first." };
  const email = await sendPostSession(client as Client, commitment as Commitment, wk?.title ?? "");
  revalidatePath(`/coach/clients/${client_id}`, "layout");
  return { ok: email.status === "sent", email, message: emailMessage(email, "Post-session email") };
}

export async function reviewCommitment(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const { supabase } = await requireCoach();
  const id = str(fd, "commitment_id", 64);
  const status = str(fd, "status", 20) as CommitmentStatus;
  if (!["not_started", "in_progress", "completed", "needs_review"].includes(status)) return { error: "Choose a status." };
  const { data, error } = await supabase
    .from("commitments")
    .update({
      status,
      coach_feedback: optStr(fd, "coach_feedback", 1000),
      completed_at: status === "completed" ? new Date().toISOString() : null,
    })
    .eq("id", id)
    .select("client_id")
    .single();
  if (error || !data) return { error: "Could not save the review." };
  revalidatePath(`/coach/clients/${data.client_id}`, "layout");
  return { ok: true, message: "Commitment updated." };
}

export async function sendReminder(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const { supabase } = await requireCoach();
  const client_id = str(fd, "client_id", 64);
  const [{ data: client }, { data: commitment }] = await Promise.all([
    supabase.from("clients").select("*").eq("id", client_id).single(),
    supabase
      .from("commitments")
      .select("*")
      .eq("client_id", client_id)
      .not("approved_at", "is", null)
      .neq("status", "completed")
      .order("week_number", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);
  if (!client) return { error: "Client not found." };
  if (!commitment) return { error: "There's no open, approved One Money Move to remind about." };
  const email = await sendReminderNow(client as Client, commitment as Commitment);
  revalidatePath(`/coach/clients/${client_id}`, "layout");
  return { ok: email.status === "sent", email, message: emailMessage(email, "Accountability reminder") };
}

// ---------------------------------------------------------------------------
// Progress
// ---------------------------------------------------------------------------
export async function recordProgress(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const { supabase } = await requireCoach();
  const client_id = str(fd, "client_id", 64);
  const source = str(fd, "source", 20);
  if (source !== "verified" && source !== "self_reported") return { error: "Choose whether these numbers are verified or self-reported." };
  const emergency_savings = optNumber(fd, "emergency_savings");
  const consumer_debt = optNumber(fd, "consumer_debt");
  const monthly_cash_flow = optNumber(fd, "monthly_cash_flow", { min: -10_000_000, max: 10_000_000 });
  const retirement_contribution_pct = optNumber(fd, "retirement_contribution_pct", { max: 100 });
  if ([emergency_savings, consumer_debt, monthly_cash_flow, retirement_contribution_pct].includes(undefined)) {
    return { error: "Check the numbers: use plain amounts like 1200 or 6.5." };
  }
  const benefits = str(fd, "employer_benefits_reviewed", 5);
  const { error } = await supabase.from("progress_snapshots").insert({
    client_id,
    source,
    emergency_savings,
    consumer_debt,
    monthly_cash_flow,
    retirement_contribution_pct,
    employer_benefits_reviewed: benefits === "yes" ? true : benefits === "no" ? false : null,
    note: optStr(fd, "note", 1000),
  });
  if (error) return { error: "Could not save progress." };
  revalidatePath(`/coach/clients/${client_id}`, "layout");
  return { ok: true, message: "Progress recorded." };
}

// ---------------------------------------------------------------------------
// Email templates
// ---------------------------------------------------------------------------
export async function saveTemplate(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const { supabase } = await requireCoach();
  const key = str(fd, "key", 40);
  const subject = str(fd, "subject", 200);
  const body = String(fd.get("body") ?? "").slice(0, 10000);
  if (!subject || !body.trim()) return { error: "Subject and message can't be empty." };
  const { error } = await supabase.from("email_templates").update({ subject, body }).eq("key", key);
  if (error) return { error: "Could not save the template." };
  revalidatePath("/coach/templates");
  return { ok: true, message: "Template saved. New emails use it right away." };
}
