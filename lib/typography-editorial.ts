import { cn } from "@/lib/utils";

/**
 * Marketing type roles. Each maps to a `.type-*` token class in globals.css
 * (size, leading, tracking, weight); call sites add colour and layout only.
 */

/** Hero display — 72px+, heaviest weight (500), −0.035em, 0.94 leading. */
export const editorialDisplay = "type-display text-balance";

/** Partner charity names in the cause roll — the biggest type on the page. */
export const editorialRoll = "type-roll text-balance";

/** Section headings — 48–72px, one weight lighter than the hero (400). */
export const editorialDisplayMd = "type-heading text-balance";

/** Statement / lead sentences — 32–48px subhead. */
export const editorialStatement = "type-subhead text-balance";

/** Card, step and plan titles. */
export const editorialTitle = "type-title";

/** Large impact numbers (₹ raised, meals) — tabular, display tracking. */
export const editorialFigure = "type-figure";

/** Caps eyebrow (+0.08em). */
export const editorialEyebrow = "type-eyebrow";

/** The one accent voice — Austin italic, rationed to two uses on home. */
export const editorialAccentVoice = "type-accent text-coral";

export const editorialMenuLink = cn(
  "font-sans font-light tracking-[-0.02em] text-navy transition-colors",
  "text-[clamp(2rem,5vw,3.5rem)] leading-[1.05]",
);

export const editorialParenLabel = "type-caption font-sans";

export const editorialParenLabelOnDark = "text-on-dark-quiet";

/** Body copy on navy — 18px, 1.55, 80% white, 62ch measure. */
export const editorialBodyOnDark = "type-body measure text-on-dark-body";

/** Body copy on light surfaces. */
export const editorialBody = "type-body measure text-navy/80";

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

/**
 * Key figures (winnings, pools, shares) — Bagoss sans in coral. Austin italic
 * is reserved for page titles; data stays sans and tabular so it scans and
 * aligns.
 */
export const editorialKeyNumber =
  "font-sans font-medium leading-none text-coral tabular-nums lining-nums";

/** Numeric table cells — sans, tabular, navy so small text holds AA contrast. */
export const editorialTableNumber =
  "font-sans text-[15px] text-navy tabular-nums lining-nums";

/**
 * Column headers on utility tables. Small caps render at ~70% of the font
 * size, so 16px lands close to the old 12px uppercase labels.
 */
export const editorialTableHead =
  "font-sans text-[16px] font-normal tracking-[0.06em] [font-variant-caps:all-small-caps]";
