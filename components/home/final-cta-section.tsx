import Link from "next/link";

import { RevealItem, ScrollReveal } from "@/components/home/scroll-reveal";
import { Button } from "@/components/ui/button";
import { headingSection } from "@/lib/typography";

export function FinalCtaSection() {
  return (
    <section
      id="join"
      className="section-navy border-t border-line px-4 py-16 sm:px-6 lg:px-8"
    >
      <ScrollReveal>
        <RevealItem>
          <div className="mx-auto max-w-6xl overflow-hidden rounded-[24px] border border-coral/30 bg-gradient-to-br from-coral/10 via-sand to-navy px-6 py-12 text-center sm:px-10">
            <h2 className={headingSection}>
              Ready to play for{" "}
              <span className="text-coral">something bigger</span>?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate">
              Join members who fund real charity work, log their latest scores,
              and share in transparent monthly draws.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" render={<Link href="/subscribe" />}>
                Subscribe now
              </Button>
              <Button
                size="lg"
                variant="ghost"
                render={<Link href="/signup" />}
              >
                Create account
              </Button>
            </div>
          </div>
        </RevealItem>
      </ScrollReveal>
    </section>
  );
}
