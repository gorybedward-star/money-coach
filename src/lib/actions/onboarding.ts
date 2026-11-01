"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { findInvite } from "@/lib/onboarding";
import { passwordProblem } from "@/lib/validation";
import type { FormState } from "./auth";

export async function completeOnboarding(_prev: FormState, formData: FormData): Promise<FormState> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const problem = passwordProblem(password, String(formData.get("confirm") ?? ""));
  if (problem) return { error: problem };

  const invite = await findInvite(token);
  if (!invite) return { error: "This link has expired or was already used. Please ask your coach for a new one." };

  const db = createAdminClient();
  // Claim the link first so it can only ever be used once.
  const { data: claimed } = await db
    .from("client_invites")
    .update({ used_at: new Date().toISOString() })
    .eq("id", invite.inviteId)
    .is("used_at", null)
    .select("id");
  if (!claimed?.length) return { error: "This link was already used. Please sign in instead." };

  const { error: pwError } = await db.auth.admin.updateUserById(invite.client.user_id!, { password });
  if (pwError) {
    await db.from("client_invites").update({ used_at: null }).eq("id", invite.inviteId);
    return { error: "We couldn't save that password. Please try a different one." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email: invite.client.email, password });
  if (error) redirect("/login");
  redirect("/portal/intake");
}
