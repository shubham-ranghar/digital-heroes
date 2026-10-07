-- Contact form messages (public insert, admin read/update)
CREATE TABLE public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  resolved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.contact_messages IS 'Inbound contact form submissions from the marketing site.';

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY contact_messages_insert_public ON public.contact_messages
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY contact_messages_select_admin ON public.contact_messages
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY contact_messages_update_admin ON public.contact_messages
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

GRANT INSERT ON public.contact_messages TO anon, authenticated;
GRANT SELECT, UPDATE ON public.contact_messages TO authenticated;

-- Account deletion requests (user submits; no automatic deletion)
CREATE TABLE public.account_deletion_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT account_deletion_requests_status_check CHECK (
    status IN ('pending', 'reviewed', 'cancelled')
  ),
  CONSTRAINT account_deletion_requests_user_unique UNIQUE (user_id)
);

ALTER TABLE public.account_deletion_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY account_deletion_insert_own ON public.account_deletion_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY account_deletion_select_own_or_admin ON public.account_deletion_requests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());
