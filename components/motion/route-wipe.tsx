"use client";

import { useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import {
  COLUMN_COUNT,
  ROUTE_WIPE,
  WIPE_TRANSFORM,
  columnTiming,
  type WipeState,
} from "@/components/motion/column-wipe";
import { useMenuOpen } from "@/components/providers/menu-open-context";
import { EASE_IN_OUT } from "@/lib/motion";

type Inset = { top: number; right: number; bottom: number; left: number };

type Wipe = {
  key: number;
  /** Where the columns start: `above` for a click, `cover` for back/forward. */
  from: WipeState;
  inset: Inset;
  /** Covered, but the route hasn't committed yet: show the hold indicator. */
  holding: boolean;
};

/**
 * `covering`: columns dropping. `holding`: down, waiting on the router.
 * `revealing`: lift scheduled or running.
 */
type Phase = "idle" | "covering" | "holding" | "revealing";

/** `EASE_IN_OUT` (a bezier array) as CSS, for WAAPI. */
const EASING = `cubic-bezier(${String(EASE_IN_OUT)})`;

/** From click until the last column is down. */
const COVER_MS =
  (ROUTE_WIPE.cover.duration +
    (COLUMN_COUNT - 1) * ROUTE_WIPE.cover.stagger) *
  1000;

/** Lift the cover anyway if a covered navigation never commits. */
const HOLD_LIMIT_MS = 8000;

/** Menu links: the menu's own close is the transition, so skip ours. */
const MENU_NAV_WINDOW_MS = 3000;

/**
 * The innermost `[data-route-content]` region: `<main>` on marketing/auth
 * pages, the content pane inside the member/admin shells (and their loading
 * shells). The overlay covers only that, so the header and app sidebars stay
 * put.
 */
function routeContent(): HTMLElement | null {
  const regions = document.querySelectorAll<HTMLElement>("[data-route-content]");
  return regions[regions.length - 1] ?? null;
}

function measureInset(): Inset {
  const rect = routeContent()?.getBoundingClientRect();
  if (!rect) {
    return { top: 0, right: 0, bottom: 0, left: 0 };
  }
  const width = document.documentElement.clientWidth;
  return {
    top: Math.max(0, rect.top),
    right: Math.max(0, width - rect.right),
    bottom: 0,
    left: Math.max(0, rect.left),
  };
}

/**
 * A plain left-click on a same-origin link to another page that `<Link>` has
 * taken over (it calls `preventDefault` and starts a client navigation). Read
 * in the bubble phase on `window`, after React's root listener on `document`
 * has run the link's handler, so links the browser navigates natively
 * (downloads, route handlers, plain anchors) never put the cover up.
 */
function clientNavLink(event: MouseEvent): HTMLAnchorElement | null {
  if (
    !event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return null;
  }
  const anchor = (event.target as Element | null)?.closest?.<HTMLAnchorElement>(
    "a[href]",
  );
  if (
    !anchor ||
    (anchor.target && anchor.target !== "_self") ||
    anchor.hasAttribute("download")
  ) {
    return null;
  }
  const url = new URL(anchor.href, window.location.href);
  if (
    url.origin !== window.location.origin ||
    url.pathname === window.location.pathname
  ) {
    return null;
  }
  return anchor;
}

/**
 * The site's single route transition: the menu's column wipe (same columns,
 * curve and stagger as `ColumnWipe`), shortened to 0.28s cover + 0.28s
 * reveal. The navigation starts on click, in parallel with the cover, and the
 * two never interrupt each other:
 *
 * - a commit that lands mid-cover schedules the reveal for the moment the
 *   cover completes (a WAAPI delay, so it starts on time even if the new
 *   route is busy mounting on the main thread);
 * - a cover that completes first holds (indicator after a beat) until the
 *   route commits. Every app route has a loading boundary, so the commit is
 *   the prefetched shell, not the finished page, and content streams in
 *   after the reveal;
 * - a commit that lands mid-reveal lets the reveal run on.
 *
 * Back/forward and programmatic navigations play the reveal alone. Columns
 * animate `transform` with WAAPI, on the compositor. Mounted once at the
 * root, outside the page tree: no wrapper, no transform or overflow on any
 * scroll ancestor, so sticky sections are untouched. The overlay never takes
 * pointer events.
 */
export function RouteWipe() {
  const pathname = usePathname();
  const reduceMotion = Boolean(useReducedMotion());
  const { menuOpen } = useMenuOpen();
  const [wipe, setWipe] = useState<Wipe | null>(null);

  const phase = useRef<Phase>("idle");
  /** Click → commit raced the cover; reveal as soon as the cover is down. */
  const coverDoneAt = useRef(0);
  const columns = useRef<(HTMLDivElement | null)[]>([]);
  const animations = useRef<Animation[]>([]);
  /** Bumped per tween; a superseded tween's completion is ignored. */
  const tween = useRef(0);
  const startedKey = useRef(0);
  const menuNavUntil = useRef(0);
  const holdTimer = useRef<number | undefined>(undefined);
  const lastPathname = useRef(pathname);
  const nextKey = useRef(0);
  const latest = useRef({ reduceMotion, menuOpen });

  useEffect(() => {
    latest.current = { reduceMotion, menuOpen };
  }, [reduceMotion, menuOpen]);

  /**
   * Tween every column to `to`. `from: "current"` picks up wherever the
   * columns are (reversing mid-flight); `delay` (ms) holds the start on the
   * compositor. Covers fill backwards too, so a staggered column holds its
   * start position; reveals don't, so a reveal scheduled behind a running
   * cover leaves it alone until its turn.
   */
  const tweenColumns = useCallback(
    (
      to: WipeState,
      from: WipeState | "current",
      onDone: () => void,
      delay = 0,
    ) => {
      const id = ++tween.current;
      const elements = columns.current.filter(
        (element): element is HTMLDivElement => element !== null,
      );
      const fromFrames = elements.map((element) =>
        from === "current"
          ? getComputedStyle(element).transform
          : WIPE_TRANSFORM[from],
      );
      if (from === "current") {
        animations.current.forEach((animation) => animation.cancel());
        animations.current = [];
      }
      const started = elements.map((element, index) => {
        const timing = columnTiming(ROUTE_WIPE, to, index);
        return element.animate(
          [{ transform: fromFrames[index] }, { transform: WIPE_TRANSFORM[to] }],
          {
            duration: timing.duration * 1000,
            delay: delay + timing.delay * 1000,
            easing: EASING,
            fill: to === "cover" ? "both" : "forwards",
          },
        );
      });
      animations.current.push(...started);
      Promise.all(started.map((animation) => animation.finished)).then(
        () => {
          if (tween.current === id) {
            onDone();
          }
        },
        () => {},
      );
    },
    [],
  );

  const finish = useCallback(() => {
    animations.current = [];
    phase.current = "idle";
    setWipe(null);
  }, []);

  const reveal = useCallback(
    (delay = 0) => {
      window.clearTimeout(holdTimer.current);
      phase.current = "revealing";
      tweenColumns("above", "cover", finish, delay);
    },
    [finish, tweenColumns],
  );

  const onCovered = useCallback(() => {
    phase.current = "holding";
    setWipe((current) => current && { ...current, holding: true });
  }, []);

  const cover = useCallback(
    (from: WipeState | "current") => {
      phase.current = "covering";
      coverDoneAt.current = performance.now() + COVER_MS;
      tweenColumns("cover", from, onCovered);
    },
    [onCovered, tweenColumns],
  );

  // A new wipe's columns are in the DOM: start its first tween.
  useLayoutEffect(() => {
    if (!wipe || startedKey.current === wipe.key) {
      return;
    }
    startedKey.current = wipe.key;
    if (wipe.from === "above") {
      cover("above");
    } else {
      reveal();
    }
  }, [wipe, cover, reveal]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const anchor = clientNavLink(event);
      if (!anchor) {
        return;
      }
      if (latest.current.menuOpen || anchor.closest("#site-menu")) {
        menuNavUntil.current = performance.now() + MENU_NAV_WINDOW_MS;
        return;
      }
      if (latest.current.reduceMotion) {
        return;
      }

      if (phase.current === "idle") {
        // `cover` runs from the layout effect once the columns mount.
        phase.current = "covering";
        setWipe({
          key: ++nextKey.current,
          from: "above",
          inset: measureInset(),
          holding: false,
        });
      } else if (phase.current === "revealing") {
        // Clicked on the way out: drop the columns back from where they are.
        cover("current");
      } else {
        // Already covering or holding: the newest navigation is the one that
        // will commit, and its commit lifts the cover.
        return;
      }

      window.clearTimeout(holdTimer.current);
      holdTimer.current = window.setTimeout(() => {
        if (phase.current === "holding") {
          setWipe((current) => current && { ...current, holding: false });
          reveal();
        }
      }, HOLD_LIMIT_MS);
    };

    window.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("click", onClick);
      window.clearTimeout(holdTimer.current);
    };
  }, [cover, reveal]);

  // Layout effect: the new route's first paint is already covered (or already
  // fading), never a flash of the uncovered page. Runs after the scroll
  // provider's reset (an earlier sibling), so the route is at the top.
  useLayoutEffect(() => {
    if (pathname === lastPathname.current) {
      return;
    }
    lastPathname.current = pathname;

    if (performance.now() < menuNavUntil.current) {
      menuNavUntil.current = 0;
      return;
    }

    if (latest.current.reduceMotion) {
      routeContent()?.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: 150,
        easing: "ease-out",
      });
      return;
    }

    // Re-fit to the new route's content area (e.g. into the member shell: its
    // sidebar shows at once and only the content pane is revealed). The
    // overlay is `contain: strict`, so this never lays out the page.
    const inset = measureInset();
    switch (phase.current) {
      case "covering":
        setWipe((current) => current && { ...current, inset });
        reveal(Math.max(0, coverDoneAt.current - performance.now()));
        return;
      case "holding":
        setWipe((current) => current && { ...current, inset, holding: false });
        reveal();
        return;
      case "revealing":
        return;
      case "idle":
        // Back/forward or programmatic navigation: reveal from fully covered
        // (the layout effect above starts it before paint).
        phase.current = "revealing";
        setWipe({
          key: ++nextKey.current,
          from: "cover",
          inset,
          holding: false,
        });
    }
  }, [pathname, reveal]);

  if (!wipe) {
    return null;
  }

  return (
    <div
      data-route-wipe=""
      data-holding={wipe.holding ? "" : undefined}
      className="pointer-events-none fixed z-35 overflow-hidden contain-strict"
      style={wipe.inset}
      aria-hidden
    >
      <div key={wipe.key} className="absolute inset-0 flex">
        {Array.from({ length: COLUMN_COUNT }, (_, index) => (
          <div
            key={index}
            ref={(element) => {
              columns.current[index] = element;
            }}
            className="h-full flex-1 bg-cream will-change-transform"
            style={{ transform: WIPE_TRANSFORM[wipe.from] }}
          />
        ))}
      </div>
      {wipe.holding ? <div className="route-wipe-hold" /> : null}
    </div>
  );
}
