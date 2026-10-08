-- Rename stripe_webhook_events to payment_webhook_events (provider-agnostic name)

ALTER TABLE IF EXISTS public.stripe_webhook_events
  RENAME TO payment_webhook_events;

COMMENT ON TABLE public.payment_webhook_events IS
  'Processed payment webhook event IDs for idempotent handlers (service role only).';

-- Rename stripe-specific columns in subscriptions table to provider-agnostic names
ALTER TABLE IF EXISTS public.subscriptions
  RENAME COLUMN stripe_customer_id TO external_customer_id;

ALTER TABLE IF EXISTS public.subscriptions
  RENAME COLUMN stripe_subscription_id TO external_subscription_id;

-- Rename the unique constraint
ALTER TABLE IF EXISTS public.subscriptions
  DROP CONSTRAINT IF EXISTS subscriptions_stripe_subscription_id_unique;

ALTER TABLE IF EXISTS public.subscriptions
  ADD CONSTRAINT subscriptions_external_subscription_id_unique UNIQUE (external_subscription_id);

-- Rename stripe-specific column in donations table
ALTER TABLE IF EXISTS public.donations
  RENAME COLUMN stripe_payment_intent_id TO payment_intent_id;

-- Update comments
COMMENT ON COLUMN public.subscriptions.external_customer_id IS
  'External payment provider customer ID (e.g., Razorpay customer_id).';

COMMENT ON COLUMN public.subscriptions.external_subscription_id IS
  'External payment provider subscription ID (e.g., Razorpay subscription_id).';

COMMENT ON COLUMN public.donations.payment_intent_id IS
  'External payment provider payment intent ID (e.g., Razorpay payment_id).';
