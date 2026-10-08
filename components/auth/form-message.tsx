import { cn } from "@/lib/utils";

export function FormError({
  message,
  className,
}: {
  message?: string | null;
  className?: string;
}) {
  if (!message) {
    return null;
  }

  return (
    <p
      role="alert"
      className={cn(
        "motion-fade-down rounded-xl border border-status-danger/40 bg-status-danger/10 px-3 py-2 text-sm text-status-danger",
        className,
      )}
    >
      {message}
    </p>
  );
}

export function FormSuccess({
  message,
  className,
}: {
  message?: string | null;
  className?: string;
}) {
  if (!message) {
    return null;
  }

  return (
    <p
      role="status"
      className={cn(
        "motion-fade-down rounded-xl border border-status-active/40 bg-status-active/15 px-3 py-2 text-sm text-navy",
        className,
      )}
    >
      {message}
    </p>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p className="motion-fade-down text-xs text-status-danger" role="alert">
      {message}
    </p>
  );
}
