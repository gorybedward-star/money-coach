"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { blankState, normalizeState, sampleState, type ToolkitState } from "@/lib/toolkit/model";

/**
 * Stage 1 storage: the whole toolkit lives in one localStorage key in this browser only.
 * Stage 3 replaces load/save with authenticated Supabase reads and writes behind the same `update` API.
 */
export const STORAGE_KEY = "mc-toolkit-v1";

type Ctx = {
  state: ToolkitState;
  update: (fn: (s: ToolkitState) => ToolkitState) => void;
  replace: (s: ToolkitState) => void;
  persisted: boolean;
};

const ToolkitContext = createContext<Ctx | null>(null);

function load(): ToolkitState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? normalizeState(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

export function ToolkitProvider({ children, fallback }: { children: ReactNode; fallback: ReactNode }) {
  const [state, setState] = useState<ToolkitState | null>(null);
  const [persisted, setPersisted] = useState(true);

  useEffect(() => {
    // First visit: start with the onboarding wizard on a blank slate (sample data is one click away).
    setState(load() ?? blankState());
  }, []);

  useEffect(() => {
    if (!state) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      setPersisted(true);
    } catch {
      setPersisted(false);
    }
  }, [state]);

  const update = useCallback((fn: (s: ToolkitState) => ToolkitState) => setState((s) => (s ? fn(s) : s)), []);
  const replace = useCallback((s: ToolkitState) => setState(s), []);
  const value = useMemo(() => (state ? { state, update, replace, persisted } : null), [state, update, replace, persisted]);

  if (!value) return <>{fallback}</>;
  return <ToolkitContext.Provider value={value}>{children}</ToolkitContext.Provider>;
}

export function useToolkit() {
  const ctx = useContext(ToolkitContext);
  if (!ctx) throw new Error("useToolkit must be used inside ToolkitProvider");
  return ctx;
}

export { sampleState, blankState };

/* ---------------- Hash routing: "#/debt" etc. Works the same on Vercel and in a static preview. ---------------- */

export type View = "dashboard" | "paycheck" | "debt" | "emergency" | "investing" | "benefits" | "reset" | "net-worth" | "data" | "welcome";
const VIEWS: View[] = ["dashboard", "paycheck", "debt", "emergency", "investing", "benefits", "reset", "net-worth", "data", "welcome"];

function readView(): View {
  if (typeof window === "undefined") return "dashboard";
  const v = window.location.hash.replace(/^#\/?/, "").split(/[?#]/)[0] as View;
  return VIEWS.includes(v) ? v : "dashboard";
}

export function useView() {
  const [view, setView] = useState<View>("dashboard");
  useEffect(() => {
    const on = () => {
      setView(readView());
      window.scrollTo({ top: 0 });
    };
    setView(readView());
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  return view;
}

export function go(view: View) {
  if (typeof window === "undefined") return;
  const next = `#/${view}`;
  if (window.location.hash === next) window.scrollTo({ top: 0, behavior: "smooth" });
  else window.location.hash = next;
}
