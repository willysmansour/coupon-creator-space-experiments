-- Säker cleanup av företag-dubbletter med foreign key constraints
-- Vi måste flytta uploads till den "huvudsakliga" versionen av företaget innan vi tar bort dubbletter

-- STEG 1: Identifiera vilka företag som har uploads och kan inte tas bort direkt
SELECT 
  'Companies with uploads (cannot delete directly)' as status,
  c.id,
  c.name,
  c.created_at,
  COUNT(u.id) as antal_uploads
FROM public.companies c
LEFT JOIN public.uploads u ON c.id = u.company_id
WHERE c.name IN ('test', 'New Company', 'Conta')
GROUP BY c.id, c.name, c.created_at
HAVING COUNT(u.id) > 0
ORDER BY c.name, c.created_at;

-- STEG 2: För varje dublett-grupp, identifiera det "huvudsakliga" företaget (senaste)
WITH main_companies AS (
  SELECT DISTINCT ON (name) 
    id as main_company_id,
    name,
    created_at
  FROM public.companies 
  WHERE name IN ('test', 'New Company', 'Conta')
  ORDER BY name, created_at DESC
),
duplicate_companies AS (
  SELECT 
    c.id as duplicate_id,
    c.name,
    mc.main_company_id
  FROM public.companies c
  JOIN main_companies mc ON c.name = mc.name
  WHERE c.id != mc.main_company_id
    AND c.name IN ('test', 'New Company', 'Conta')
)
SELECT 
  'Cleanup plan' as step,
  dc.name,
  dc.duplicate_id as will_be_deleted,
  dc.main_company_id as will_be_kept,
  COUNT(u.id) as uploads_to_move
FROM duplicate_companies dc
LEFT JOIN public.uploads u ON dc.duplicate_id = u.company_id
GROUP BY dc.name, dc.duplicate_id, dc.main_company_id
ORDER BY dc.name;

-- STEG 3: Flytta uploads från dubbletter till huvudföretaget
-- VARNING: Detta ändrar data permanent!
/*
WITH main_companies AS (
  SELECT DISTINCT ON (name) 
    id as main_company_id,
    name
  FROM public.companies 
  WHERE name IN ('test', 'New Company', 'Conta')
  ORDER BY name, created_at DESC
),
duplicate_companies AS (
  SELECT 
    c.id as duplicate_id,
    c.name,
    mc.main_company_id
  FROM public.companies c
  JOIN main_companies mc ON c.name = mc.name
  WHERE c.id != mc.main_company_id
    AND c.name IN ('test', 'New Company', 'Conta')
)
UPDATE public.uploads 
SET company_id = dc.main_company_id
FROM duplicate_companies dc
WHERE uploads.company_id = dc.duplicate_id;
*/

-- STEG 4: Flytta user_roles från dubbletter till huvudföretaget
/*
WITH main_companies AS (
  SELECT DISTINCT ON (name) 
    id as main_company_id,
    name
  FROM public.companies 
  WHERE name IN ('test', 'New Company', 'Conta')
  ORDER BY name, created_at DESC
),
duplicate_companies AS (
  SELECT 
    c.id as duplicate_id,
    c.name,
    mc.main_company_id
  FROM public.companies c
  JOIN main_companies mc ON c.name = mc.name
  WHERE c.id != mc.main_company_id
    AND c.name IN ('test', 'New Company', 'Conta')
)
UPDATE public.user_roles 
SET company_id = dc.main_company_id
FROM duplicate_companies dc
WHERE user_roles.company_id = dc.duplicate_id;
*/

-- STEG 5: Nu kan vi säkert ta bort dubbletter (efter steg 3 och 4)
/*
WITH main_companies AS (
  SELECT DISTINCT ON (name) 
    id as main_company_id,
    name
  FROM public.companies 
  WHERE name IN ('test', 'New Company', 'Conta')
  ORDER BY name, created_at DESC
)
DELETE FROM public.companies c
WHERE c.name IN ('test', 'New Company', 'Conta')
  AND c.id NOT IN (SELECT main_company_id FROM main_companies);
*/

-- STEG 6: Verifiera att cleanup fungerade
SELECT 
  'After cleanup verification' as status,
  c.name,
  COUNT(*) as antal_kvar
FROM public.companies c
WHERE c.name IN ('test', 'New Company', 'Conta')
GROUP BY c.name
ORDER BY c.name;
