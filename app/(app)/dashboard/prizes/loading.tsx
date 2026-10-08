import { Skeleton } from "@/components/ui/skeleton";

export default function PrizesLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-4 w-full max-w-md" />
      <Skeleton className="h-48 w-full rounded-[20px]" />
    </div>
  );
}
