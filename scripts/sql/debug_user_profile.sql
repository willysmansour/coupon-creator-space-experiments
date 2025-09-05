-- Debug användarens profil och roll
-- Kolla om användaren har profil och vilken roll de har

-- 1. Kolla aktuell inloggad användare (kör i Supabase med användaren inloggad)
SELECT 
  'Current user info' as debug_step,
  auth.uid() as user_id,
  (SELECT email FROM auth.users WHERE id = auth.uid()) as email;

-- 2. Kolla om användaren har en profil
SELECT 
  'Profile check' as debug_step,
  p.*
FROM public.profiles p
WHERE p.user_id = auth.uid();

-- 3. Kolla användarens roller
SELECT 
  'User roles check' as debug_step,
  ur.role,
  ur.company_id,
  c.name as company_name
FROM public.user_roles ur
LEFT JOIN public.companies c ON ur.company_id = c.id
WHERE ur.user_id = auth.uid();

-- 4. Kolla auth.users metadata (där vi skickar company_name, first_name, last_name)
SELECT 
  'Auth metadata check' as debug_step,
  au.email,
  au.raw_user_meta_data
FROM auth.users au
WHERE au.id = auth.uid();

-- 5. Skapa profil manuellt om den saknas (kör bara om profil saknas)
INSERT INTO public.profiles (user_id, email, first_name, last_name)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'first_name', 'User'),
  COALESCE(au.raw_user_meta_data->>'last_name', 'Name')
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.user_id
WHERE au.id = auth.uid()
  AND p.user_id IS NULL;
