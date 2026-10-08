ALTER TABLE public.charities
  ADD COLUMN IF NOT EXISTS category text;

COMMENT ON COLUMN public.charities.category IS
  'Optional cause category for directory filtering (e.g. Education).';

CREATE INDEX IF NOT EXISTS charities_category_idx ON public.charities (category)
  WHERE category IS NOT NULL;
