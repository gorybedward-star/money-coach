import type { LeadPayload, LeadResponse } from "@/lib/leads";

/** Web3Forms key for bedwardghllc@outlook.com. Public by design. */
const WEB3FORMS_DEFAULT_KEY = "bdeba55d-48fa-4522-b8b6-edcfa41d2597";

const LABELS: Record<LeadPayload["type"], string> = {
  roadmap: "Free Money Roadmap request",
  scorecard: "Scorecard results request",
  "tsp-checkup": "TSP Checkup results request",
  "benefits-checklist": "Benefits Checklist request",
  contact: "Service request / question",
  newsletter: "Newsletter signup",
};

/**
 * Sends a form submission.
 *
 * [EXTERNAL SETUP] If NEXT_PUBLIC_WEB3FORMS_KEY is set, submissions are emailed
 * straight to the founder's inbox by Web3Forms (free plan, sent from the
 * visitor's browser). Otherwise they go to /api/lead (see LEAD_WEBHOOK_URL).
 */
export async function sendLead(payload: LeadPayload): Promise<LeadResponse> {
  // Web3Forms access keys are designed to be public (they are sent from the browser);
  // they only allow sending email to the owner's inbox. Env var overrides the default.
  const key = process.env.NEXT_PUBLIC_WEB3FORMS_KEY || WEB3FORMS_DEFAULT_KEY;
  // The shareable preview build sets NEXT_PUBLIC_DISABLE_FORMS so it never sends real email.
  if (!key || process.env.NEXT_PUBLIC_DISABLE_FORMS === "1") {
    const res = await fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return (await res.json()) as LeadResponse;
  }

  if (payload.company) return { ok: true, delivered: false }; // honeypot
  const context = Object.entries(payload.context ?? {})
    .map(([k, v]) => `${k}: ${v}`)
    .join(", ");
  const res = await fetch("https://api.web3forms.com/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      access_key: key,
      subject: `MONEY COACH: ${LABELS[payload.type]}`,
      from_name: "MONEY COACH website",
      replyto: payload.email,
      "Request type": LABELS[payload.type],
      Name: payload.name ?? "(not given)",
      Email: payload.email,
      "Service of interest": payload.service ?? "(none)",
      Message: payload.message ?? "(none)",
      Details: context || "(none)",
      "Marketing emails OK": payload.marketingConsent ? "YES, opted in" : "No",
    }),
  });
  const data = (await res.json().catch(() => ({}))) as { success?: boolean; message?: string };
  if (!res.ok || !data.success) return { ok: false, error: "We couldn't send that right now. Please try again or email us directly." };
  return { ok: true, delivered: true };
}
