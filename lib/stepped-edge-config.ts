/** Ziggurat column step counts (1–3 units tall). */
export const STEPPED_EDGE_COLUMNS_FIVE = [1, 2, 3, 2, 1] as const;

/** Footer / compact boundary (3 columns). */
export const STEPPED_EDGE_COLUMNS_THREE = [1, 3, 1] as const;

/** Middle-out reveal order for 5 columns. */
export const STEPPED_EDGE_ORDER_FIVE = [2, 1, 3, 0, 4] as const;

export const STEPPED_EDGE_ORDER_THREE = [1, 0, 2] as const;

export const STEPPED_EDGE_STAGGER = 0.12;

export function columnRevealProgress(
  scrollProgress: number,
  orderIndex: number,
  stagger = STEPPED_EDGE_STAGGER,
  columnCount = 5,
): number {
  const start = orderIndex * stagger;
  const span = 1 - (columnCount - 1) * stagger;
  if (span <= 0) {
    return scrollProgress >= start ? 1 : 0;
  }
  return Math.min(1, Math.max(0, (scrollProgress - start) / span));
}
