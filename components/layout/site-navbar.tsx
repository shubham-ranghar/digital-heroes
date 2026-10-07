"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect } from "react";
import { motion } from "framer-motion";

import { Container } from "@/components/layout/container";
import { MenuOverlay, type MenuCharity } from "@/components/layout/menu-overlay";
import { SiteLogo } from "@/components/layout/site-logo";
import { useMenuOpen } from "@/components/providers/menu-open-context";
import { buttonMotionProps } from "@/lib/motion";
import { cn } from "@/lib/utils";

type SiteNavbarProps = {
  menuCharities: MenuCharity[];
  isLoggedIn?: boolean;
  isAdmin?: boolean;
};

export function SiteNavbar({
  menuCharities,
  isLoggedIn = false,
  isAdmin = false,
}: SiteNavbarProps) {
  const pathname = usePathname();
  const { menuOpen, setMenuOpen } = useMenuOpen();
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

  const isAuthRoute =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password";

  const accountHref = isLoggedIn ? "/dashboard" : "/login";
  const accountLabel = isLoggedIn ? "Dashboard" : "Login";
  const showAccountLink = !isLoggedIn && pathname !== "/login";
  const showSubscribe = pathname !== "/signup";

  const navAccountBtn =
    "inline-flex h-11 min-h-11 items-center justify-center rounded-full border border-navy bg-cream px-3.5 text-sm font-medium text-navy hover:bg-sand sm:px-4";

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
          className="pointer-events-auto flex h-[var(--header-height)] min-w-0 items-center gap-2 sm:gap-4"
        >
          <SiteLogo />

          <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-3">
            {showAccountLink ? (
              <motion.div
                className="hidden min-[400px]:block"
                {...buttonMotionProps(false)}
              >
                <Link href={accountHref} className={navAccountBtn}>
                  {accountLabel}
                </Link>
              </motion.div>
            ) : null}
            <motion.button
              id="site-menu-button"
              type="button"
              className="box-border inline-flex h-11 min-h-11 shrink-0 appearance-none items-center justify-center border border-navy bg-cream px-3.5 text-sm font-medium leading-none text-navy shadow-none motion-transition-colors"
              style={{
                backgroundColor: "var(--cream)",
                borderColor: "var(--navy)",
                color: "var(--navy)",
              }}
              onClick={() => setMenuOpen(true)}
              aria-expanded={menuOpen}
              aria-controls="site-menu"
              {...buttonMotionProps(false)}
            >
              Menu
            </motion.button>
            {showSubscribe ? (
              <motion.div {...buttonMotionProps(false)}>
                <Link
                  href="/subscribe"
                  className="inline-flex h-11 min-h-11 items-center rounded-full bg-coral px-4 text-sm font-medium text-navy hover:bg-coral-deep sm:px-5"
                >
                  Subscribe
                </Link>
              </motion.div>
            ) : null}
          </div>
        </Container>
      </header>

      <MenuOverlay
        open={menuOpen}
        onClose={closeMenu}
        charities={menuCharities}
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
        menuControlId="site-menu-close-button"
      />
    </>
  );
}
