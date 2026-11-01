import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AppShell, NotConfigured } from "@/components/app/app-shell";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getViewer } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Client login", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  if (!isSupabaseConfigured()) {
    return (
      <AppShell area="Login" signedIn={false}>
        <NotConfigured />
      </AppShell>
    );
  }
  const viewer = await getViewer();
  if (viewer?.role === "coach") redirect("/coach");
  if (viewer?.role === "client") redirect("/portal");
  const sp = await searchParams;

  return (
    <AppShell area="Login" signedIn={false}>
      <div className="mx-auto max-w-md px-4 py-16 sm:py-24">
        <h1 className="text-3xl font-bold">Welcome back</h1>
        <p className="mt-2 text-slate-600">Sign in to your Money Coach account.</p>
        {sp["signed-out"] && <p className="mt-6 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700" role="status">You&rsquo;re signed out.</p>}
        {sp.error === "no-access" && (
          <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">That page isn&rsquo;t available for this account.</p>
        )}
        {sp.error === "link-expired" && (
          <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">That link has expired. Please request a new one.</p>
        )}
        <LoginForm />
      </div>
    </AppShell>
  );
}
