-- Admin winners table and draw preview: show who won, not a UUID prefix.
--
-- Emails live in auth.users, which the admin's own session cannot read, so
-- admin_list_winners becomes SECURITY DEFINER. That bypasses RLS, so the
-- function now checks is_admin() itself and returns nothing to anyone else.
-- Search also matches name and email, and the 'member' sort orders by the
-- name shown (display name, then email) instead of the hidden user id.

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
SECURITY DEFINER
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
      d.month AS draw_month,
      p.display_name AS member_name,
      u.email::text AS member_email
    FROM public.winners w
    CROSS JOIN pattern
    LEFT JOIN public.draws d ON d.id = w.draw_id
    LEFT JOIN public.profiles p ON p.id = w.user_id
    LEFT JOIN auth.users u ON u.id = w.user_id
    WHERE public.is_admin()
      AND (p_verification IS NULL OR w.verification = p_verification)
      AND (p_payment IS NULL OR w.payment = p_payment)
      AND (
        pattern.value IS NULL
        OR w.user_id::text ILIKE pattern.value
        OR d.month::text ILIKE pattern.value
        OR p.display_name ILIKE pattern.value
        OR u.email ILIKE pattern.value
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
          CASE WHEN p_sort = 'member' AND p_dir = 'asc'
            THEN lower(COALESCE(f.member_name, f.member_email)) END ASC NULLS LAST,
          CASE WHEN p_sort = 'member' AND p_dir = 'desc'
            THEN lower(COALESCE(f.member_name, f.member_email)) END DESC NULLS LAST,
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
  'Admin Winners table: one page of winners with draw month, member name and email. Admins only (checked inside; reads auth.users).';

REVOKE ALL ON FUNCTION public.admin_list_winners(text, text, text, text, text, integer, integer)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_winners(text, text, text, text, text, integer, integer)
  TO authenticated, service_role;

-- ---------------------------------------------------------------------------
-- admin_member_labels: display name + email for a set of user ids
-- ---------------------------------------------------------------------------
-- Used by the draw simulation preview. Ids travel in the request body, so a
-- long winner list can't overflow the URL the way an .in() filter would.

CREATE OR REPLACE FUNCTION public.admin_member_labels(p_user_ids uuid[])
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    jsonb_agg(jsonb_build_object(
      'id', p.id,
      'display_name', p.display_name,
      'email', u.email::text
    )),
    '[]'::jsonb
  )
  FROM public.profiles p
  LEFT JOIN auth.users u ON u.id = p.id
  WHERE p.id = ANY (p_user_ids);
$$;

COMMENT ON FUNCTION public.admin_member_labels(uuid[]) IS
  'Display name and email for the given user ids (draw preview). Service role only.';

REVOKE ALL ON FUNCTION public.admin_member_labels(uuid[]) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_member_labels(uuid[]) TO service_role;
