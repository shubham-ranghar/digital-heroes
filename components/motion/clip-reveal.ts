"use client";

import { useInView, useReducedMotion, type Transition } from "framer-motion";
import { useLayoutEffect, useState, type RefObject } from "react";

import { useClientMounted } from "@/hooks/use-client-mounted";
import { REVEAL } from "@/lib/motion";

export const CLIP_OPEN = "inset(0% 0% 0% 0%)";
/** Wipe origin: `right` reveals left→right (images), `bottom` top→down (headings). */
const CLIP_CLOSED = {
  right: "inset(0% 100% 0% 0%)",
  bottom: "inset(0% 0% 100% 0%)",
} as const;

export type RevealGate = {
  reduceMotion: boolean;
  /** Start hidden: true only for client-side mounts (nothing painted yet). */
  startHidden: boolean;
  /** Target state right now; flips to true once the element is in view. */
  visible: boolean;
};

/**
 * Shared "when may this enter?" rule for scroll reveals (`Reveal`,
 * `RevealStagger`, `useClipReveal`). Never hides painted content:
 * - Server HTML renders visible, so content shows without JS.
 * - On hydration, only elements below the viewport are hidden, in a layout
 *   effect (before paint, while offscreen); anything on screen stays put.
 * - After client navigation nothing has painted yet, so it starts hidden and
 *   enters as soon as the observer reports it in view.
 * Hiding is always instant; the only animated direction is in.
 */
export function useRevealGate(
  ref: RefObject<Element | null>,
  margin: `${number}% 0px` = "-10% 0px",
): RevealGate {
  const reduceMotion = Boolean(useReducedMotion());
  const inView = useInView(ref, { once: true, margin });
  const hydrated = useClientMounted();
  // False during hydration (server snapshot), true for client-side mounts.
  const [clientMount] = useState(hydrated);
  const [armed, setArmed] = useState(clientMount);

  useLayoutEffect(() => {
    if (clientMount || reduceMotion) {
      return;
    }
    const node = ref.current;
    if (node && node.getBoundingClientRect().top >= window.innerHeight) {
      setArmed(true);
    }
  }, [clientMount, reduceMotion, ref]);

  if (reduceMotion) {
    return { reduceMotion, startHidden: false, visible: true };
  }
  return {
    reduceMotion,
    startHidden: clientMount,
    visible: !armed || inView,
  };
}

type ClipRevealOptions = {
  from: keyof typeof CLIP_CLOSED;
  duration?: number;
};

/** Clip-path wipe on scroll entry; degrades open (see `useRevealGate`). */
export function useClipReveal(
  ref: RefObject<Element | null>,
  { from, duration = REVEAL.duration }: ClipRevealOptions,
) {
  const { reduceMotion, startHidden, visible } = useRevealGate(ref, "-8% 0px");

  if (reduceMotion) {
    return { initial: false as const, animate: { clipPath: CLIP_OPEN } };
  }

  const closed = CLIP_CLOSED[from];
  const transition: Transition = visible
    ? { duration, ease: REVEAL.ease }
    : { duration: 0 };

  return {
    initial: startHidden ? { clipPath: closed } : (false as const),
    animate: { clipPath: visible ? CLIP_OPEN : closed },
    transition,
  };
}
