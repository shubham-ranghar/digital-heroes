/**
 * The hero's navy panel steps in at 60% of the width (below xl) and 53.5%
 * (xl+) at its top step — see the panel clips in `editorial-hero.tsx`.
 * Sections below the fold hang their navy masses off that same vertical line
 * so the hero's split carries down the page.
 *
 * Six tracks at lg+: left gutter · tier · 24px · tier · 48px · step column.
 * The step column is a percentage of the full-bleed section (as the hero clip
 * is) and runs to the viewport edge, so anything placed in it bleeds right.
 */
export const STEP_LINE_GRID =
  "lg:grid-cols-[max(var(--gutter),calc(50vw-960px+var(--gutter)))_minmax(0,1fr)_1.5rem_minmax(0,1fr)_3rem_40%] xl:grid-cols-[max(var(--gutter),calc(50vw-960px+var(--gutter)))_minmax(0,1fr)_1.5rem_minmax(0,1fr)_3rem_46.5%]";

/** Gutter that also tracks the 1920px `Container` cap on ultra-wide screens. */
export const EDGE_PAD_X =
  "px-[max(var(--gutter),calc(50vw-960px+var(--gutter)))]";
