"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

type CheckoutToastProps = {
  checkout?: string;
  hasAccess: boolean;
};

export function CheckoutToast({ checkout, hasAccess }: CheckoutToastProps) {
  const shown = useRef(false);

  useEffect(() => {
    if (shown.current) {
      return;
    }
    if (checkout === "success" && hasAccess) {
      shown.current = true;
      toast.success("Thanks — your subscription is active.");
    }
    if (checkout === "cancelled") {
      shown.current = true;
      toast.message("Checkout cancelled. You can subscribe anytime.");
    }
  }, [checkout, hasAccess]);

  return null;
}
