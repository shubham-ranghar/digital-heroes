"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useEffectEvent, useState, useTransition } from "react";

import type { ServerTableControls } from "@/components/admin/sortable-data-table";
import {
  applyTableUpdate,
  tableStateToSearch,
  type AdminTableState,
} from "@/lib/admin/pagination";

const SEARCH_DEBOUNCE_MS = 300;

/** Links and navigation for an admin table whose state lives in the URL. */
export function useAdminTableUrl(state: AdminTableState) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function hrefFor(update: Partial<AdminTableState>) {
    return `${pathname}${tableStateToSearch(applyTableUpdate(state, update))}`;
  }

  function navigate(update: Partial<AdminTableState>) {
    startTransition(() => {
      router.replace(hrefFor(update), { scroll: false });
    });
  }

  return { hrefFor, navigate, isPending };
}

/** `SortableDataTable` server-mode controls backed by the URL. */
export function useServerTable(state: AdminTableState) {
  const { hrefFor, navigate, isPending } = useAdminTableUrl(state);

  const controls: ServerTableControls = {
    query: state.q,
    filters: state.filters,
    sortId: state.sort,
    sortDir: state.dir,
    pending: isPending,
    onQueryChange: (q) => navigate({ q }),
    onFiltersChange: (filters) => navigate({ filters }),
    onSortChange: (sort, dir) => navigate({ sort, dir }),
  };

  return { controls, hrefFor };
}

/** Search box value that commits once typing pauses, not on every keystroke. */
export function useDebouncedSearch(
  committed: string,
  onCommit: (value: string) => void,
) {
  const [value, setValue] = useState(committed);
  const commit = useEffectEvent(onCommit);

  useEffect(() => {
    const next = value.trim();
    if (next === committed) {
      return;
    }
    const timer = setTimeout(() => commit(next), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [value, committed]);

  return [value, setValue] as const;
}
