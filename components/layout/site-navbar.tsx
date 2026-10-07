"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect } from "react";
import { motion } from "framer-motion";

import { SignOutButton } from "@/components/auth/sign-out-button";
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

/** Shared height and typography for header controls */
const navControl =
  "inline-flex h-9 min-h-9 max-w-full shrink-0 items-center justify-center rounded-full px-3 text-[0.8125rem] font-medium leading-none whitespace-nowrap motion-transition-colors sm:px-3.5";

const navBtnSecondary = cn(
  navControl,
  "border border-navy/25 bg-cream/85 text-navy shadow-[0_1px_0_rgba(20,33,61,0.04)] backdrop-blur-sm hover:border-navy/45 hover:bg-sand/90",
);

const navBtnPrimary = cn(
  navControl,
  "border border-transparent bg-coral px-3.5 text-navy shadow-[0_1px_0_rgba(20,33,61,0.06)] hover:bg-coral-deep sm:px-4",
);

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

  const accountHref = isLoggedIn ? "/dashboard" : "/login";
  const accountLabel = isLoggedIn ? "Dashboard" : "Login";
  const showLoginLink = !isLoggedIn && pathname !== "/login";
  const showDashboardLink = isLoggedIn;
  const showSubscribe = pathname !== "/signup";

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
            className="pointer-events-auto flex h-[var(--header-height)] min-w-0 items-center gap-3 sm:gap-4"
          >
            <SiteLogo
              className="min-w-0 [&_span]:h-9 [&_span]:text-base sm:[&_span]:text-lg"
            />

            <nav
              className="ml-auto flex min-w-0 items-center gap-1 sm:gap-1.5"
              aria-label="Site"
            >
              {showLoginLink ? (
                <motion.div
                  className="hidden min-w-0 min-[400px]:block"
                  {...buttonMotionProps(false)}
                >
                  <Link href={accountHref} className={navBtnSecondary}>
                    {accountLabel}
                  </Link>
                </motion.div>
              ) : null}
              {showDashboardLink ? (
                <>
                  <motion.div
                    className="hidden min-w-0 min-[400px]:block"
                    {...buttonMotionProps(false)}
                  >
                    <Link href="/dashboard" className={navBtnSecondary}>
                      Dashboard
                    </Link>
                  </motion.div>
                  <motion.div
                    className="hidden min-w-0 sm:block"
                    {...buttonMotionProps(false)}
                  >
                    <SignOutButton className={navBtnSecondary} />
                  </motion.div>
                </>
              ) : null}
              <motion.button
                id="site-menu-button"
                type="button"
                className={navBtnSecondary}
                onClick={() => setMenuOpen(true)}
                aria-expanded={menuOpen}
                aria-controls="site-menu"
                {...buttonMotionProps(false)}
              >
                Menu
              </motion.button>
              {showSubscribe ? (
                <motion.div
                  className="min-w-0"
                  {...buttonMotionProps(false)}
                >
                  <Link href="/subscribe" className={navBtnPrimary}>
                    Subscribe
                  </Link>
                </motion.div>
              ) : null}
            </nav>
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
