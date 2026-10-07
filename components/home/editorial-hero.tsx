"use client";

import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  useInView,
} from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { HighlightHeadline } from "@/components/editorial/highlight-headline";
import { SteppedEdge } from "@/components/editorial/stepped-edge";
import { LineReveal } from "@/components/motion/line-reveal";
import { Container } from "@/components/layout/container";
import { useCountUp } from "@/hooks/use-count-up";
import { HERO_IMAGE_ALT, HERO_IMAGE_SRC } from "@/lib/home/hero-image";
import type { HomeStats } from "@/lib/home/stats";
import {
  buttonMotionProps,
  DURATION,
  EASE_IN_OUT,
  EASE_OUT,
} from "@/lib/motion";
import { tabularImpact } from "@/lib/typography";
import { cn } from "@/lib/utils";

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

const contentStagger = {
  hidden: { opacity: 0, y: 16 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: DURATION.base,
      ease: EASE_OUT,
      delay: 0.4 + index * 0.1,
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
      className="relative isolate min-h-0 overflow-x-hidden bg-navy md:min-h-[100svh]"
    >
      <motion.div
        className="relative z-0 aspect-[4/3] w-full shrink-0 md:absolute md:inset-y-0 md:left-[46%] md:right-0 md:aspect-auto xl:left-[39.5%]"
        data-nav-theme="dark"
        initial={reduceMotion ? false : { opacity: 0, scale: 1.06 }}
        animate={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
        transition={{ duration: DURATION.hero, ease: EASE_OUT }}
        style={
          reduceMotion || !mdUp ? undefined : { y: photoY }
        }
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
        <div className="pointer-events-none absolute inset-0 bg-navy/12" aria-hidden />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-40 bg-gradient-to-b from-[rgba(20,33,61,0.55)] to-transparent"
          aria-hidden
        />
      </motion.div>

      <motion.div
        className="pointer-events-none absolute inset-0 z-[1] hidden bg-navy md:block xl:hidden"
        style={{ clipPath: HERO_PANEL_CLIP_DESKTOP_TABLET }}
        aria-hidden
        initial={reduceMotion ? false : { x: "-100%" }}
        animate={reduceMotion ? undefined : { x: 0 }}
        transition={{ duration: DURATION.hero, ease: EASE_IN_OUT }}
      />
      <motion.div
        className="pointer-events-none absolute inset-0 z-[1] hidden bg-navy xl:block"
        style={{ clipPath: HERO_PANEL_CLIP_DESKTOP_WIDE }}
        aria-hidden
        initial={reduceMotion ? false : { x: "-100%" }}
        animate={reduceMotion ? undefined : { x: 0 }}
        transition={{ duration: DURATION.hero, ease: EASE_IN_OUT }}
      />

      <div className="relative z-[2] md:pointer-events-none md:min-h-[100svh]">
        <motion.div
          className="bg-navy md:hidden"
          style={{ clipPath: HERO_PANEL_CLIP_MOBILE }}
          initial={reduceMotion ? false : { x: "-100%" }}
          animate={reduceMotion ? undefined : { x: 0 }}
          transition={{ duration: DURATION.hero, ease: EASE_IN_OUT }}
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
        </motion.div>

        <Container
          data-nav-theme="dark"
          className={cn(
            "pointer-events-auto hidden min-h-[100svh] flex-col md:flex",
            HERO_TOP_PADDING,
            HERO_BOTTOM_PADDING,
          )}
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
        </Container>
      </div>
      <SteppedEdge
        position="bottom"
        color="var(--navy)"
        className="relative z-[2]"
        playOnMount
      />
    </section>
  );
}

function HeroCopy({ reduceMotion }: { reduceMotion: boolean | null }) {
  return (
    <div>
      <HighlightHeadline
        className="mt-0 max-w-none text-[clamp(40px,11vw,56px)] leading-[0.98] md:max-w-[min(36rem,calc(46vw-var(--gutter)-48px))] md:text-[clamp(44px,6.2vw,104px)] xl:max-w-[min(36rem,calc(39.5vw-var(--gutter)-48px))]"
        tone="dark"
      >
        <LineReveal
          playOnMount
          delay={0.4}
          lineClassName="text-[length:inherit] leading-[inherit]"
          lines={[
            "Your game.",
            <em key="em">Their future.</em>,
          ]}
        />
      </HighlightHeadline>
      <motion.p
        className="mt-6 max-w-[34ch] text-[17px] leading-relaxed text-cream/[0.78]"
        custom={0}
        initial={reduceMotion ? false : "hidden"}
        animate={reduceMotion ? undefined : "visible"}
        variants={contentStagger}
      >
        Subscribe, log your latest five scores, and enter the monthly draw while
        your chosen charity receives a meaningful share of every payment.
      </motion.p>
      <motion.div
        className="mt-8 flex flex-wrap items-center gap-5"
        custom={1}
        initial={reduceMotion ? false : "hidden"}
        animate={reduceMotion ? undefined : "visible"}
        variants={contentStagger}
      >
        <motion.div {...buttonMotionProps(reduceMotion)}>
          <Link
            href="/subscribe"
            className="inline-flex h-12 items-center rounded-full bg-coral px-8 text-base font-medium text-navy hover:bg-coral-deep motion-transition-colors"
          >
            Subscribe now
          </Link>
        </motion.div>
        <Link
          href="#how-it-works"
          className="motion-link-arrow inline-flex items-center gap-1.5 text-[17px] font-normal text-coral underline decoration-coral/80 underline-offset-4 hover:underline"
        >
          See how it works
          <ArrowRight className="size-4" data-arrow aria-hidden />
        </Link>
      </motion.div>
    </div>
  );
}

function HeroStats({
  currencySymbol,
  totalRaisedDisplay,
}: {
  currencySymbol: string;
  totalRaisedDisplay: number;
}) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLParagraphElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });

  const { value } = useCountUp(totalRaisedDisplay, {
    decimals: 0,
    enabled: inView,
    duration: 1600,
  });

  const formattedRaised = useMemo(
    () =>
      new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(
        Math.round(value),
      ),
    [value],
  );

  return (
    <motion.p
      ref={ref}
      className={cn("text-sm", tabularImpact)}
      custom={2}
      initial={reduceMotion ? false : "hidden"}
      animate={reduceMotion ? undefined : "visible"}
      variants={contentStagger}
    >
      <span
        className="block text-[12px] font-normal uppercase tracking-[0.12em] text-cream/70"
      >
        Raised for partner causes
      </span>
      <span className="mt-1 block font-sans text-3xl font-light text-coral">
        {currencySymbol}
        {formattedRaised}
      </span>
    </motion.p>
  );
}
