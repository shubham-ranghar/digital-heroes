-- admin_charity_breakdown: per-charity figures for the admin Reports page.
--
-- Two numbers per charity that must not be added together:
--   * active_percentage_sum: sum of charity percentages over members whose
--     subscription currently grants access (has_active_subscription). The app
--     multiplies by the monthly fee to get a per-month commitment. Lapsed and
--     never-paid members are excluded: they aren't paying anything in.
--   * donation_paise: cumulative succeeded INR one-off donations.
-- One row per charity, including charities with no supporters or donations.
-- Service role only.

CREATE OR REPLACE FUNCTION public.admin_charity_breakdown()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'charity_id', c.id,
        'name', c.name,
        'slug', c.slug,
        'active_supporters', COALESCE(sup.active_supporters, 0),
        'active_percentage_sum', COALESCE(sup.active_percentage_sum, 0),
        'donation_paise', COALESCE(don.donation_paise, 0)
      )
      ORDER BY c.name
    ),
    '[]'::jsonb
  )
  FROM public.charities c
  LEFT JOIN (
    SELECT
      uc.charity_id,
      count(*)::int AS active_supporters,
      sum(uc.percentage) AS active_percentage_sum
    FROM public.user_charity uc
    WHERE public.has_active_subscription(uc.user_id)
    GROUP BY uc.charity_id
  ) sup ON sup.charity_id = c.id
  LEFT JOIN (
    SELECT d.charity_id, sum(d.amount_cents)::bigint AS donation_paise
    FROM public.donations d
    WHERE d.status = 'succeeded' AND d.currency = 'inr'
    GROUP BY d.charity_id
  ) don ON don.charity_id = c.id;
$$;

COMMENT ON FUNCTION public.admin_charity_breakdown() IS
  'Per-charity active-subscriber commitment (percentage sum) and cumulative INR donations for admin reports. Service role only.';

REVOKE ALL ON FUNCTION public.admin_charity_breakdown() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_charity_breakdown() TO service_role;
