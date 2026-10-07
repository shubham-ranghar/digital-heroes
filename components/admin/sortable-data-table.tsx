"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type SortableColumn<T> = {
  id: string;
  header: string;
  sortable?: boolean;
  sortValue?: (row: T) => string | number;
  cell: (row: T) => React.ReactNode;
  className?: string;
};

type SortableDataTableProps<T> = {
  rows: T[];
  columns: SortableColumn<T>[];
  getRowId: (row: T) => string;
  dense?: boolean;
  emptyMessage?: string;
};

export function SortableDataTable<T>({
  rows,
  columns,
  getRowId,
  dense = true,
  emptyMessage = "No rows to show.",
}: SortableDataTableProps<T>) {
  const [sortId, setSortId] = useState<string | null>(columns[0]?.id ?? null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const sortedRows = useMemo(() => {
    if (!sortId) {
      return rows;
    }
    const column = columns.find((col) => col.id === sortId);
    if (!column?.sortValue) {
      return rows;
    }
    const getter = column.sortValue;
    return [...rows].sort((a, b) => {
      const av = getter(a);
      const bv = getter(b);
      if (typeof av === "number" && typeof bv === "number") {
        return sortDir === "asc" ? av - bv : bv - av;
      }
      return sortDir === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
  }, [rows, columns, sortId, sortDir]);

  function toggleSort(columnId: string, sortable?: boolean) {
    if (!sortable) {
      return;
    }
    if (sortId === columnId) {
      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
      return;
    }
    setSortId(columnId);
    setSortDir("asc");
  }

  return (
    <div className="rounded-[16px] border border-line bg-surface">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
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
                    dense ? "h-9 px-3 text-xs uppercase tracking-wide text-slate" : undefined,
                    column.className,
                  )}
                >
                  {column.sortable ? (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 hover:text-navy"
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
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-sm text-muted-foreground"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            sortedRows.map((row) => (
              <TableRow key={getRowId(row)} className={dense ? "text-sm" : undefined}>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    className={cn(dense ? "px-3 py-2" : undefined, column.className)}
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
  );
}
