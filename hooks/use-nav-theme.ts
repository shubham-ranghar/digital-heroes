"use client";

import { type RefObject, useEffect, useState } from "react";

export type NavTheme = "dark" | "light";

const NAV_BAR_SELECTOR = "[data-site-navbar]";

function resolveThemeFromPoint(x: number, y: number): NavTheme {
  const stack = document.elementsFromPoint(x, y);

  for (const node of stack) {
    if (!(node instanceof HTMLElement)) {
      continue;
    }
    if (node.closest(NAV_BAR_SELECTOR)) {
      continue;
    }

    const themed = node.closest<HTMLElement>("[data-nav-theme]");
    if (themed) {
      return themed.dataset.navTheme === "light" ? "light" : "dark";
    }
  }

  return "dark";
}

export function useNavTheme(anchorRef: RefObject<HTMLElement | null>) {
  const [theme, setTheme] = useState<NavTheme>("dark");

  useEffect(() => {
    let rafId = 0;

    const measure = () => {
      const anchor = anchorRef.current;
      if (!anchor) {
        return;
      }

      const rect = anchor.getBoundingClientRect();
      const x = Math.min(
        window.innerWidth - 1,
        Math.max(1, rect.left + rect.width / 2),
      );
      const y = Math.min(
        window.innerHeight - 1,
        Math.max(1, rect.top + rect.height / 2),
      );

      setTheme(resolveThemeFromPoint(x, y));
    };

    const schedule = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(measure);
    };

    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [anchorRef]);

  return theme;
}
