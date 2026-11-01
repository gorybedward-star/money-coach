import { requireCoach } from "@/lib/auth";
import { coachTimeZone } from "@/lib/coaching/time";
import { PageHeader } from "@/components/app/app-shell";
import { EnrollForm } from "./enroll-form";

export default async function NewClientPage() {
  await requireCoach();
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <PageHeader eyebrow="The 7-Week Money Reset" title="Enroll a client">
        Creates their private account, assigns Week 1, and sends the welcome email with a secure intake link.
      </PageHeader>
      <EnrollForm timeZone={coachTimeZone} />
    </div>
  );
}
