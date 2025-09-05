-- Kolla exakt vad som finns i databasen just nu

-- 1. Alla företag som finns
SELECT 
  'Current companies in database' as check_type,
  c.id,
  c.name,
  c.owner_user_id,
  c.is_active,
  c.created_at,
  au.email as owner_email
FROM public.companies c
LEFT JOIN auth.users au ON c.owner_user_id = au.id
ORDER BY c.created_at DESC;

-- 2. Alla användare som finns
SELECT 
  'Current users in database' as check_type,
  au.id,
  au.email,
  au.created_at
FROM auth.users au
ORDER BY au.created_at DESC;

-- 3. Alla user_roles som finns
SELECT 
  'Current user roles in database' as check_type,
  ur.user_id,
  ur.role,
  ur.company_id,
  au.email,
  c.name as company_name
FROM public.user_roles ur
LEFT JOIN auth.users au ON ur.user_id = au.id
LEFT JOIN public.companies c ON ur.company_id = c.id
ORDER BY ur.created_at DESC;

-- 4. Dubbletter (om det finns några)
SELECT 
  'Duplicate companies still exist' as check_type,
  c.name,
  COUNT(*) as antal_dubbletter
FROM public.companies c
GROUP BY c.name
HAVING COUNT(*) > 1
ORDER BY COUNT(*) DESC;
