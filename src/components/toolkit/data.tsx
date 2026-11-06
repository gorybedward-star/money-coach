"use client";

import { useRef, useState } from "react";
import { Download, RotateCcw, Sparkles, Trash2, Upload } from "lucide-react";
import { normalizeState } from "@/lib/toolkit/model";
import { STORAGE_KEY, blankState, go, sampleState, useToolkit } from "./store";
import { Btn, Card, PageHeader } from "./ui";

export function DataSettings() {
  const { state, replace, persisted } = useToolkit();
  const [msg, setMsg] = useState<string | null>(null);
  const file = useRef<HTMLInputElement>(null);

  const exportJson = () => {
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), app: "money-coach-toolkit", data: state }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `money-coach-toolkit-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    setMsg("Exported. Keep the file somewhere private.");
  };

  const importJson = async (f: File) => {
    try {
      const parsed = JSON.parse(await f.text());
      const next = normalizeState(parsed?.data ?? parsed);
      if (!next) throw new Error("bad");
      replace({ ...next, onboarded: true });
      setMsg("Imported. Your dashboard has been updated.");
    } catch {
      setMsg("That file couldn't be read. Choose a file exported from this toolkit.");
    }
  };

  return (
    <div>
      <PageHeader title="Your data" intro="Export a copy, load the sample family or start over. In this prototype, nothing leaves your browser." />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Where your data lives" eyebrow="Prototype">
          <ul className="space-y-2 text-[13.5px] leading-relaxed text-[#33475f]">
            <li>Everything you enter is saved in this browser on this device ({persisted ? "saving normally" : "saving is blocked, so changes will be lost when you close the tab"}).</li>
            <li>It isn&rsquo;t sent to Money Coach or anyone else, and it won&rsquo;t follow you to another device.</li>
            <li>Clearing your browser data, or using a private window, erases it. Export a copy if you want a backup.</li>
            <li>Never enter Social Security numbers, bank logins or full account numbers. The toolkit never needs them.</li>
          </ul>
          <p className="mt-4 rounded-xl bg-[#fbf6ea] p-3 text-xs leading-relaxed text-[#5c4a1f]">The paid version will add secure sign-in and private, encrypted cloud storage with per-customer access controls. Until then, this prototype is for demonstration and personal testing only.</p>
        </Card>

        <Card title="Manage" eyebrow={state.mode === "sample" ? "Showing sample data" : "Showing your numbers"}>
          <div className="grid gap-3">
            <Btn variant="secondary" className="justify-start" onClick={exportJson}><Download className="size-4" /> Export my data (JSON)</Btn>
            <Btn variant="secondary" className="justify-start" onClick={() => file.current?.click()}><Upload className="size-4" /> Import a saved file</Btn>
            <input ref={file} type="file" accept="application/json,.json" className="hidden" onChange={(e) => e.target.files?.[0] && importJson(e.target.files[0])} />
            <Btn variant="secondary" className="justify-start" onClick={() => { if (state.mode !== "own" || confirm("Replace your numbers with the sample family? Export first if you want to keep them.")) { replace(sampleState()); setMsg("Sample family loaded."); } }}><Sparkles className="size-4" /> Load the sample family</Btn>
            <Btn variant="secondary" className="justify-start" onClick={() => { replace({ ...state, onboarded: false }); go("welcome"); }}><RotateCcw className="size-4" /> Run the setup wizard again</Btn>
            <Btn variant="danger" className="justify-start" onClick={() => { if (confirm("Delete everything saved in this toolkit on this browser? This can't be undone.")) { try { localStorage.removeItem(STORAGE_KEY); } catch {} replace(blankState()); go("welcome"); } }}><Trash2 className="size-4" /> Delete all my data</Btn>
          </div>
          {msg && <p role="status" className="mt-4 text-sm text-[#167d68]">{msg}</p>}
        </Card>
      </div>
    </div>
  );
}
