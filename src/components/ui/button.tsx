import * as React from "react";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// shadcn/ui-style button, extended with brand variants.
export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-emerald text-white shadow-soft hover:bg-emerald-700 hover:-translate-y-0.5 hover:shadow-lift",
        gold: "bg-gold text-navy shadow-soft hover:bg-[#d4b273] hover:-translate-y-0.5 hover:shadow-lift",
        navy: "bg-navy text-ivory hover:bg-navy-800 hover:-translate-y-0.5",
        outline:
          "border-2 border-navy/15 bg-transparent text-navy hover:border-navy/40 hover:bg-white",
        outlineLight:
          "border-2 border-ivory/30 bg-transparent text-ivory hover:border-ivory/70 hover:bg-white/5",
        ghost: "text-navy hover:bg-navy/5",
        link: "text-emerald underline-offset-4 hover:underline px-0 h-auto",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-6 text-[0.95rem]",
        lg: "h-13 px-7 text-base sm:h-14 sm:px-8",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

type ButtonLinkProps = React.ComponentProps<typeof Link> & VariantProps<typeof buttonVariants>;

export function ButtonLink({ className, variant, size, ...props }: ButtonLinkProps) {
  return <Link className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
