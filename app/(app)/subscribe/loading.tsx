import { Skeleton } from "@/components/ui/skeleton";

export default function SubscribeLoading() {
  return (
    <div data-tone="navy" className="section-navy hero-glow flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-32 w-full rounded-[20px]" />
        <Skeleton className="h-10 w-full rounded-full" />
      </div>
    </div>
  );
}
