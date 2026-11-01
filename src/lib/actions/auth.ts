"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { appUrl, isSupabaseConfigured } from "@/lib/supabase/config";
import { passwordProblem } from "@/lib/validation";

export type FormState = { error?: string; ok?: boolean; message?: string } | undefined;

export async function signIn(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!isSupabaseConfigured()) return { error: "The client portal isn't switched on yet." };
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Enter your email and password." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) return { error: "That email and password don't match. Please try again." };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).maybeSingle();
  if (profile?.role === "coach") redirect("/coach");
  if (profile?.role === "client") redirect("/portal");
  await supabase.auth.signOut();
  return { error: "This account doesn't have access yet. Please contact your coach." };
}

export async function signOut() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/login?signed-out=1");
}

export async function requestPasswordReset(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!isSupabaseConfigured()) return { error: "The client portal isn't switched on yet." };
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) return { error: "Enter a valid email address." };
  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${appUrl()}/auth/callback?next=/reset-password` });
  // Same answer whether or not the account exists.
  return { ok: true, message: "If that email has an account, a reset link is on its way. Check your inbox in a few minutes." };
}

export async function updatePassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  const problem = passwordProblem(password, confirm);
  if (problem) return { error: problem };
  const supabase = await createClient();
  const { data, error } = await supabase.auth.updateUser({ password });
  if (error || !data.user) return { error: "Your reset link has expired. Please request a new one." };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).maybeSingle();
  redirect(profile?.role === "coach" ? "/coach" : "/portal");
}
