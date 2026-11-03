import { CalendarCheck, Mail } from "lucide-react";
import { bookCall, site } from "@/config/site";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** A plain anchor (not next/link) so mailto: and outside booking links work. */
export function BookCallButton({
  className,
  variant = "gold",
  size = "lg",
}: {
  className?: string;
  variant?: "gold" | "primary" | "navy";
  size?: "md" | "lg";
}) {
  return (
    <a
      href={bookCall.href}
      {...(bookCall.isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={cn(buttonVariants({ variant, size }), className)}
    >
      <CalendarCheck aria-hidden /> {bookCall.label}
    </a>
  );
}

/** The same single next step at the end of every public page, just above the footer. */
export function BookCallBand() {
  return (
    <section aria-labelledby="book-call-heading" className="border-t border-navy/10 bg-ivory-200">
      <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 py-12 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald">Your next step</p>
          <h2 id="book-call-heading" className="mt-2 text-2xl font-bold leading-tight text-navy sm:text-3xl">
            Not sure where to start? Let&rsquo;s talk for 15 minutes.
          </h2>
          <p className="mt-2 leading-relaxed text-slate-600">
            Free, no pressure, and no sales pitch. Tell {site.founder.firstName} where you are, and you&rsquo;ll leave with
            one clear next money move.
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-start gap-2">
          <BookCallButton />
          {!bookCall.isExternal && (
            <p className="flex items-center gap-1.5 text-xs text-slate-600">
              <Mail className="size-3.5" aria-hidden /> Opens an email to {site.contactEmail}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
