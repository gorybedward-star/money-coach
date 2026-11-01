// Hash routing for the preview. "/tools/cost-of-waiting#x?service=y" <-> "#tools--cost-of-waiting---x" etc.
export type Route = { path: string; fragment?: string; service?: string };

export function encode(href: string, base: Route): string {
  if (href.startsWith("#")) return toHash({ ...base, fragment: href.slice(1) || undefined });
  const url = new URL(href, "http://x");
  return toHash({ path: url.pathname, fragment: url.hash.slice(1) || undefined, service: url.searchParams.get("service") ?? undefined });
}

function toHash(r: Route) {
  let h = r.path === "/" ? "home" : r.path.replace(/^\/|\/$/g, "").split("/").join("--");
  if (r.service) h += "--service-" + r.service;
  if (r.fragment) h += "---" + r.fragment;
  return "#" + h;
}

export function currentRoute(): Route {
  const raw = decodeURIComponent(location.hash.slice(1));
  if (!raw || raw === "home") return { path: "/" };
  const [p, fragment] = raw.split("---");
  const segs = p.split("--");
  let service: string | undefined;
  if (segs.at(-1)?.startsWith("service-")) service = segs.pop()!.slice(8);
  const path = segs[0] === "home" ? "/" : "/" + segs.join("/");
  return { path, fragment, service };
}

export function subscribe(cb: () => void) {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
}
