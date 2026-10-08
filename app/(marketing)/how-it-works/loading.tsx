import { MarketingPageSkeleton } from "@/components/layout/marketing-page-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function HowItWorksLoading() {
  return (
    <MarketingPageSkeleton>
      <div className="grid gap-6 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-56 rounded-[20px]" />
        ))}
      </div>
    </MarketingPageSkeleton>
  );
}
