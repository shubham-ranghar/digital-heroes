import { Skeleton } from "@/components/ui/skeleton";
import { MarketingSection } from "@/components/layout/marketing-section";

export default function CharityDetailLoading() {
  return (
    <>
      <MarketingSection variant="navy" className="pb-10 pt-10">
        <Skeleton className="mb-6 h-9 w-32 bg-cream/20" />
        <Skeleton className="h-10 w-3/4 max-w-lg bg-cream/20" />
        <Skeleton className="mt-4 h-20 w-full max-w-3xl bg-cream/10" />
      </MarketingSection>
      <MarketingSection variant="cream">
        <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
          <Skeleton className="h-64 rounded-[20px]" />
          <Skeleton className="h-72 rounded-[20px]" />
        </div>
      </MarketingSection>
    </>
  );
}
