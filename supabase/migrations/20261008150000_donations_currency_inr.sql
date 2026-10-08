-- Razorpay charges in INR, so new donations default to 'inr' (amount_cents
-- holds paise). The app already writes currency explicitly on insert; this
-- only fixes the column default.
--
-- Existing rows are intentionally NOT rewritten: rows with currency = 'gbp'
-- came from the earlier Stripe integration and their amount_cents is pence,
-- so relabelling them would silently turn £ amounts into ₹ amounts. Reports
-- and home stats sum only currency = 'inr'. Inspect legacy rows with:
--   SELECT currency, status, count(*), sum(amount_cents)
--   FROM public.donations GROUP BY 1, 2;
ALTER TABLE public.donations
  ALTER COLUMN currency SET DEFAULT 'inr';

COMMENT ON COLUMN public.donations.currency IS
  'ISO 4217 code, lowercase. ''inr'' for all Razorpay donations; legacy Stripe rows may be ''gbp''.';
