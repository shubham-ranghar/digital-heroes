-- Subscription gate for scores/draw_entries: latest row per user, mirroring app access rules.

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
        WHEN s.status = 'active' THEN true
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
  'True when the user''s latest subscription row grants product access (active, or cancelled until renewal_date).';

-- scores: require active subscription (or admin) on insert/update
DROP POLICY IF EXISTS scores_insert_own_or_admin ON public.scores;
CREATE POLICY scores_insert_own_or_admin ON public.scores
  FOR INSERT
  WITH CHECK (
    public.is_admin()
    OR (
      user_id = auth.uid()
      AND public.has_active_subscription(auth.uid())
    )
  );

DROP POLICY IF EXISTS scores_update_own_or_admin ON public.scores;
CREATE POLICY scores_update_own_or_admin ON public.scores
  FOR UPDATE
  USING (
    public.is_admin()
    OR (
      user_id = auth.uid()
      AND public.has_active_subscription(auth.uid())
    )
  )
  WITH CHECK (
    public.is_admin()
    OR (
      user_id = auth.uid()
      AND public.has_active_subscription(auth.uid())
    )
  );

-- draw_entries: require active subscription (or admin) on insert/update
DROP POLICY IF EXISTS draw_entries_insert_own_or_admin ON public.draw_entries;
CREATE POLICY draw_entries_insert_own_or_admin ON public.draw_entries
  FOR INSERT
  WITH CHECK (
    public.is_admin()
    OR (
      user_id = auth.uid()
      AND public.has_active_subscription(auth.uid())
    )
  );

DROP POLICY IF EXISTS draw_entries_update_own_or_admin ON public.draw_entries;
CREATE POLICY draw_entries_update_own_or_admin ON public.draw_entries
  FOR UPDATE
  USING (
    public.is_admin()
    OR (
      user_id = auth.uid()
      AND public.has_active_subscription(auth.uid())
    )
  )
  WITH CHECK (
    public.is_admin()
    OR (
      user_id = auth.uid()
      AND public.has_active_subscription(auth.uid())
    )
  );
