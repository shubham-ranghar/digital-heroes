-- SAMPLE DATA — local / demo charities (not production partners)
--
-- Run this first, then `npm run seed` (scripts/seed.ts). The draw lifecycle
-- (published + draft draws, entries, winners, scores, donation, subscription)
-- lives in the script, not here: it needs auth users, which only the Admin
-- API can create, and its prize amounts and jackpot carryover are computed by
-- the draw engine (lib/draw/pools.ts) so they can never drift from the
-- 40/35/25 split.
-- Defensive insert: checks if category column exists before inserting with it
DO $$
DECLARE
  has_category boolean;
  riverside_id uuid;
  greenfield_id uuid;
  harbour_id uuid;
  hillside_id uuid;
BEGIN
  -- Check if category column exists
  has_category := EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'charities'
      AND column_name = 'category'
  );

  -- Insert charities (2 featured, 2 regular)
  IF has_category THEN
    INSERT INTO public.charities (name, slug, description, images, is_featured, category)
    VALUES
      (
        'Riverside Youth Sports',
        'sample-riverside-youth',
        'After-school coaching and kit for teens in East London.',
        '["/hero.webp"]'::jsonb,
        true,
        'Youth & Sports'
      ),
      (
        'Greenfield Food Bank',
        'sample-greenfield-food-bank',
        'Weekly groceries and dignity packs for families in crisis.',
        '["/hero.webp"]'::jsonb,
        true,
        'Hunger & Food'
      ),
      (
        'Harbour Mental Health',
        'sample-harbour-mental-health',
        'Counselling slots funded for coastal communities.',
        '["/hero.webp"]'::jsonb,
        false,
        'Health'
      ),
      (
        'Hillside Literacy Trust',
        'sample-hillside-literacy',
        'Reading mentors and library hours for primary pupils.',
        '["/hero.webp"]'::jsonb,
        false,
        'Education'
      )
    ON CONFLICT (slug) DO UPDATE SET
      name = EXCLUDED.name,
      description = EXCLUDED.description,
      images = EXCLUDED.images,
      is_featured = EXCLUDED.is_featured,
      category = EXCLUDED.category;
  ELSE
    INSERT INTO public.charities (name, slug, description, images, is_featured)
    VALUES
      (
        'Riverside Youth Sports',
        'sample-riverside-youth',
        'After-school coaching and kit for teens in East London.',
        '["/hero.webp"]'::jsonb,
        true
      ),
      (
        'Greenfield Food Bank',
        'sample-greenfield-food-bank',
        'Weekly groceries and dignity packs for families in crisis.',
        '["/hero.webp"]'::jsonb,
        true
      ),
      (
        'Harbour Mental Health',
        'sample-harbour-mental-health',
        'Counselling slots funded for coastal communities.',
        '["/hero.webp"]'::jsonb,
        false
      ),
      (
        'Hillside Literacy Trust',
        'sample-hillside-literacy',
        'Reading mentors and library hours for primary pupils.',
        '["/hero.webp"]'::jsonb,
        false
      )
    ON CONFLICT (slug) DO UPDATE SET
      name = EXCLUDED.name,
      description = EXCLUDED.description,
      images = EXCLUDED.images,
      is_featured = EXCLUDED.is_featured;
  END IF;

  -- Get charity IDs for events
  SELECT id INTO riverside_id FROM public.charities WHERE slug = 'sample-riverside-youth';
  SELECT id INTO greenfield_id FROM public.charities WHERE slug = 'sample-greenfield-food-bank';
  SELECT id INTO harbour_id FROM public.charities WHERE slug = 'sample-harbour-mental-health';
  SELECT id INTO hillside_id FROM public.charities WHERE slug = 'sample-hillside-literacy';

  -- Delete existing sample events to prevent duplicates (no unique constraint on charity_events)
  DELETE FROM public.charity_events WHERE charity_id IN (riverside_id, greenfield_id, harbour_id, hillside_id);

  -- Insert sample events for each charity
  IF riverside_id IS NOT NULL THEN
    INSERT INTO public.charity_events (charity_id, title, description, event_date, location)
    VALUES
      (riverside_id, 'Summer Golf Day', 'Annual charity golf tournament with prizes and dinner.', CURRENT_DATE + INTERVAL '30 days', 'East London Golf Club'),
      (riverside_id, 'Youth Coaching Workshop', 'Free coaching session for teens aged 12-18.', CURRENT_DATE + INTERVAL '45 days', 'Riverside Sports Centre');
  END IF;

  IF greenfield_id IS NOT NULL THEN
    INSERT INTO public.charity_events (charity_id, title, description, event_date, location)
    VALUES
      (greenfield_id, 'Community Food Drive', 'Monthly collection event for local families.', CURRENT_DATE + INTERVAL '14 days', 'Greenfield Community Hall'),
      (greenfield_id, 'Volunteer Training', 'Learn how to help with weekly food distribution.', CURRENT_DATE + INTERVAL '21 days', 'Greenfield Food Bank');
  END IF;

  IF harbour_id IS NOT NULL THEN
    INSERT INTO public.charity_events (charity_id, title, description, event_date, location)
    VALUES
      (harbour_id, 'Mental Health Awareness Walk', 'Coastal walk to raise awareness and funds.', CURRENT_DATE + INTERVAL '7 days', 'Harbour Promenade'),
      (harbour_id, 'Counselling Open Day', 'Free consultations and information session.', CURRENT_DATE + INTERVAL '28 days', 'Harbour Wellness Centre');
  END IF;

  IF hillside_id IS NOT NULL THEN
    INSERT INTO public.charity_events (charity_id, title, description, event_date, location)
    VALUES
      (hillside_id, 'Reading Marathon', '24-hour reading event with guest authors.', CURRENT_DATE + INTERVAL '10 days', 'Hillside Primary School'),
      (hillside_id, 'Library Fundraiser', 'Book sale and auction to support library hours.', CURRENT_DATE + INTERVAL '35 days', 'Hillside Community Library');
  END IF;
END $$;
