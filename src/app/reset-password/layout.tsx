import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppShell } from "@/components/app/app-shell";

export const metadata: Metadata = { title: "Account", robots: { index: false } };

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <AppShell area="Account" signedIn={false}>
      {children}
    </AppShell>
  );
}
