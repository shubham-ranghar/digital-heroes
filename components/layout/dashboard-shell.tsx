import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type DashboardShellProps = {
  className?: string;
  children: ReactNode;
};

/** Subscriber / admin layout: deep background, soft cards. */
export function DashboardShell({ className, children }: DashboardShellProps) {
  return (
    <div className={cn("shell-dashboard min-h-[50vh] px-4 py-10 sm:px-6", className)}>
      <div className="mx-auto w-full max-w-6xl">{children}</div>
    </div>
  );
}
