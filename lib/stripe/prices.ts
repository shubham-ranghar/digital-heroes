import { hasStripeEnv } from "@/lib/config/env";
import { getStripePriceIds } from "@/lib/stripe/env";
import { getStripe } from "@/lib/stripe/server";

function formatStripeAmount(amountMinor: number, currency: string): string {
  const code = currency.toUpperCase();
  const zeroDecimal = code === "JPY";
  const value = zeroDecimal ? amountMinor : amountMinor / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: code,
    minimumFractionDigits: zeroDecimal ? 0 : 2,
    maximumFractionDigits: zeroDecimal ? 0 : 2,
  }).format(value);
}

export type PlanPriceDisplay = {
  monthlyLabel: string;
  yearlyLabel: string;
  yearlySavingsHint: string | null;
};

function fallbackPrices(): PlanPriceDisplay {
  const monthlyInr = process.env.NEXT_PUBLIC_SUBSCRIPTION_FEE_INR ?? "499";
  const yearlyInr = process.env.NEXT_PUBLIC_SUBSCRIPTION_FEE_INR_YEARLY;
  const yearly = yearlyInr ?? String(Number(monthlyInr) * 12 * 0.9);
  return {
    monthlyLabel: `₹${monthlyInr}/month`,
    yearlyLabel: `₹${yearly}/year`,
    yearlySavingsHint: "Discounted annual billing",
  };
}

export async function getPlanPriceDisplay(): Promise<PlanPriceDisplay> {
  if (!hasStripeEnv()) {
    return fallbackPrices();
  }

  try {
    const stripe = getStripe();
    const ids = getStripePriceIds();
    const [monthly, yearly] = await Promise.all([
      stripe.prices.retrieve(ids.monthly),
      stripe.prices.retrieve(ids.yearly),
    ]);

    const monthlyAmount = monthly.unit_amount ?? 0;
    const yearlyAmount = yearly.unit_amount ?? 0;
    const currency = monthly.currency ?? yearly.currency ?? "inr";

    const monthlyLabel = `${formatStripeAmount(monthlyAmount, currency)}/month`;
    const yearlyLabel = `${formatStripeAmount(yearlyAmount, currency)}/year`;

    const twelveMonthly = monthlyAmount * 12;
    const savingsHint =
      twelveMonthly > yearlyAmount
        ? `Save ${formatStripeAmount(twelveMonthly - yearlyAmount, currency)} vs 12× monthly`
        : null;

    return {
      monthlyLabel,
      yearlyLabel,
      yearlySavingsHint: savingsHint,
    };
  } catch {
    return fallbackPrices();
  }
}
