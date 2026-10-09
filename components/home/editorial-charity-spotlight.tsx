"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useMemo } from "react";

import { ImpactCount } from "@/components/home/impact-count";
import { SectionHeadline } from "@/components/motion/section-headline";
import { Reveal, RevealStagger, RevealStaggerItem } from "@/components/motion/reveal";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { resolveCharityPhotos } from "@/lib/charity/imagery";
import type { Charity } from "@/lib/charity/types";
import type { HomepageCharities } from "@/lib/home/charities";
import { getMemberImpact, schoolMealsFor, SCHOOL_MEAL_SOURCE } from "@/lib/impact";
import { CURRENCY_SYMBOL, formatAmount } from "@/lib/money";
import { formatPlayedOnLabel } from "@/lib/scores/dates";
import {
  editorialBodyOnDark,
  editorialDisplayMd,
  editorialEyebrow,
  editorialFigure,
  editorialParenLabelOnDark,
  editorialRoll,
  editorialTitle,
} from "@/lib/typography-editorial";
import { cn } from "@/lib/utils";

type EditorialCharitySpotlightProps = {
  data: HomepageCharities;
  /** Cumulative raised (₹), or null when it can't be computed honestly. */
  totalRaised: number | null;
};

/**
 * Second appearance of the impact motif, on its clay surface: what members
 * have raised, what that is in school meals, and what scale buys.
 */
function ImpactLedger({ totalRaised }: { totalRaised: number | null }) {
  const perHundred = getMemberImpact().mealsPerHundredMembersMonthly;

  return (
    <Reveal className="h-full">
      <aside
        aria-label="Impact so far"
        className="flex h-full flex-col justify-between gap-8 bg-clay p-6 text-navy sm:p-8 lg:p-10"
      >
        {totalRaised != null ? (
          <div>
            <p className={editorialEyebrow}>Raised for partner causes so far</p>
            <ImpactCount
              className={cn(editorialFigure, "mt-3 block text-navy")}
              prefix={CURRENCY_SYMBOL}
              value={totalRaised}
              format={formatAmount}
            />
            <p className="type-body-sm mt-3 text-navy/85">
              ≈ the cost of {formatAmount(schoolMealsFor(totalRaised))} school
              meals.
            </p>
          </div>
        ) : null}
        <div className={cn(totalRaised != null && "border-t border-navy/20 pt-6")}>
          <p className={editorialTitle}>
            Every 100 members ≈ {formatAmount(perHundred)} school meals a month.
          </p>
          <p className="type-caption mt-2 text-navy/75">
            At the minimum 10% share. {SCHOOL_MEAL_SOURCE}.
          </p>
        </div>
      </aside>
    </Reveal>
  );
}

/**
 * Partner names as the page's largest type. Each row carries its tinted
 * photo; hover (or focus) warms the name to clay and lets colour back into
 * the photo.
 */
function CauseRoll({
  charities,
  featuredId,
}: {
  charities: Charity[];
  featuredId: string;
}) {
  const photos = useMemo(() => resolveCharityPhotos(charities), [charities]);

  return (
    <RevealStagger as="ol" className="mt-16 border-b border-cream/15 lg:mt-24" stagger={0.06}>
      {charities.map((charity, index) => {
        const photo = photos.get(charity.id)!;
        return (
          <RevealStaggerItem as="li" key={charity.id} className="border-t border-cream/15">
            <Link
              href={`/charities/${charity.slug}`}
              className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-5 gap-y-3 py-7 outline-offset-4 md:grid-cols-[3.5rem_minmax(0,1fr)_auto] md:gap-x-8 md:py-10"
            >
              <span
                className="type-caption hidden self-start pt-3 text-on-dark-quiet md:block"
                aria-hidden
              >
                ( {String(index + 1).padStart(2, "0")} )
              </span>
              <span className="min-w-0">
                <span
                  className={cn(
                    editorialRoll,
                    "block text-cream transition-colors duration-(--dur-hover) ease-(--ease-hover) group-hover:text-clay group-focus-visible:text-clay",
                  )}
                >
                  {charity.name}
                </span>
                <span className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  {charity.category ? (
                    <span className={cn(editorialEyebrow, "text-clay")}>
                      {charity.category}
                    </span>
                  ) : null}
                  {charity.id === featuredId ? (
                    <span className={cn(editorialEyebrow, "text-on-dark-quiet")}>
                      Featured
                    </span>
                  ) : null}
                  {charity.description ? (
                    <span className="type-body-sm hidden text-on-dark-body sm:inline">
                      {charity.description}
                    </span>
                  ) : null}
                </span>
              </span>
              <span className="flex items-center gap-4 md:gap-6">
                <span className="photo-tint relative block aspect-[4/3] w-24 shrink-0 sm:w-36 lg:w-56">
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 96px, (max-width: 1024px) 144px, 224px"
                    unoptimized={!photo.src.startsWith("/")}
                  />
                </span>
                <ArrowUpRight
                  className="hidden size-6 text-cream transition-transform duration-(--dur-hover) ease-(--ease-hover) group-hover:-translate-y-0.5 group-hover:translate-x-0.5 md:block motion-reduce:transform-none"
                  aria-hidden
                />
              </span>
            </Link>
          </RevealStaggerItem>
        );
      })}
    </RevealStagger>
  );
}

function CharitiesEmptyState() {
  return (
    <div className="mt-12 border border-cream/15 px-6 py-12 text-center sm:px-10">
      <h3 className={cn(editorialTitle, "text-cream")}>No causes listed yet</h3>
      <p className={cn(editorialBodyOnDark, "mx-auto mt-3")}>
        Partner listings will show here once charities are added to the platform.
      </p>
      <Button
        variant="ghost"
        size="lg"
        className="mt-8 border border-cream/30 text-cream hover:bg-cream/10"
        render={<Link href="/charities" />}
      >
        Browse causes
      </Button>
    </div>
  );
}

function FeaturedEvents({
  charityName,
  events,
}: {
  charityName: string;
  events: HomepageCharities["featuredEvents"];
}) {
  if (events.length === 0) {
    return null;
  }
  return (
    <div className="mt-14 grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-8">
      <h3 className={cn(editorialEyebrow, "text-on-dark-quiet")}>
        Upcoming at {charityName}
      </h3>
      <ul className="type-body-sm text-on-dark-body">
        {events.slice(0, 3).map((event) => (
          <li
            key={event.id}
            className="flex flex-col gap-0.5 border-b border-cream/10 py-3 first:pt-0 last:border-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
          >
            <span className="font-medium text-cream">{event.title}</span>
            <span className="shrink-0 text-on-dark-quiet">
              {formatPlayedOnLabel(event.event_date)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function EditorialCharitySpotlight({
  data,
  totalRaised,
}: EditorialCharitySpotlightProps) {
  const { featured, others, featuredEvents } = data;

  const charities = useMemo((): Charity[] => {
    if (!featured) {
      return [];
    }
    return [featured, ...others];
  }, [featured, others]);

  return (
    <section
      id="charities"
      data-nav-section
      data-nav-theme="dark"
      className="bg-navy text-cream"
    >
      <Container className="py-16 sm:py-20 lg:py-28">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-stretch lg:gap-12">
          <header className="lg:col-span-7">
            <SectionHeadline
              align="left"
              label="Charities"
              labelClassName={editorialParenLabelOnDark}
              headlineClassName={cn(editorialDisplayMd, "text-cream")}
              lines={[
                <>Causes members</>,
                <>
                  <em className="text-coral">fund</em>
                </>,
              ]}
            />
            <p className={cn(editorialBodyOnDark, "mt-6")}>
              Every membership sends a share of its fee to the partner its
              member chooses at signup, at least 10%, and more if they like.
              These are the causes on the platform today.
            </p>
          </header>
          <div className="lg:col-span-5">
            <ImpactLedger totalRaised={totalRaised} />
          </div>
        </div>

        {charities.length === 0 ? (
          <CharitiesEmptyState />
        ) : (
          <>
            <CauseRoll charities={charities} featuredId={featured!.id} />
            <FeaturedEvents charityName={featured!.name} events={featuredEvents} />
            <div className="mt-14 flex justify-center">
              <Button
                variant="secondary"
                size="lg"
                className="border-cream/35 text-cream hover:border-cream hover:bg-cream/10"
                render={<Link href="/charities" />}
              >
                Browse all causes
              </Button>
            </div>
          </>
        )}
      </Container>
    </section>
  );
}
