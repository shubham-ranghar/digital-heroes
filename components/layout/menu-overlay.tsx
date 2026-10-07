"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useCallback, useEffect } from "react";
import { createPortal } from "react-dom";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { Container } from "@/components/layout/container";
import { useClientMounted } from "@/hooks/use-client-mounted";
import {
  buttonMotionProps,
  DURATION,
  EASE_IN_OUT,
  EASE_OUT,
} from "@/lib/motion";
import { getSocialFooterLinks } from "@/lib/footer-links";
import { menuNavLinks } from "@/lib/site-nav-links";
import { RollText } from "@/components/motion/roll-link";
import { cn } from "@/lib/utils";

export type MenuCharity = {
  name: string;
  slug: string;
};

type MenuOverlayProps = {
  open: boolean;
  onClose: () => void;
  charities: MenuCharity[];
  isLoggedIn?: boolean;
  isAdmin?: boolean;
  menuControlId?: string;
};

type MenuLink = { href: string; label: string; key: string };

function buildPrimaryMenuLinks(
  isLoggedIn: boolean,
  isAdmin: boolean,
): MenuLink[] {
  const browseLinks = menuNavLinks.map((link) => ({
    href: link.href,
    label: link.label,
    key: link.href,
  }));
  const home =
    browseLinks.find((link) => link.href === "/") ?? browseLinks[0];
  const restBrowse = browseLinks.filter((link) => link.href !== "/");

  const links: MenuLink[] = [
    home,
    ...(isLoggedIn
      ? [{ href: "/dashboard", label: "Dashboard", key: "dashboard" }]
      : []),
    { href: "/subscribe", label: "Subscribe", key: "subscribe" },
    ...restBrowse,
  ];
  if (isAdmin) {
    links.push({ href: "/admin", label: "Admin", key: "admin" });
  }
  return links;
}

const menuFocusRing =
  "outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-navy focus-visible:outline-offset-2";

function MenuSectionLabel({ children }: { children: string }) {
  return (
    <p className="text-[14px] font-normal leading-none text-navy">
      ( {children} )
    </p>
  );
}

function isBrowseLinkActive(href: string, pathname: string): boolean {
  const path = href.split("#")[0] || href;
  if (path === "/dashboard") {
    return pathname.startsWith("/dashboard");
  }
  if (path === "/admin") {
    return pathname.startsWith("/admin");
  }
  if (path === "/charities") {
    return pathname.startsWith("/charities");
  }
  if (path === "/") {
    return pathname === "/";
  }
  return pathname === path;
}

type BrowseRowProps = {
  href: string;
  label: string;
  active: boolean;
  index: number;
  reduceMotion: boolean | null;
  mdUp: boolean;
  open: boolean;
  onNavigate: () => void;
};

function BrowseRow({
  href,
  label,
  active,
  index,
  reduceMotion,
  mdUp,
  open,
  onNavigate,
}: BrowseRowProps) {
  const enterDelay = 0.25 + index * 0.05;

  return (
    <motion.li
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: mdUp ? 20 : 12 }}
      animate={
        reduceMotion
          ? { opacity: open ? 1 : 0 }
          : open
            ? { opacity: 1, y: 0 }
            : { opacity: 0, y: mdUp ? 12 : 8 }
      }
      transition={
        open
          ? {
              delay: enterDelay,
              duration: DURATION.base,
              ease: EASE_OUT,
            }
          : { duration: DURATION.fast, ease: EASE_OUT }
      }
      className="border-b border-navy md:border-line"
    >
      <Link
        href={href}
        onClick={onNavigate}
        className={cn(
          menuFocusRing,
          "group flex w-full min-h-11 items-center gap-2 py-1.5 md:min-h-0 md:py-2",
          "font-light text-navy",
          "text-[clamp(26px,7.4vw,32px)] leading-[1.1] tracking-[-0.02em]",
          "md:text-[clamp(32px,3.4vw,64px)] md:leading-[1.05] md:tracking-[-0.03em]",
        )}
      >
        {active ? (
          <span className="size-2 shrink-0 rounded-full bg-coral" aria-hidden />
        ) : (
          <span className="size-2 shrink-0" aria-hidden />
        )}
        <span className="min-w-0 flex-1">
          <RollText text={label} />
        </span>
        <ArrowRight
          className="hidden size-5 shrink-0 text-navy opacity-0 transition-opacity md:block group-hover:opacity-100"
          aria-hidden
        />
      </Link>
    </motion.li>
  );
}

function MenuOverlayTopBarMobile({
  onClose,
  closeButtonId,
}: {
  onClose: () => void;
  closeButtonId: string;
}) {
  return (
    <div
      className="shrink-0 border-b border-navy px-5 pt-[env(safe-area-inset-top,0px)] md:hidden"
    >
      <div className="flex h-16 items-center gap-2">
        <Link
          href="/"
          onClick={onClose}
          className={cn(
            menuFocusRing,
            "min-w-0 shrink text-lg font-semibold tracking-tight text-navy",
          )}
        >
          digital<span className="text-coral">.HEROES</span>
        </Link>
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <motion.button
            id={closeButtonId}
            type="button"
            className={cn(
              menuFocusRing,
              "inline-flex h-11 min-w-16 items-center justify-center rounded-none border border-line bg-white px-3 text-sm font-medium text-navy",
            )}
            onClick={onClose}
            {...buttonMotionProps(false)}
          >
            Close
          </motion.button>
          <motion.div {...buttonMotionProps(false)}>
            <Link
              href="/subscribe"
              className={cn(
                menuFocusRing,
                "inline-flex h-11 items-center rounded-full bg-coral px-4 text-sm font-medium text-navy hover:bg-coral-deep",
              )}
            >
              Subscribe
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function MenuOverlayTopBarDesktop({
  onClose,
  closeButtonId,
}: {
  onClose: () => void;
  closeButtonId: string;
}) {
  return (
    <div className="hidden shrink-0 border-b border-line md:block">
      <Container className="flex h-16 items-center gap-4">
        <Link
          href="/"
          onClick={onClose}
          className={cn(
            menuFocusRing,
            "shrink-0 text-lg font-semibold tracking-tight text-navy",
          )}
        >
          digital<span className="text-coral">.HEROES</span>
        </Link>
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <motion.button
            id={closeButtonId}
            type="button"
            className={cn(
              menuFocusRing,
              "inline-flex h-10 min-w-10 items-center justify-center rounded-none border border-line bg-white px-3 text-sm font-medium text-navy",
            )}
            onClick={onClose}
            {...buttonMotionProps(false)}
          >
            Close
          </motion.button>
          <motion.div {...buttonMotionProps(false)}>
            <Link
              href="/subscribe"
              className={cn(
                menuFocusRing,
                "inline-flex h-10 items-center rounded-full bg-coral px-5 text-sm font-medium text-navy hover:bg-coral-deep",
              )}
            >
              Subscribe
            </Link>
          </motion.div>
        </div>
      </Container>
    </div>
  );
}

export function MenuOverlay({
  open,
  onClose,
  charities,
  isLoggedIn = false,
  isAdmin = false,
  menuControlId = "site-menu-close-button",
}: MenuOverlayProps) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const mounted = useClientMounted();
  const portalRoot = mounted ? document.body : null;
  const primaryLinks = buildPrimaryMenuLinks(isLoggedIn, isAdmin);
  const socialLinks = getSocialFooterLinks();

  const onNavigate = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);

    const control = document.getElementById(menuControlId);
    control?.focus();

    return () => {
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, menuControlId]);

  useEffect(() => {
    if (!open || !portalRoot) {
      return;
    }

    const onTab = (event: KeyboardEvent) => {
      if (event.key !== "Tab") {
        return;
      }
      const root = document.getElementById("site-menu");
      if (!root) {
        return;
      }
      const control = document.getElementById(menuControlId);
      const inPanel = Array.from(
        root.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      const focusables = control
        ? [control, ...inPanel.filter((el) => el !== control)]
        : inPanel;
      if (focusables.length === 0) {
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onTab);
    return () => document.removeEventListener("keydown", onTab);
  }, [open, menuControlId, portalRoot]);

  if (!portalRoot) {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            className="fixed inset-0 z-[99] bg-navy/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DURATION.fast, ease: EASE_IN_OUT }}
            aria-hidden
          />
          <motion.div
          id="site-menu"
          role="dialog"
          aria-modal="true"
          aria-label={
            charities.length > 0
              ? `Site menu — ${charities.length} featured charities`
              : "Site menu"
          }
          className="fixed inset-0 z-[100] flex h-[100dvh] flex-col overflow-hidden bg-transparent text-navy"
          initial={reduceMotion ? { opacity: 0 } : false}
          animate={reduceMotion ? { opacity: 1 } : undefined}
          exit={
            reduceMotion
              ? { opacity: 0, transition: { duration: DURATION.fast } }
              : undefined
          }
        >
          {!reduceMotion ? (
            <div className="pointer-events-none absolute inset-0 flex" aria-hidden>
              {[2, 1, 3, 0, 4].map((col, orderIdx) => (
                <motion.div
                  key={col}
                  className="h-full flex-1 bg-cream"
                  initial={{ y: "-100%" }}
                  animate={{ y: 0 }}
                  exit={{
                    y: "-100%",
                    transition: {
                      duration: 0.5,
                      delay: (4 - orderIdx) * 0.06,
                      ease: EASE_IN_OUT,
                    },
                  }}
                  transition={{
                    duration: 0.8,
                    delay: orderIdx * 0.06,
                    ease: EASE_IN_OUT,
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="absolute inset-0 bg-cream" aria-hidden />
          )}
          <motion.div
            className="relative z-10 flex min-h-0 flex-1 flex-col bg-cream/0"
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={
              reduceMotion
                ? { opacity: 1, y: 0 }
                : { opacity: 1, y: 0 }
            }
            exit={
              reduceMotion
                ? { opacity: 0, transition: { duration: DURATION.fast } }
                : {
                    opacity: 0,
                    y: 12,
                    transition: { duration: DURATION.fast, ease: EASE_OUT },
                  }
            }
            transition={{
              delay: reduceMotion ? 0 : 0.48,
              duration: DURATION.base,
              ease: EASE_OUT,
            }}
          >
          <MenuOverlayTopBarMobile
            onClose={onClose}
            closeButtonId={menuControlId}
          />
          <MenuOverlayTopBarDesktop
            onClose={onClose}
            closeButtonId={menuControlId}
          />

          {/* Mobile menu body */}
          <div
            className={cn(
              "flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden px-5 pb-[max(1rem,env(safe-area-inset-bottom))] md:hidden",
            )}
          >
            <section className="pt-6">
              <MenuSectionLabel>Browse</MenuSectionLabel>
              <motion.div
                className="mt-2 h-px origin-left bg-navy"
                initial={reduceMotion ? false : { scaleX: 0 }}
                animate={reduceMotion ? { scaleX: 1 } : { scaleX: 1 }}
                transition={{ delay: 0.25, duration: DURATION.base, ease: EASE_OUT }}
                aria-hidden
              />
              <ul>
                {primaryLinks.map((link, index) => (
                  <BrowseRow
                    key={link.key}
                    href={link.href}
                    label={link.label}
                    active={isBrowseLinkActive(link.href, pathname)}
                    index={index}
                    reduceMotion={reduceMotion}
                    mdUp={false}
                    open={open}
                    onNavigate={onNavigate}
                  />
                ))}
              </ul>
            </section>

            {socialLinks.length > 0 ? (
              <section className="mt-10">
                <MenuSectionLabel>Follow us</MenuSectionLabel>
                <div className="mt-2 border-t border-navy" aria-hidden />
                <ul className="mt-2">
                  {socialLinks.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={onNavigate}
                        className={cn(
                          menuFocusRing,
                          "group inline-flex min-h-11 items-center py-1 text-[15px] font-medium text-navy",
                        )}
                      >
                        <RollText text={link.label} />
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>

          {isLoggedIn ? (
            <div
              className="shrink-0 border-t border-navy bg-cream px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:hidden"
            >
              <SignOutButton className="w-full bg-cream hover:bg-sand" />
            </div>
          ) : null}

          {/* Desktop menu body (unchanged layout) */}
          <div
            className={cn(
              "hidden min-h-0 flex-1 flex-col overflow-hidden md:flex",
              "px-[100px] pb-6 pt-6",
            )}
          >
            <div className="grid min-h-0 flex-1 grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-x-8 lg:gap-y-0">
              <div className="min-h-0 lg:col-span-7">
                <MenuSectionLabel>Browse</MenuSectionLabel>
                <motion.div
                  className="mt-2 h-px origin-left bg-line"
                  initial={reduceMotion ? false : { scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.25, duration: DURATION.base, ease: EASE_OUT }}
                  aria-hidden
                />
                <ul>
                  {primaryLinks.map((link, index) => (
                    <BrowseRow
                      key={link.key}
                      href={link.href}
                      label={link.label}
                      active={isBrowseLinkActive(link.href, pathname)}
                      index={index}
                      reduceMotion={reduceMotion}
                      mdUp={true}
                      open={open}
                      onNavigate={onNavigate}
                    />
                  ))}
                </ul>
              </div>

              <div className="flex min-h-0 flex-col gap-8 lg:col-span-4 lg:col-start-9">
                {isLoggedIn ? (
                  <div>
                    <MenuSectionLabel>Account</MenuSectionLabel>
                    <div className="mt-2 border-t border-line" aria-hidden />
                    <div className="mt-4">
                      <SignOutButton className="bg-cream hover:bg-sand" />
                    </div>
                  </div>
                ) : null}
                {socialLinks.length > 0 ? (
                  <div>
                    <MenuSectionLabel>Follow us</MenuSectionLabel>
                    <div className="mt-2 border-t border-line" aria-hidden />
                    <ul className="mt-2 space-y-1">
                      {socialLinks.map((link) => (
                        <li key={link.href}>
                          <a
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={onNavigate}
                            className={cn(
                              menuFocusRing,
                              "group text-[16px] font-medium text-navy",
                            )}
                          >
                            <RollText text={link.label} />
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
          </motion.div>
        </motion.div>
        </>
      ) : null}
    </AnimatePresence>,
    portalRoot,
  );
}
