import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { hashToken } from "@/lib/tokens";

/** Looks up a still-valid onboarding link. Server-only (uses the service role). */
export async function findInvite(token: string) {
  if (!token || token.length > 100) return null;
  const db = createAdminClient();
  const { data } = await db
    .from("client_invites")
    .select("id, expires_at, used_at, client:clients(id, user_id, first_name, email)")
    .eq("token_hash", hashToken(token))
    .maybeSingle();
  if (!data || data.used_at || new Date(data.expires_at) < new Date()) return null;
  const client = (Array.isArray(data.client) ? data.client[0] : data.client) as
    | { id: string; user_id: string | null; first_name: string; email: string }
    | null;
  if (!client?.user_id) return null;
  return { inviteId: data.id as string, client };
}

