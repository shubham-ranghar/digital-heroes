-- SAMPLE DATA — local / demo charities (not production partners)
INSERT INTO public.charities (name, slug, description, images, is_featured)
VALUES
  (
    'SAMPLE · Riverside Youth Sports',
    'sample-riverside-youth',
    'SAMPLE: After-school coaching and kit for teens in East London.',
    '["/hero.webp"]'::jsonb,
    true
  ),
  (
    'SAMPLE · Greenfield Food Bank',
    'sample-greenfield-food-bank',
    'SAMPLE: Weekly groceries and dignity packs for families in crisis.',
    '["/hero.webp"]'::jsonb,
    false
  ),
  (
    'SAMPLE · Harbour Mental Health',
    'sample-harbour-mental-health',
    'SAMPLE: Counselling slots funded for coastal communities.',
    '["/hero.webp"]'::jsonb,
    false
  ),
  (
    'SAMPLE · Hillside Literacy Trust',
    'sample-hillside-literacy',
    'SAMPLE: Reading mentors and library hours for primary pupils.',
    '["/hero.webp"]'::jsonb,
    false
  )
ON CONFLICT (slug) DO NOTHING;
