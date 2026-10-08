import { MarketingPageSkeleton } from "@/components/layout/marketing-page-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function ContactLoading() {
  return (
    <MarketingPageSkeleton>
      <div className="max-w-lg space-y-4">
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-12 w-40 rounded-full" />
      </div>
    </MarketingPageSkeleton>
  );
}
