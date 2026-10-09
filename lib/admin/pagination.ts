export const ADMIN_PAGE_SIZE = 25;

const MAX_SEARCH_LENGTH = 100;

export type SortDirection = "asc" | "desc";

export type SearchParamsRecord = Record<string, string | string[] | undefined>;

/** URL-backed state of a server-paginated admin table. */
export type AdminTableState = {
  page: number;
  q: string;
  /** Active filter values keyed by URL param; absent key = no filter. */
  filters: Record<string, string>;
  /** Server sort key, or null for the list's default order. */
  sort: string | null;
  dir: SortDirection;
};

export type PageResult<T> = {
  rows: T[];
  total: number;
};

type TableStateConfig = {
  /** Allowed values per filter param; anything else is ignored. */
  filters?: Record<string, readonly string[]>;
  sorts?: readonly string[];
};

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function parsePage(value: string | string[] | undefined): number {
  const raw = firstParam(value);
  if (!raw || !/^\d+$/.test(raw)) {
    return 1;
  }
  const page = Number(raw);
  return Number.isSafeInteger(page) && page >= 1 ? page : 1;
}

export function parseTableState(
  searchParams: SearchParamsRecord,
  config: TableStateConfig = {},
): AdminTableState {
  const filters: Record<string, string> = {};
  for (const [key, allowed] of Object.entries(config.filters ?? {})) {
    const value = firstParam(searchParams[key]);
    if (value && allowed.includes(value)) {
      filters[key] = value;
    }
  }

  const sortParam = firstParam(searchParams.sort);
  const sort = sortParam && config.sorts?.includes(sortParam) ? sortParam : null;

  return {
    page: parsePage(searchParams.page),
    q: (firstParam(searchParams.q) ?? "").trim().slice(0, MAX_SEARCH_LENGTH),
    filters,
    sort,
    dir: firstParam(searchParams.dir) === "desc" ? "desc" : "asc",
  };
}

/** Query string (with leading "?", or "") for a table state; defaults are omitted. */
export function tableStateToSearch(state: AdminTableState): string {
  const params = new URLSearchParams();
  if (state.q) {
    params.set("q", state.q);
  }
  for (const key of Object.keys(state.filters).sort()) {
    params.set(key, state.filters[key]);
  }
  if (state.sort) {
    params.set("sort", state.sort);
    params.set("dir", state.dir);
  }
  if (state.page > 1) {
    params.set("page", String(state.page));
  }
  const search = params.toString();
  return search ? `?${search}` : "";
}

/** Applies a change; anything other than a page change returns to page 1. */
export function applyTableUpdate(
  state: AdminTableState,
  update: Partial<AdminTableState>,
): AdminTableState {
  const next = { ...state, ...update };
  if (update.page === undefined) {
    next.page = 1;
  }
  return next;
}

export function pageOffset(page: number, pageSize = ADMIN_PAGE_SIZE): number {
  return (Math.max(1, page) - 1) * pageSize;
}

export function lastPage(total: number, pageSize = ADMIN_PAGE_SIZE): number {
  return Math.max(1, Math.ceil(total / pageSize));
}

/** True when the requested page is past the end of a non-empty result. */
export function isPageOutOfRange(
  page: number,
  total: number,
  pageSize = ADMIN_PAGE_SIZE,
): boolean {
  return total > 0 && page > lastPage(total, pageSize);
}

/** Reads the `{ total, rows }` JSON returned by the admin list SQL functions. */
export function parsePageJson(data: unknown): PageResult<Record<string, unknown>> {
  const value = (data ?? {}) as { total?: unknown; rows?: unknown };
  return {
    total: Number(value.total ?? 0) || 0,
    rows: Array.isArray(value.rows) ? (value.rows as Record<string, unknown>[]) : [],
  };
}

/**
 * PostgREST `or` filter matching `term` anywhere in any of `columns`. The value
 * is double-quoted so commas, dots and parentheses in it can't break the
 * filter syntax; quotes and backslashes are dropped rather than escaped.
 */
export function ilikeAnyOf(columns: readonly string[], term: string): string {
  const value = term.replace(/["\\]/g, "");
  return columns.map((column) => `${column}.ilike."%${value}%"`).join(",");
}
