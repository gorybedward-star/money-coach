import { AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function FormMessage({ state, className }: { state?: { error?: string; message?: string } | undefined; className?: string }) {
  if (!state?.error && !state?.message) return null;
  const isError = Boolean(state.error);
  return (
    <p
      role={isError ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2 rounded-xl px-4 py-3 text-sm",
        isError ? "bg-red-50 text-red-800" : "bg-emerald-50 text-emerald-700",
        className,
      )}
    >
      {isError ? <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden /> : <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden />}
      <span>{state.error ?? state.message}</span>
    </p>
  );
}
