import type { ReactNode } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type BentoCardProps = {
  title: string;
  className?: string;
  headerAction?: ReactNode;
  children: ReactNode;
};

export function BentoCard({
  title,
  className,
  headerAction,
  children,
}: BentoCardProps) {
  return (
    <Card
      interactive={false}
      className={cn("h-full border-line bg-surface", className)}
    >
      <CardHeader className="flex flex-col items-stretch gap-3 space-y-0 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <CardTitle className="text-base font-sans text-navy">{title}</CardTitle>
        {headerAction ? (
          <div className="flex shrink-0 flex-wrap gap-2">{headerAction}</div>
        ) : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
