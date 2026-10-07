import { Skeleton } from "@/components/ui/skeleton";
import { MarketingSection } from "@/components/layout/marketing-section";

export default function CharitiesLoading() {
  return (
    <MarketingSection variant="cream" className="py-12 sm:py-16">
      <Skeleton className="mb-4 h-4 w-24" />
      <Skeleton className="mb-8 h-10 w-72 max-w-full" />
      <Skeleton className="mb-8 h-10 w-full max-w-md" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-64 rounded-[20px]" />
        ))}
      </div>
    </MarketingSection>
  );
}
