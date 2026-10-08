-- Scores: reject writes that the latest-five retention would immediately undo.
--
-- scores_enforce_latest_five() (AFTER INSERT) deletes everything outside a
-- user's five newest played_on dates. With five scores on file, inserting an
-- OLDER date succeeded and then deleted the row just inserted: a silent
-- success with nothing saved. This BEFORE trigger raises instead, so the
-- retention rule stays but never discards the row being written.
--
-- Error contract: SQLSTATE 'DH001' (mapped in lib/scores/errors.ts). Kept
-- distinct from 23505 (scores_one_per_user_per_day, duplicate date).

CREATE OR REPLACE FUNCTION public.scores_reject_outside_latest_five()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cutoff date;
BEGIN
  -- Serialise writes per user: without this, two concurrent inserts can both
  -- pass the check and one's AFTER trim deletes the other's row.
  PERFORM pg_advisory_xact_lock(hashtextextended(NEW.user_id::text, 0));

  -- Fifth-newest of the user's OTHER rows (the row being edited never counts
  -- against itself, so ordinary edits of a five-score history always pass).
  SELECT s.played_on INTO cutoff
  FROM public.scores s
  WHERE s.user_id = NEW.user_id
    AND s.id IS DISTINCT FROM NEW.id
  ORDER BY s.played_on DESC, s.created_at DESC
  OFFSET 4
  LIMIT 1;

  IF cutoff IS NOT NULL AND NEW.played_on < cutoff THEN
    RAISE EXCEPTION 'Score date % is older than the latest five scores (oldest kept %).',
      NEW.played_on, cutoff
      USING ERRCODE = 'DH001',
            HINT = 'Delete an older score first, or pick a more recent date.';
  END IF;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.scores_reject_outside_latest_five() IS
  'Before insert/update: raises DH001 when played_on would fall outside the user''s latest five, instead of letting the retention trim delete the new row.';

DROP TRIGGER IF EXISTS scores_reject_outside_latest_five_trigger ON public.scores;
CREATE TRIGGER scores_reject_outside_latest_five_trigger
  BEFORE INSERT OR UPDATE OF user_id, played_on ON public.scores
  FOR EACH ROW
  EXECUTE FUNCTION public.scores_reject_outside_latest_five();

-- Retention trim also runs when an update moves a row to another user or date
-- (a no-op for normal edits, which never change the row count).
DROP TRIGGER IF EXISTS scores_enforce_latest_five_trigger ON public.scores;
CREATE TRIGGER scores_enforce_latest_five_trigger
  AFTER INSERT OR UPDATE OF user_id, played_on ON public.scores
  FOR EACH ROW
  EXECUTE FUNCTION public.scores_enforce_latest_five();
