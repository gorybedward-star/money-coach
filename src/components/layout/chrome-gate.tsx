"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Paths that use the calm app layout instead of the marketing header and footer. */
const APP_PREFIXES = ["/toolkit", "/coach", "/portal", "/login", "/onboard", "/forgot-password", "/reset-password"];

export function isAppPath(pathname: string | null) {
  return !!pathname && APP_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/** Hides the public site's header/footer inside the coach and client areas. */
export function ChromeGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return isAppPath(pathname) ? null : <>{children}</>;
}
