import { MarketingPageShell } from "@/components/layout/marketing-page-shell";
import { Skeleton } from "@/components/ui/skeleton";

export default function WinnersLoading() {
  return (
    <MarketingPageShell>
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-4 h-4 w-full max-w-xl" />
        <Skeleton className="mt-10 h-64 w-full rounded-[20px]" />
      </div>
    </MarketingPageShell>
  );
}
