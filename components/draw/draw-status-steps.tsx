import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

const STEPS = [
  { key: "draft", label: "Draft" },
  { key: "simulated", label: "Simulated" },
  { key: "published", label: "Published" },
] as const;

type DrawStatusStepsProps = {
  status: string;
  className?: string;
};

/** Draft → Simulated → Published progression for a monthly draw (display only). */
export function DrawStatusSteps({ status, className }: DrawStatusStepsProps) {
  const currentIndex = STEPS.findIndex((step) => step.key === status);
  if (currentIndex === -1) {
    return (
      <p className={cn("text-xs capitalize text-muted-foreground", className)}>
        Status: {status}
      </p>
    );
  }

  return (
    <ol
      className={cn("flex items-center gap-1.5 text-xs", className)}
      aria-label={`Draw status: ${STEPS[currentIndex].label}`}
    >
      {STEPS.map((step, index) => {
        const done = index < currentIndex;
        const current = index === currentIndex;
        return (
          <li key={step.key} className="flex items-center gap-1.5">
            {index > 0 ? (
              <span
                className={cn(
                  "h-px w-3 sm:w-5",
                  index <= currentIndex ? "bg-coral" : "bg-line",
                )}
                aria-hidden
              />
            ) : null}
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 motion-interactive",
                current && "border-coral/50 bg-coral/12 font-medium text-navy",
                done && "border-transparent text-navy",
                !current && !done && "border-line text-slate",
              )}
              aria-current={current ? "step" : undefined}
            >
              {done ? (
                <Check className="size-3 text-coral" aria-hidden />
              ) : current ? (
                <span className="relative flex size-1.5" aria-hidden>
                  {step.key !== "published" ? (
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-coral/60 motion-reduce:animate-none [animation-iteration-count:3]" />
                  ) : null}
                  <span className="relative inline-flex size-1.5 rounded-full bg-coral" />
                </span>
              ) : null}
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
