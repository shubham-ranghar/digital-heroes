-- has_active_subscription: an 'active' row lapses 3 days after renewal_date.
--
-- Previously 'active' without cancel_at_period_end granted access forever, so
-- a renewal webhook that never arrived (or any mock-mode subscription) kept
-- access open indefinitely. Razorpay's subscription.charged moves renewal_date
-- forward each cycle; the 3-day grace covers a late webhook. A null
-- renewal_date (e.g. an admin-created row) still grants access.
--
-- Mirrors subscriptionGrantsAccess / RENEWAL_GRACE_DAYS in
-- lib/subscription/grants.ts — change both together.

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
          AND (s.renewal_date IS NULL OR s.renewal_date >= CURRENT_DATE - 3)
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
  'True when the latest subscription grants product access: active (until 3 days past renewal_date), or cancel-at-period-end / cancelled until renewal_date.';
