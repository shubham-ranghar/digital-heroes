import { bodyLead, headingSection } from "@/lib/typography";
import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
};

/** Marketing / dashboard section title block. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "max-w-2xl space-y-3",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow ? (
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate">
          {eyebrow}
        </p>
      ) : null}
      <h2 className={headingSection}>{title}</h2>
      {description ? <p className={bodyLead}>{description}</p> : null}
    </div>
  );
}
