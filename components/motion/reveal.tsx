"use client";

import { m, useReducedMotion } from "framer-motion";
import {
  Children,
  cloneElement,
  isValidElement,
  useRef,
  type ReactElement,
  type ReactNode,
} from "react";

import { useClipReveal, useRevealGate } from "@/components/motion/clip-reveal";
import { DURATION, EASE_OUT, REVEAL, revealTransition } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * `inView` (default): scroll reveal, gated by `useRevealGate` (enters on
 * client navigation, never re-hides content already painted on first load).
 * `mount`: plays once on mount, for app surfaces where content is already on
 * screen.
 */
export type RevealTrigger = "inView" | "mount";

/**
 * App-surface timing: DURATION.base, opacity only, so it reads as content
 * settling under the route wipe (`RouteWipe`) rather than a second transition.
 */
const FAST_TRANSITION = { duration: DURATION.base, ease: EASE_OUT };
const MARKETING_OFFSET_Y = REVEAL.rise;

function offsetFor(fast: boolean) {
  return fast ? 0 : MARKETING_OFFSET_Y;
}

type RevealProps = {
  children: ReactNode;
  className?: string;
  trigger?: RevealTrigger;
  fast?: boolean;
  /**
   * `clip`: section-heading wipe (top→down) on scroll entry instead of a fade.
   * Uses the same in-view observer; `fast` shortens it to DURATION.base.
   */
  effect?: "fade" | "clip";
};

export function Reveal({
  children,
  className,
  trigger = "inView",
  fast = false,
  effect = "fade",
}: RevealProps) {
  if (effect === "clip") {
    return (
      <ClipReveal className={className} fast={fast}>
        {children}
      </ClipReveal>
    );
  }
  return (
    <FadeReveal className={className} trigger={trigger} fast={fast}>
      {children}
    </FadeReveal>
  );
}

function ClipReveal({
  children,
  className,
  fast,
}: {
  children: ReactNode;
  className?: string;
  fast: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const clip = useClipReveal(ref, {
    from: "bottom",
    duration: fast ? DURATION.base : REVEAL.duration,
  });
  return (
    <m.div ref={ref} className={cn(className)} {...clip}>
      {children}
    </m.div>
  );
}

function FadeReveal({
  children,
  className,
  trigger,
  fast,
}: Omit<RevealProps, "effect"> & { trigger: RevealTrigger; fast: boolean }) {
  if (trigger === "mount") {
    return (
      <MountFade className={className} fast={fast}>
        {children}
      </MountFade>
    );
  }
  return (
    <InViewFade className={className} fast={fast}>
      {children}
    </InViewFade>
  );
}

function MountFade({
  children,
  className,
  fast,
}: {
  children: ReactNode;
  className?: string;
  fast: boolean;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <m.div
      className={cn(className)}
      initial={
        reduceMotion ? { opacity: 0 } : { opacity: 0, y: offsetFor(fast) }
      }
      animate={{ opacity: 1, y: 0 }}
      transition={
        reduceMotion
          ? { duration: DURATION.instant }
          : fast
            ? FAST_TRANSITION
            : revealTransition
      }
    >
      {children}
    </m.div>
  );
}

function InViewFade({
  children,
  className,
  fast,
}: {
  children: ReactNode;
  className?: string;
  fast: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { startHidden, visible } = useRevealGate(ref);
  const hidden = { opacity: 0, y: offsetFor(fast) };

  return (
    <m.div
      ref={ref}
      className={cn(className)}
      initial={startHidden ? hidden : false}
      animate={visible ? { opacity: 1, y: 0 } : hidden}
      transition={
        !visible
          ? { duration: 0 }
          : fast
            ? FAST_TRANSITION
            : revealTransition
      }
    >
      {children}
    </m.div>
  );
}

type RevealStaggerProps = {
  children: ReactNode;
  className?: string;
  /** Seconds between siblings (default 60ms). */
  stagger?: number;
  as?: "ul" | "ol" | "div";
  trigger?: RevealTrigger;
};

/**
 * Children reveal in a chain, `stagger` apart, capped at five links: the
 * sixth item onward lands with the fifth, so long lists never trail off.
 * Each `RevealStaggerItem` child is handed its own delay.
 */
export function RevealStagger({
  children,
  className,
  stagger = REVEAL.stagger,
  as = "div",
  trigger = "inView",
}: RevealStaggerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { startHidden, visible } = useRevealGate(ref);

  const Component = m[as];
  const variants = { hidden: {}, visible: {} };
  const items = Children.toArray(children);
  const isItem = (child: ReactNode): child is ReactElement<RevealStaggerItemProps> =>
    isValidElement(child) && child.type === RevealStaggerItem;
  const step = Math.min(stagger, REVEAL.stagger);
  const chained = items.map((child, index) => {
    if (!isItem(child)) {
      return child;
    }
    const link = items.slice(0, index).filter(isItem).length;
    return cloneElement(child, {
      revealDelaySec: Math.min(link, REVEAL.maxChain - 1) * step,
    });
  });

  if (trigger === "mount") {
    return (
      <Component
        className={cn(className)}
        initial="hidden"
        animate="visible"
        variants={variants}
      >
        {chained}
      </Component>
    );
  }

  return (
    <div ref={ref}>
      <Component
        className={cn(className)}
        initial={startHidden ? "hidden" : false}
        animate={visible ? "visible" : "hidden"}
        variants={variants}
      >
        {chained}
      </Component>
    </div>
  );
}

type RevealStaggerItemProps = {
  children: ReactNode;
  className?: string;
  as?: "div" | "li";
  offsetY?: number;
  fast?: boolean;
  /** Set by `RevealStagger`: this item's place in the chain. */
  revealDelaySec?: number;
};

export function RevealStaggerItem({
  children,
  className,
  as = "div",
  offsetY,
  fast = false,
  revealDelaySec = 0,
}: RevealStaggerItemProps) {
  const reduceMotion = useReducedMotion();
  const MotionTag = m[as];

  return (
    <MotionTag
      className={cn(className)}
      variants={
        reduceMotion
          ? {
              hidden: { opacity: 1, y: 0 },
              visible: { opacity: 1, y: 0 },
            }
          : {
              hidden: {
                opacity: 0,
                y: offsetY ?? offsetFor(fast),
                // Hiding only happens offscreen (see useRevealGate): no tween.
                transition: { duration: 0 },
              },
              visible: {
                opacity: 1,
                y: 0,
                transition: {
                  ...(fast ? FAST_TRANSITION : revealTransition),
                  delay: revealDelaySec,
                },
              },
            }
      }
    >
      {children}
    </MotionTag>
  );
}
