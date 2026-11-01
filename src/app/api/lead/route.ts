import { NextResponse } from "next/server";
import { validateLead, type LeadResponse } from "@/lib/leads";

/**
 * Receives form submissions.
 *
 * [EXTERNAL SETUP] Set LEAD_WEBHOOK_URL to forward submissions as JSON to your
 * email/CRM tool (for example a Zapier, Make, or n8n webhook, or a provider
 * like ConvertKit/Resend via a small function). Until it is set, submissions
 * are NOT stored or emailed anywhere, and the UI tells the visitor so.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json<LeadResponse>({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const { lead, error } = validateLead(body);
  if (!lead) return NextResponse.json<LeadResponse>({ ok: false, error: error ?? "Invalid request." }, { status: 400 });

  // Honeypot: silently accept bots without forwarding.
  if (lead.company) return NextResponse.json<LeadResponse>({ ok: true, delivered: false });

  const webhook = process.env.LEAD_WEBHOOK_URL;
  if (!webhook) {
    // Log only the type, never personal details.
    console.info(`[lead] received type=${lead.type} (LEAD_WEBHOOK_URL not configured, not forwarded)`);
    return NextResponse.json<LeadResponse>({ ok: true, delivered: false });
  }

  try {
    const { company: _honeypot, ...forward } = lead;
    void _honeypot;
    const res = await fetch(webhook, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.LEAD_WEBHOOK_SECRET ? { Authorization: `Bearer ${process.env.LEAD_WEBHOOK_SECRET}` } : {}),
      },
      body: JSON.stringify({ ...forward, submittedAt: new Date().toISOString(), source: "money-coach-website" }),
    });
    if (!res.ok) throw new Error(`Webhook responded ${res.status}`);
    return NextResponse.json<LeadResponse>({ ok: true, delivered: true });
  } catch (e) {
    console.error("[lead] forward failed", e instanceof Error ? e.message : e);
    return NextResponse.json<LeadResponse>(
      { ok: false, error: "We couldn't send that right now. Please try again or email us directly." },
      { status: 502 },
    );
  }
}
