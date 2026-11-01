import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Labeled placeholder for photography that must be supplied and approved by the founder.
 * Replace with next/image once real, licensed photos are available.
 */
export function ImagePlaceholder({
  label,
  note = "Photo placeholder · founder to supply",
  className,
  tone = "light",
}: {
  label: string;
  note?: string;
  className?: string;
  tone?: "light" | "dark";
}) {
  return (
    <div
      role="img"
      aria-label={`Placeholder: ${label}`}
      className={cn(
        "relative flex flex-col items-center justify-center gap-3 overflow-hidden rounded-[var(--radius-card)] p-6 text-center",
        tone === "light"
          ? "bg-gradient-to-br from-sand via-ivory-200 to-gold-50 text-navy/70"
          : "bg-gradient-to-br from-navy-700 via-navy-800 to-navy text-ivory/70",
        className,
      )}
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.07] [background-image:radial-gradient(currentColor_1px,transparent_1px)] [background-size:16px_16px]"
      />
      <ImageIcon className="relative size-10 opacity-60" aria-hidden />
      <p className="relative max-w-xs text-sm font-semibold">{label}</p>
      <p className="relative text-xs uppercase tracking-wider opacity-70">{note}</p>
    </div>
  );
}
