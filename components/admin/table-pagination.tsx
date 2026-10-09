import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { lastPage } from "@/lib/admin/pagination";
import { tabularImpact } from "@/lib/typography";
import { cn } from "@/lib/utils";

type TablePaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  noun: { singular: string; plural: string };
  hrefForPage: (page: number) => string;
};

const countFormat = new Intl.NumberFormat("en-IN");

function PageButton({
  href,
  label,
  children,
}: {
  href: string | null;
  label: string;
  children: React.ReactNode;
}) {
  if (!href) {
    return (
      <Button type="button" size="sm" variant="secondary" disabled aria-label={label}>
        {children}
      </Button>
    );
  }
  return (
    <Button
      size="sm"
      variant="secondary"
      aria-label={label}
      render={<Link href={href} scroll={false} />}
    >
      {children}
    </Button>
  );
}

export function TablePagination({
  page,
  pageSize,
  total,
  noun,
  hrefForPage,
}: TablePaginationProps) {
  const pages = lastPage(total, pageSize);
  const first = (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);
  const label = total === 1 ? noun.singular : noun.plural;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p
        className={cn("text-xs text-muted-foreground", tabularImpact)}
        aria-live="polite"
      >
        {total === 0
          ? `0 ${noun.plural}`
          : `${countFormat.format(first)}–${countFormat.format(last)} of ${countFormat.format(total)} ${label}`}
      </p>
      {pages > 1 ? (
        <nav aria-label="Pagination" className="flex items-center gap-2">
          <PageButton
            href={page > 1 ? hrefForPage(page - 1) : null}
            label="Previous page"
          >
            <ChevronLeft className="size-4" aria-hidden />
            Previous
          </PageButton>
          <span className={cn("text-xs text-muted-foreground", tabularImpact)}>
            Page {countFormat.format(page)} of {countFormat.format(pages)}
          </span>
          <PageButton
            href={page < pages ? hrefForPage(page + 1) : null}
            label="Next page"
          >
            Next
            <ChevronRight className="size-4" aria-hidden />
          </PageButton>
        </nav>
      ) : null}
    </div>
  );
}
