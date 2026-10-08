"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";

import { ColumnWipe, MENU_WIPE } from "@/components/motion/column-wipe";
import { INTRO_FAILSAFE_MS, INTRO_PATH } from "@/lib/intro";

// Decided once per document by `INTRO_SCRIPT`, then cleared when it finishes.
let plays: boolean | undefined;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getPlays(): boolean {
  // The CSS failsafe clock starts no earlier than the script, so a frame of
  // margin means we never take over a cover that has started fading.
  const coveredAt = window.__dhIntro;
  plays ??=
    coveredAt !== undefined &&
    performance.now() - coveredAt < INTRO_FAILSAFE_MS - 50;
  return plays;
}

/** Server and hydration: undecided, so the markup matches either outcome. */
function getServerPlays(): boolean | null {
  return null;
}

function finish() {
  plays = false;
  document.documentElement.removeAttribute("data-intro");
  listeners.forEach((listener) => listener());
}

type IntroWipeProps = {
  /** True while the intro covers the page (Lenis is held for that span). */
  onPlayingChange: (playing: boolean) => void;
};

/**
 * First-load intro: the menu's close, played over a page that starts covered.
 * The cover is in the server HTML, shown or hidden by the `<head>` script
 * before first paint; on hydration the columns lift (0.74s) in step with the
 * hero entrance. Mounted once at the root, so client navigations never replay
 * it. Fixed and transform-only: no wrapper around the page, no pointer events.
 */
export function IntroWipe({ onPlayingChange }: IntroWipeProps) {
  const pathname = usePathname();
  const [entryPath] = useState(pathname);
  const decided = useSyncExternalStore(subscribe, getPlays, getServerPlays);
  const playing = decided === true;

  useEffect(() => {
    if (!playing) {
      return;
    }
    // Dev Strict Mode resets <html> attributes on remount; keep ours while live.
    document.documentElement.setAttribute("data-intro", "play");
    onPlayingChange(true);
    return () => onPlayingChange(false);
  }, [playing, onPlayingChange]);

  if (entryPath !== INTRO_PATH || decided === false) {
    return null;
  }

  return (
    <div
      className="intro-wipe pointer-events-none fixed inset-0 z-[100]"
      data-live={playing ? "" : undefined}
      style={{
        animation: playing
          ? "none"
          : `intro-wipe-failsafe 250ms ease-out ${INTRO_FAILSAFE_MS}ms forwards`,
      }}
      aria-hidden
    >
      <ColumnWipe
        timing={MENU_WIPE}
        initial="cover"
        animate={playing ? "above" : "cover"}
        onComplete={(state) => {
          if (state === "above") {
            finish();
          }
        }}
      />
    </div>
  );
}
