import { requireCoach } from "@/lib/auth";
import { saveTemplate } from "@/lib/actions/coach";
import { placeholderHelp, renderEmail } from "@/lib/email/render";
import { appUrl } from "@/lib/supabase/config";
import { site } from "@/config/site";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";
import { ActionForm } from "@/components/app/action-form";
import { PageHeader } from "@/components/app/app-shell";

const sample = {
  first_name: "Jordan",
  link: `${appUrl()}/onboard/example`,
  portal_link: `${appUrl()}/portal`,
  week_number: "1",
  week_title: "Understand Your Money Story",
  action: "Open a separate savings account and set up a $25 weekly transfer",
  deadline: "Friday, November 13",
  success_criteria: "Account open and first transfer made",
  session_summary: "Great conversation today about where your money habits come from.",
  appointment: "Our next session: Thursday, November 12 at 6:30 PM EST.",
  coach_name: site.founder.name,
};

export default async function TemplatesPage() {
  const { supabase } = await requireCoach();
  const { data } = await supabase.from("email_templates").select("*").order("key", { ascending: false });
  const templates = (data ?? []) as { key: string; name: string; subject: string; body: string; updated_at: string }[];
  const order = ["welcome", "post_session", "reminder"];
  templates.sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <PageHeader eyebrow="Communication" title="Email templates">
        Edit the wording any time. Placeholders in double curly braces are filled in for each client. A line like
        <code className="mx-1 rounded bg-white px-1.5 py-0.5 text-sm">[button:Label]({"{{portal_link}}"})</code>becomes a button.
      </PageHeader>

      <div className="space-y-8">
        {templates.map((t) => {
          const preview = renderEmail(t.subject, t.body, sample);
          return (
            <Card key={t.key}>
              <CardContent className="grid gap-8 lg:grid-cols-2">
                <ActionForm action={saveTemplate} submitLabel="Save template">
                  <h2 className="text-xl font-bold">{t.name}</h2>
                  <input type="hidden" name="key" value={t.key} />
                  <div>
                    <Label htmlFor={`${t.key}-subject`}>Subject</Label>
                    <Input id={`${t.key}-subject`} name="subject" defaultValue={t.subject} maxLength={200} required />
                  </div>
                  <div>
                    <Label htmlFor={`${t.key}-body`}>Message</Label>
                    <Textarea id={`${t.key}-body`} name="body" defaultValue={t.body} className="min-h-96 font-mono text-sm" required />
                  </div>
                </ActionForm>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">Preview with sample details</p>
                  <p className="mt-2 font-semibold">{preview.subject}</p>
                  <iframe title={`${t.name} preview`} srcDoc={preview.html} sandbox="" className="mt-3 h-[560px] w-full rounded-xl border border-navy/10 bg-white" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="mt-8">
        <CardContent>
          <h2 className="text-lg font-bold">Placeholders</h2>
          <dl className="mt-4 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
            {placeholderHelp.map((p) => (
              <div key={p.key} className="flex gap-3">
                <dt><code className="rounded bg-ivory px-1.5 py-0.5">{`{{${p.key}}}`}</code></dt>
                <dd className="text-slate-600">{p.meaning}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
