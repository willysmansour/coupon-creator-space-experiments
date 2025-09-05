-- Debug superadmin utan email - kolla auth.users istället
SELECT 
  ur.user_id,
  ur.role,
  au.email,
  au.raw_user_meta_data->>'first_name' as first_name,
  au.raw_user_meta_data->>'last_name' as last_name,
  au.created_at as auth_created,
  ur.created_at as role_created,
  CASE 
    WHEN au.email = 'admin@test.com' THEN 'Designated Superadmin'
    ELSE 'Other Superadmin'
  END as admin_type
FROM public.user_roles ur
LEFT JOIN auth.users au ON ur.user_id = au.id
WHERE ur.role = 'super_admin'
ORDER BY ur.created_at;

-- Kolla om profilen saknas för denna användare
SELECT 
  'Missing profile for superadmin' as issue,
  ur.user_id,
  au.email as auth_email,
  CASE WHEN p.user_id IS NULL THEN 'SAKNAR PROFIL' ELSE 'HAR PROFIL' END as profile_status
FROM public.user_roles ur
LEFT JOIN auth.users au ON ur.user_id = au.id
LEFT JOIN public.profiles p ON ur.user_id = p.user_id
WHERE ur.role = 'super_admin'
  AND ur.user_id = '99349edf-26e3-4b9b-86c8-109404567a6e';

-- Skapa profil för superadmin om den saknas
INSERT INTO public.profiles (user_id, email, first_name, last_name)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'first_name', 'Super'),
  COALESCE(au.raw_user_meta_data->>'last_name', 'Admin')
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.user_id
WHERE au.id = '99349edf-26e3-4b9b-86c8-109404567a6e'
  AND p.user_id IS NULL;
