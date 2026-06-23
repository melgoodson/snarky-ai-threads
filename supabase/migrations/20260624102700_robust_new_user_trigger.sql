-- Redefine handle_new_user function to gracefully resolve username collisions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  suffix INT := 1;
BEGIN
  -- Extract initial base username
  base_username := COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1));
  
  -- Handle empty or null username edge case
  IF base_username IS NULL OR base_username = '' THEN
    base_username := 'user';
  END IF;
  
  final_username := base_username;
  
  -- Loop to append dynamic numeric suffixes if username already exists
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) LOOP
    final_username := base_username || suffix::TEXT;
    suffix := suffix + 1;
  END LOOP;

  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, final_username);
  RETURN NEW;
END;
$$;
