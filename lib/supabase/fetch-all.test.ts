import { describe, expect, it } from "vitest";

import { fetchAllRows } from "@/lib/supabase/fetch-all";

function fakeTable(size: number, maxRows: number) {
  const rows = Array.from({ length: size }, (_, index) => index);
  const calls: [number, number][] = [];
  const fetchBatch = async (from: number, to: number) => {
    calls.push([from, to]);
    const end = Math.min(to + 1, from + maxRows);
    return { data: rows.slice(from, end), error: null };
  };
  return { rows, calls, fetchBatch };
}

describe("fetchAllRows", () => {
  it("reads past the per-request row cap", async () => {
    const table = fakeTable(2500, 1000);
    expect(await fetchAllRows(table.fetchBatch)).toEqual(table.rows);
    expect(table.calls).toEqual([
      [0, 999],
      [1000, 1999],
      [2000, 2999],
      [2500, 3499],
    ]);
  });

  it("stays complete when the server cap is below the batch size", async () => {
    const table = fakeTable(1200, 500);
    expect(await fetchAllRows(table.fetchBatch)).toEqual(table.rows);
  });

  it("treats an out-of-range error as the end", async () => {
    const result = await fetchAllRows(async (from) =>
      from === 0
        ? { data: [1, 2], error: null }
        : { data: null, error: { message: "range", code: "PGRST103" } },
    );
    expect(result).toEqual([1, 2]);
  });

  it("throws other errors", async () => {
    await expect(
      fetchAllRows(async () => ({ data: null, error: { message: "boom" } })),
    ).rejects.toThrow("boom");
  });
});
