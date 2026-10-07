"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { Container } from "@/components/layout/container";
import {
  buttonMotionProps,
  DURATION,
  EASE_IN_OUT,
  EASE_OUT,
  motionEase,
} from "@/lib/motion";
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
  menuControlId?: string;
};

const browseLinks = [
  { href: "/#welcome", label: "Home", key: "home" },
  { href: "/#how-it-works", label: "How it works", key: "how" },
  { href: "/#how-you-win", label: "Prizes", key: "prizes" },
  { href: "/#charities", label: "Charities", key: "charities" },
  { href: "/#pricing", label: "Pricing", key: "pricing" },
  { href: "mailto:hello@digitalheroes.example", label: "Contact", key: "contact" },
] as const;

const exploreLinks = [
  { href: "/charities", label: "Featured charities" },
  { href: "/#how-you-win", label: "Past draws" },
  { href: "/dashboard/prizes", label: "Winners" },
  { href: "/#how-it-works", label: "FAQ" },
  { href: "#", label: "Terms and privacy" },
] as const;

const followLinks = [
  { href: "#", label: "LinkedIn" },
  { href: "#", label: "Instagram" },
  { href: "#", label: "YouTube" },
  { href: "#", label: "Facebook" },
] as const;

const menuFocusRing =
  "outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-navy focus-visible:outline-offset-2";

function useMdUp() {
  const [mdUp, setMdUp] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const update = () => setMdUp(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return mdUp;
}

function MenuSectionLabel({ children }: { children: string }) {
  return (
    <p className="text-[14px] font-normal leading-none text-navy">
      ( {children} )
    </p>
  );
}

function isBrowseLinkActive(
  href: string,
  pathname: string,
  key: string,
): boolean {
  if (key === "home") {
    return pathname === "/";
  }
  if (href.startsWith("/#")) {
    return pathname === "/";
  }
  if (href.startsWith("/charities")) {
    return pathname.startsWith("/charities");
  }
  return pathname === href;
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
          "font-light text-navy active:text-coral-deep",
          "text-[clamp(26px,7.4vw,32px)] leading-[1.1] tracking-[-0.02em]",
          "md:text-[clamp(32px,3.4vw,64px)] md:leading-[1.05] md:tracking-[-0.03em]",
          "motion-transition-colors motion-transition-transform",
          !reduceMotion && "md:hover:translate-x-3 md:hover:text-coral-deep",
          reduceMotion && "md:hover:text-coral-deep",
        )}
      >
        {active ? (
          <span className="size-2 shrink-0 rounded-full bg-coral" aria-hidden />
        ) : (
          <span className="size-2 shrink-0" aria-hidden />
        )}
        <span className="min-w-0 flex-1 overflow-hidden">
          <span className="block">{label}</span>
        </span>
        <ArrowRight
          className={cn(
            "hidden size-5 shrink-0 text-navy opacity-0 transition-opacity md:block",
            "group-hover:text-coral-deep group-hover:opacity-100",
          )}
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
  charities: _charities,
  isLoggedIn = false,
  menuControlId = "site-menu-close-button",
}: MenuOverlayProps) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const mdUp = useMdUp();
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

  const onNavigate = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    setPortalRoot(document.body);
  }, []);

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

  const accountLinks = [
    { href: "/login", label: "Login" },
    ...(isLoggedIn ? [{ href: "/dashboard", label: "Dashboard" }] : []),
    { href: "/subscribe", label: "Subscribe" },
  ];

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
          aria-label="Site menu"
          className="fixed inset-0 z-[100] flex h-[100dvh] flex-col overflow-hidden bg-cream text-navy"
          initial={
            reduceMotion
              ? { opacity: 0 }
              : { clipPath: "inset(0 0 100% 0)" }
          }
          animate={
            reduceMotion
              ? { opacity: 1 }
              : { clipPath: "inset(0 0 0% 0)" }
          }
          exit={
            reduceMotion
              ? { opacity: 0, transition: { duration: DURATION.fast } }
              : {
                  clipPath: "inset(0 0 100% 0)",
                  transition: { duration: 0.5, ease: EASE_IN_OUT },
                }
          }
          transition={{
            duration: reduceMotion ? DURATION.fast : 0.7,
            ease: EASE_IN_OUT,
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
                {browseLinks.map((link, index) => (
                  <BrowseRow
                    key={link.key}
                    href={link.href}
                    label={link.label}
                    active={isBrowseLinkActive(link.href, pathname, link.key)}
                    index={index}
                    reduceMotion={reduceMotion}
                    mdUp={false}
                    open={open}
                    onNavigate={onNavigate}
                  />
                ))}
              </ul>
            </section>

            <section className="mt-10">
              <MenuSectionLabel>Explore</MenuSectionLabel>
              <div className="mt-2 border-t border-navy" aria-hidden />
              <ul>
                {exploreLinks.map((link, index) => (
                  <motion.li
                    key={link.label}
                    initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
                    animate={
                      reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }
                    }
                    transition={{
                      delay: 0.04 + index * 0.04,
                      duration: 0.35,
                      ease: motionEase,
                    }}
                  >
                    <Link
                      href={link.href}
                      onClick={onNavigate}
                      className={cn(
                        menuFocusRing,
                        "flex min-h-11 items-center py-1.5 font-light leading-[1.2] text-navy active:text-coral-deep",
                        "text-[clamp(20px,5.6vw,24px)]",
                      )}
                    >
                      {link.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </section>

            <section className="mt-10">
              <div className="border-t border-navy" aria-hidden />
              <div className="grid grid-cols-2 border-b border-navy">
                <div className="py-2 pr-2">
                  <MenuSectionLabel>Follow Us</MenuSectionLabel>
                </div>
                <div className="py-2 pl-2">
                  <MenuSectionLabel>Account</MenuSectionLabel>
                </div>
              </div>
              <div className="grid grid-cols-2">
                <ul className="pr-2 pt-2">
                  {followLinks.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        onClick={onNavigate}
                        className={cn(
                          menuFocusRing,
                          "inline-flex min-h-11 items-center py-1 text-[15px] font-medium leading-[1.5] text-navy active:text-coral-deep",
                        )}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
                <ul className="pl-2 pt-2">
                  {accountLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={onNavigate}
                        className={cn(
                          menuFocusRing,
                          "inline-flex min-h-11 items-center py-1 text-[15px] font-medium leading-[1.5] text-navy active:text-coral-deep",
                        )}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </div>

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
                  {browseLinks.map((link, index) => (
                    <BrowseRow
                      key={link.key}
                      href={link.href}
                      label={link.label}
                      active={isBrowseLinkActive(link.href, pathname, link.key)}
                      index={index}
                      reduceMotion={reduceMotion}
                      mdUp={true}
                      open={open}
                      onNavigate={onNavigate}
                    />
                  ))}
                </ul>
              </div>

              <div className="flex min-h-0 flex-col lg:col-span-4 lg:col-start-9">
                <div className="min-h-0">
                  <MenuSectionLabel>Explore</MenuSectionLabel>
                  <div className="mt-2 border-t border-line" aria-hidden />
                  <ul className="mt-2 space-y-2">
                    {exploreLinks.map((link, index) => (
                      <motion.li
                        key={link.label}
                        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
                        animate={
                          reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }
                        }
                        transition={{
                          delay: 0.1 + index * 0.05,
                          duration: 0.4,
                          ease: motionEase,
                        }}
                        className="border-b border-line pb-3 last:border-b-0"
                      >
                        <Link
                          href={link.href}
                          onClick={onNavigate}
                          className={cn(
                            menuFocusRing,
                            "font-light leading-[1.1] tracking-[-0.02em] text-navy",
                            "text-[clamp(22px,2.2vw,40px)]",
                            "hover:underline hover:decoration-coral-deep hover:underline-offset-[4px]",
                          )}
                        >
                          {link.label}
                        </Link>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                <div className="mt-auto shrink-0 pt-6">
                  <div className="border-t border-line pt-5">
                    <div className="grid gap-8 sm:grid-cols-2">
                      <div>
                        <MenuSectionLabel>Follow Us</MenuSectionLabel>
                        <div className="mt-2 border-t border-line" aria-hidden />
                        <ul className="mt-2 space-y-1">
                          {followLinks.map((link) => (
                            <li key={link.label}>
                              <Link
                                href={link.href}
                                onClick={onNavigate}
                                className={cn(
                                  menuFocusRing,
                                  "text-[16px] font-medium text-navy hover:text-coral-deep",
                                )}
                              >
                                {link.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <MenuSectionLabel>Account</MenuSectionLabel>
                        <div className="mt-2 border-t border-line" aria-hidden />
                        <ul className="mt-2 space-y-1">
                          {accountLinks.map((link) => (
                            <li key={link.href}>
                              <Link
                                href={link.href}
                                onClick={onNavigate}
                                className={cn(
                                  menuFocusRing,
                                  "text-[16px] font-medium text-navy hover:text-coral-deep",
                                )}
                              >
                                {link.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        </>
      ) : null}
    </AnimatePresence>,
    portalRoot,
  );
}
