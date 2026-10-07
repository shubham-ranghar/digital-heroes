import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type LegalDocumentProps = {
  title: string;
  lastUpdated: string;
  children: ReactNode;
  className?: string;
};

export function LegalDocument({
  title,
  lastUpdated,
  children,
  className,
}: LegalDocumentProps) {
  return (
    <article className={cn("prose-legal space-y-6 text-foreground", className)}>
      <header className="space-y-2 border-b border-line pb-6">
        <h1 className="font-sans text-display-sm font-semibold">{title}</h1>
        <p className="text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
      </header>
      <div className="space-y-4 text-sm leading-relaxed text-muted-foreground [&_h2]:mt-8 [&_h2]:font-sans [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-foreground [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
        {children}
      </div>
    </article>
  );
}
