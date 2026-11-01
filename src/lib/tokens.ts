import { createHash, randomBytes } from "node:crypto";

/** A random, URL-safe onboarding token. Only its hash is ever stored. */
export function newToken() {
  return randomBytes(32).toString("base64url");
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export const INVITE_DAYS = 14;
