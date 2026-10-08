"use client";

import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, useReducedMotion } from "framer-motion";

import { buttonInteraction } from "@/lib/motion";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-full border bg-clip-padding text-sm font-medium whitespace-nowrap motion-transition-colors motion-transition-transform outline-none select-none disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-status-danger [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-coral text-navy hover:bg-coral-deep",
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

type ButtonProps = ButtonPrimitive.Props & VariantProps<typeof buttonVariants>;

function Button({
  className,
  variant = "default",
  size = "default",
  render,
  nativeButton,
  ...props
}: ButtonProps) {
  const reduceMotion = useReducedMotion();

  const defaultRender = (
    <motion.button
      whileHover={reduceMotion ? undefined : buttonInteraction.hover}
      whileTap={reduceMotion ? undefined : buttonInteraction.tap}
    />
  );

  return (
    <ButtonPrimitive
      data-slot="button"
      nativeButton={nativeButton ?? (render != null ? false : undefined)}
      render={render ?? defaultRender}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
