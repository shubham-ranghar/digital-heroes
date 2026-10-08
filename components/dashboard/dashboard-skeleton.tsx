import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl" aria-busy="true" aria-label="Loading dashboard">
      <Skeleton className="mb-2 h-4 w-24" />
      <Skeleton className="mb-8 h-10 w-64 max-w-full" />
      <div className="grid auto-rows-min gap-4 md:grid-cols-12">
        <Skeleton className="min-h-[200px] md:col-span-4" />
        <Skeleton className="min-h-[320px] md:col-span-8" />
        <Skeleton className="min-h-[260px] md:col-span-6" />
        <Skeleton className="min-h-[200px] md:col-span-3" />
        <Skeleton className="min-h-[200px] md:col-span-3" />
      </div>
    </div>
  );
}
