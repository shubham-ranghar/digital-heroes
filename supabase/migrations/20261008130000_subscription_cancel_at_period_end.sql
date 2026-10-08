-- Cancel-at-period-end: member keeps access until renewal_date, then loses access.

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS cancel_at_period_end boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.subscriptions.cancel_at_period_end IS
  'When true, billing stops after renewal_date; access continues until end of that date.';

CREATE OR REPLACE FUNCTION public.has_active_subscription(uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (
      SELECT CASE
        WHEN s.status = 'active'
          AND NOT COALESCE(s.cancel_at_period_end, false)
          THEN true
        WHEN s.status = 'active'
          AND COALESCE(s.cancel_at_period_end, false)
          AND s.renewal_date IS NOT NULL
          AND s.renewal_date >= CURRENT_DATE
          THEN true
        WHEN s.status = 'cancelled'
          AND s.renewal_date IS NOT NULL
          AND s.renewal_date >= CURRENT_DATE
          THEN true
        ELSE false
      END
      FROM public.subscriptions s
      WHERE s.user_id = uid
      ORDER BY s.created_at DESC
      LIMIT 1
    ),
    false
  );
$$;

COMMENT ON FUNCTION public.has_active_subscription(uuid) IS
  'True when the latest subscription grants product access (active, or cancel-at-period-end until renewal_date).';
