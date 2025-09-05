-- Kolla varför test@test.com inte syns i Admin-panelen

-- 1. Kolla om test@test.com finns i auth.users
SELECT 
  'Auth users check' as step,
  au.id,
  au.email,
  au.created_at
FROM auth.users au
WHERE au.email = 'test@test.com';

-- 2. Kolla om test@test.com har roller
SELECT 
  'User roles check' as step,
  ur.user_id,
  ur.role,
  ur.company_id,
  ur.created_at
FROM public.user_roles ur
JOIN auth.users au ON ur.user_id = au.id
WHERE au.email = 'test@test.com';

-- 3. Kolla alla användare och deras roller (vad Admin-sidan ser)
SELECT 
  'What Admin page sees' as step,
  ur.id,
  ur.user_id,
  ur.role,
  ur.company_id,
  c.name as company_name,
  ur.created_at
FROM public.user_roles ur
LEFT JOIN public.companies c ON ur.company_id = c.id
ORDER BY ur.created_at DESC;

-- 4. Kolla alla auth.users (alla som registrerat sig)
SELECT 
  'All registered users' as step,
  au.id,
  au.email,
  au.created_at,
  CASE WHEN ur.user_id IS NULL THEN 'SAKNAR ROLL' ELSE 'HAR ROLL' END as role_status
FROM auth.users au
LEFT JOIN public.user_roles ur ON au.id = ur.user_id
ORDER BY au.created_at DESC;
