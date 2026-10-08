import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { CharityImage } from "@/components/charity/charity-image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Charity } from "@/lib/charity/types";

/** Directory card — one lift on the card plus a slow image zoom (CSS only). */
export function CharityCard({ charity }: { charity: Charity }) {
  const image = charity.images[0];

  return (
    <Card interactive className="group/charity h-full gap-0 py-0">
      <Link
        href={`/charities/${charity.slug}`}
        className="flex h-full flex-col rounded-[20px] focus-visible:outline-offset-4"
      >
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-t-[18px] bg-navy/50">
          {image ? (
            <CharityImage
              src={image}
              alt=""
              className="size-full transition-transform duration-700 ease-[var(--ease-out)] group-hover/charity:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover/charity:scale-100"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-sm text-slate">
              {charity.name}
            </div>
          )}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-navy/25 to-transparent"
            aria-hidden
          />
          {charity.is_featured ? (
            <Badge className="absolute top-3 left-3 shadow-[var(--shadow-resting)]">
              Featured
            </Badge>
          ) : null}
        </div>
        <CardHeader className="gap-2 pt-5">
          {charity.category ? (
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate">
              {charity.category}
            </p>
          ) : null}
          <CardTitle className="text-lg">{charity.name}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col pt-2 pb-5">
          <p className="line-clamp-3 flex-1 text-sm text-muted-foreground">
            {charity.description ?? "Learn how this partner creates impact."}
          </p>
          <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-navy">
            View cause
            <ArrowRight
              className="size-4 text-coral transition-transform duration-[var(--dur-fast)] ease-[var(--ease-out)] group-hover/charity:translate-x-1 motion-reduce:transform-none"
              aria-hidden
            />
          </span>
        </CardContent>
      </Link>
    </Card>
  );
}
