export function passwordProblem(password: string, confirm: string): string | null {
  if (password.length < 10) return "Use at least 10 characters.";
  if (password.length > 72) return "Use 72 characters or fewer.";
  if (password !== confirm) return "The two passwords don't match.";
  return null;
}

export function str(formData: FormData, key: string, max = 2000): string {
  return String(formData.get(key) ?? "").trim().slice(0, max);
}

export function optStr(formData: FormData, key: string, max = 2000): string | null {
  const v = str(formData, key, max);
  return v ? v : null;
}

/** Parses an optional dollar/percent amount like "$1,200". Returns undefined when invalid. */
export function optNumber(formData: FormData, key: string, { min = 0, max = 100_000_000 } = {}): number | null | undefined {
  const raw = str(formData, key, 40).replace(/[$,%\s]/g, "");
  if (!raw) return null;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < min || n > max) return undefined;
  return Math.round(n * 100) / 100;
}

export const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) && s.length <= 254;

export const isIsoDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(`${s}T00:00:00Z`));
