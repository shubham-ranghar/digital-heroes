-- SAMPLE DATA — local / demo charities (not production partners)
INSERT INTO public.charities (name, slug, description, images, is_featured, category)
VALUES
  (
    'SAMPLE · Riverside Youth Sports',
    'sample-riverside-youth',
    'SAMPLE: After-school coaching and kit for teens in East London.',
    '["/hero.webp"]'::jsonb,
    true,
    'Youth & sports'
  ),
  (
    'SAMPLE · Greenfield Food Bank',
    'sample-greenfield-food-bank',
    'SAMPLE: Weekly groceries and dignity packs for families in crisis.',
    '["/hero.webp"]'::jsonb,
    false,
    'Food & shelter'
  ),
  (
    'SAMPLE · Harbour Mental Health',
    'sample-harbour-mental-health',
    'SAMPLE: Counselling slots funded for coastal communities.',
    '["/hero.webp"]'::jsonb,
    false,
    'Health & wellbeing'
  ),
  (
    'SAMPLE · Hillside Literacy Trust',
    'sample-hillside-literacy',
    'SAMPLE: Reading mentors and library hours for primary pupils.',
    '["/hero.webp"]'::jsonb,
    false,
    'Education'
  )
ON CONFLICT (slug) DO NOTHING;
