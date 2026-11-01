/**
 * Turns an editable plain-text template into a branded HTML email and a
 * plain-text version. Template syntax:
 *   {{placeholder}}          replaced with the (HTML-escaped) value
 *   [button:Label](url)      a button (url may be a placeholder)
 *   blank line               new paragraph
 */

export type TemplateVars = Record<string, string | null | undefined>;

export const placeholderHelp: { key: string; meaning: string }[] = [
  { key: "first_name", meaning: "Client's first name" },
  { key: "link", meaning: "Secure onboarding link (welcome email)" },
  { key: "portal_link", meaning: "Client portal link" },
  { key: "week_number", meaning: "Coaching week number" },
  { key: "week_title", meaning: "Coaching week title" },
  { key: "objective", meaning: "This week's priority" },
  { key: "action", meaning: "My commitment (the agreed One Money Move)" },
  { key: "deadline", meaning: "Commitment deadline" },
  { key: "success_criteria", meaning: "How we'll measure success" },
  { key: "session_summary", meaning: "Short, non-confidential session recap" },
  { key: "appointment", meaning: "Next appointment sentence" },
  { key: "coach_name", meaning: "Your name" },
];

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

export function fillText(template: string, vars: TemplateVars): string {
  return template.replace(/\{\{\s*([a-z_]+)\s*\}\}/g, (_, key: string) => vars[key] ?? "");
}

const isSafeUrl = (u: string) => /^https?:\/\//i.test(u);

export function renderEmail(subjectTemplate: string, bodyTemplate: string, vars: TemplateVars) {
  const subject = fillText(subjectTemplate, vars).replace(/[\r\n]+/g, " ").trim();
  const filled = fillText(bodyTemplate, vars);
  const paragraphs = filled
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const text = paragraphs
    .map((p) => p.replace(/\[button:([^\]]+)\]\(([^)\s]+)\)/g, (_, label: string, url: string) => `${label}: ${url}`))
    .join("\n\n");

  const htmlParas = paragraphs
    .map((p) => {
      const button = /^\[button:([^\]]+)\]\(([^)\s]+)\)$/.exec(p);
      if (button) {
        const [, label, url] = button;
        if (!isSafeUrl(url)) return "";
        return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 20px"><tr><td style="border-radius:999px;background:#167d68"><a href="${escapeHtml(url)}" style="display:inline-block;padding:14px 28px;font-weight:600;font-size:16px;color:#ffffff;text-decoration:none;border-radius:999px">${escapeHtml(label)}</a></td></tr></table>`;
      }
      const inner = escapeHtml(p).replace(/\n/g, "<br>");
      return `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#10243a">${inner}</p>`;
    })
    .join("\n");

  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:0;background:#faf8f2;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf8f2;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #ebe6d9">
<tr><td style="background:#10243a;padding:22px 32px"><span style="font-family:Georgia,'Times New Roman',serif;font-size:20px;font-weight:700;color:#faf8f2;letter-spacing:-0.01em">MONEY <span style="color:#c9a45c">COACH</span></span></td></tr>
<tr><td style="padding:32px 32px 16px">${htmlParas}</td></tr>
<tr><td style="padding:20px 32px 28px;border-top:1px solid #f2eee2;font-size:12px;line-height:1.6;color:#64748b">One Week. One Objective. One Money Move.<br>Money Coach provides financial education and coaching, not individualized investment, tax, or legal advice. For your privacy, we never include account numbers or detailed financial information in email.</td></tr>
</table></td></tr></table></body></html>`;

  return { subject, html, text };
}
