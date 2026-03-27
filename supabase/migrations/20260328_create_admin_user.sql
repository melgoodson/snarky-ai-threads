-- ============================================================
-- Create admin user: teamsienvi@gmail.com
-- Password: SnarkyAdmin2026!
--
-- ⚠️ DO NOT run as a migration. Run manually in Supabase SQL Editor.
-- ⚠️ If you get "database error querying schema", see Step 0 below.
-- ============================================================

-- ╔════════════════════════════════════════════════════════════╗
-- ║ OPTION A: Use Supabase Dashboard (RECOMMENDED)           ║
-- ║                                                           ║
-- ║ 1. Go to Supabase Dashboard → Authentication → Users      ║
-- ║ 2. Click "Add user" → "Create new user"                  ║
-- ║ 3. Email: teamsienvi@gmail.com                            ║
-- ║    Password: SnarkyAdmin2026!                             ║
-- ║    ✅ Check "Auto Confirm User"                           ║
-- ║ 4. Click Create                                           ║
-- ║ 5. Then run ONLY the SQL below (Step 2 + Step 3)          ║
-- ╚════════════════════════════════════════════════════════════╝


-- Step 0: If you already ran the old SQL and got "database error querying schema",
-- clean up the broken record first:
-- DELETE FROM auth.identities WHERE provider_id IN (SELECT id::text FROM auth.users WHERE email = 'teamsienvi@gmail.com');
-- DELETE FROM auth.users WHERE email = 'teamsienvi@gmail.com';


-- ╔════════════════════════════════════════════════════════════╗
-- ║ OPTION B: Create user via SQL (if Dashboard doesn't work) ║
-- ╚════════════════════════════════════════════════════════════╝

-- Step 1: Create auth user
DO $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Check if user already exists
  SELECT id INTO new_user_id FROM auth.users WHERE email = 'teamsienvi@gmail.com';

  IF new_user_id IS NOT NULL THEN
    RAISE NOTICE 'User already exists with id: %', new_user_id;
  ELSE
    -- Generate a new UUID
    new_user_id := gen_random_uuid();

    -- Insert user
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password,
      email_confirmed_at, aud, role,
      raw_app_meta_data, raw_user_meta_data,
      is_super_admin, created_at, updated_at,
      confirmation_token, recovery_token,
      email_change_token_new, email_change
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'teamsienvi@gmail.com',
      crypt('SnarkyAdmin2026!', gen_salt('bf')),
      now(), 'authenticated', 'authenticated',
      '{"provider":"email","providers":["email"]}',
      '{}',
      false, now(), now(),
      '', '', '', ''
    );

    -- Insert identity (required by GoTrue)
    INSERT INTO auth.identities (
      id, user_id, identity_data, provider, provider_id,
      last_sign_in_at, created_at, updated_at
    ) VALUES (
      gen_random_uuid(),
      new_user_id,
      jsonb_build_object('sub', new_user_id::text, 'email', 'teamsienvi@gmail.com', 'email_verified', true),
      'email',
      new_user_id::text,
      now(), now(), now()
    );

    RAISE NOTICE 'User created with id: %', new_user_id;
  END IF;
END $$;


-- Step 2: Grant admin role (run this regardless of Option A or B)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'teamsienvi@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;


-- Step 3: Create profile (run this regardless of Option A or B)
INSERT INTO public.profiles (id, username)
SELECT id, 'teamsienvi'
FROM auth.users
WHERE email = 'teamsienvi@gmail.com'
ON CONFLICT (id) DO NOTHING;


-- Step 4: Verify everything worked
SELECT
  u.id,
  u.email,
  u.email_confirmed_at,
  r.role
FROM auth.users u
LEFT JOIN public.user_roles r ON r.user_id = u.id
WHERE u.email = 'teamsienvi@gmail.com';
