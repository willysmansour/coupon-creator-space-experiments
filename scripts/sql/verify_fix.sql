-- Verifiera att fix:en fungerade

-- 1. Kolla alla profiler (ska nu ha rätt data)
SELECT 
  'Fixed profiles' as step,
  p.user_id,
  p.email,
  p.first_name,
  p.last_name,
  p.company_id,
  p.created_at
FROM public.profiles p
ORDER BY p.created_at DESC;

-- 2. Kolla specifikt test@test.com användaren
SELECT 
  'Test user profile' as step,
  p.*
FROM public.profiles p
WHERE p.user_id = '3c654742-666d-466a-be5f-7b75abff99ae';

-- 3. Kolla att triggern finns och är aktiv
SELECT 
  'Trigger status' as step,
  trigger_name,
  event_manipulation,
  trigger_schema,
  trigger_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- 4. Kolla att funktionen finns
SELECT 
  'Function status' as step,
  routine_name,
  routine_type,
  routine_definition
FROM information_schema.routines
WHERE routine_name = 'handle_new_user'
  AND routine_schema = 'public';

-- 5. Test: Kolla att metadata läses korrekt från auth.users
SELECT 
  'Metadata test' as step,
  au.email,
  au.raw_user_meta_data->>'first_name' as should_be_first_name,
  au.raw_user_meta_data->>'last_name' as should_be_last_name,
  au.raw_user_meta_data->>'company_name' as should_be_company_name,
  p.first_name as actual_first_name,
  p.last_name as actual_last_name
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.user_id
WHERE au.email = 'test@test.com';
