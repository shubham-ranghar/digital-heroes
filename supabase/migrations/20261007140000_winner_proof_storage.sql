-- Private storage for winner screenshot proofs + tighten winners row updates.

-- ---------------------------------------------------------------------------
-- Storage bucket (private)
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'winner-proofs',
  'winner-proofs',
  false,
  5242880,
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ---------------------------------------------------------------------------
-- Storage RLS: owner folder = auth.uid(); admins read all
-- Path pattern: {user_id}/{winner_id}/filename.ext
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS winner_proofs_select_owner_or_admin ON storage.objects;
CREATE POLICY winner_proofs_select_owner_or_admin ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'winner-proofs'
    AND (
      public.is_admin()
      OR (storage.foldername(name))[1] = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS winner_proofs_insert_owner ON storage.objects;
CREATE POLICY winner_proofs_insert_owner ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'winner-proofs'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS winner_proofs_update_owner ON storage.objects;
CREATE POLICY winner_proofs_update_owner ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'winner-proofs'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'winner-proofs'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS winner_proofs_delete_owner_or_admin ON storage.objects;
CREATE POLICY winner_proofs_delete_owner_or_admin ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'winner-proofs'
    AND (
      public.is_admin()
      OR (storage.foldername(name))[1] = auth.uid()::text
    )
  );

-- ---------------------------------------------------------------------------
-- Winners: members may only upload proof; verification/payment = admin only
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.winners_guard_member_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.is_admin() THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.user_id = auth.uid() THEN
    IF NEW.verification IS DISTINCT FROM OLD.verification
      OR NEW.payment IS DISTINCT FROM OLD.payment
      OR NEW.prize_amount IS DISTINCT FROM OLD.prize_amount
      OR NEW.tier IS DISTINCT FROM OLD.tier
      OR NEW.draw_id IS DISTINCT FROM OLD.draw_id
      OR NEW.user_id IS DISTINCT FROM OLD.user_id THEN
      RAISE EXCEPTION 'Only admins can change verification or payment fields';
    END IF;

    IF NEW.proof_url IS DISTINCT FROM OLD.proof_url THEN
      IF OLD.verification = 'approved' THEN
        RAISE EXCEPTION 'Cannot replace proof after approval';
      END IF;
      IF OLD.verification NOT IN ('pending', 'rejected') THEN
        RAISE EXCEPTION 'Proof cannot be updated in the current state';
      END IF;
      -- Re-submit after rejection returns to pending review.
      IF OLD.verification = 'rejected' THEN
        NEW.verification := 'pending';
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS winners_guard_member_update_trigger ON public.winners;

CREATE TRIGGER winners_guard_member_update_trigger
  BEFORE UPDATE ON public.winners
  FOR EACH ROW
  EXECUTE FUNCTION public.winners_guard_member_update();
