import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Client } from "@/lib/coaching/types";

/** The signed-in user and role, verified with Supabase Auth (not just the cookie). */
export const getViewer = cache(async () => {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("role, full_name").eq("id", user.id).maybeSingle();
  return { supabase, user, role: (profile?.role ?? null) as "coach" | "client" | null };
});

export async function requireCoach() {
  const viewer = await getViewer();
  if (!viewer) redirect("/login");
  if (viewer.role !== "coach") redirect(viewer.role === "client" ? "/portal" : "/login?error=no-access");
  return viewer;
}

export async function requireClient() {
  const viewer = await getViewer();
  if (!viewer) redirect("/login");
  if (viewer.role !== "client") redirect(viewer.role === "coach" ? "/coach" : "/login?error=no-access");
  const { data: client } = await viewer.supabase.from("clients").select("*").eq("user_id", viewer.user.id).single();
  if (!client) redirect("/login?error=no-access");
  return { ...viewer, client: client as Client };
}
