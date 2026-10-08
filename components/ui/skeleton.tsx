import * as React from "react";

import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "skeleton-shimmer rounded-xl bg-sand/70 in-[.section-navy]:bg-cream/10 in-[.bg-navy]:bg-cream/10",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
