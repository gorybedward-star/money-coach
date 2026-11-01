import { useSyncExternalStore } from "react";
import { currentRoute, subscribe } from "../router";
export function usePathname() {
  return useSyncExternalStore(subscribe, () => currentRoute().path, () => "/");
}
export class NotFoundError extends Error {}
export function notFound(): never {
  throw new NotFoundError("not found");
}
export function useRouter() {
  return { push: (h: string) => (location.hash = h) };
}
