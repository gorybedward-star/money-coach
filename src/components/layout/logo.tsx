import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  // Original mark: a rising three-step "foundation" inside a shield-like rounded square.
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" className={cn("size-9", className)}>
      <rect width="40" height="40" rx="11" fill="#10243A" />
      <rect x="9" y="24" width="6" height="7" rx="1.5" fill="#C9A45C" />
      <rect x="17" y="18" width="6" height="13" rx="1.5" fill="#C9A45C" />
      <rect x="25" y="11" width="6" height="20" rx="1.5" fill="#167D68" />
    </svg>
  );
}

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="group flex items-center gap-2.5" aria-label="MONEY COACH home">
      <LogoMark />
      <span className={cn("font-display text-lg font-bold tracking-tight", light ? "text-ivory" : "text-navy")}>
        MONEY <span className={light ? "text-gold" : "text-emerald"}>COACH</span>
      </span>
    </Link>
  );
}
