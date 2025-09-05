-- Kolla vilka användare som har super_admin-roller
-- Denna query visar alla superadmins i systemet

SELECT 
  ur.user_id,
  ur.role,
  p.email,
  p.first_name,
  p.last_name,
  ur.created_at,
  CASE 
    WHEN p.email = 'admin@test.com' THEN 'Designated Superadmin'
    ELSE 'Other Superadmin'
  END as admin_type
FROM public.user_roles ur
LEFT JOIN public.profiles p ON ur.user_id = p.user_id
WHERE ur.role = 'super_admin'
ORDER BY ur.created_at;

-- Alternativ query om profiles inte fungerar - använd auth.users istället
SELECT 
  ur.user_id,
  ur.role,
  au.email,
  au.raw_user_meta_data->>'first_name' as first_name,
  au.raw_user_meta_data->>'last_name' as last_name,
  ur.created_at,
  CASE 
    WHEN au.email = 'admin@test.com' THEN 'Designated Superadmin'
    ELSE 'Other Superadmin'
  END as admin_type
FROM public.user_roles ur
LEFT JOIN auth.users au ON ur.user_id = au.id
WHERE ur.role = 'super_admin'
ORDER BY ur.created_at;

-- Kolla också alla roller för att se fördelningen
SELECT 
  role,
  COUNT(*) as antal_användare
FROM public.user_roles
GROUP BY role
ORDER BY role;
