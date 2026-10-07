import { Skeleton } from "@/components/ui/skeleton";
import { MarketingSection } from "@/components/layout/marketing-section";

export default function LoginLoading() {
  return (
    <MarketingSection variant="cream" className="flex flex-1 items-center py-16">
      <div className="mx-auto w-full max-w-md space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full max-w-sm" />
        <Skeleton className="mt-8 h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full rounded-full" />
      </div>
    </MarketingSection>
  );
}
