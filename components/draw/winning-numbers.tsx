import { tabularImpact } from "@/lib/typography";
import { cn } from "@/lib/utils";

type WinningNumbersProps = {
  numbers: number[];
  className?: string;
  size?: "sm" | "md";
};

/** Winning numbers as staggered balls (CSS-only reveal; static under reduced motion). */
export function WinningNumbers({
  numbers,
  className,
  size = "md",
}: WinningNumbersProps) {
  return (
    <ol
      className={cn("flex flex-wrap items-center gap-2 sm:gap-3", className)}
      aria-label={`Winning numbers: ${numbers.join(", ")}`}
    >
      {numbers.map((value, index) => (
        <li
          // Duplicates are allowed in a draw, so the index is part of the key.
          key={`${index}-${value}`}
          className={cn(
            "motion-ball-in flex items-center justify-center rounded-full border border-coral/30 bg-gradient-to-b from-surface to-cream font-sans text-navy shadow-[var(--shadow-resting),inset_0_-2px_0_rgba(242,84,45,0.18)]",
            size === "md" ? "size-12 text-lg sm:size-14 sm:text-xl" : "size-9 text-sm",
            tabularImpact,
          )}
          style={{ "--ball-i": index } as React.CSSProperties}
        >
          {value}
        </li>
      ))}
    </ol>
  );
}
