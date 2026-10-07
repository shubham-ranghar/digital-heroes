"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef, type ReactNode } from "react";

import { useClientMounted } from "@/hooks/use-client-mounted";
import { DURATION, EASE_OUT, revealTransition } from "@/lib/motion";
import { cn } from "@/lib/utils";

type RevealProps = {
  children: ReactNode;
  className?: string;
};

export function Reveal({ children, className }: RevealProps) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const hydrated = useClientMounted();

  const shouldAnimate = hydrated && !reduceMotion && inView;

  return (
    <motion.div
      ref={ref}
      className={cn(className)}
      initial={false}
      animate={
        reduceMotion
          ? { opacity: 1, y: 0 }
          : shouldAnimate
            ? { opacity: 1, y: 0 }
            : hydrated && !inView
              ? { opacity: 0, y: 24 }
              : { opacity: 1, y: 0 }
      }
      transition={reduceMotion ? { duration: DURATION.fast } : revealTransition}
    >
      {children}
    </motion.div>
  );
}

type RevealStaggerProps = {
  children: ReactNode;
  className?: string;
  stagger?: number;
  as?: "ul" | "ol" | "div";
};

export function RevealStagger({
  children,
  className,
  stagger = 0.08,
  as = "div",
}: RevealStaggerProps) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const hydrated = useClientMounted();

  const Component = motion[as];

  return (
    <div ref={ref}>
      <Component
        className={cn(className)}
        initial={false}
        animate={
          reduceMotion || !hydrated
            ? "visible"
            : inView
              ? "visible"
              : "hidden"
        }
        variants={{
          hidden: {},
          visible: {
            transition: { staggerChildren: stagger, delayChildren: 0 },
          },
        }}
      >
        {children}
      </Component>
    </div>
  );
}

type RevealStaggerItemProps = {
  children: ReactNode;
  className?: string;
  as?: "div" | "li";
  offsetY?: number;
};

export function RevealStaggerItem({
  children,
  className,
  as = "div",
  offsetY = 24,
}: RevealStaggerItemProps) {
  const reduceMotion = useReducedMotion();
  const MotionTag = motion[as];

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
              hidden: { opacity: 0, y: offsetY },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: DURATION.slow, ease: EASE_OUT },
              },
            }
      }
    >
      {children}
    </MotionTag>
  );
}
