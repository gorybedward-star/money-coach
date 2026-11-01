import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppShell, NotConfigured } from "@/components/app/app-shell";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "My Money Coach Journey", robots: { index: false } };
export const dynamic = "force-dynamic";

export default function PortalLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell area="My Journey" nav={[{ href: "/portal", label: "My Journey" }, { href: "/portal/intake", label: "My intake" }]}>
      {isSupabaseConfigured() ? children : <NotConfigured />}
    </AppShell>
  );
}
