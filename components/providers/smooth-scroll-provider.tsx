"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

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
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    if (reduceMotion) {
      lenisRef.current?.destroy();
      lenisRef.current = null;
      setLenis(null);
      return;
    }

    const instance = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false,
    });

    lenisRef.current = instance;
    setLenis(instance);

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
      setLenis(null);
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

  useEffect(() => {
    const instance = lenisRef.current;
    if (instance) {
      instance.scrollTo(0, { immediate: true });
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
      {children}
    </SmoothScrollContext.Provider>
  );
}
