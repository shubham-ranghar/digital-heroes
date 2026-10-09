import { describe, expect, it } from "vitest";

import {
  applyTableUpdate,
  ilikeAnyOf,
  isPageOutOfRange,
  lastPage,
  pageOffset,
  parsePage,
  parsePageJson,
  parseTableState,
  tableStateToSearch,
  type AdminTableState,
} from "@/lib/admin/pagination";

const base: AdminTableState = {
  page: 3,
  q: "asha",
  filters: { role: "admin" },
  sort: "email",
  dir: "desc",
};

describe("parsePage", () => {
  it("accepts positive integers and falls back to 1", () => {
    expect(parsePage("4")).toBe(4);
    expect(parsePage(undefined)).toBe(1);
    expect(parsePage("0")).toBe(1);
    expect(parsePage("-2")).toBe(1);
    expect(parsePage("2.5")).toBe(1);
    expect(parsePage("abc")).toBe(1);
    expect(parsePage(["5", "6"])).toBe(5);
  });
});

describe("parseTableState", () => {
  const config = {
    filters: { role: ["subscriber", "admin"] },
    sorts: ["email", "name"],
  };

  it("keeps only allowed filter and sort values", () => {
    const state = parseTableState(
      { role: "owner", sort: "password", dir: "desc", q: "  x  ", page: "2" },
      config,
    );
    expect(state).toEqual({ page: 2, q: "x", filters: {}, sort: null, dir: "desc" });
  });

  it("reads valid params", () => {
    const state = parseTableState({ role: "admin", sort: "name" }, config);
    expect(state.filters).toEqual({ role: "admin" });
    expect(state.sort).toBe("name");
    expect(state.dir).toBe("asc");
  });

  it("caps search length", () => {
    expect(parseTableState({ q: "a".repeat(500) }).q).toHaveLength(100);
  });
});

describe("tableStateToSearch", () => {
  it("omits defaults", () => {
    expect(
      tableStateToSearch({ page: 1, q: "", filters: {}, sort: null, dir: "asc" }),
    ).toBe("");
  });

  it("round-trips through parseTableState", () => {
    const search = tableStateToSearch(base);
    const params = Object.fromEntries(new URLSearchParams(search.slice(1)));
    expect(
      parseTableState(params, { filters: { role: ["admin"] }, sorts: ["email"] }),
    ).toEqual(base);
  });
});

describe("applyTableUpdate", () => {
  it("resets to page 1 when search, filters or sort change", () => {
    expect(applyTableUpdate(base, { q: "ravi" }).page).toBe(1);
    expect(applyTableUpdate(base, { filters: {} }).page).toBe(1);
    expect(applyTableUpdate(base, { sort: "name", dir: "asc" }).page).toBe(1);
  });

  it("keeps everything else on a page change", () => {
    expect(applyTableUpdate(base, { page: 4 })).toEqual({ ...base, page: 4 });
  });
});

describe("page arithmetic", () => {
  it("computes offsets and last page", () => {
    expect(pageOffset(1)).toBe(0);
    expect(pageOffset(3)).toBe(50);
    expect(lastPage(0)).toBe(1);
    expect(lastPage(25)).toBe(1);
    expect(lastPage(26)).toBe(2);
  });

  it("flags pages past the end of a non-empty result only", () => {
    expect(isPageOutOfRange(3, 50)).toBe(true);
    expect(isPageOutOfRange(2, 50)).toBe(false);
    expect(isPageOutOfRange(9, 0)).toBe(false);
  });
});

describe("parsePageJson", () => {
  it("reads total and rows, tolerating null", () => {
    expect(parsePageJson({ total: 3, rows: [{ id: "a" }] })).toEqual({
      total: 3,
      rows: [{ id: "a" }],
    });
    expect(parsePageJson(null)).toEqual({ total: 0, rows: [] });
  });
});

describe("ilikeAnyOf", () => {
  it("quotes the term and drops quotes and backslashes", () => {
    expect(ilikeAnyOf(["name", "email"], 'a.b,c"\\')).toBe(
      'name.ilike."%a.b,c%",email.ilike."%a.b,c%"',
    );
  });
});
