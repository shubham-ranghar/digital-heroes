import {
  getRazorpayKeyId,
  getRazorpayKeySecret,
} from "@/lib/payments/env";

type RazorpayRequestInit = {
  method?: string;
  body?: Record<string, unknown>;
};

export async function razorpayFetch<T>(
  path: string,
  init: RazorpayRequestInit = {},
): Promise<T> {
  const auth = Buffer.from(
    `${getRazorpayKeyId()}:${getRazorpayKeySecret()}`,
  ).toString("base64");

  const response = await fetch(`https://api.razorpay.com/v1${path}`, {
    method: init.method ?? (init.body ? "POST" : "GET"),
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: init.body ? JSON.stringify(init.body) : undefined,
  });

  const data = (await response.json()) as T & { error?: { description?: string } };
  if (!response.ok) {
    const message =
      data.error?.description ??
      `Razorpay API error (${response.status}) on ${path}`;
    throw new Error(message);
  }

  return data;
}
