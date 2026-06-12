-- Update the function handle_new_user to automatically link existing guest orders
-- with matching email to the newly created user profile.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );

  -- Link guest orders with matching email to the new user id
  UPDATE public.orders
  SET user_id = NEW.id
  WHERE email = NEW.email AND user_id IS NULL;

  RETURN NEW;
END;
$$;
