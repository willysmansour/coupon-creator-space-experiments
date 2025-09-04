-- Ta bort dubbletter av företag - behåll bara den senaste versionen av varje namn

-- STEG 1: Kolla vilka som kommer tas bort (kör först för att se vad som händer)
SELECT 
  'Companies to be deleted' as action,
  c1.id,
  c1.name,
  c1.created_at as will_be_deleted,
  c2.created_at as newer_version_exists
FROM public.companies c1
JOIN public.companies c2 ON c1.name = c2.name AND c2.created_at > c1.created_at
WHERE c1.name IN ('test', 'New Company', 'Conta')
ORDER BY c1.name, c1.created_at;

-- STEG 2: Ta bort dubbletter (kör bara om du är säker!)
-- Detta behåller den SENASTE versionen av varje företagsnamn
DELETE FROM public.companies c1
WHERE EXISTS (
  SELECT 1 FROM public.companies c2
  WHERE c2.name = c1.name 
    AND c2.created_at > c1.created_at
)
AND c1.name IN ('test', 'New Company', 'Conta');

-- STEG 3: Verifiera att dubbletter är borta
SELECT 
  'After cleanup' as status,
  c.name,
  COUNT(*) as antal_kvar
FROM public.companies c
GROUP BY c.name
HAVING COUNT(*) > 1
ORDER BY COUNT(*) DESC;

-- STEG 4: Kolla att user_roles fortfarande är kopplade korrekt
SELECT 
  'User roles check' as status,
  ur.user_id,
  ur.role,
  ur.company_id,
  c.name as company_name,
  CASE WHEN c.id IS NULL THEN 'BROKEN LINK!' ELSE 'OK' END as status
FROM public.user_roles ur
LEFT JOIN public.companies c ON ur.company_id = c.id
WHERE ur.role = 'company_admin'
ORDER BY ur.created_at DESC;
