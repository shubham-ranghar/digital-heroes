import Link from "next/link";

import { Button } from "@/components/ui/button";

export function Footer() {
  return (
    <footer className="border-t border-line bg-navy">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm space-y-3">
          <p className="font-sans text-xl font-semibold text-cream">
            digital<span className="text-coral">.HEROES</span>
          </p>
          <p className="text-sm leading-relaxed text-slate">
            Play with purpose. Every round fuels charity impact and monthly
            community prize draws — without the cliché fairway aesthetic.
          </p>
        </div>

        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate" aria-label="Footer">
          <Link href="/#how-it-works" className="hover:text-cream">
            How it works
          </Link>
          <Link href="/#how-you-win" className="hover:text-cream">
            Prizes
          </Link>
          <Link href="/charities" className="hover:text-cream">
            Charities
          </Link>
          <Link href="/#pricing" className="hover:text-cream">
            Pricing
          </Link>
        </nav>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button variant="outline" size="sm" render={<Link href="/login" />}>
            Login
          </Button>
          <Button size="sm" render={<Link href="/subscribe" />}>
            Subscribe
          </Button>
        </div>
      </div>

      <div className="border-t border-line px-4 py-4 sm:px-6">
        <p className="mx-auto max-w-6xl text-center text-xs text-slate">
          © 2026 Digital Heroes. Charity-first subscription platform.
        </p>
      </div>
    </footer>
  );
}
