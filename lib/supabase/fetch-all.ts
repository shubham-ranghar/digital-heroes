type BatchResponse<T> = {
  data: T[] | null;
  error: { message: string; code?: string } | null;
};

/**
 * Reads every row of a query in batches. A single PostgREST request returns at
 * most the project's "Max rows" setting (1,000 by default) and silently drops
 * the rest. `fetchBatch` must order by a unique key so batches don't overlap
 * or skip rows. Stops at the first empty batch, so it stays correct even if
 * "Max rows" is set below `batchSize`.
 */
export async function fetchAllRows<T>(
  fetchBatch: (from: number, to: number) => PromiseLike<BatchResponse<T>>,
  batchSize = 1000,
): Promise<T[]> {
  const rows: T[] = [];
  for (;;) {
    const { data, error } = await fetchBatch(rows.length, rows.length + batchSize - 1);
    if (error) {
      // Range past the end of the result.
      if (error.code === "PGRST103") {
        return rows;
      }
      throw new Error(error.message);
    }
    if (!data?.length) {
      return rows;
    }
    rows.push(...data);
  }
}
