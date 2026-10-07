import * as React from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-12 w-full min-w-0 rounded-xl border border-input bg-surface px-3 py-2 text-base text-navy motion-transition-colors outline-none transition-[box-shadow] duration-[var(--dur-fast)] ease-[var(--ease-out)] file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate focus-visible:border-coral focus-visible:ring-2 focus-visible:ring-coral/50 focus-visible:ring-offset-0 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-status-danger md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
