"use client";

import type { FaqItem } from "@/lib/faq/content";
import { cn } from "@/lib/utils";

type FaqAccordionProps = {
  items: FaqItem[];
  className?: string;
};

export function FaqAccordion({ items, className }: FaqAccordionProps) {
  return (
    <div className={cn("divide-y divide-line rounded-[20px] border border-line bg-surface", className)}>
      {items.map((item) => (
        <details key={item.id} className="group px-5 py-4">
          <summary
            className="cursor-pointer list-none font-medium text-foreground marker:content-none [&::-webkit-details-marker]:hidden"
          >
            <span className="flex items-center justify-between gap-4">
              {item.question}
              <span
                className="text-coral transition-transform group-open:rotate-45"
                aria-hidden
              >
                +
              </span>
            </span>
          </summary>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {item.answer}
          </p>
        </details>
      ))}
    </div>
  );
}
