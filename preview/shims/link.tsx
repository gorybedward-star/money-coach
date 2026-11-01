import * as React from "react";
// Preview shim: plain anchor; a global click handler in the entry turns "/path" hrefs into hash routes.
type Props = React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string | { pathname?: string }; prefetch?: boolean; replace?: boolean; scroll?: boolean };
const Link = React.forwardRef<HTMLAnchorElement, Props>(function Link({ href, prefetch: _p, replace: _r, scroll: _s, ...rest }, ref) {
  void _p; void _r; void _s;
  const h = typeof href === "string" ? href : href.pathname ?? "/";
  return <a ref={ref} href={h} {...rest} />;
});
export default Link;
