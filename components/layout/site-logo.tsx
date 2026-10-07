"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { LogoMark } from "@/components/layout/logo-mark";
import { useNavTheme } from "@/hooks/use-nav-theme";
import { DURATION, EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

const COLLAPSE_SCROLL_Y = 80;

type SiteLogoProps = {
  className?: string;
};

export function SiteLogo({ className }: SiteLogoProps) {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const navTheme = useNavTheme(linkRef);
  const reduceMotion = useReducedMotion();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const onScroll = () => setCollapsed(window.scrollY > COLLAPSE_SCROLL_Y);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const transition = reduceMotion
    ? { duration: 0 }
    : { duration: DURATION.base, ease: EASE_OUT };

  return (
    <Link
      ref={linkRef}
      href="/"
      className={cn(
        "relative flex shrink-0 items-center motion-transition-colors duration-300",
        collapsed ? "w-9" : "max-w-[min(100%,15rem)]",
        navTheme === "dark" ? "text-cream" : "text-navy",
        className,
      )}
    >
      <span className="relative flex h-9 w-full items-center">
        <motion.span
          className="absolute left-0 top-1/2 inline-flex -translate-y-1/2 items-center whitespace-nowrap text-lg font-semibold tracking-tight"
          initial={false}
          animate={{
            opacity: collapsed ? 0 : 1,
            width: collapsed ? 0 : "auto",
          }}
          transition={transition}
          style={{ overflow: "hidden", pointerEvents: collapsed ? "none" : "auto" }}
          aria-hidden={collapsed}
        >
          digital<span className="text-coral">.HEROES</span>
        </motion.span>
        <motion.span
          className="absolute left-0 top-1/2 -translate-y-1/2"
          initial={false}
          animate={{
            opacity: collapsed ? 1 : 0,
            scale: collapsed ? 1 : 0.92,
          }}
          transition={transition}
          style={{ pointerEvents: collapsed ? "auto" : "none" }}
          aria-hidden={!collapsed}
        >
          <LogoMark className="size-9" />
        </motion.span>
        {/* Keeps tap target & layout width before collapse */}
        <span
          className={cn(
            "invisible whitespace-nowrap text-lg font-semibold",
            collapsed && "hidden",
          )}
          aria-hidden
        >
          digital.HEROES
        </span>
      </span>
    </Link>
  );
}
