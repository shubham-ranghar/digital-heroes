import Link from "next/link";

import { CharityImage } from "@/components/charity/charity-image";
import { MarketingSection } from "@/components/layout/marketing-section";
import { RevealItem, ScrollReveal } from "@/components/home/scroll-reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import type { HomepageCharities } from "@/lib/home/charities";
import { cn } from "@/lib/utils";

type CharitySpotlightSectionProps = {
  data: HomepageCharities;
};

function CharityTile({
  name,
  slug,
  description,
  image,
  featured,
}: {
  name: string;
  slug: string;
  description: string | null;
  image?: string;
  featured?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-[20px] border bg-card shadow-sm",
        featured
          ? "border-status-active/40 md:grid md:grid-cols-2"
          : "border-line",
      )}
    >
      <div className="relative min-h-[180px] bg-navy/30 md:min-h-[220px]">
        {image ? (
          <CharityImage src={image} alt="" className="absolute inset-0 size-full" />
        ) : (
          <div className="flex h-full min-h-[180px] items-center justify-center bg-gradient-to-br from-status-active/15 to-navy/60 text-sm text-slate">
            Partner cause
          </div>
        )}
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy/70 to-transparent"
          aria-hidden
        />
        {featured ? (
          <Badge variant="outline" className="absolute left-4 top-4">
            Featured
          </Badge>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5 md:justify-center">
        <h3 className="font-sans text-xl text-foreground">{name}</h3>
        <p className="line-clamp-4 flex-1 text-sm text-muted-foreground">
          {description ?? "Community-led programmes funded by member subscriptions."}
        </p>
        <Button
          variant={featured ? "default" : "secondary"}
          size="sm"
          className="w-fit"
          render={<Link href={`/charities/${slug}`} />}
        >
          Learn more
        </Button>
      </div>
    </div>
  );
}

export function CharitySpotlightSection({ data }: CharitySpotlightSectionProps) {
  const { featured, others } = data;

  return (
    <MarketingSection variant="cream" id="charities">
      <SectionHeading
        eyebrow="Charity impact"
        title="Causes our members fund"
        description="Choose your partner at signup. Leaf accents mark featured work we’re amplifying right now."
        className="mb-10"
      />

      {!featured ? (
        <div className="rounded-[20px] border border-dashed border-line p-10 text-center">
          <p className="text-sm text-muted-foreground">
            Charity partners are being onboarded.{" "}
            <Link
              href="/charities"
              className="text-coral underline-offset-4 hover:underline"
            >
              Browse causes
            </Link>
          </p>
        </div>
      ) : (
        <ScrollReveal stagger className="space-y-5">
          <RevealItem>
            <CharityTile
              featured
              name={featured.name}
              slug={featured.slug}
              description={featured.description}
              image={featured.images[0]}
            />
          </RevealItem>
          {others.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((charity) => (
                <RevealItem key={charity.id}>
                  <CharityTile
                    name={charity.name}
                    slug={charity.slug}
                    description={charity.description}
                    image={charity.images[0]}
                  />
                </RevealItem>
              ))}
            </div>
          ) : null}
        </ScrollReveal>
      )}

      <div className="mt-8">
        <Button variant="outline" render={<Link href="/charities" />}>
          View all charities
        </Button>
      </div>
    </MarketingSection>
  );
}
