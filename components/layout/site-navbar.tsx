"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Menu } from "lucide-react";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { Container } from "@/components/layout/container";
import { MenuOverlay, type MenuCharity } from "@/components/layout/menu-overlay";
import { SiteLogo } from "@/components/layout/site-logo";
import { useMenuOpen } from "@/components/providers/menu-open-context";
import { useSectionTone, useThemeColor } from "@/hooks/use-section-tone";
import { cn } from "@/lib/utils";

type SiteNavbarProps = {
  menuCharities: MenuCharity[];
  isLoggedIn?: boolean;
  isAdmin?: boolean;
};

/** Past this, the header takes its own blurred surface (see `[data-site-navbar]`). */
const SCROLL_SURFACE_PX = 40;

/** Shared height and typography for header controls */
const navControl =
  "motion-tone motion-press motion-nudge inline-flex h-11 min-h-11 max-w-full shrink-0 items-center justify-center rounded-full px-3 text-[0.8125rem] font-medium leading-none whitespace-nowrap sm:px-3.5";

const navBtnSecondary = cn(
  navControl,
  "border border-(color:--nav-pill-border) bg-(--nav-pill-bg) text-(--nav-fg) shadow-[0_1px_0_rgba(20,33,61,0.04)] backdrop-blur-sm hover:border-(color:--nav-pill-border-hover) hover:bg-(--nav-pill-bg-hover) group-data-scrolled/header:bg-(--nav-pill-bg-scrolled) group-data-scrolled/header:shadow-[0_6px_18px_-10px_rgba(20,33,61,0.35)]",
);

const navBtnPrimary = cn(
  navControl,
  "group-data-scrolled/header:shadow-[0_6px_18px_-10px_rgba(20,33,61,0.35)] border border-transparent bg-coral px-3.5 text-navy shadow-[0_1px_0_rgba(20,33,61,0.06)] hover:bg-coral-deep hover:shadow-[0_8px_20px_-8px_rgba(217,68,31,0.55)] sm:px-4",
);

export function SiteNavbar({
  menuCharities,
  isLoggedIn = false,
  isAdmin = false,
}: SiteNavbarProps) {
  const pathname = usePathname();
  const { menuOpen, setMenuOpen } = useMenuOpen();
  const closeMenu = useCallback(() => setMenuOpen(false), [setMenuOpen]);
  const [scrolled, setScrolled] = useState(false);
  const hidden =
    pathname.startsWith("/dashboard") || pathname.startsWith("/admin");
  const surfaceTone = useSectionTone({ enabled: !hidden });
  useThemeColor(hidden ? null : surfaceTone);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setScrolled(window.scrollY > SCROLL_SURFACE_PX);
    };
    const onScroll = () => {
      if (!frame) {
        frame = requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.classList.add("site-menu-open");
    } else {
      document.body.classList.remove("site-menu-open");
    }
    return () => document.body.classList.remove("site-menu-open");
  }, [menuOpen]);

  if (hidden) {
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
        data-scrolled={scrolled || undefined}
        data-surface-tone={surfaceTone}
        className={cn(
          "group/header",
          "site-header-surface pointer-events-none fixed inset-x-0 top-0 z-50",
          menuOpen ? "opacity-0" : "opacity-100",
        )}
        aria-hidden={menuOpen}
      >
          <Container
            className="pointer-events-auto flex h-[var(--header-height)] min-w-0 items-center gap-3 sm:gap-4"
          >
            <SiteLogo
              className="motion-tone min-w-0 text-(--nav-fg) [&_span]:h-9 [&_span]:text-base sm:[&_span]:text-lg"
            />

            <nav
              className="ml-auto flex min-w-0 items-center gap-1 sm:gap-1.5"
              aria-label="Site"
            >
              {showSubscribe ? (
                <div className="min-w-0 shrink">
                  <Link href="/subscribe" className={navBtnPrimary}>
                    Subscribe
                  </Link>
                </div>
              ) : null}
              {showLoginLink ? (
                <div className="hidden min-w-0 md:block">
                  <Link href={accountHref} className={navBtnSecondary}>
                    {accountLabel}
                  </Link>
                </div>
              ) : null}
              {showDashboardLink ? (
                <>
                  <div className="hidden min-w-0 md:block">
                    <Link href="/dashboard" className={navBtnSecondary}>
                      Dashboard
                    </Link>
                  </div>
                  <div className="hidden min-w-0 md:block">
                    <SignOutButton className={navBtnSecondary} />
                  </div>
                </>
              ) : null}
              <button
                id="site-menu-button"
                type="button"
                className={cn(navBtnSecondary, "px-2.5 sm:px-3")}
                onClick={() => setMenuOpen(true)}
                aria-expanded={menuOpen}
                aria-controls="site-menu"
                aria-label="Open menu"
              >
                <Menu className="size-5 shrink-0" aria-hidden />
                <span className="sr-only">Menu</span>
              </button>
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
