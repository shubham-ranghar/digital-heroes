import { PageOpenEdge } from "@/components/motion/page-open-edge";

/**
 * Root template wraps the route-group layouts (and their headers), so it adds
 * no wrapper element. Page enters live in the group templates via
 * `RouteTransition`; dashboard/admin use `AppRouteFade`.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PageOpenEdge />
      {children}
    </>
  );
}
