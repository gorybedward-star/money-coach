import type { Metadata } from "next";
import Link from "next/link";
import { AppShell, NotConfigured } from "@/components/app/app-shell";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { findInvite } from "@/lib/onboarding";
import { OnboardForm } from "./onboard-form";

export const metadata: Metadata = { title: "Welcome", robots: { index: false } };

export default async function OnboardPage({ params }: { params: Promise<{ token: string }> }) {
  if (!isSupabaseConfigured()) {
    return (
      <AppShell area="Welcome" signedIn={false}>
        <NotConfigured />
      </AppShell>
    );
  }
  const { token } = await params;
  const invite = await findInvite(token);

  return (
    <AppShell area="Welcome" signedIn={false}>
      <div className="mx-auto max-w-md px-4 py-16 sm:py-20">
        {invite ? (
          <>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-600">The 7-Week Money Reset</p>
            <h1 className="mt-2 text-3xl font-bold">Welcome, {invite.client.first_name}.</h1>
            <p className="mt-3 text-slate-600">
              First, create a password for your private Money Coach account. Next, you&rsquo;ll fill in a short, confidential
              intake before our first session.
            </p>
            <OnboardForm token={token} email={invite.client.email} />
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold">This link has expired</h1>
            <p className="mt-3 text-slate-600">
              Onboarding links work once and expire after 14 days. If you already created your password,{" "}
              <Link href="/login" className="text-emerald underline underline-offset-2">sign in here</Link>. Otherwise, reply to your
              welcome email and your coach will send a new link.
            </p>
          </>
        )}
      </div>
    </AppShell>
  );
}
