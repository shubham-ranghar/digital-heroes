/**
 * Single source for money display. The app is INR end to end: Razorpay
 * charges in INR, and every amount renders with en-IN (lakh/crore) grouping.
 */
export const CURRENCY_CODE = "INR";
export const CURRENCY_SYMBOL = "₹";
const LOCALE = "en-IN";

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

  return new Intl.NumberFormat(LOCALE, {
    style: "currency",
    currency: CURRENCY_CODE,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(rupees);
}

/** Format INR from minor units (paise). */
export function formatMoney(amountInPaise: number): string {
  return formatCurrency(amountInPaise, { paise: true });
}

/**
 * Whole-rupee amount with en-IN grouping and no symbol, for count-up displays
 * that render `CURRENCY_SYMBOL` in its own element.
 */
export function formatAmount(rupees: number): string {
  return new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0 }).format(
    Math.round(rupees),
  );
}
