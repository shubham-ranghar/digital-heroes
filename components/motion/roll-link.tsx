"use client";

import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import type { ComponentProps, CSSProperties } from "react";

import { cn } from "@/lib/utils";

type RollTextProps = {
  text: string;
  className?: string;
  /** Per-letter roll delay on hover (default on). */
  stagger?: boolean;
};

function RollTextBlock({
  text,
  staggerIndex,
}: {
  text: string;
  staggerIndex?: number;
}) {
  const trackStyle: CSSProperties | undefined =
    staggerIndex !== undefined
      ? { "--roll-i": staggerIndex } as CSSProperties
      : undefined;

  return (
    <span className="roll-text inline-block overflow-hidden align-bottom leading-[inherit] [height:1lh]">
      <span
        className={cn(
          "roll-text__track block",
          staggerIndex !== undefined && "roll-text__track--stagger",
        )}
        style={trackStyle}
      >
        <span className="roll-text__line block leading-[inherit] [height:1lh]">
          {text}
        </span>
        <span
          className="roll-text__line block leading-[inherit] [height:1lh]"
          aria-hidden="true"
        >
          {text}
        </span>
      </span>
    </span>
  );
}

export function RollText({
  text,
  className,
  stagger = true,
}: RollTextProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <span className={className}>{text}</span>;
  }

  if (!stagger) {
    return (
      <span className={className}>
        <RollTextBlock text={text} />
      </span>
    );
  }

  return (
    <>
      <span className="sr-only">{text}</span>
      <span className={cn("inline whitespace-pre", className)} aria-hidden>
        {Array.from(text).map((char, index) => {
          const display = char === " " ? "\u00a0" : char;
          return (
            <RollTextBlock
              key={index}
              text={display}
              staggerIndex={index}
            />
          );
        })}
      </span>
    </>
  );
}

type RollLinkProps = ComponentProps<typeof Link> & {
  label: string;
  stagger?: boolean;
};

export function RollLink({
  label,
  className,
  stagger = true,
  ...props
}: RollLinkProps) {
  return (
    <Link className={cn("group roll-link", className)} {...props}>
      <RollText text={label} stagger={stagger} />
    </Link>
  );
}
