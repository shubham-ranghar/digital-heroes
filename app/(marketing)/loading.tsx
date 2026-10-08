import { Skeleton } from "@/components/ui/skeleton";

/**
 * Home (`/`) fallback: the hero's frame (navy, full height from md, image
 * column on the right), so a navigation home commits on the prefetched shell
 * and the hero fills in place. Marketing pages with their own `loading.tsx`
 * use that instead; static pages never suspend.
 */
export default function MarketingLoading() {
  return (
    <section
      data-tone="navy"
      aria-busy="true"
      aria-label="Loading"
      className="relative isolate min-h-0 overflow-hidden bg-navy md:min-h-[100svh]"
    >
      <div className="aspect-[4/3] w-full bg-cream/5 md:absolute md:inset-y-0 md:left-[46%] md:right-0 md:aspect-auto xl:left-[39.5%]" />
      <div className="relative px-4 pb-12 pt-8 sm:px-6 md:flex md:min-h-[100svh] md:w-[46%] md:flex-col md:justify-end md:px-10 md:pb-16 md:pt-[var(--header-height)] xl:w-[39.5%]">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="mt-6 h-14 w-full max-w-md" />
        <Skeleton className="mt-3 h-14 w-4/5 max-w-sm" />
        <Skeleton className="mt-6 h-5 w-full max-w-sm" />
        <Skeleton className="mt-8 h-11 w-44 rounded-full" />
      </div>
    </section>
  );
}
