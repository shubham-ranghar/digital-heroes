/** Format INR from minor units (paise). Whole rupees omit decimals; fractional rupees use two. */
export function formatMoney(amountInPaise: number): string {
  const rupees = amountInPaise / 100;
  const isWhole = Math.abs(rupees - Math.round(rupees)) < 1e-9;

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: isWhole ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(rupees);
}
