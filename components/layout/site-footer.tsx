import Link from "next/link";

import { SteppedEdge } from "@/components/editorial/stepped-edge";
import { Container } from "@/components/layout/container";
import { editorialDisplayMd } from "@/lib/typography-editorial";

export function SiteFooter() {
  return (
    <footer data-nav-theme="light" className="relative bg-cream text-navy">
      <Container className="pb-32 pt-16 text-center sm:pt-20">
        <p className={editorialDisplayMd}>
          Play with purpose — funding{" "}
          <em className="font-serif italic text-coral">real community work</em>{" "}
          every month.
        </p>
        <p className="mt-4 text-[17px] text-navy/80">
          hello@digitalheroes.example · London &amp; Mumbai (placeholder)
        </p>
        <nav
          className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[17px] text-navy/80"
          aria-label="Footer"
        >
          <Link href="/#how-it-works" className="hover:text-navy">
            How it works
          </Link>
          <Link href="/#how-you-win" className="hover:text-navy">
            Prizes
          </Link>
          <Link href="/charities" className="hover:text-navy">
            Charities
          </Link>
          <Link href="/login" className="hover:text-navy">
            Login
          </Link>
          <Link href="/subscribe" className="font-medium text-navy hover:underline">
            Subscribe
          </Link>
        </nav>
      </Container>

      <div className="relative" data-nav-theme="dark">
        <SteppedEdge position="bottom" color="var(--navy)" />
        <p className="absolute inset-x-0 bottom-8 text-center font-sans text-xl text-cream md:bottom-10">
          digital<span className="text-coral">.HEROES</span>
        </p>
      </div>

      <div data-nav-theme="dark" className="bg-navy py-6 text-center">
        <Container>
          <p className="text-xs text-cream/70">
            © 2026 Digital Heroes. Charity-first membership.
          </p>
        </Container>
      </div>
    </footer>
  );
}
