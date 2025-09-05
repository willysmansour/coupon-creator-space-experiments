-- FINAL DATABASE CLEANUP - Ta bort alla gamla företag och behåll bara aktiva

-- STEG 1: Identifiera vilka företag som ska BEHÅLLAS (har owner_user_id)
SELECT 
  'Companies to KEEP' as action,
  c.id,
  c.name,
  c.owner_user_id,
  c.created_at,
  au.email as owner_email
FROM public.companies c
LEFT JOIN auth.users au ON c.owner_user_id = au.id
WHERE c.owner_user_id IS NOT NULL
ORDER BY c.created_at DESC;

-- STEG 2: Identifiera vilka företag som ska TAS BORT (saknar owner_user_id)
SELECT 
  'Companies to DELETE' as action,
  c.id,
  c.name,
  c.owner_user_id,
  c.created_at
FROM public.companies c
WHERE c.owner_user_id IS NULL
ORDER BY c.created_at DESC;

-- STEG 3: Kolla om det finns uploads eller user_roles kopplade till företag som ska tas bort
SELECT 
  'Orphaned uploads that will be affected' as action,
  u.id as upload_id,
  u.company_id,
  c.name as company_name,
  u.customer_name,
  u.created_at
FROM public.uploads u
JOIN public.companies c ON u.company_id = c.id
WHERE c.owner_user_id IS NULL;

SELECT 
  'Orphaned user_roles that will be affected' as action,
  ur.id as role_id,
  ur.user_id,
  ur.role,
  ur.company_id,
  c.name as company_name
FROM public.user_roles ur
JOIN public.companies c ON ur.company_id = c.id
WHERE c.owner_user_id IS NULL;

-- STEG 4: TA BORT alla företag utan ägare (VARNING: Detta tar bort data permanent!)
-- Kör bara om du är säker på att du vill ta bort dessa företag
/*
DELETE FROM public.companies 
WHERE owner_user_id IS NULL;
*/

-- STEG 5: Verifiera att endast aktiva företag finns kvar
/*
SELECT 
  'Companies remaining after cleanup' as result,
  c.id,
  c.name,
  c.owner_user_id,
  c.created_at,
  au.email as owner_email
FROM public.companies c
LEFT JOIN auth.users au ON c.owner_user_id = au.id
ORDER BY c.created_at DESC;
*/
