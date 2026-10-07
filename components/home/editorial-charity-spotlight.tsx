"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";

import { SectionHeadline } from "@/components/motion/section-headline";
import { RevealStagger, RevealStaggerItem } from "@/components/motion/reveal";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { EditorialCard } from "@/components/ui/editorial-card";
import type { HomepageCharities } from "@/lib/home/charities";
import type { Charity } from "@/lib/charity/types";
import {
  editorialBodyOnDark,
  editorialDisplayMd,
  editorialLinkOnDark,
  editorialParenLabelOnDark,
} from "@/lib/typography-editorial";
import { HERO_IMAGE_SRC } from "@/lib/home/hero-image";
import { formatPlayedOnLabel } from "@/lib/scores/dates";
import { cn } from "@/lib/utils";

type EditorialCharitySpotlightProps = {
  data: HomepageCharities;
};

type CharityCardProps = {
  name: string;
  slug: string;
  description: string | null;
  imageSrc: string | null;
  featured?: boolean;
};

function CharityCard({
  name,
  slug,
  description,
  imageSrc,
  featured,
}: CharityCardProps) {
  return (
    <EditorialCard
      notch="top"
      borderClassName={featured ? "bg-coral/40" : "bg-cream/20"}
      className="motion-card-hover flex h-full min-h-0 flex-col text-cream"
    >
      <article className="flex h-full min-h-0 flex-col overflow-hidden rounded-[inherit] bg-surface/30">
        <div className="relative aspect-[16/10] w-full shrink-0 bg-navy/50">
          {featured ? (
            <span
              className="absolute left-4 top-4 z-10 rounded-full border border-cream/25 bg-navy/80 px-3 py-1 font-sans text-xs font-medium tracking-wide text-cream backdrop-blur-sm"
            >
              Featured
            </span>
          ) : null}
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              unoptimized
            />
          ) : (
            <Image
              src={HERO_IMAGE_SRC}
              alt=""
              fill
              className="object-cover opacity-90"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          )}
        </div>
        <div className="flex min-h-0 flex-1 flex-col p-5 sm:p-6">
          <h3 className="font-sans text-lg font-medium leading-snug tracking-tight text-cream sm:text-xl">
            {name}
          </h3>
          <p
            className={cn(
              "mt-2 line-clamp-3 min-h-[4.5rem] flex-1 text-[15px] leading-relaxed sm:min-h-[4.875rem]",
              editorialBodyOnDark,
            )}
          >
            {description ?? "Programmes funded by member subscriptions."}
          </p>
          <Link
            href={`/charities/${slug}`}
            className={cn("mt-4 inline-flex w-fit text-[14px]", editorialLinkOnDark)}
          >
            ( Visit )
          </Link>
        </div>
      </article>
    </EditorialCard>
  );
}

function CharitiesEmptyState() {
  return (
    <div className="mt-12 rounded-[20px] border border-cream/15 bg-surface/15 px-6 py-12 text-center sm:px-10">
      <h3 className="font-sans text-2xl font-medium text-cream">
        No causes listed yet
      </h3>
      <p className={cn("mx-auto mt-3 max-w-md", editorialBodyOnDark)}>
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

function FeaturedEventsPanel({
  charityName,
  events,
}: {
  charityName: string;
  events: HomepageCharities["featuredEvents"];
}) {
  return (
    <div className="mt-10 rounded-[20px] border border-cream/15 bg-cream/[0.06] p-6 sm:p-8">
      <h3 className="font-sans text-sm font-medium uppercase tracking-wide text-cream/65">
        Upcoming at {charityName}
      </h3>
      {events.length > 0 ? (
        <ul className="mt-4 space-y-3 text-[15px] leading-relaxed text-cream/[0.82]">
          {events.slice(0, 3).map((event) => (
            <li
              key={event.id}
              className="flex flex-col gap-0.5 border-b border-cream/10 pb-3 last:border-0 last:pb-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
            >
              <span className="font-medium text-cream">{event.title}</span>
              <span className="shrink-0 text-cream/70">
                {formatPlayedOnLabel(event.event_date)}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className={cn("mt-3", editorialBodyOnDark)}>
          Upcoming community events will be listed here.
        </p>
      )}
    </div>
  );
}

export function EditorialCharitySpotlight({ data }: EditorialCharitySpotlightProps) {
  const { featured, others, featuredEvents } = data;
  const hasCharities = Boolean(featured);

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
      <Container className="py-16 sm:py-20 lg:py-24">
        <header className="mx-auto max-w-3xl text-center">
          <SectionHeadline
            label="Charities"
            labelClassName={editorialParenLabelOnDark}
            headlineClassName={cn(editorialDisplayMd, "text-cream text-balance")}
            lines={[
              <>Causes members</>,
              <><em className="text-coral">fund</em></>,
            ]}
          />
          <p
            className={cn(
              "mx-auto mt-5 max-w-[52ch] text-balance text-[17px] leading-relaxed",
              editorialBodyOnDark,
            )}
          >
            Every membership sends a share of your fee to the partner you choose at
            signup. Explore causes below and visit a profile to learn more.
          </p>
        </header>

        {!hasCharities ? (
          <CharitiesEmptyState />
        ) : (
          <>
            <RevealStagger
              className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-7 xl:grid-cols-4 xl:gap-8"
              stagger={0.06}
            >
              {charities.map((charity) => (
                <RevealStaggerItem key={charity.id} className="min-h-0 h-full">
                  <CharityCard
                    featured={charity.id === featured!.id}
                    name={charity.name}
                    slug={charity.slug}
                    description={charity.description}
                    imageSrc={charity.images[0] ?? null}
                  />
                </RevealStaggerItem>
              ))}
            </RevealStagger>

            <FeaturedEventsPanel
              charityName={featured!.name}
              events={featuredEvents}
            />

            <div className="mt-12 flex justify-center">
              <Button
                variant="secondary"
                size="lg"
                className="border-cream/35 text-cream hover:border-cream hover:bg-cream/10"
                render={<Link href="/charities" />}
              >
                Browse causes
              </Button>
            </div>
          </>
        )}
      </Container>
    </section>
  );
}
