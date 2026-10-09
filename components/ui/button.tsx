"use client";

import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  // Disabled is a neutral muted surface, never a faded brand colour. A busy
  // (loading) button keeps its own colours so "Saving…" still reads as the
  // action in flight.
  "group/button relative inline-flex shrink-0 items-center justify-center rounded-full border bg-clip-padding text-sm font-medium whitespace-nowrap motion-interactive motion-press outline-none select-none disabled:pointer-events-none data-disabled:pointer-events-none disabled:not-aria-busy:border-transparent disabled:not-aria-busy:bg-muted disabled:not-aria-busy:text-muted-foreground disabled:not-aria-busy:shadow-none data-disabled:not-aria-busy:border-transparent data-disabled:not-aria-busy:bg-muted data-disabled:not-aria-busy:text-muted-foreground data-disabled:not-aria-busy:shadow-none aria-busy:cursor-progress aria-busy:opacity-75 aria-invalid:border-status-danger [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-coral text-navy shadow-[0_1px_0_rgba(20,33,61,0.08),inset_0_1px_0_rgba(255,255,255,0.18)] hover:bg-coral-deep hover:shadow-[0_8px_20px_-8px_rgba(217,68,31,0.55)]",
        outline:
          "border-navy bg-transparent text-navy hover:bg-navy/5",
        secondary:
          "border-navy bg-transparent text-navy hover:bg-sand/80 in-[.section-navy]:border-cream/50 in-[.section-navy]:text-cream in-[.section-navy]:hover:border-cream in-[.section-navy]:hover:bg-cream/10 in-[.section-cream]:border-navy in-[.section-cream]:text-navy",
        ghost:
          "border-transparent bg-transparent text-foreground hover:bg-foreground/5",
        destructive:
          "border-transparent bg-status-danger/12 text-status-danger hover:bg-status-danger/20",
        link: "border-transparent text-navy underline-offset-4 hover:underline in-[.section-navy]:text-cream",
      },
      size: {
        default: "h-11 min-h-11 gap-2 px-5",
        xs: "h-7 min-h-7 gap-1 px-3 text-xs",
        sm: "h-10 min-h-10 gap-1.5 px-4 text-[0.8125rem] sm:min-h-10",
        lg: "h-11 min-h-11 gap-2 px-6 text-base",
        icon: "size-11 min-h-11 min-w-11",
        "icon-xs": "size-7 min-h-7 min-w-7",
        "icon-sm": "size-10 min-h-10 min-w-10 sm:size-11 sm:min-h-11 sm:min-w-11",
        "icon-lg": "size-11 min-h-11 min-w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

type ButtonProps = ButtonPrimitive.Props &
  VariantProps<typeof buttonVariants> & {
    /** Shows a spinner, sets aria-busy, and disables the button. */
    loading?: boolean;
  };

function Button({
  className,
  variant = "default",
  size = "default",
  render,
  nativeButton,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="button"
      nativeButton={nativeButton ?? (render != null ? false : undefined)}
      render={render}
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden />
      ) : null}
      {children}
    </ButtonPrimitive>
  );
}

export { Button, buttonVariants };
