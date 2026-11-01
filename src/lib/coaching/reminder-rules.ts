/**
 * When to send the accountability reminder. Pure function so it can be tested.
 *
 * A reminder is due once per commitment when ALL of these are true:
 *  - the coach approved the commitment at least 12 hours ago (no reminder right after the post-session email)
 *  - the client hasn't reported it completed
 *  - the deadline is today, tomorrow, or the day after, OR the next session is within 48 hours
 *
 * Because it is evaluated against the CURRENT deadline and appointment, a
 * rescheduled session automatically moves the reminder.
 */
export type ReminderInput = {
  approvedAt: string | null;
  status: "not_started" | "in_progress" | "completed" | "needs_review";
  deadline: string | null; // YYYY-MM-DD
  nextSessionAt: string | null; // ISO
  today: string; // YYYY-MM-DD in the coach's zone
  now: Date;
};

export const REMINDER_DAYS_BEFORE_DEADLINE = 2;
export const REMINDER_HOURS_BEFORE_SESSION = 48;

export function isReminderDue(r: ReminderInput): { due: boolean; reason: string } {
  if (!r.approvedAt) return { due: false, reason: "not approved" };
  if (r.status === "completed") return { due: false, reason: "already completed" };
  if (r.now.getTime() - Date.parse(r.approvedAt) < 12 * 3_600_000) return { due: false, reason: "approved under 12 hours ago" };

  if (r.deadline) {
    const days = Math.round((Date.parse(`${r.deadline}T00:00:00Z`) - Date.parse(`${r.today}T00:00:00Z`)) / 86_400_000);
    if (days >= 0 && days <= REMINDER_DAYS_BEFORE_DEADLINE) return { due: true, reason: `deadline in ${days} day(s)` };
  }
  if (r.nextSessionAt) {
    const hours = (Date.parse(r.nextSessionAt) - r.now.getTime()) / 3_600_000;
    if (hours > 0 && hours <= REMINDER_HOURS_BEFORE_SESSION) return { due: true, reason: "next session within 48 hours" };
  }
  return { due: false, reason: "not yet" };
}
