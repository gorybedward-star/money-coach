"use client";

import { useState } from "react";
import { Copy } from "lucide-react";

/** Shows an onboarding link the coach can copy when the email couldn't be sent. */
export function CopyLink({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="mt-3 rounded-xl border border-gold/50 bg-gold-50 p-4 text-sm">
      <p className="font-semibold">Send this secure link to the client yourself:</p>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <input readOnly value={link} className="w-full rounded-lg border border-navy/15 bg-white px-3 py-2 font-mono text-xs" onFocus={(e) => e.target.select()} aria-label="Onboarding link" />
        <button
          type="button"
          onClick={() => navigator.clipboard.writeText(link).then(() => setCopied(true))}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-navy px-3 py-2 text-xs font-semibold text-ivory"
        >
          <Copy className="size-3.5" aria-hidden /> {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <p className="mt-2 text-xs text-slate-600">It works once and expires in 14 days. Don&rsquo;t post it anywhere public.</p>
    </div>
  );
}
