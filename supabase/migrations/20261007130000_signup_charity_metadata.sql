-- On signup, create user_charity from auth.users.raw_user_meta_data (email-confirm flow).

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  charity_uuid uuid;
  pct numeric;
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (NEW.id, 'subscriber')
  ON CONFLICT (id) DO NOTHING;

  charity_uuid := NULLIF(NEW.raw_user_meta_data ->> 'charity_id', '')::uuid;
  pct := COALESCE((NEW.raw_user_meta_data ->> 'charity_percentage')::numeric, 10);

  IF charity_uuid IS NOT NULL THEN
    INSERT INTO public.user_charity (user_id, charity_id, percentage)
    VALUES (NEW.id, charity_uuid, GREATEST(pct, 10))
    ON CONFLICT (user_id) DO UPDATE
      SET charity_id = EXCLUDED.charity_id,
          percentage = EXCLUDED.percentage,
          updated_at = now();
  END IF;

  RETURN NEW;
END;
$$;
