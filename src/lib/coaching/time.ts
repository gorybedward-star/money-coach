/**
 * Appointment times are entered and shown in the coach's time zone
 * (COACH_TIMEZONE, default America/New_York) and stored in UTC.
 */
export const coachTimeZone = process.env.COACH_TIMEZONE || process.env.NEXT_PUBLIC_COACH_TIMEZONE || "America/New_York";

function tzOffsetMs(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return asUtc - date.getTime();
}

/** "2026-11-05T18:30" in the given zone → ISO UTC string. Returns null if invalid. */
export function localInputToUtc(value: string, timeZone = coachTimeZone): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value.trim());
  if (!m) return null;
  const guess = Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]);
  let utc = guess - tzOffsetMs(new Date(guess), timeZone);
  utc = guess - tzOffsetMs(new Date(utc), timeZone); // correct across DST edges
  const d = new Date(utc);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/** ISO UTC → "2026-11-05T18:30" in the given zone (for datetime-local inputs). */
export function utcToLocalInput(iso: string | null, timeZone = coachTimeZone): string {
  if (!iso) return "";
  const d = new Date(iso);
  const local = new Date(d.getTime() + tzOffsetMs(d, timeZone));
  return local.toISOString().slice(0, 16);
}

export function formatAppointment(iso: string | null, timeZone = coachTimeZone): string {
  if (!iso) return "Not scheduled yet";
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(new Date(iso));
}

/** "2026-11-12" → "Thursday, November 12" (dates are calendar dates, no zone shift). */
export function formatDate(date: string | null): string {
  if (!date) return "No date set";
  const [y, m, d] = date.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", { timeZone: "UTC", weekday: "long", month: "long", day: "numeric" }).format(
    new Date(Date.UTC(y, m - 1, d)),
  );
}

/** Today's calendar date in the coach's zone, as YYYY-MM-DD. */
export function todayInZone(timeZone = coachTimeZone, now = new Date()): string {
  return utcToLocalInput(now.toISOString(), timeZone).slice(0, 10);
}

export function daysBetween(fromDate: string, toDate: string): number {
  const a = Date.parse(`${fromDate}T00:00:00Z`);
  const b = Date.parse(`${toDate}T00:00:00Z`);
  return Math.round((b - a) / 86_400_000);
}

export function formatMoney(n: number | null | undefined): string {
  if (n === null || n === undefined) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}
