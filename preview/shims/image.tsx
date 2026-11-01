/* eslint-disable @next/next/no-img-element */
import type { ImgHTMLAttributes } from "react";
export default function Image({ priority: _p, fill: _f, alt, ...rest }: ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean; fill?: boolean; alt: string }) {
  void _p; void _f;
  return <img alt={alt} {...rest} />;
}
