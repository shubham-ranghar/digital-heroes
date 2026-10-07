"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { DURATION, EASE_OUT, revealTransition } from "@/lib/motion";
import { cn } from "@/lib/utils";

type RevealProps = {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "article" | "li";
};

export function Reveal({ children, className, as = "div" }: RevealProps) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const Component = motion[as];
  const shouldAnimate = hydrated && !reduceMotion && inView;

  return (
    <Component
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
      transition={
        reduceMotion
          ? { duration: 0.15 }
          : revealTransition
      }
    >
      {children}
    </Component>
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
  const ref = useRef<HTMLElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const Component = motion[as];

  return (
    <Component
      ref={ref}
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
  );
}

type RevealStaggerItemProps = {
  children: ReactNode;
  className?: string;
  as?: "div" | "li";
};

export function RevealStaggerItem({
  children,
  className,
  as = "div",
}: RevealStaggerItemProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  const MotionTag = motion[as];

  return (
    <MotionTag
      className={cn(className)}
      variants={{
        hidden: { opacity: 0, y: 24 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: DURATION.slow, ease: EASE_OUT },
        },
      }}
    >
      {children}
    </MotionTag>
  );
}
