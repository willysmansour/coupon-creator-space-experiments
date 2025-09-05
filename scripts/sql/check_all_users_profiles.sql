-- Kolla alla användare och deras profiler (utan att behöva vara inloggad)

-- 1. Kolla alla användare i auth.users
SELECT 
  'All auth users' as step,
  au.id,
  au.email,
  au.created_at,
  au.raw_user_meta_data->>'first_name' as meta_first_name,
  au.raw_user_meta_data->>'last_name' as meta_last_name,
  au.raw_user_meta_data->>'company_name' as meta_company_name
FROM auth.users au
ORDER BY au.created_at DESC
LIMIT 5;

-- 2. Kolla alla profiler
SELECT 
  'All profiles' as step,
  p.user_id,
  p.email,
  p.first_name,
  p.last_name,
  p.created_at
FROM public.profiles p
ORDER BY p.created_at DESC
LIMIT 5;

-- 3. Kolla vilka användare som SAKNAR profiler
SELECT 
  'Users missing profiles' as step,
  au.id as user_id,
  au.email,
  au.created_at,
  CASE WHEN p.user_id IS NULL THEN 'SAKNAR PROFIL' ELSE 'HAR PROFIL' END as profile_status
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.user_id
WHERE p.user_id IS NULL
ORDER BY au.created_at DESC;

-- 4. Kolla alla user_roles
SELECT 
  'All user roles' as step,
  ur.user_id,
  ur.role,
  ur.company_id,
  c.name as company_name,
  ur.created_at
FROM public.user_roles ur
LEFT JOIN public.companies c ON ur.company_id = c.id
ORDER BY ur.created_at DESC
LIMIT 5;
