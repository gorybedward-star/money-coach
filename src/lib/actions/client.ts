"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireClient } from "@/lib/auth";
import { optNumber, optStr, str } from "@/lib/validation";

export type ClientActionState = { error?: string; message?: string; ok?: boolean } | undefined;

export async function submitIntake(_prev: ClientActionState, fd: FormData): Promise<ClientActionState> {
  const { supabase, client } = await requireClient();

  const primary_goals = str(fd, "primary_goals", 2000);
  if (!primary_goals) return { error: "Please share at least one financial goal." };
  if (fd.get("consent_privacy") !== "on" || fd.get("consent_coaching_comms") !== "on") {
    return { error: "Please check both consent boxes so we can coach you." };
  }
  const preferred_contact = str(fd, "preferred_contact", 10);
  if (!["email", "phone", "text"].includes(preferred_contact)) return { error: "Choose how you'd like us to contact you." };

  const numbers = {
    monthly_income: optNumber(fd, "monthly_income", { max: 10_000_000 }),
    monthly_expenses: optNumber(fd, "monthly_expenses", { max: 10_000_000 }),
    emergency_savings: optNumber(fd, "emergency_savings"),
    consumer_debt: optNumber(fd, "consumer_debt"),
    retirement_contribution_pct: optNumber(fd, "retirement_contribution_pct", { max: 100 }),
  };
  if (Object.values(numbers).includes(undefined)) {
    return { error: "Please use plain numbers for amounts, like 2500 or 6. Rough estimates are fine." };
  }

  const row = {
    client_id: client.id,
    phone: optStr(fd, "phone", 40),
    best_time: optStr(fd, "best_time", 200),
    preferred_contact,
    primary_goals,
    concerns: optStr(fd, "concerns"),
    money_story: optStr(fd, "money_story"),
    habit_to_change: optStr(fd, "habit_to_change", 1000),
    debt_notes: optStr(fd, "debt_notes"),
    retirement_overview: optStr(fd, "retirement_overview"),
    employee_benefits: optStr(fd, "employee_benefits"),
    consent_privacy: true,
    consent_coaching_comms: true,
    ...numbers,
  };

  const { data: existing } = await supabase.from("intakes").select("client_id").eq("client_id", client.id).maybeSingle();
  const { error } = existing
    ? await supabase.from("intakes").update(row).eq("client_id", client.id)
    : await supabase.from("intakes").insert(row);
  if (error) return { error: "We couldn't save your intake. Please try again." };

  // The intake itself is the first Week 1 client checklist item.
  if (!existing) {
    const { data: item } = await supabase
      .from("curriculum_items")
      .select("id")
      .eq("week_number", 1)
      .eq("audience", "client")
      .eq("position", 1)
      .maybeSingle();
    if (item) await supabase.from("checklist_progress").upsert({ client_id: client.id, item_id: item.id }, { ignoreDuplicates: true });
  }
  revalidatePath("/portal");
  redirect("/portal?intake=done");
}

export async function toggleMyChecklistItem(itemId: string, done: boolean) {
  const { supabase, client } = await requireClient();
  if (done) await supabase.from("checklist_progress").upsert({ client_id: client.id, item_id: itemId }, { ignoreDuplicates: true });
  else await supabase.from("checklist_progress").delete().eq("client_id", client.id).eq("item_id", itemId);
  revalidatePath("/portal");
}

export async function updateMyCommitment(_prev: ClientActionState, fd: FormData): Promise<ClientActionState> {
  const { supabase } = await requireClient();
  const status = str(fd, "status", 20);
  if (status !== "in_progress" && status !== "completed") return { error: "Choose In Progress or Completed." };
  const { error } = await supabase.rpc("client_update_commitment", {
    p_commitment_id: str(fd, "commitment_id", 64),
    p_status: status,
    p_note: str(fd, "note", 1000),
  });
  if (error) return { error: "We couldn't save your update. Please try again." };
  revalidatePath("/portal");
  return { ok: true, message: status === "completed" ? "Nice work. Your coach will see your update." : "Progress saved. Keep going!" };
}
