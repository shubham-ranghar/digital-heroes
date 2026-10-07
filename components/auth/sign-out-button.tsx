"use client";

import { useTransition } from "react";

import { signOutAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SignOutButtonProps = {
  className?: string;
};

export function SignOutButton({ className }: SignOutButtonProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      className={cn(className)}
      disabled={isPending}
      onClick={() => startTransition(() => signOutAction())}
    >
      {isPending ? "Signing out…" : "Sign out"}
    </Button>
  );
}
