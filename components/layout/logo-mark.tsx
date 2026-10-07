import { cn } from "@/lib/utils";

type LogoMarkProps = {
  className?: string;
  title?: string;
};

/** Compact navbar mark — inherits `currentColor` from the logo link. */
export function LogoMark({ className, title = "digital.HEROES" }: LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 36 36"
      width={36}
      height={36}
      className={cn("shrink-0", className)}
      role="img"
      aria-label={title}
    >
      <rect
        x="1"
        y="1"
        width="34"
        height="34"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <text
        x="18"
        y="23"
        textAnchor="middle"
        fontSize="14"
        fontFamily="var(--font-bagoss-standard)"
        fontWeight="500"
        fill="currentColor"
        letterSpacing="-0.04em"
      >
        dH
      </text>
    </svg>
  );
}
