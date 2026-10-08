"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export type SectionTone = "cream" | "navy";

const TONE_SELECTOR = "[data-tone]";

/** Routes whose first section is navy; every other nav route opens on cream. */
const NAVY_FIRST_ROUTES = [
  /^\/$/,
  /^\/charities\/[^/]+\/?$/,
  /^\/(login|signup|forgot-password|reset-password|subscribe)(\/|$)/,
];

/**
 * Tone of the first section on a route. Used for SSR and the first client
 * render so the nav paints correctly before the observer reports.
 */
export function getInitialSectionTone(pathname: string): SectionTone {
  return NAVY_FIRST_ROUTES.some((route) => route.test(pathname))
    ? "navy"
    : "cream";
}

function readNavHeight() {
  const value = getComputedStyle(document.documentElement).getPropertyValue(
    "--header-height",
  );
  return Number.parseFloat(value) || 72;
}

function toTone(node: HTMLElement): SectionTone {
  return node.dataset.tone === "navy" ? "navy" : "cream";
}

/**
 * Tone of the `[data-tone]` section crossing the line just beneath the nav.
 * When several match (nested sections, or a curtain sliding over a pinned
 * one), the one latest in document order wins because it paints on top.
 */
export function useSectionTone({ enabled = true }: { enabled?: boolean } = {}) {
  const pathname = usePathname();
  const initialTone = getInitialSectionTone(pathname);
  const [observed, setObserved] = useState<{
    pathname: string;
    tone: SectionTone;
  } | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const crossing = new Set<HTMLElement>();
    let observer: IntersectionObserver | null = null;
    let scanFrame = 0;

    const report = () => {
      let topmost: HTMLElement | null = null;
      for (const node of crossing) {
        if (!node.isConnected) {
          crossing.delete(node);
          continue;
        }
        if (
          !topmost ||
          topmost.compareDocumentPosition(node) &
            Node.DOCUMENT_POSITION_FOLLOWING
        ) {
          topmost = node;
        }
      }
      if (topmost) {
        const tone = toTone(topmost);
        setObserved((prev) =>
          prev?.pathname === pathname && prev.tone === tone
            ? prev
            : { pathname, tone },
        );
      }
    };

    const observeAll = () => {
      document
        .querySelectorAll<HTMLElement>(TONE_SELECTOR)
        .forEach((node) => observer?.observe(node));
    };

    const connect = () => {
      observer?.disconnect();
      crossing.clear();

      // A 1px band at the nav's bottom edge. `-100%` for the bottom margin
      // would invert the root box (negative height), which browsers treat as
      // empty, so the bottom inset is sized from the viewport instead.
      const navHeight = readNavHeight();
      const bottomInset = Math.max(0, window.innerHeight - navHeight - 1);

      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const node = entry.target as HTMLElement;
            if (entry.isIntersecting) {
              crossing.add(node);
            } else {
              crossing.delete(node);
            }
          }
          report();
        },
        { rootMargin: `-${navHeight}px 0px -${bottomInset}px 0px` },
      );
      observeAll();
    };

    // Sections can stream in later (Suspense boundaries, footer).
    const mutations = new MutationObserver(() => {
      if (!scanFrame) {
        scanFrame = requestAnimationFrame(() => {
          scanFrame = 0;
          observeAll();
        });
      }
    });

    connect();
    mutations.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("resize", connect);

    return () => {
      window.removeEventListener("resize", connect);
      mutations.disconnect();
      cancelAnimationFrame(scanFrame);
      observer?.disconnect();
      observer = null;
      crossing.clear();
    };
  }, [enabled, pathname]);

  return observed?.pathname === pathname ? observed.tone : initialTone;
}

/** Keeps `<meta name="theme-color">` in step with the section tone. */
export function useThemeColor(tone: SectionTone | null) {
  useEffect(() => {
    if (!tone) {
      return;
    }

    const color = getComputedStyle(document.documentElement)
      .getPropertyValue(`--${tone}`)
      .trim();
    if (!color) {
      return;
    }

    let meta = document.head.querySelector<HTMLMetaElement>(
      'meta[name="theme-color"]',
    );
    const created = !meta;
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "theme-color";
      document.head.appendChild(meta);
    }
    const previous = meta.content;
    meta.content = color;

    return () => {
      if (created) {
        meta.remove();
      } else {
        meta.content = previous;
      }
    };
  }, [tone]);
}
