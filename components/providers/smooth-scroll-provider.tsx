"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useReducedMotion } from "framer-motion";
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import {
  getLenisSnapshot,
  setLenisSnapshot,
  subscribeLenis,
} from "@/lib/lenis-store";
import { SmoothScrollContext } from "@/lib/smooth-scroll-context";
import { scrollToHash } from "@/lib/scroll-to-hash";

type SmoothScrollProviderProps = {
  children: ReactNode;
  menuOpen?: boolean;
};

export function SmoothScrollProvider({
  children,
  menuOpen = false,
}: SmoothScrollProviderProps) {
  const reduceMotion = useReducedMotion();
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);
  const lenis = useSyncExternalStore(
    subscribeLenis,
    getLenisSnapshot,
    () => null,
  );

  useEffect(() => {
    if (reduceMotion) {
      lenisRef.current?.destroy();
      lenisRef.current = null;
      setLenisSnapshot(null);
      return;
    }

    const instance = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false,
      // Scrollable tables/panels keep native scrolling.
      allowNestedScroll: true,
      // Base UI dialogs/selects lock scroll with inline overflow on <html> or
      // <body>. Lenis scrolls the window directly, so it must stand down or
      // the page behind an open modal would still move.
      virtualScroll: () => !isDocumentScrollLocked(),
    });

    lenisRef.current = instance;
    setLenisSnapshot(instance);

    let frame = 0;
    const raf = (time: number) => {
      instance.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      instance.destroy();
      lenisRef.current = null;
      setLenisSnapshot(null);
    };
  }, [reduceMotion]);

  useEffect(() => {
    const instance = lenisRef.current;
    if (!instance) {
      return;
    }
    if (menuOpen) {
      instance.stop();
    } else {
      instance.start();
    }
  }, [menuOpen, lenis]);

  // Layout effect: reset before paint, ahead of the route template's enter
  // animation (Framer starts it in a passive effect). `force` covers Lenis
  // being stopped when navigating from the open menu overlay.
  useLayoutEffect(() => {
    const instance = lenisRef.current;
    if (instance) {
      instance.scrollTo(0, { immediate: true, force: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  useEffect(() => {
    if (reduceMotion) {
      return;
    }

    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest<HTMLAnchorElement>("a[href]");
      if (!anchor) {
        return;
      }
      const href = anchor.getAttribute("href");
      if (!href || !href.includes("#")) {
        return;
      }

      if (scrollToHash(href, lenisRef.current)) {
        event.preventDefault();
      }
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [pathname, reduceMotion]);

  const value = useMemo(
    () => ({ lenis, reduceMotion: Boolean(reduceMotion) }),
    [lenis, reduceMotion],
  );

  return (
    <SmoothScrollContext.Provider value={value}>
      <div className="flex min-h-full min-w-0 flex-1 flex-col overflow-x-clip">
        {children}
      </div>
    </SmoothScrollContext.Provider>
  );
}

function isDocumentScrollLocked(): boolean {
  return (
    document.documentElement.style.overflowY === "hidden" ||
    document.body.style.overflowY === "hidden"
  );
}
