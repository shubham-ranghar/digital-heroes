export type FormatCurrencyOptions = {
  /** When true, `amount` is in paise; otherwise whole or fractional rupees. */
  paise?: boolean;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
};

/** Shared INR (₹) formatter for UI, reports, and donations. */
export function formatCurrency(
  amount: number,
  options?: FormatCurrencyOptions,
): string {
  const rupees = options?.paise ? amount / 100 : amount;
  const isWhole =
    options?.minimumFractionDigits !== undefined
      ? false
      : Math.abs(rupees - Math.round(rupees)) < 1e-9;

  const minimumFractionDigits =
    options?.minimumFractionDigits ?? (isWhole ? 0 : 2);
  const maximumFractionDigits = options?.maximumFractionDigits ?? 2;

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(rupees);
}

/** Format INR from minor units (paise). */
export function formatMoney(amountInPaise: number): string {
  return formatCurrency(amountInPaise, { paise: true });
}
