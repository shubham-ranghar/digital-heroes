"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";

import { Container } from "@/components/layout/container";
import { MenuOverlay, type MenuCharity } from "@/components/layout/menu-overlay";
import { SiteLogo } from "@/components/layout/site-logo";
import { useMenuOpen } from "@/components/providers/menu-open-context";
import { useNavTheme } from "@/hooks/use-nav-theme";
import { buttonMotionProps } from "@/lib/motion";
import { cn } from "@/lib/utils";

type SiteNavbarProps = {
  menuCharities: MenuCharity[];
  isLoggedIn?: boolean;
};

export function SiteNavbar({ menuCharities, isLoggedIn = false }: SiteNavbarProps) {
  const pathname = usePathname();
  const { menuOpen, setMenuOpen } = useMenuOpen();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuTheme = useNavTheme(menuButtonRef);

  const closeMenu = useCallback(() => setMenuOpen(false), [setMenuOpen]);

  useEffect(() => {
    if (menuOpen) {
      document.body.classList.add("site-menu-open");
    } else {
      document.body.classList.remove("site-menu-open");
    }
    return () => document.body.classList.remove("site-menu-open");
  }, [menuOpen]);

  if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      <header
        data-site-navbar
        className={cn(
          "pointer-events-none fixed inset-x-0 top-0 z-50 bg-transparent motion-transition-opacity",
          menuOpen ? "opacity-0" : "opacity-100",
        )}
        aria-hidden={menuOpen}
      >
        <Container
          className="pointer-events-auto flex h-[72px] min-w-0 items-center gap-2 sm:gap-4"
        >
          <SiteLogo />

          <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-3">
            <motion.button
              ref={menuButtonRef}
              id="site-menu-button"
              type="button"
              className={cn(
                "inline-flex h-10 min-w-10 items-center justify-center rounded-none px-2.5 text-sm font-medium motion-transition-colors sm:px-3",
                menuTheme === "dark"
                  ? "bg-cream text-navy"
                  : "bg-navy text-cream",
              )}
              onClick={() => setMenuOpen(true)}
              aria-expanded={menuOpen}
              aria-controls="site-menu"
              {...buttonMotionProps(false)}
            >
              Menu
            </motion.button>
            <motion.div {...buttonMotionProps(false)}>
              <Link
                href="/subscribe"
                className="inline-flex h-10 items-center rounded-full bg-coral px-4 text-sm font-medium text-navy hover:bg-coral-deep sm:px-5"
              >
                Subscribe
              </Link>
            </motion.div>
          </div>
        </Container>
      </header>

      <MenuOverlay
        open={menuOpen}
        onClose={closeMenu}
        charities={menuCharities}
        isLoggedIn={isLoggedIn}
        menuControlId="site-menu-close-button"
      />
    </>
  );
}
