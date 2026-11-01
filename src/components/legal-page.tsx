import type { ReactNode } from "react";
import { ApprovalNote } from "@/components/disclosure";

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
      <ApprovalNote>
        DRAFT FOR PROFESSIONAL REVIEW. This text is a starting template and must be reviewed by a qualified attorney before publication.
      </ApprovalNote>
      <h1 className="mt-6 text-4xl font-bold sm:text-5xl">{title}</h1>
      <p className="mt-3 text-sm text-slate-600">Last updated: {updated}</p>
      <div className="prose-mc mt-10">{children}</div>
    </div>
  );
}
