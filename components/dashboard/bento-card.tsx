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
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-4">
        <CardTitle className="text-base font-sans text-navy">{title}</CardTitle>
        {headerAction}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
