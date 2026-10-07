import { cn } from "@/lib/utils";

/** Large Inter display — editorial homepage headlines. */
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
