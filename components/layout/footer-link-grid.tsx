"use client";

import { FooterNavLink } from "@/components/layout/footer-nav-link";
import { Container } from "@/components/layout/container";
import { RevealStagger, RevealStaggerItem } from "@/components/motion/reveal";
import type { FooterColumn } from "@/lib/footer-links";
import { editorialParenLabel } from "@/lib/typography-editorial";
import { cn } from "@/lib/utils";

type FooterLinkGridProps = {
  columns: FooterColumn[];
};

function FooterColumnContent({ column }: { column: FooterColumn }) {
  return (
    <>
      <p className={cn(editorialParenLabel, "font-medium text-slate")}>
        ( {column.label} )
      </p>
      <ul className="mt-4 flex flex-col gap-0.5">
        {column.links.map((link) => (
          <li key={`${column.label}-${link.href}`}>
            <FooterNavLink
              href={link.href}
              label={link.label}
              external={link.external}
            />
          </li>
        ))}
      </ul>
    </>
  );
}

export function FooterLinkGrid({ columns }: FooterLinkGridProps) {
  const visibleColumns = columns.filter((column) => column.links.length > 0);
  const columnCount = visibleColumns.length;
  const gridClass =
    columnCount <= 3
      ? "grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10"
      : "grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10";

  return (
    <div data-tone="cream" className="bg-sand text-navy">
      <Container className="py-14 md:py-20 lg:py-24">
        <RevealStagger className={gridClass} stagger={0.06}>
          {visibleColumns.map((column) => (
            <RevealStaggerItem key={column.label} as="div" offsetY={16}>
              <FooterColumnContent column={column} />
            </RevealStaggerItem>
          ))}
        </RevealStagger>
      </Container>
    </div>
  );
}
