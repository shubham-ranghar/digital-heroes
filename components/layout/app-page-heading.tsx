import type { ReactNode } from "react";

import { ParenLabel } from "@/components/editorial/paren-label";
import { bodyLead } from "@/lib/typography";
import { editorialAppTitle } from "@/lib/typography-editorial";
import { cn } from "@/lib/utils";

type AppPageHeadingProps = {
  /** Paren eyebrow, e.g. "Member" renders "( Member )". */
  label: string;
  /** Wrap the emphasis word in <em> for the Austin italic treatment. */
  title: ReactNode;
  description?: ReactNode;
  /** Status pill rendered beside the eyebrow (e.g. subscription access). */
  pill?: ReactNode;
  /** Primary action(s), right-aligned on wide viewports. */
  actions?: ReactNode;
  as?: "h1" | "h2";
  className?: string;
};

/**
 * The one page-title block for every dashboard / admin page: eyebrow, title,
 * description — plus optional pill and actions. Pages must not hand-roll
 * their own header markup, so the pattern cannot drift.
 */
export function AppPageHeading({
  label,
  title,
  description,
  pill,
  actions,
  as: Heading = "h2",
  className,
}: AppPageHeadingProps) {
  const block = (
    <div className="max-w-2xl space-y-3">
      {pill ? (
        <div className="flex flex-wrap items-center gap-3">
          <ParenLabel className="block text-navy/70">{label}</ParenLabel>
          {pill}
        </div>
      ) : (
        <ParenLabel className="block text-navy/70">{label}</ParenLabel>
      )}
      <Heading className={editorialAppTitle}>{title}</Heading>
      {description ? <p className={bodyLead}>{description}</p> : null}
    </div>
  );

  if (!actions) {
    return <div className={className}>{block}</div>;
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      {block}
      <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row">
        {actions}
      </div>
    </div>
  );
}
