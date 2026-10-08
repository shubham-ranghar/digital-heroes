"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { FormError } from "@/components/auth/form-message";
import { Button } from "@/components/ui/button";
import {
  cancelSubscriptionAction,
  resumeSubscriptionAction,
} from "@/lib/payments/actions";

type BillingManageButtonsProps = {
  showManage?: boolean;
  cancelAtPeriodEnd?: boolean;
};

/** Cancel-at-period-end or resume billing (settings / dashboard / subscribe). */
export function BillingManageButtons({
  showManage = false,
  cancelAtPeriodEnd = false,
}: BillingManageButtonsProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!showManage) {
    return null;
  }

  function cancelAtEnd() {
    setError(null);
    startTransition(async () => {
      const result = await cancelSubscriptionAction();
      if (!result.ok) {
        toast.error(result.message);
        setError(result.message);
        return;
      }
      toast.success(result.message);
      window.location.reload();
    });
  }

  function resume() {
    setError(null);
    startTransition(async () => {
      const result = await resumeSubscriptionAction();
      if (!result.ok) {
        toast.error(result.message);
        setError(result.message);
        return;
      }
      toast.success(result.message);
      window.location.reload();
    });
  }

  return (
    <div className="space-y-4">
      <FormError message={error} />
      {cancelAtPeriodEnd ? (
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          disabled={isPending}
          onClick={resume}
        >
          Resume subscription
        </Button>
      ) : (
        <Button
          type="button"
          variant="ghost"
          className="w-full"
          disabled={isPending}
          onClick={cancelAtEnd}
        >
          Cancel at end of billing period
        </Button>
      )}
    </div>
  );
}
