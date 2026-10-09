-- Donations: members may only create pending rows.
--
-- The original policy checked only user_id = auth.uid(), so a member calling
-- the API directly could insert status = 'succeeded' and inflate the charity
-- totals shown in admin reports and on the homepage. Only the payment webhook
-- and mock checkout (both service role, which bypasses RLS) mark a donation
-- succeeded; the app's own insert in createDonationCheckoutAction is already
-- 'pending'.

DROP POLICY IF EXISTS donations_insert_own_or_admin ON public.donations;
CREATE POLICY donations_insert_own_or_admin ON public.donations
  FOR INSERT
  WITH CHECK (
    public.is_admin()
    OR (
      user_id = auth.uid()
      AND status = 'pending'
    )
  );
