import Link from "next/link";

import { CharityImage } from "@/components/charity/charity-image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Charity } from "@/lib/charity/types";

export function CharityCard({ charity }: { charity: Charity }) {
  const image = charity.images[0];

  return (
    <Card className="h-full">
      <Link href={`/charities/${charity.slug}`} className="flex h-full flex-col">
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-t-[18px] bg-navy/50">
          {image ? (
            <CharityImage
              src={image}
              alt=""
              className="size-full transition-transform duration-300 group-hover/card:scale-[1.02]"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-sm text-slate">
              {charity.name}
            </div>
          )}
          {charity.is_featured ? (
            <Badge
              variant="outline"
              className="absolute top-3 left-3"
            >
              Featured
            </Badge>
          ) : null}
        </div>
        <CardHeader className="space-y-2">
          <CardTitle className="text-base">{charity.name}</CardTitle>
          {charity.category ? (
            <Badge variant="secondary" className="w-fit text-xs font-normal">
              {charity.category}
            </Badge>
          ) : null}
        </CardHeader>
        <CardContent className="flex-1">
          <p className="line-clamp-3 text-sm text-muted-foreground">
            {charity.description ?? "Learn how this partner creates impact."}
          </p>
        </CardContent>
      </Link>
    </Card>
  );
}
