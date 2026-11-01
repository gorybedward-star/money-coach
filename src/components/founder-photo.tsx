import Image from "next/image";
import { site } from "@/config/site";
import { cn } from "@/lib/utils";

export const FOUNDER_PHOTO = "/images/gory-bedward.jpg";

export function FounderPhoto({ className, priority = false }: { className?: string; priority?: boolean }) {
  return (
    <div className={cn("relative overflow-hidden rounded-[var(--radius-card)] shadow-lift", className)}>
      <Image
        src={FOUNDER_PHOTO}
        alt={`${site.founder.name}, founder of MONEY COACH`}
        width={900}
        height={1285}
        priority={priority}
        sizes="(min-width: 1024px) 28rem, 100vw"
        className="h-full w-full object-cover object-[50%_25%]"
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 rounded-[var(--radius-card)] ring-1 ring-inset ring-gold/40" />
    </div>
  );
}
