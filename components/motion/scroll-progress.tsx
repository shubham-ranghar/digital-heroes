"use client";

import type Lenis from "lenis";
import {
  m,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
} from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { useSmoothScroll } from "@/lib/smooth-scroll-context";

const SPRING = { stiffness: 280, damping: 18, mass: 0.3 };

/** Lenis reports 1 when nothing scrolls; an unscrollable page reads as 0. */
function lenisProgress(lenis: Lenis) {
  return lenis.limit > 0 ? lenis.progress : 0;
}

/**
 * Page scroll progress bar (decorative). Fed by Lenis' scroll event, which
 * fires inside Framer's frame loop (see SmoothScrollProvider), so the bar
 * moves in the same frame as the page. Native `useScroll` is the fallback
 * when Lenis is off (reduced motion), and then the bar follows directly
 * without the spring.
 */
export function ScrollProgress() {
  const pathname = usePathname();
  const { lenis, reduceMotion } = useSmoothScroll();
  const progress = useMotionValue(0);
  const smoothed = useSpring(progress, SPRING);
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    if (!lenis) {
      progress.set(scrollYProgress.get());
      return;
    }
    progress.jump(lenisProgress(lenis));
    return lenis.on("scroll", (instance) => progress.set(lenisProgress(instance)));
  }, [lenis, progress, scrollYProgress]);

  // The marketing layout persists across routes: snap to the new page's
  // position (the provider resets scroll in a layout effect, before this
  // passive effect) instead of springing back from the old one.
  useEffect(() => {
    smoothed.jump(progress.get());
  }, [pathname, progress, smoothed]);

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    if (!lenis) {
      progress.set(value);
    }
  });

  return (
    <m.div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-60 h-0.5 origin-left bg-coral"
      style={{ scaleX: reduceMotion ? progress : smoothed }}
    />
  );
}
