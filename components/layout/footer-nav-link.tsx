"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { ArrowRight } from "lucide-react";

import { RollText } from "@/components/motion/roll-link";
import { cn } from "@/lib/utils";

type FooterNavLinkProps = {
  href: string;
  label: string;
  external?: boolean;
};

function hashFromHref(href: string): string | null {
  const hashIndex = href.indexOf("#");
  if (hashIndex === -1) {
    return null;
  }
  return href.slice(hashIndex);
}

function pathFromHref(href: string): string {
  const hashIndex = href.indexOf("#");
  if (hashIndex === -1) {
    return href;
  }
  const path = href.slice(0, hashIndex);
  return path === "" ? "/" : path;
}

function isFooterLinkActive(
  href: string,
  pathname: string,
  currentHash: string,
): boolean {
  if (href.startsWith("mailto:") || href.startsWith("http")) {
    return false;
  }

  const targetPath = pathFromHref(href);
  const targetHash = hashFromHref(href);

  if (targetPath === "/charities") {
    if (!pathname.startsWith("/charities")) {
      return false;
    }
    return !targetHash;
  }

  if (targetPath === "/dashboard") {
    return pathname.startsWith("/dashboard");
  }

  if (pathname !== targetPath) {
    return false;
  }

  if (targetHash) {
    return currentHash === targetHash;
  }

  if (href === "/" && pathname === "/") {
    return currentHash === "" || currentHash === "#welcome";
  }

  return true;
}

export function FooterNavLink({ href, label, external }: FooterNavLinkProps) {
  const pathname = usePathname();
  const [currentHash, setCurrentHash] = useState("");

  useEffect(() => {
    const syncHash = () => setCurrentHash(window.location.hash);
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, [pathname]);

  const active = isFooterLinkActive(href, pathname, currentHash);

  const className = cn(
    "group flex min-h-11 w-full items-center gap-2 py-1",
    "font-sans font-light text-navy",
    "text-[clamp(22px,4.5vw,28px)] leading-[1.1] tracking-[-0.02em]",
    "md:text-[clamp(26px,2.6vw,44px)] md:leading-[1.05] md:tracking-[-0.03em]",
  );

  const content = (
    <>
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
    </>
  );

  if (external || href.startsWith("http")) {
    return (
      <a
        href={href}
        className={className}
        target="_blank"
        rel="noopener noreferrer"
      >
        {content}
      </a>
    );
  }

  if (href.startsWith("mailto:")) {
    return (
      <a href={href} className={className}>
        {content}
      </a>
    );
  }

  return (
    <Link
      href={href}
      className={className}
      aria-current={active ? "page" : undefined}
    >
      {content}
    </Link>
  );
}
