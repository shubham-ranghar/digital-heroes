-- Paginated admin lists, platform totals, and the indexes they and the
-- subscription access check rely on.

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

-- has_active_subscription() and every "latest subscription per member" lookup
-- filter on user_id and take the newest created_at. The composite index serves
-- both; the single-column one it replaces is redundant.
CREATE INDEX IF NOT EXISTS subscriptions_user_id_created_at_idx
  ON public.subscriptions (user_id, created_at DESC);
DROP INDEX IF EXISTS public.subscriptions_user_id_idx;

-- Foreign key with no index: supporter counts and ON DELETE RESTRICT checks
-- on charities scanned the whole table.
CREATE INDEX IF NOT EXISTS user_charity_charity_id_idx
  ON public.user_charity (charity_id);

-- Admin messages: newest first, plus the unresolved filter and unread badge.
CREATE INDEX IF NOT EXISTS contact_messages_created_at_idx
  ON public.contact_messages (created_at DESC);
CREATE INDEX IF NOT EXISTS contact_messages_unresolved_created_at_idx
  ON public.contact_messages (created_at DESC)
  WHERE resolved = false;

-- ---------------------------------------------------------------------------
-- admin_list_users: one page of the admin Users table
-- ---------------------------------------------------------------------------
-- Emails live in auth.users, which PostgREST cannot join, so search, filter,
-- sort and paging all happen here. Returns {"total": n, "rows": [...]}.
-- Service role only: it reads auth.users and bypasses RLS.

CREATE OR REPLACE FUNCTION public.admin_list_users(
  p_search text DEFAULT NULL,
  p_role text DEFAULT NULL,
  p_access text DEFAULT NULL,
  p_sort text DEFAULT 'joined',
  p_dir text DEFAULT 'desc',
  p_limit integer DEFAULT 25,
  p_offset integer DEFAULT 0
)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH pattern AS (
    SELECT CASE
      WHEN NULLIF(btrim(p_search), '') IS NULL THEN NULL
      ELSE '%' || replace(replace(replace(btrim(p_search), '\', '\\'), '%', '\%'), '_', '\_') || '%'
    END AS value
  ),
  members AS (
    SELECT
      p.id,
      u.email::text AS email,
      p.display_name,
      p.role,
      p.created_at,
      s.plan,
      s.status,
      s.renewal_date,
      COALESCE(s.cancel_at_period_end, false) AS cancel_at_period_end,
      public.has_active_subscription(p.id) AS has_access,
      (SELECT count(*)::int FROM public.scores sc WHERE sc.user_id = p.id) AS score_count
    FROM public.profiles p
    CROSS JOIN pattern
    LEFT JOIN auth.users u ON u.id = p.id
    LEFT JOIN LATERAL (
      SELECT sub.plan, sub.status, sub.renewal_date, sub.cancel_at_period_end
      FROM public.subscriptions sub
      WHERE sub.user_id = p.id
      ORDER BY sub.created_at DESC
      LIMIT 1
    ) s ON true
    WHERE (p_role IS NULL OR p.role = p_role)
      AND (
        pattern.value IS NULL
        OR u.email ILIKE pattern.value
        OR p.display_name ILIKE pattern.value
      )
  ),
  filtered AS (
    SELECT *
    FROM members
    WHERE p_access IS NULL OR has_access = (p_access = 'active')
  ),
  page AS (
    SELECT
      f.*,
      row_number() OVER (
        ORDER BY
          CASE WHEN p_sort = 'email' AND p_dir = 'asc' THEN lower(f.email) END ASC NULLS LAST,
          CASE WHEN p_sort = 'email' AND p_dir = 'desc' THEN lower(f.email) END DESC NULLS LAST,
          CASE WHEN p_sort = 'name' AND p_dir = 'asc' THEN lower(f.display_name) END ASC NULLS LAST,
          CASE WHEN p_sort = 'name' AND p_dir = 'desc' THEN lower(f.display_name) END DESC NULLS LAST,
          CASE WHEN p_sort = 'role' AND p_dir = 'asc' THEN f.role END ASC,
          CASE WHEN p_sort = 'role' AND p_dir = 'desc' THEN f.role END DESC,
          CASE WHEN p_sort = 'access' AND p_dir = 'asc' THEN f.has_access END ASC,
          CASE WHEN p_sort = 'access' AND p_dir = 'desc' THEN f.has_access END DESC,
          CASE WHEN p_sort = 'plan' AND p_dir = 'asc' THEN f.plan END ASC NULLS LAST,
          CASE WHEN p_sort = 'plan' AND p_dir = 'desc' THEN f.plan END DESC NULLS LAST,
          CASE WHEN p_sort = 'scores' AND p_dir = 'asc' THEN f.score_count END ASC,
          CASE WHEN p_sort = 'scores' AND p_dir = 'desc' THEN f.score_count END DESC,
          CASE WHEN p_sort = 'joined' AND p_dir = 'asc' THEN f.created_at END ASC,
          f.created_at DESC,
          f.id
      ) AS ord
    FROM filtered f
    ORDER BY ord
    LIMIT LEAST(GREATEST(p_limit, 1), 100)
    OFFSET GREATEST(p_offset, 0)
  )
  SELECT jsonb_build_object(
    'total', (SELECT count(*) FROM filtered),
    'rows', COALESCE(
      (SELECT jsonb_agg(to_jsonb(page) - 'ord' ORDER BY ord) FROM page),
      '[]'::jsonb
    )
  );
$$;

COMMENT ON FUNCTION public.admin_list_users(text, text, text, text, text, integer, integer) IS
  'Admin Users table: one page of members with email, latest subscription, access and score count. Service role only.';

REVOKE ALL ON FUNCTION public.admin_list_users(text, text, text, text, text, integer, integer)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_users(text, text, text, text, text, integer, integer)
  TO service_role;

-- ---------------------------------------------------------------------------
-- admin_list_winners: one page of the admin Winners table
-- ---------------------------------------------------------------------------
-- SECURITY INVOKER: RLS still applies, so an admin session sees every winner
-- and any other caller sees only their own rows. Returns {"total", "rows"}.

CREATE OR REPLACE FUNCTION public.admin_list_winners(
  p_search text DEFAULT NULL,
  p_verification text DEFAULT NULL,
  p_payment text DEFAULT NULL,
  p_sort text DEFAULT 'created',
  p_dir text DEFAULT 'desc',
  p_limit integer DEFAULT 25,
  p_offset integer DEFAULT 0
)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  WITH pattern AS (
    SELECT CASE
      WHEN NULLIF(btrim(p_search), '') IS NULL THEN NULL
      ELSE '%' || replace(replace(replace(btrim(p_search), '\', '\\'), '%', '\%'), '_', '\_') || '%'
    END AS value
  ),
  filtered AS (
    SELECT
      w.id,
      w.draw_id,
      w.user_id,
      w.tier,
      w.prize_amount,
      w.proof_url,
      w.verification,
      w.payment,
      w.created_at,
      w.updated_at,
      d.month AS draw_month
    FROM public.winners w
    CROSS JOIN pattern
    LEFT JOIN public.draws d ON d.id = w.draw_id
    WHERE (p_verification IS NULL OR w.verification = p_verification)
      AND (p_payment IS NULL OR w.payment = p_payment)
      AND (
        pattern.value IS NULL
        OR w.user_id::text ILIKE pattern.value
        OR d.month::text ILIKE pattern.value
      )
  ),
  page AS (
    SELECT
      f.*,
      row_number() OVER (
        ORDER BY
          CASE WHEN p_sort = 'draw' AND p_dir = 'asc' THEN f.draw_month END ASC NULLS LAST,
          CASE WHEN p_sort = 'draw' AND p_dir = 'desc' THEN f.draw_month END DESC NULLS LAST,
          CASE WHEN p_sort = 'tier' AND p_dir = 'asc' THEN f.tier END ASC,
          CASE WHEN p_sort = 'tier' AND p_dir = 'desc' THEN f.tier END DESC,
          CASE WHEN p_sort = 'amount' AND p_dir = 'asc' THEN f.prize_amount END ASC,
          CASE WHEN p_sort = 'amount' AND p_dir = 'desc' THEN f.prize_amount END DESC,
          CASE WHEN p_sort = 'member' AND p_dir = 'asc' THEN f.user_id::text END ASC,
          CASE WHEN p_sort = 'member' AND p_dir = 'desc' THEN f.user_id::text END DESC,
          CASE WHEN p_sort = 'verification' AND p_dir = 'asc' THEN f.verification END ASC,
          CASE WHEN p_sort = 'verification' AND p_dir = 'desc' THEN f.verification END DESC,
          CASE WHEN p_sort = 'payment' AND p_dir = 'asc' THEN f.payment END ASC,
          CASE WHEN p_sort = 'payment' AND p_dir = 'desc' THEN f.payment END DESC,
          CASE WHEN p_sort = 'created' AND p_dir = 'asc' THEN f.created_at END ASC,
          f.created_at DESC,
          f.id
      ) AS ord
    FROM filtered f
    ORDER BY ord
    LIMIT LEAST(GREATEST(p_limit, 1), 100)
    OFFSET GREATEST(p_offset, 0)
  )
  SELECT jsonb_build_object(
    'total', (SELECT count(*) FROM filtered),
    'rows', COALESCE(
      (SELECT jsonb_agg(to_jsonb(page) - 'ord' ORDER BY ord) FROM page),
      '[]'::jsonb
    )
  );
$$;

COMMENT ON FUNCTION public.admin_list_winners(text, text, text, text, text, integer, integer) IS
  'Admin Winners table: one page of winners with draw month. Runs under the caller''s RLS.';

REVOKE ALL ON FUNCTION public.admin_list_winners(text, text, text, text, text, integer, integer)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_winners(text, text, text, text, text, integer, integer)
  TO authenticated, service_role;

-- ---------------------------------------------------------------------------
-- platform_totals: sums for admin reports and the homepage
-- ---------------------------------------------------------------------------
-- Replaces reading whole tables into Node to add them up, which also broke
-- silently past the API's per-request row limit.

CREATE OR REPLACE FUNCTION public.platform_totals()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'donation_total_paise', (
      SELECT COALESCE(sum(amount_cents), 0)
      FROM public.donations
      WHERE status = 'succeeded' AND currency = 'inr'
    ),
    'charity_percentage_sum', (
      SELECT COALESCE(sum(percentage), 0) FROM public.user_charity
    ),
    'prize_paid', (
      SELECT COALESCE(sum(prize_amount), 0) FROM public.winners WHERE payment = 'paid'
    ),
    'prize_pending', (
      SELECT COALESCE(sum(prize_amount), 0) FROM public.winners WHERE payment <> 'paid'
    )
  );
$$;

COMMENT ON FUNCTION public.platform_totals() IS
  'Donation, charity-commitment and prize sums for reports and homepage stats. Service role only.';

REVOKE ALL ON FUNCTION public.platform_totals() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.platform_totals() TO service_role;
