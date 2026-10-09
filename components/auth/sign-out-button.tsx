"use client";

import { LogOut } from "lucide-react";
import { useTransition } from "react";

import { signOutAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SignOutButtonProps = {
  className?: string;
  label?: string;
  pendingLabel?: string;
  variant?: "secondary" | "ghost" | "link";
  size?: "sm" | "lg";
  /** Lead with the log-out glyph (sidebar text-link treatment). */
  withIcon?: boolean;
};

export function SignOutButton({
  className,
  label = "Sign out",
  pendingLabel = "Signing out…",
  variant = "secondary",
  size = "lg",
  withIcon = false,
}: SignOutButtonProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={cn("shrink-0 justify-center", className)}
      loading={isPending}
      onClick={() =>
        startTransition(async () => {
          await signOutAction();
        })
      }
    >
      {withIcon && !isPending ? <LogOut className="size-4" aria-hidden /> : null}
      {isPending ? pendingLabel : label}
    </Button>
  );
}
