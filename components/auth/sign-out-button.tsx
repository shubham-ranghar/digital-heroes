"use client";

import { useTransition } from "react";

import { signOutAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SignOutButtonProps = {
  className?: string;
  label?: string;
  pendingLabel?: string;
};

export function SignOutButton({
  className,
  label = "Sign out",
  pendingLabel = "Signing out…",
}: SignOutButtonProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="secondary"
      size="lg"
      className={cn("shrink-0 justify-center", className)}
      disabled={isPending}
      aria-busy={isPending}
      onClick={() =>
        startTransition(async () => {
          await signOutAction();
        })
      }
    >
      {isPending ? pendingLabel : label}
    </Button>
  );
}
