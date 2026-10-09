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
    throw new RazorpayApiError(path, response.status, data.error?.description);
  }

  return data;
}

/**
 * Razorpay error descriptions are written for end users ("Exceeds the
 * maximum total_count…"), so callers may surface `message` directly.
 */
export class RazorpayApiError extends Error {
  readonly status: number;
  readonly path: string;

  constructor(path: string, status: number, description?: string) {
    super(description ?? `Razorpay API error (${status}) on ${path}`);
    this.name = "RazorpayApiError";
    this.path = path;
    this.status = status;
  }
}
