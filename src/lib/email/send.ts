import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { site } from "@/config/site";
import { renderEmail, type TemplateVars } from "./render";

export type EmailKind =
  /** Account emails (welcome / onboarding link). Always sent. */
  | "transactional"
  /** Coaching emails. Skipped when automation is paused or the client opted out. */
  | "coaching";

export type SendResult = {
  status: "sent" | "failed" | "skipped" | "duplicate";
  detail?: string;
};

type SendArgs = {
  clientId: string;
  to: string;
  templateKey: "welcome" | "post_session" | "reminder";
  /** One logical email = one key. A key that was already sent is never sent again. */
  dedupeKey: string;
  vars: TemplateVars;
  kind: EmailKind;
};

export function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

/**
 * Sends one templated email through Resend and records the outcome in
 * email_log: sent, failed (with the error), or skipped (with the reason).
 */
export async function sendTemplatedEmail({ clientId, to, templateKey, dedupeKey, vars, kind }: SendArgs): Promise<SendResult> {
  const db = createAdminClient();

  // 1. Reserve the dedupe key. A previous failed/skipped attempt may be retried.
  const { error: insertError } = await db
    .from("email_log")
    .insert({ client_id: clientId, template_key: templateKey, dedupe_key: dedupeKey, to_email: to, status: "pending" });
  if (insertError) {
    if (insertError.code !== "23505") return { status: "failed", detail: `Could not log email: ${insertError.message}` };
    const { data: existing } = await db.from("email_log").select("status, attempts").eq("dedupe_key", dedupeKey).single();
    if (!existing || existing.status === "sent" || existing.status === "pending") {
      return { status: "duplicate", detail: "This email was already sent." };
    }
    const { data: claimed } = await db
      .from("email_log")
      .update({ status: "pending", attempts: existing.attempts + 1, to_email: to, detail: null })
      .eq("dedupe_key", dedupeKey)
      .eq("status", existing.status)
      .select("id");
    if (!claimed?.length) return { status: "duplicate", detail: "Another send is in progress." };
  }

  const finish = async (status: "sent" | "failed" | "skipped", detail: string | null, providerId?: string) => {
    await db
      .from("email_log")
      .update({ status, detail, provider_message_id: providerId ?? null })
      .eq("dedupe_key", dedupeKey);
    return { status, detail: detail ?? undefined } as SendResult;
  };

  // 2. Respect communication preferences for coaching emails.
  if (kind === "coaching") {
    const { data: client } = await db.from("clients").select("automation_paused, email_opt_in, status").eq("id", clientId).single();
    if (!client) return finish("skipped", "Client not found");
    if (client.automation_paused) return finish("skipped", "Automation is paused for this client");
    if (!client.email_opt_in) return finish("skipped", "Client opted out of coaching emails");
    if (client.status === "withdrawn") return finish("skipped", "Client has withdrawn");
  }

  // 3. Render the coach-editable template.
  const { data: template } = await db.from("email_templates").select("subject, body").eq("key", templateKey).single();
  if (!template) return finish("failed", `Email template "${templateKey}" is missing`);
  const email = renderEmail(template.subject, template.body, { coach_name: site.founder.name, ...vars });

  // 4. Send.
  if (!isEmailConfigured()) {
    if (process.env.NODE_ENV !== "production") {
      console.info(`[email:dev] To: ${to}\nSubject: ${email.subject}\n\n${email.text}\n`);
    }
    return finish("skipped", "Email service not configured (RESEND_API_KEY / EMAIL_FROM)");
  }

  try {
    const res = await fetch(`${process.env.RESEND_API_URL || "https://api.resend.com"}/emails`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
        "Idempotency-Key": dedupeKey.slice(0, 256),
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM,
        to: [to],
        reply_to: site.contactEmail,
        subject: email.subject,
        html: email.html,
        text: email.text,
      }),
    });
    const body = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
    if (!res.ok) return finish("failed", `Resend ${res.status}: ${body.message ?? "request failed"}`.slice(0, 500));
    return finish("sent", null, body.id);
  } catch (e) {
    return finish("failed", `Network error: ${e instanceof Error ? e.message : String(e)}`.slice(0, 500));
  }
}
