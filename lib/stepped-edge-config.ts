/** Ziggurat column step counts (1–3 units tall). */
export const STEPPED_EDGE_COLUMNS_FIVE = [1, 2, 3, 2, 1] as const;

/** Footer / compact boundary (3 columns). */
export const STEPPED_EDGE_COLUMNS_THREE = [1, 3, 1] as const;

/** Middle-out reveal order for 5 columns. */
export const STEPPED_EDGE_ORDER_FIVE = [2, 1, 3, 0, 4] as const;

export const STEPPED_EDGE_ORDER_THREE = [1, 0, 2] as const;

/** How far each column's slice spills into its neighbours' (0 = strictly sequential). */
export const STEPPED_EDGE_OVERLAP = 0.6;

/**
 * Scroll-progress slice for the column revealed `orderIndex`-th: roughly
 * i/cols → (i+1)/cols, widened by the overlap and spaced so the last column
 * finishes exactly at 1.
 */
export function columnScrollRange(
  orderIndex: number,
  columnCount: number,
  overlap = STEPPED_EDGE_OVERLAP,
): readonly [number, number] {
  if (columnCount <= 1) {
    return [0, 1];
  }
  const width = Math.min(1, (1 + overlap) / columnCount);
  const start = (orderIndex * (1 - width)) / (columnCount - 1);
  return [start, start + width];
}
