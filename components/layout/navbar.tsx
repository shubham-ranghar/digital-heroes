"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#how-you-win", label: "Prizes" },
  { href: "/#charities", label: "Charities" },
  { href: "/#pricing", label: "Pricing" },
] as const;

export function Navbar() {
  const pathname = usePathname();

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b border-line",
        "bg-navy/75 backdrop-blur-md supports-backdrop-filter:bg-navy/60",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="font-sans text-lg font-semibold tracking-tight text-cream"
        >
          digital<span className="text-coral">.HEROES</span>
        </Link>

        <nav
          className="hidden items-center gap-6 md:flex"
          aria-label="Primary"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm text-slate transition-colors hover:text-cream",
                pathname === link.href && "text-cream",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Button variant="ghost" size="sm" render={<Link href="/login" />}>
            Login
          </Button>
          <Button size="sm" render={<Link href="/subscribe" />}>
            Subscribe
          </Button>
        </div>
      </div>
    </header>
  );
}
