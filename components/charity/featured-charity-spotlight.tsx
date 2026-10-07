import Link from "next/link";

import { CharityImage } from "@/components/charity/charity-image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Charity } from "@/lib/charity/types";

type FeaturedCharitySpotlightProps = {
  charity: Charity;
};

/** Homepage spotlight — leaf accent, impact-first (not sports club). */
export function FeaturedCharitySpotlight({
  charity,
}: FeaturedCharitySpotlightProps) {
  const image = charity.images[0];

  return (
    <div className="grid gap-8 overflow-hidden rounded-[20px] border border-status-active/35 bg-surface/80 lg:grid-cols-2">
      <div className="relative min-h-[220px] bg-navy/40 lg:min-h-full">
        {image ? (
          <CharityImage
            src={image}
            alt=""
            className="absolute inset-0 size-full"
          />
        ) : (
          <div className="flex size-full min-h-[220px] items-center justify-center p-8 text-center text-slate">
            Featured partner
          </div>
        )}
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy/80 via-transparent to-transparent"
          aria-hidden
        />
      </div>

      <div className="flex flex-col justify-center gap-5 p-6 sm:p-8">
        <Badge variant="outline" className="w-fit">
          Featured charity
        </Badge>
        <h3 className="font-sans text-display-sm font-semibold tracking-tightish text-cream">
          {charity.name}
        </h3>
        <p className="text-body-lg leading-relaxed text-slate">
          {charity.description ??
            "This month we’re highlighting a partner whose work turns everyday play into lasting community impact."}
        </p>
        <div className="flex flex-wrap gap-3">
          <Button render={<Link href={`/charities/${charity.slug}`} />}>
            Meet {charity.name.split(" ")[0]}
          </Button>
          <Button
            variant="secondary"
            render={<Link href="/charities" />}
          >
            Browse all causes
          </Button>
        </div>
      </div>
    </div>
  );
}
