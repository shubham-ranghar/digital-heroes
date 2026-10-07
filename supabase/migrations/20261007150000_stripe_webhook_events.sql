-- Stripe webhook idempotency (service role only; no client policies).

CREATE TABLE IF NOT EXISTS public.stripe_webhook_events (
  event_id text PRIMARY KEY,
  type text NOT NULL,
  processed_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.stripe_webhook_events IS
  'Processed Stripe webhook event IDs for idempotent handlers (service role only).';

ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;

-- No policies: anon/authenticated cannot access; service_role bypasses RLS.
GRANT ALL ON public.stripe_webhook_events TO service_role;
