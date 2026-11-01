/** Shared lead payload types and validation (used by forms and the API route). */

export type LeadType = "roadmap" | "scorecard" | "tsp-checkup" | "benefits-checklist" | "contact" | "newsletter";

export type LeadPayload = {
  type: LeadType;
  name?: string;
  email: string;
  marketingConsent: boolean;
  service?: string;
  message?: string;
  /** Small, non-sensitive context such as a score. Never account numbers, SSNs, or medical details. */
  context?: Record<string, string | number>;
  /** Honeypot. Real users leave this empty. */
  company?: string;
};

export type LeadResponse = { ok: true; delivered: boolean } | { ok: false; error: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const TYPES: LeadType[] = ["roadmap", "scorecard", "tsp-checkup", "benefits-checklist", "contact", "newsletter"];

export function validateLead(input: unknown): { lead?: LeadPayload; error?: string } {
  if (!input || typeof input !== "object") return { error: "Invalid request." };
  const b = input as Record<string, unknown>;
  const type = b.type as LeadType;
  if (!TYPES.includes(type)) return { error: "Invalid request type." };
  const email = String(b.email ?? "").trim().slice(0, 200);
  if (!EMAIL_RE.test(email)) return { error: "Please enter a valid email address." };
  const name = b.name ? String(b.name).trim().slice(0, 100) : undefined;
  const message = b.message ? String(b.message).trim().slice(0, 3000) : undefined;
  if (type === "contact" && !message) return { error: "Please include a short message." };
  const service = b.service ? String(b.service).slice(0, 50) : undefined;
  const context: Record<string, string | number> = {};
  if (b.context && typeof b.context === "object") {
    for (const [k, v] of Object.entries(b.context as Record<string, unknown>).slice(0, 20)) {
      if (typeof v === "number" || typeof v === "string") context[k.slice(0, 40)] = typeof v === "string" ? v.slice(0, 200) : v;
    }
  }
  return {
    lead: {
      type,
      email,
      name,
      message,
      service,
      context,
      marketingConsent: b.marketingConsent === true,
      company: b.company ? String(b.company) : undefined,
    },
  };
}
