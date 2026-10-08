import { cn } from "@/lib/utils";

/** Large Bagoss display — editorial homepage headlines. */
export const editorialDisplay = cn(
  "font-sans font-light tracking-[-0.03em] text-balance",
  "text-[clamp(2.75rem,6.5vw,6rem)] leading-[0.98]",
);

export const editorialDisplayMd = cn(
  "font-sans font-light tracking-[-0.03em]",
  "text-[clamp(2rem,4vw,3.5rem)] leading-[1.02]",
);

export const editorialStatement = cn(
  "font-sans font-light tracking-[-0.03em] text-balance",
  "text-[clamp(1.75rem,3.2vw,3.25rem)] leading-[1.05]",
);

export const editorialMenuLink = cn(
  "font-sans font-light tracking-[-0.02em] text-navy transition-colors",
  "text-[clamp(2rem,5vw,3.5rem)] leading-[1.05]",
);

export const editorialParenLabel =
  "font-sans text-[14px] tracking-wide";

export const editorialParenLabelOnDark = "text-cream/70";

export const editorialBodyOnDark =
  "text-[17px] leading-relaxed text-cream/[0.78]";

export const editorialLinkOnDark =
  "text-coral underline decoration-coral/80 underline-offset-4 font-normal";

export const editorialAccent = "font-serif italic font-normal text-coral not-italic:font-serif";

/**
 * App page title — the marketing headline voice at utility scale: light sans
 * with the emphasis word (<em>) in Austin italic.
 */
export const editorialAppTitleVoice = cn(
  "font-sans font-light tracking-[-0.03em] text-balance text-navy",
  "[&_em]:font-serif [&_em]:italic [&_em]:font-normal [&_em]:tracking-normal",
);

// Plain concat: tailwind-merge reads custom `text-display-*` sizes as colours.
export const editorialAppTitle = `${editorialAppTitleVoice} text-display-md leading-tight`;

/** Hero figures (winnings, pools, shares) — Austin italic in coral, as on How you win. */
export const editorialKeyNumber =
  "font-serif italic font-normal leading-none text-coral tabular-nums lining-nums";

/** Numeric table cells — the same serif voice, kept navy so small text holds AA contrast. */
export const editorialTableNumber =
  "font-serif italic text-[15px] text-navy tabular-nums lining-nums";

/**
 * Column headers on utility tables. Small caps render at ~70% of the font
 * size, so 16px lands close to the old 12px uppercase labels.
 */
export const editorialTableHead =
  "font-sans text-[16px] font-normal tracking-[0.06em] [font-variant-caps:all-small-caps]";
