"use client";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: (response: unknown) => void) => void;
    };
  }
}

let scriptPromise: Promise<void> | null = null;

function loadRazorpayScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Razorpay Checkout requires a browser"));
  }
  if (window.Razorpay) {
    return Promise.resolve();
  }
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Razorpay Checkout"));
      document.body.appendChild(script);
    });
  }
  return scriptPromise;
}

export type OpenRazorpaySubscriptionInput = {
  keyId: string;
  subscriptionId: string;
  name: string;
  description: string;
  prefill?: { email?: string; name?: string };
  onSuccess: () => void;
  onDismiss?: () => void;
};

export async function openRazorpaySubscriptionCheckout(
  input: OpenRazorpaySubscriptionInput,
) {
  await loadRazorpayScript();
  if (!window.Razorpay) {
    throw new Error("Razorpay Checkout is unavailable");
  }

  const rzp = new window.Razorpay({
    key: input.keyId,
    subscription_id: input.subscriptionId,
    name: input.name,
    description: input.description,
    prefill: input.prefill,
    theme: { color: "#e85d4c" },
    handler: () => input.onSuccess(),
    modal: {
      ondismiss: () => input.onDismiss?.(),
    },
  });
  rzp.open();
}

export type OpenRazorpayOrderInput = {
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  onSuccess: () => void;
  onDismiss?: () => void;
};

export async function openRazorpayOrderCheckout(input: OpenRazorpayOrderInput) {
  await loadRazorpayScript();
  if (!window.Razorpay) {
    throw new Error("Razorpay Checkout is unavailable");
  }

  const rzp = new window.Razorpay({
    key: input.keyId,
    order_id: input.orderId,
    amount: input.amount,
    currency: input.currency,
    name: input.name,
    description: input.description,
    theme: { color: "#e85d4c" },
    handler: () => input.onSuccess(),
    modal: {
      ondismiss: () => input.onDismiss?.(),
    },
  });
  rzp.open();
}
