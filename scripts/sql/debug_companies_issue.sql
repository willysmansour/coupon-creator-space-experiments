-- Debug företag-problemet: varför finns det så många dubbletter?

-- 1. Kolla alla företag och när de skapades
SELECT 
  'All companies' as step,
  c.id,
  c.name,
  c.owner_user_id,
  c.is_active,
  c.discount_active,
  c.discount_percentage,
  c.created_at,
  au.email as owner_email
FROM public.companies c
LEFT JOIN auth.users au ON c.owner_user_id = au.id
ORDER BY c.created_at DESC;

-- 2. Kolla dubbletter av företagsnamn
SELECT 
  'Company name duplicates' as step,
  c.name,
  COUNT(*) as antal_dubbletter,
  MIN(c.created_at) as första_skapad,
  MAX(c.created_at) as senast_skapad
FROM public.companies c
GROUP BY c.name
HAVING COUNT(*) > 1
ORDER BY COUNT(*) DESC;

-- 3. Kolla företag utan ägare
SELECT 
  'Companies without owners' as step,
  c.id,
  c.name,
  c.owner_user_id,
  c.created_at
FROM public.companies c
WHERE c.owner_user_id IS NULL
ORDER BY c.created_at DESC;

-- 4. Kolla användare och deras företag
SELECT 
  'Users and their companies' as step,
  au.email,
  ur.role,
  c.name as company_name,
  c.id as company_id,
  ur.created_at as role_created,
  c.created_at as company_created
FROM auth.users au
LEFT JOIN public.user_roles ur ON au.id = ur.user_id
LEFT JOIN public.companies c ON ur.company_id = c.id
WHERE au.email != 'admin@test.com'
ORDER BY au.created_at DESC;

-- 5. Ta bort dubbletter (behåll bara den senaste av varje namn)
-- VARNING: Kör bara om du är säker!
/*
DELETE FROM public.companies c1
WHERE EXISTS (
  SELECT 1 FROM public.companies c2
  WHERE c2.name = c1.name 
    AND c2.created_at > c1.created_at
    AND c1.name != 'admin' -- Skydda admin-företaget
);
*/
