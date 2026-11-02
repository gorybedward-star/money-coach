import Link from "next/link";
import { Info } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Disclosure({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <aside
      className={cn(
        "flex gap-3 rounded-2xl border border-navy/10 bg-white/70 p-4 text-sm leading-relaxed text-slate-600",
        className,
      )}
    >
      <Info className="mt-0.5 size-4 shrink-0 text-emerald" aria-hidden />
      <div>
        {children ?? (
          <>
            For general education only, not individualized financial, investment, insurance, legal, or tax advice.
            Financial and insurance products are regulated by each state; consult licensed professionals before acting.
            Results are hypothetical and not guaranteed.{" "}
          </>
        )}{" "}
        <Link href="/disclaimer" className="font-medium text-emerald underline underline-offset-2">
          Disclaimer
        </Link>
      </div>
    </aside>
  );
}

/** Small banner flagging content that still needs founder or legal sign-off. */
export function ApprovalNote({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        "inline-flex items-start gap-2 rounded-xl border border-gold/50 bg-gold-50 px-3 py-2 text-xs leading-relaxed text-navy",
        className,
      )}
    >
      <span aria-hidden className="mt-1 size-1.5 shrink-0 rounded-full bg-gold-600" />
      <span>{children}</span>
    </p>
  );
}
