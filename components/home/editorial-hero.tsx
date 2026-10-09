"use client";

import Image from "next/image";
import Link from "next/link";
import {
  m,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { HighlightHeadline } from "@/components/editorial/highlight-headline";
import { LineReveal } from "@/components/motion/line-reveal";
import { Container } from "@/components/layout/container";
import { ImpactCount } from "@/components/home/impact-count";
import { HERO_IMAGE_ALT, HERO_IMAGE_SRC } from "@/lib/home/hero-image";
import { schoolMealsFor } from "@/lib/impact";
import { formatAmount } from "@/lib/money";
import type { HomeStats } from "@/lib/home/stats";
import type { Variants } from "framer-motion";
import { EASE_IN_OUT, REVEAL, revealDelay } from "@/lib/motion";
import { editorialBodyOnDark } from "@/lib/typography-editorial";
import { cn } from "@/lib/utils";

/**
 * Entrance timeline, from hydration. On a first visit that is also when the
 * `IntroWipe` columns start lifting (right to left, clear by 0.74s, the two
 * over the copy last), so every beat here lands by then too.
 */
const HERO_ENTER = 0.65;

const heroPanelSlide = {
  initial: { x: "-100%" },
  animate: { x: 0 },
  transition: { duration: HERO_ENTER, ease: EASE_IN_OUT },
} as const;

/** Entry only (opacity + rise, no scale); the scroll drift lives on the parent. */
const heroPhotoEnter = {
  initial: { opacity: 0, y: REVEAL.rise },
  animate: { opacity: 1, y: 0 },
  transition: { duration: HERO_ENTER, ease: REVEAL.ease },
} as const;

const HERO_PANEL_CLIP_DESKTOP_WIDE =
  "polygon(0 0, 53.5% 0, 53.5% 12%, 46.5% 12%, 46.5% 24%, 39.5% 24%, 39.5% 100%, 0 100%)";

const HERO_PANEL_CLIP_DESKTOP_TABLET =
  "polygon(0 0, 60% 0, 60% 12%, 53% 12%, 53% 24%, 46% 24%, 46% 100%, 0 100%)";

const HERO_PANEL_CLIP_MOBILE =
  "polygon(0 6%, 22% 6%, 22% 3%, 50% 3%, 50% 0, 78% 0, 78% 3%, 100% 3%, 100% 100%, 0 100%)";

const HERO_CONTENT_MAX =
  "w-full max-w-[min(36rem,calc(46vw-var(--gutter)-48px))] xl:max-w-[min(36rem,calc(39.5vw-var(--gutter)-48px))]";

const HERO_TOP_PADDING = "pt-[calc(72px+clamp(32px,6vh,72px))]";
const HERO_BOTTOM_PADDING = "pb-[clamp(32px,6vh,64px)]";

const contentStagger: Variants = {
  hidden: { opacity: 0, y: REVEAL.rise },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: REVEAL.duration,
      ease: REVEAL.ease,
      delay: revealDelay(index, 0.2),
    },
  }),
};

type EditorialHeroProps = {
  stats: HomeStats;
};

export function EditorialHero({ stats }: EditorialHeroProps) {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const [mdUp, setMdUp] = useState(false);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const photoY = useTransform(scrollYProgress, [0, 1], [0, -40]);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const update = () => setMdUp(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return (
    <section
      ref={sectionRef}
      id="welcome"
      data-tone="navy"
      className="relative isolate min-h-0 overflow-hidden bg-navy md:min-h-[100svh]"
    >
      {/* Scrub (scroll drift) on the frame, entry on the inner layer: one
          element never carries both. */}
      <m.div
        className="relative z-0 aspect-[4/3] w-full shrink-0 overflow-hidden md:absolute md:-top-10 md:bottom-[-2.5rem] md:left-[46%] md:right-0 md:aspect-auto xl:left-[39.5%]"
        data-nav-theme="dark"
        style={
          reduceMotion || !mdUp ? undefined : { y: photoY }
        }
      >
        <m.div
          className="absolute inset-0"
          initial={reduceMotion ? false : heroPhotoEnter.initial}
          animate={reduceMotion ? undefined : heroPhotoEnter.animate}
          transition={heroPhotoEnter.transition}
        >
        <Image
          src={HERO_IMAGE_SRC}
          alt={HERO_IMAGE_ALT}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 60vw"
          className="object-cover object-[center_30%] max-md:transform-none"
          unoptimized
        />
        </m.div>
        <div className="pointer-events-none absolute inset-0 bg-navy/12" aria-hidden />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-40 bg-gradient-to-b from-[rgba(20,33,61,0.55)] to-transparent"
          aria-hidden
        />
      </m.div>

      <div
        className="pointer-events-none absolute inset-0 z-[1] hidden overflow-hidden md:block xl:hidden"
        style={{ clipPath: HERO_PANEL_CLIP_DESKTOP_TABLET }}
        aria-hidden
      >
        <m.div
          className="absolute inset-0 bg-navy"
          initial={reduceMotion ? false : heroPanelSlide.initial}
          animate={reduceMotion ? undefined : heroPanelSlide.animate}
          transition={heroPanelSlide.transition}
        />
      </div>
      <div
        className="pointer-events-none absolute inset-0 z-[1] hidden overflow-hidden xl:block"
        style={{ clipPath: HERO_PANEL_CLIP_DESKTOP_WIDE }}
        aria-hidden
      >
        <m.div
          className="absolute inset-0 bg-navy"
          initial={reduceMotion ? false : heroPanelSlide.initial}
          animate={reduceMotion ? undefined : heroPanelSlide.animate}
          transition={heroPanelSlide.transition}
        />
      </div>

      <div className="relative z-[2] md:pointer-events-none md:min-h-[100svh]">
        <div
          className="relative overflow-hidden bg-navy md:hidden"
          style={{ clipPath: HERO_PANEL_CLIP_MOBILE }}
        >
          <m.div
            className="pointer-events-none absolute inset-0 z-0 bg-navy"
            aria-hidden
            initial={reduceMotion ? false : heroPanelSlide.initial}
            animate={reduceMotion ? undefined : heroPanelSlide.animate}
            transition={heroPanelSlide.transition}
          />
          <m.div
            className="relative z-10"
            initial={reduceMotion ? false : heroPanelSlide.initial}
            animate={reduceMotion ? undefined : heroPanelSlide.animate}
            transition={heroPanelSlide.transition}
          >
            <Container
              data-nav-theme="dark"
              className="pointer-events-auto flex flex-col gap-8 py-10"
            >
              <HeroCopy reduceMotion={reduceMotion} />
              <HeroStats
                currencySymbol={stats.currencySymbol}
                totalRaisedDisplay={stats.totalRaisedDisplay}
              />
            </Container>
          </m.div>
        </div>

        <Container
          data-nav-theme="dark"
          className={cn(
            "pointer-events-auto hidden min-h-[100svh] flex-col md:flex",
            HERO_TOP_PADDING,
            HERO_BOTTOM_PADDING,
          )}
        >
          <m.div
            className="hero-glow-drift flex min-h-0 flex-1 flex-col"
            initial={reduceMotion ? false : heroPanelSlide.initial}
            animate={reduceMotion ? undefined : heroPanelSlide.animate}
            transition={heroPanelSlide.transition}
          >
            <div className="flex min-h-0 flex-1 flex-col justify-center">
              <div className={HERO_CONTENT_MAX}>
                <HeroCopy reduceMotion={reduceMotion} />
              </div>
            </div>
            <div className={cn(HERO_CONTENT_MAX, "shrink-0")}>
              <HeroStats
                currencySymbol={stats.currencySymbol}
                totalRaisedDisplay={stats.totalRaisedDisplay}
              />
            </div>
          </m.div>
        </Container>
      </div>
    </section>
  );
}

function HeroCopy({ reduceMotion }: { reduceMotion: boolean | null }) {
  return (
    <div>
      <HighlightHeadline
        className="mt-0 max-w-none md:max-w-[min(36rem,calc(46vw-var(--gutter)-48px))] xl:max-w-[min(36rem,calc(39.5vw-var(--gutter)-48px))]"
        tone="dark"
      >
        <LineReveal
          playOnMount
          delay={0.16}
          lineClassName="text-[length:inherit] leading-[inherit]"
          lines={[
            "Your game.",
            <em key="em">Their future.</em>,
          ]}
        />
      </HighlightHeadline>
      <m.p
        className={cn(editorialBodyOnDark, "mt-6 max-w-[38ch]")}
        custom={0}
        initial={reduceMotion ? false : "hidden"}
        animate={reduceMotion ? undefined : "visible"}
        variants={contentStagger}
      >
        Subscribe, log your latest five scores, and enter the monthly draw while
        your chosen charity receives a meaningful share of every payment.
      </m.p>
      <m.div
        className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-5"
        custom={1}
        initial={reduceMotion ? false : "hidden"}
        animate={reduceMotion ? undefined : "visible"}
        variants={contentStagger}
      >
        <Link
          href="/subscribe"
          className="group/cta motion-cta motion-press type-body inline-flex h-14 min-h-11 w-full items-center justify-center gap-2 rounded-full bg-coral px-9 font-medium text-navy hover:bg-coral-deep sm:w-auto"
        >
          Subscribe now
          <ArrowRight
            className="size-4 transition-transform duration-(--dur-hover) ease-(--ease-hover) group-hover/cta:translate-x-0.5 motion-reduce:transform-none"
            aria-hidden
          />
        </Link>
        <Link
          href="#how-it-works"
          className="motion-link-arrow type-body inline-flex items-center gap-1.5 text-coral underline decoration-coral/80 underline-offset-4 hover:underline"
        >
          See how it works
          <ArrowRight className="size-4" data-arrow aria-hidden />
        </Link>
      </m.div>
    </div>
  );
}

function HeroStats({
  currencySymbol,
  totalRaisedDisplay,
}: {
  currencySymbol: string;
  totalRaisedDisplay: number | null;
}) {
  if (totalRaisedDisplay == null) {
    return null;
  }

  return (
    <HeroImpactAnchor
      currencySymbol={currencySymbol}
      totalRaisedDisplay={totalRaisedDisplay}
    />
  );
}

/**
 * First appearance of the page's impact motif: the cumulative figure, in
 * clay, with what it means in school meals. It recurs in the charities
 * ledger and the closing CTA.
 */
function HeroImpactAnchor({
  currencySymbol,
  totalRaisedDisplay,
}: {
  currencySymbol: string;
  totalRaisedDisplay: number;
}) {
  const reduceMotion = useReducedMotion();
  const meals = schoolMealsFor(totalRaisedDisplay);

  return (
    <m.div
      className="border-t border-cream/15 pt-5"
      custom={2}
      initial={reduceMotion ? false : "hidden"}
      animate={reduceMotion ? undefined : "visible"}
      variants={contentStagger}
    >
      <p className="type-eyebrow text-on-dark-quiet">Raised for partner causes</p>
      <p className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <ImpactCount
          startOnMount
          className="type-subhead text-clay"
          prefix={currencySymbol}
          value={totalRaisedDisplay}
          format={formatAmount}
        />
        {meals > 0 ? (
          <span className="type-body-sm text-on-dark-body">
            ≈ the cost of {formatAmount(meals)} school meals
          </span>
        ) : null}
      </p>
    </m.div>
  );
}
