"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

import { cn } from "@/lib/utils";

type MarqueeProps = {
  /** One set of items; rendered `copies` times side by side. */
  children: ReactNode;
  /** Total sets on the track. Every set after the first must cover the viewport. */
  copies: number;
  /** Seconds for one set to drift its own width. */
  durationSec: number;
  /** Space between items, also applied after each set so the seam matches. */
  gapClassName?: string;
  className?: string;
};

/**
 * Ambient right-to-left loop. Each set animates `translate3d(-100%)` of its own
 * width (globals.css `.marquee-copy`), so when one cycle ends the next set sits
 * exactly where the first began — no jump. It's a CSS animation, so it runs on
 * the compositor and never waits on Lenis, React or the main thread.
 *
 * Paused until on screen: the observer writes `data-running` straight to the
 * DOM (no React render). Hover, keyboard focus and a touch press also pause it
 * so a link can be hit. Only the first set is interactive; the rest are inert
 * duplicates hidden from assistive tech. No touch handlers, so a vertical drag
 * over the track scrolls the page natively.
 */
export function Marquee({
  children,
  copies,
  durationSec,
  gapClassName = "gap-4 pr-4",
  className,
}: MarqueeProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) {
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      node.toggleAttribute("data-running", entry.isIntersecting);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "marquee overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)]",
        className,
      )}
      style={{ "--marquee-duration": `${durationSec}s` } as CSSProperties}
    >
      <div className="flex h-full w-max">
        {Array.from({ length: copies }, (_, index) => (
          <ul
            key={index}
            className={cn("marquee-copy flex h-full shrink-0", gapClassName)}
            aria-hidden={index > 0 || undefined}
            inert={index > 0 || undefined}
          >
            {children}
          </ul>
        ))}
      </div>
    </div>
  );
}
