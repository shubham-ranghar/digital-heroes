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
  as?: "h1" | "h2";
  className?: string;
};

/** Dashboard / admin page title block in the marketing editorial voice. */
export function AppPageHeading({
  label,
  title,
  description,
  as: Heading = "h2",
  className,
}: AppPageHeadingProps) {
  return (
    <div className={cn("max-w-2xl space-y-3", className)}>
      <ParenLabel className="block text-navy/70">{label}</ParenLabel>
      <Heading className={editorialAppTitle}>{title}</Heading>
      {description ? <p className={bodyLead}>{description}</p> : null}
    </div>
  );
}
