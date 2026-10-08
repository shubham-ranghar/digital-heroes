-- Allow past_due subscription status (failed payment, Stripe retries).

ALTER TABLE public.subscriptions
  DROP CONSTRAINT subscriptions_status_check;

ALTER TABLE public.subscriptions
  ADD CONSTRAINT subscriptions_status_check
  CHECK (status IN ('active', 'cancelled', 'lapsed', 'past_due'));
