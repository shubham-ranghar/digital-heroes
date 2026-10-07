import { Container } from "@/components/layout/container";
import { Skeleton } from "@/components/ui/skeleton";

export function FeaturedCharitySkeleton() {
  return (
    <section className="bg-navy">
      <Container className="py-16">
        <Skeleton className="mb-8 h-10 w-64 max-w-full bg-cream/10" />
        <Skeleton className="h-64 w-full bg-cream/10 sm:h-80" />
      </Container>
    </section>
  );
}
