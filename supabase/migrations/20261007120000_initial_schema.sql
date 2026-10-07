-- Digital Heroes: initial schema, score retention trigger, RLS, and is_admin() helper.
-- Roles: subscriber (default) and admin. Visitors have no auth.users row.

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

-- Returns true when the current JWT user is an admin (used in RLS policies).
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  );
$$;

COMMENT ON FUNCTION public.is_admin() IS
  'Security definer helper for RLS: true when auth.uid() has profiles.role = admin.';

-- Prevent subscribers from escalating their own role.
CREATE OR REPLACE FUNCTION public.profiles_guard_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.role IS DISTINCT FROM OLD.role AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can change profile roles';
  END IF;
  RETURN NEW;
END;
$$;

-- Keep only the latest five scores per user (by played_on, then created_at).
CREATE OR REPLACE FUNCTION public.scores_enforce_latest_five()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.scores s
  WHERE s.user_id = NEW.user_id
    AND s.id NOT IN (
      SELECT id
      FROM public.scores
      WHERE user_id = NEW.user_id
      ORDER BY played_on DESC, created_at DESC
      LIMIT 5
    );
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.scores_enforce_latest_five() IS
  'After insert, deletes older rows so each user retains at most five scores (newest played_on first).';

-- Create a profile when a new auth user signs up.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (NEW.id, 'subscriber')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'subscriber'
    CONSTRAINT profiles_role_check CHECK (role IN ('subscriber', 'admin')),
  display_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.profiles IS
  'App user identity linked to auth.users; role is subscriber or admin (enforced server-side and in RLS).';

COMMENT ON COLUMN public.profiles.role IS 'subscriber: paying member; admin: full data access.';

CREATE TRIGGER profiles_guard_role_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.profiles_guard_role();

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------------
-- subscriptions
-- ---------------------------------------------------------------------------
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  plan text NOT NULL
    CONSTRAINT subscriptions_plan_check CHECK (plan IN ('monthly', 'yearly')),
  status text NOT NULL DEFAULT 'active'
    CONSTRAINT subscriptions_status_check CHECK (status IN ('active', 'cancelled', 'lapsed')),
  stripe_customer_id text,
  stripe_subscription_id text,
  renewal_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT subscriptions_stripe_subscription_id_unique UNIQUE (stripe_subscription_id)
);

CREATE INDEX subscriptions_user_id_idx ON public.subscriptions (user_id);
CREATE INDEX subscriptions_status_idx ON public.subscriptions (status);

COMMENT ON TABLE public.subscriptions IS
  'Stripe-backed membership; status must be verified server-side on authenticated requests.';

COMMENT ON COLUMN public.subscriptions.renewal_date IS
  'Next billing cycle date from Stripe; used for access checks.';

-- ---------------------------------------------------------------------------
-- charities
-- ---------------------------------------------------------------------------
CREATE TABLE public.charities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  images jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX charities_is_featured_idx ON public.charities (is_featured) WHERE is_featured = true;

COMMENT ON TABLE public.charities IS
  'Partner causes; publicly readable. Users select one at signup (see user_charity).';

COMMENT ON COLUMN public.charities.images IS 'JSON array of image URLs for marketing and signup.';

-- ---------------------------------------------------------------------------
-- charity_events
-- ---------------------------------------------------------------------------
CREATE TABLE public.charity_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  charity_id uuid NOT NULL REFERENCES public.charities (id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  event_date date NOT NULL,
  location text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX charity_events_charity_id_idx ON public.charity_events (charity_id);
CREATE INDEX charity_events_event_date_idx ON public.charity_events (event_date);

COMMENT ON TABLE public.charity_events IS
  'Charity events and related activities; publicly readable.';

-- ---------------------------------------------------------------------------
-- user_charity
-- ---------------------------------------------------------------------------
CREATE TABLE public.user_charity (
  user_id uuid PRIMARY KEY REFERENCES public.profiles (id) ON DELETE CASCADE,
  charity_id uuid NOT NULL REFERENCES public.charities (id) ON DELETE RESTRICT,
  percentage numeric(5, 2) NOT NULL
    CONSTRAINT user_charity_percentage_min CHECK (percentage >= 10),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.user_charity IS
  'Charity chosen at signup; minimum 10% of subscription fee, user may increase.';

-- ---------------------------------------------------------------------------
-- donations (independent of gameplay / subscription split)
-- ---------------------------------------------------------------------------
CREATE TABLE public.donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  charity_id uuid NOT NULL REFERENCES public.charities (id) ON DELETE RESTRICT,
  amount_cents integer NOT NULL
    CONSTRAINT donations_amount_cents_positive CHECK (amount_cents > 0),
  currency text NOT NULL DEFAULT 'gbp',
  stripe_payment_intent_id text,
  status text NOT NULL DEFAULT 'pending'
    CONSTRAINT donations_status_check CHECK (status IN ('pending', 'succeeded', 'failed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX donations_user_id_idx ON public.donations (user_id);
CREATE INDEX donations_charity_id_idx ON public.donations (charity_id);

COMMENT ON TABLE public.donations IS
  'One-off donations separate from subscription gameplay and prize pool.';

-- ---------------------------------------------------------------------------
-- scores
-- ---------------------------------------------------------------------------
CREATE TABLE public.scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  score smallint NOT NULL
    CONSTRAINT scores_score_range CHECK (score BETWEEN 1 AND 45),
  played_on date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT scores_one_per_user_per_day UNIQUE (user_id, played_on)
);

CREATE INDEX scores_user_id_played_on_idx ON public.scores (user_id, played_on DESC);

COMMENT ON TABLE public.scores IS
  'Stableford points 1–45; one row per user per calendar date; trigger retains latest five only.';

CREATE TRIGGER scores_enforce_latest_five_trigger
  AFTER INSERT ON public.scores
  FOR EACH ROW
  EXECUTE FUNCTION public.scores_enforce_latest_five();

-- ---------------------------------------------------------------------------
-- draws
-- ---------------------------------------------------------------------------
CREATE TABLE public.draws (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  month date NOT NULL,
  status text NOT NULL DEFAULT 'draft'
    CONSTRAINT draws_status_check CHECK (status IN ('draft', 'simulated', 'published')),
  mode text NOT NULL DEFAULT 'random'
    CONSTRAINT draws_mode_check CHECK (mode IN ('random', 'algorithmic')),
  winning_numbers jsonb,
  jackpot_carryover numeric(12, 2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT draws_month_unique UNIQUE (month),
  CONSTRAINT draws_month_first_day CHECK (extract(day FROM month) = 1)
);

COMMENT ON TABLE public.draws IS
  'Monthly prize draw; winning_numbers typically five Stableford values; jackpot_carryover for unclaimed 5-match tier.';

COMMENT ON COLUMN public.draws.month IS 'First calendar day of the draw month (YYYY-MM-01).';

-- ---------------------------------------------------------------------------
-- draw_entries
-- ---------------------------------------------------------------------------
CREATE TABLE public.draw_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_id uuid NOT NULL REFERENCES public.draws (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  -- Snapshot of the member''s five scores used for this draw at entry time.
  score_snapshot jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT draw_entries_unique_per_draw UNIQUE (draw_id, user_id)
);

CREATE INDEX draw_entries_draw_id_idx ON public.draw_entries (draw_id);
CREATE INDEX draw_entries_user_id_idx ON public.draw_entries (user_id);

COMMENT ON TABLE public.draw_entries IS
  'Subscriber participation in a monthly draw; one entry per user per draw.';

-- ---------------------------------------------------------------------------
-- winners
-- ---------------------------------------------------------------------------
CREATE TABLE public.winners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_id uuid NOT NULL REFERENCES public.draws (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  tier smallint NOT NULL
    CONSTRAINT winners_tier_check CHECK (tier IN (3, 4, 5)),
  prize_amount numeric(12, 2) NOT NULL
    CONSTRAINT winners_prize_amount_non_negative CHECK (prize_amount >= 0),
  proof_url text,
  verification text NOT NULL DEFAULT 'pending'
    CONSTRAINT winners_verification_check CHECK (
      verification IN ('pending', 'approved', 'rejected')
    ),
  payment text NOT NULL DEFAULT 'pending'
    CONSTRAINT winners_payment_check CHECK (payment IN ('pending', 'paid')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT winners_unique_user_tier_per_draw UNIQUE (draw_id, user_id, tier)
);

CREATE INDEX winners_draw_id_idx ON public.winners (draw_id);
CREATE INDEX winners_user_id_idx ON public.winners (user_id);

COMMENT ON TABLE public.winners IS
  'Draw winners: screenshot proof, admin verification, then payment Pending → Paid.';

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charity_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_charity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draw_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.winners ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY profiles_select_own_or_admin ON public.profiles
  FOR SELECT
  USING (id = auth.uid() OR public.is_admin());

CREATE POLICY profiles_update_own_or_admin ON public.profiles
  FOR UPDATE
  USING (id = auth.uid() OR public.is_admin())
  WITH CHECK (id = auth.uid() OR public.is_admin());

CREATE POLICY profiles_insert_admin ON public.profiles
  FOR INSERT
  WITH CHECK (public.is_admin() OR id = auth.uid());

CREATE POLICY profiles_delete_admin ON public.profiles
  FOR DELETE
  USING (public.is_admin());

-- subscriptions
CREATE POLICY subscriptions_select_own_or_admin ON public.subscriptions
  FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY subscriptions_insert_admin ON public.subscriptions
  FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY subscriptions_update_admin ON public.subscriptions
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY subscriptions_delete_admin ON public.subscriptions
  FOR DELETE
  USING (public.is_admin());

-- charities (public read)
CREATE POLICY charities_select_public ON public.charities
  FOR SELECT
  USING (true);

CREATE POLICY charities_insert_admin ON public.charities
  FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY charities_update_admin ON public.charities
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY charities_delete_admin ON public.charities
  FOR DELETE
  USING (public.is_admin());

-- charity_events (public read)
CREATE POLICY charity_events_select_public ON public.charity_events
  FOR SELECT
  USING (true);

CREATE POLICY charity_events_insert_admin ON public.charity_events
  FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY charity_events_update_admin ON public.charity_events
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY charity_events_delete_admin ON public.charity_events
  FOR DELETE
  USING (public.is_admin());

-- user_charity
CREATE POLICY user_charity_select_own_or_admin ON public.user_charity
  FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY user_charity_insert_own_or_admin ON public.user_charity
  FOR INSERT
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

CREATE POLICY user_charity_update_own_or_admin ON public.user_charity
  FOR UPDATE
  USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

CREATE POLICY user_charity_delete_own_or_admin ON public.user_charity
  FOR DELETE
  USING (user_id = auth.uid() OR public.is_admin());

-- donations
CREATE POLICY donations_select_own_or_admin ON public.donations
  FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY donations_insert_own_or_admin ON public.donations
  FOR INSERT
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

CREATE POLICY donations_update_admin ON public.donations
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY donations_delete_admin ON public.donations
  FOR DELETE
  USING (public.is_admin());

-- scores
CREATE POLICY scores_select_own_or_admin ON public.scores
  FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY scores_insert_own_or_admin ON public.scores
  FOR INSERT
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

CREATE POLICY scores_update_own_or_admin ON public.scores
  FOR UPDATE
  USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

CREATE POLICY scores_delete_own_or_admin ON public.scores
  FOR DELETE
  USING (user_id = auth.uid() OR public.is_admin());

-- draws: members may read published draws; admins manage all
CREATE POLICY draws_select_published_or_admin ON public.draws
  FOR SELECT
  USING (status = 'published' OR public.is_admin());

CREATE POLICY draws_insert_admin ON public.draws
  FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY draws_update_admin ON public.draws
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY draws_delete_admin ON public.draws
  FOR DELETE
  USING (public.is_admin());

-- draw_entries
CREATE POLICY draw_entries_select_own_or_admin ON public.draw_entries
  FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY draw_entries_insert_own_or_admin ON public.draw_entries
  FOR INSERT
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

CREATE POLICY draw_entries_update_own_or_admin ON public.draw_entries
  FOR UPDATE
  USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

CREATE POLICY draw_entries_delete_admin ON public.draw_entries
  FOR DELETE
  USING (public.is_admin());

-- winners
CREATE POLICY winners_select_own_or_admin ON public.winners
  FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY winners_insert_admin ON public.winners
  FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY winners_update_own_or_admin ON public.winners
  FOR UPDATE
  USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

CREATE POLICY winners_delete_admin ON public.winners
  FOR DELETE
  USING (public.is_admin());

-- API roles (RLS still applies for anon/authenticated; service_role bypasses RLS)
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT SELECT ON public.charities, public.charity_events TO anon, authenticated;
GRANT SELECT ON public.draws TO authenticated;

GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;
