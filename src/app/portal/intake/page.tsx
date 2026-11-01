import { requireClient } from "@/lib/auth";
import type { Intake } from "@/lib/coaching/types";
import { IntakeForm } from "./intake-form";

export default async function IntakePage() {
  const { supabase, client } = await requireClient();
  const { data } = await supabase.from("intakes").select("*").eq("client_id", client.id).maybeSingle();
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-600">Confidential</p>
      <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{data ? "My intake" : "Your Money Coach intake"}</h1>
      <p className="mt-3 text-slate-600">
        This helps us make our first session about you. There are no right or wrong answers, and estimates are perfectly fine.
        Only your coach can see what you share.
      </p>
      <IntakeForm intake={data as Intake | null} client={{ phone: client.phone, preferred_contact: client.preferred_contact }} />
    </div>
  );
}
