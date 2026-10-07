"use client";

import Image from "next/image";
import Link from "next/link";

import { SectionHeadline } from "@/components/motion/section-headline";
import { RevealStagger, RevealStaggerItem } from "@/components/motion/reveal";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { EditorialCard } from "@/components/ui/editorial-card";
import type { HomepageCharities } from "@/lib/home/charities";
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

function CharityCard({
  name,
  slug,
  description,
  imageSrc,
  featured,
}: {
  name: string;
  slug: string;
  description: string | null;
  imageSrc: string | null;
  featured?: boolean;
}) {
  return (
    <EditorialCard
      notch="top"
      borderClassName="bg-cream/25"
      className={cn(
        "motion-card-hover flex h-full flex-col text-cream",
        featured ? "min-h-[320px]" : "",
      )}
    >
      <article className="flex h-full flex-col bg-surface/40">
        <div className="relative aspect-[16/10] w-full bg-navy/50 sm:aspect-auto sm:min-h-[180px] sm:flex-1">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt=""
              fill
              className="object-cover"
              sizes={featured ? "(max-width: 1024px) 100vw, 50vw" : "240px"}
              unoptimized
            />
          ) : (
            <Image
              src={HERO_IMAGE_SRC}
              alt=""
              fill
              className="object-cover opacity-90"
              sizes={featured ? "(max-width: 1024px) 100vw, 50vw" : "240px"}
            />
          )}
        </div>
        <div className="flex flex-1 flex-col p-6">
          <h3 className="font-sans text-xl font-light tracking-tight text-cream">
            {name}
          </h3>
          <p className={cn("mt-2 flex-1", editorialBodyOnDark)}>
            {description ?? "Programmes funded by member subscriptions."}
          </p>
          <Link href={`/charities/${slug}`} className={cn("mt-4 text-[14px]", editorialLinkOnDark)}>
            ( Visit )
          </Link>
        </div>
      </article>
    </EditorialCard>
  );
}

function CharitiesEmptyState() {
  return (
    <div className="mt-12 border border-cream/15 bg-surface/20 px-6 py-12 text-center">
      <h3 className="font-sans text-2xl font-light text-cream">
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

export function EditorialCharitySpotlight({ data }: EditorialCharitySpotlightProps) {
  const { featured, others, featuredEvents } = data;
  const hasCharities = Boolean(featured);

  return (
    <section
      id="charities"
      data-nav-section
      data-nav-theme="dark"
      className="bg-navy text-cream"
    >
      <Container className="py-16 sm:py-24">
        <SectionHeadline
          label="Charities"
          labelClassName={editorialParenLabelOnDark}
          headlineClassName={cn(editorialDisplayMd, "text-cream")}
          lines={[
            <>
              Causes members <em className="text-coral">fund</em>
            </>,
          ]}
        />

        {!hasCharities ? (
          <CharitiesEmptyState />
        ) : (
          <>
            <RevealStagger
              className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8"
              stagger={0.08}
            >
              <RevealStaggerItem className="lg:col-span-7">
                <CharityCard
                  featured
                  name={featured!.name}
                  slug={featured!.slug}
                  description={featured!.description}
                  imageSrc={featured!.images[0] ?? null}
                />
                {featuredEvents.length > 0 ? (
                  <ul className="mt-6 space-y-2 border-t border-cream/10 pt-4 text-[17px] text-cream/[0.78]">
                    {featuredEvents.slice(0, 3).map((event) => (
                      <li key={event.id}>
                        <span className="text-cream">{event.title}</span>
                        {" · "}
                        {formatPlayedOnLabel(event.event_date)}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className={cn("mt-4", editorialBodyOnDark)}>
                    Upcoming community events will be listed here.
                  </p>
                )}
              </RevealStaggerItem>
              <div className="flex flex-col gap-6 lg:col-span-5">
                {others.map((charity) => (
                  <RevealStaggerItem key={charity.id}>
                    <CharityCard
                      name={charity.name}
                      slug={charity.slug}
                      description={charity.description}
                      imageSrc={charity.images[0] ?? null}
                    />
                  </RevealStaggerItem>
                ))}
              </div>
            </RevealStagger>
            <p className="mt-10 text-center">
              <Link href="/charities" className={editorialLinkOnDark}>
                Browse causes
              </Link>
            </p>
          </>
        )}
      </Container>
    </section>
  );
}
