"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, Search } from "lucide-react";

import { useDebouncedSearch } from "@/components/admin/use-admin-table-url";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  editorialTableHead,
  editorialTableNumber,
} from "@/lib/typography-editorial";
import { tabularImpact } from "@/lib/typography";
import { cn } from "@/lib/utils";

export type SortableColumn<T> = {
  id: string;
  header: string;
  sortable?: boolean;
  sortValue?: (row: T) => string | number;
  cell: (row: T) => React.ReactNode;
  className?: string;
  /** Figures (counts, amounts) — sans, tabular, right-aligned voice. */
  numeric?: boolean;
};

export type TableFilterGroup<T> = {
  id: string;
  label: string;
  options: { value: string; label: string }[];
  /** Does `row` match the chosen option? Unused in server mode. */
  predicate?: (row: T, value: string) => boolean;
};

/** Controls for a table whose rows are one page already filtered and sorted by the server. */
export type ServerTableControls = {
  query: string;
  filters: Record<string, string>;
  sortId: string | null;
  sortDir: "asc" | "desc";
  pending?: boolean;
  onQueryChange: (query: string) => void;
  onFiltersChange: (filters: Record<string, string>) => void;
  onSortChange: (sortId: string, sortDir: "asc" | "desc") => void;
};

type SortableDataTableProps<T> = {
  rows: T[];
  columns: SortableColumn<T>[];
  getRowId: (row: T) => string;
  dense?: boolean;
  emptyMessage?: string;
  /** Primary action shown with the empty state. */
  emptyAction?: React.ReactNode;
  /** Admin tables default to the navy header band. */
  headerTone?: "light" | "navy";
  /** Text to match the search input against; providing it shows the input. */
  searchText?: (row: T) => string;
  searchPlaceholder?: string;
  /** Chip groups above the table; one active option per group ("all" = off). */
  filterGroups?: TableFilterGroup<T>[];
  /** Server mode: search, filters and sort are reported here, not applied locally. */
  server?: ServerTableControls;
  /** Replaces the row count line (e.g. with pagination). */
  footer?: React.ReactNode;
};

export function SortableDataTable<T>({
  rows,
  columns,
  getRowId,
  dense = true,
  emptyMessage = "No rows to show.",
  emptyAction,
  headerTone = "navy",
  searchText,
  searchPlaceholder = "Search…",
  filterGroups,
  server,
  footer,
}: SortableDataTableProps<T>) {
  const navyHeader = headerTone === "navy";
  const [localSortId, setLocalSortId] = useState<string | null>(
    columns[0]?.id ?? null,
  );
  const [localSortDir, setLocalSortDir] = useState<"asc" | "desc">("asc");
  const [localFilters, setLocalFilters] = useState<Record<string, string>>({});
  const [query, setQuery] = useDebouncedSearch(server?.query ?? "", (value) =>
    server?.onQueryChange(value),
  );

  const sortId = server ? server.sortId : localSortId;
  const sortDir = server ? server.sortDir : localSortDir;
  const activeFilters = server ? server.filters : localFilters;

  const filteredRows = useMemo(() => {
    if (server) {
      return rows;
    }
    let next = rows;
    const needle = query.trim().toLowerCase();
    if (searchText && needle) {
      next = next.filter((row) =>
        searchText(row).toLowerCase().includes(needle),
      );
    }
    for (const group of filterGroups ?? []) {
      const value = activeFilters[group.id];
      const predicate = group.predicate;
      if (value && predicate) {
        next = next.filter((row) => predicate(row, value));
      }
    }
    return next;
  }, [server, rows, query, searchText, filterGroups, activeFilters]);

  const sortedRows = useMemo(() => {
    if (server || !sortId) {
      return filteredRows;
    }
    const column = columns.find((col) => col.id === sortId);
    if (!column?.sortValue) {
      return filteredRows;
    }
    const getter = column.sortValue;
    return [...filteredRows].sort((a, b) => {
      const av = getter(a);
      const bv = getter(b);
      if (typeof av === "number" && typeof bv === "number") {
        return sortDir === "asc" ? av - bv : bv - av;
      }
      return sortDir === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
  }, [server, filteredRows, columns, sortId, sortDir]);

  function toggleSort(columnId: string, sortable?: boolean) {
    if (!sortable) {
      return;
    }
    const nextDir =
      sortId === columnId ? (sortDir === "asc" ? "desc" : "asc") : "asc";
    if (server) {
      server.onSortChange(columnId, nextDir);
      return;
    }
    setLocalSortId(columnId);
    setLocalSortDir(nextDir);
  }

  function toggleFilter(groupId: string, value: string) {
    const next = { ...activeFilters };
    if (next[groupId] === value) {
      delete next[groupId];
    } else {
      next[groupId] = value;
    }
    if (server) {
      server.onFiltersChange(next);
      return;
    }
    setLocalFilters(next);
  }

  const hasControls = Boolean(searchText || filterGroups?.length);
  const appliedQuery = server ? server.query : query.trim();
  const isFiltered =
    appliedQuery.length > 0 || Object.keys(activeFilters).length > 0;

  return (
    <div className="space-y-3">
      {hasControls ? (
        <div className="flex flex-col gap-3">
          {searchText ? (
            <div className="relative max-w-xs">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                className="pl-9"
              />
            </div>
          ) : null}
          {filterGroups?.length ? (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              {filterGroups.map((group) => (
                <div
                  key={group.id}
                  role="group"
                  aria-label={group.label}
                  className="flex flex-wrap items-center gap-1.5"
                >
                  <span className="text-xs text-muted-foreground">
                    {group.label}
                  </span>
                  {group.options.map((option) => {
                    const active = activeFilters[group.id] === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        aria-pressed={active}
                        onClick={() => toggleFilter(group.id, option.value)}
                        className={cn(
                          "motion-interactive inline-flex h-8 items-center rounded-full border px-3 text-xs font-medium",
                          active
                            ? "border-navy bg-navy text-cream"
                            : "border-line bg-surface text-navy hover:bg-sand/60",
                        )}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      <div
        aria-busy={server?.pending || undefined}
        className={cn(
          "min-w-0 overflow-x-auto rounded-[20px] border bg-surface transition-opacity",
          navyHeader ? "border-navy" : "border-line",
          server?.pending && "opacity-60",
        )}
      >
        <Table className="min-w-[36rem]">
          <TableHeader>
            <TableRow
              className={cn(
                "hover:bg-transparent",
                navyHeader && "border-navy bg-navy hover:bg-navy",
              )}
            >
              {columns.map((column) => {
                const active = sortId === column.id;
                const Icon = active
                  ? sortDir === "asc"
                    ? ArrowUp
                    : ArrowDown
                  : ArrowUpDown;
                return (
                  <TableHead
                    key={column.id}
                    className={cn(
                      dense && cn("h-9 px-3", editorialTableHead),
                      navyHeader ? "text-cream/80" : "text-navy/70",
                      column.className,
                    )}
                  >
                    {column.sortable ? (
                      <button
                        type="button"
                        className={cn(
                          "inline-flex items-center gap-1",
                          navyHeader ? "hover:text-cream" : "hover:text-navy",
                        )}
                        onClick={() => toggleSort(column.id, column.sortable)}
                      >
                        {column.header}
                        <Icon className="size-3 opacity-70" aria-hidden />
                      </button>
                    ) : (
                      column.header
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedRows.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columns.length} className="h-32">
                  <div className="flex flex-col items-center gap-3 text-center">
                    <p className="text-sm text-muted-foreground">
                      {isFiltered
                        ? "Nothing matches your search or filters."
                        : emptyMessage}
                    </p>
                    {!isFiltered && emptyAction ? emptyAction : null}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              sortedRows.map((row) => (
                // Hover is a surface shift, so rows respond without borders moving.
                <TableRow
                  key={getRowId(row)}
                  className={cn("hover:bg-sand/40", dense && "text-sm")}
                >
                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      className={cn(
                        dense ? "px-3 py-2" : undefined,
                        column.numeric && editorialTableNumber,
                        column.className,
                      )}
                    >
                      {column.cell(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {footer ?? (
        <p
          className={cn("text-xs text-muted-foreground", tabularImpact)}
          aria-live="polite"
        >
          {isFiltered
            ? `${sortedRows.length} of ${rows.length} ${rows.length === 1 ? "row" : "rows"}`
            : `${rows.length} ${rows.length === 1 ? "row" : "rows"}`}
        </p>
      )}
    </div>
  );
}
