import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppShell, NotConfigured } from "@/components/app/app-shell";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Coach dashboard", robots: { index: false } };
export const dynamic = "force-dynamic";

export default function CoachLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell
      area="Coach"
      nav={[
        { href: "/coach", label: "Home" },
        { href: "/coach", label: "Dashboard" },
        { href: "/coach/clients/new", label: "Enroll client" },
        { href: "/coach/templates", label: "Emails" },
      ]}
    >
      {isSupabaseConfigured() ? children : <NotConfigured />}
    </AppShell>
  );
}
