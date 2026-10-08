import { formatCurrency } from "@/lib/money";

export type PlanPriceDisplay = {
  monthlyLabel: string;
  yearlyLabel: string;
  yearlySavingsHint: string | null;
};

export function getPlanPriceDisplay(): PlanPriceDisplay {
  const monthlyInr = process.env.NEXT_PUBLIC_SUBSCRIPTION_FEE_INR ?? "499";
  const yearlyInr = process.env.NEXT_PUBLIC_SUBSCRIPTION_FEE_INR_YEARLY;
  const yearly = yearlyInr ?? String(Math.round(Number(monthlyInr) * 12 * 0.9));
  const monthlyNum = Number(monthlyInr);
  const yearlyNum = Number(yearly);
  const savings =
    Number.isFinite(monthlyNum) &&
    Number.isFinite(yearlyNum) &&
    monthlyNum * 12 > yearlyNum
      ? `Save ${formatCurrency(Math.round(monthlyNum * 12 - yearlyNum))} vs 12× monthly`
      : "Discounted annual billing";

  return {
    monthlyLabel: `${formatCurrency(monthlyNum)}/month`,
    yearlyLabel: `${formatCurrency(yearlyNum)}/year`,
    yearlySavingsHint: savings,
  };
}
