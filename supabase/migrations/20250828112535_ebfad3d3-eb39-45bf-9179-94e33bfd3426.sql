-- Phase 1: Fix companies with missing owner_user_id
-- This update ensures all companies have proper ownership for security

UPDATE companies 
SET owner_user_id = (
  SELECT user_roles.user_id 
  FROM user_roles 
  WHERE user_roles.company_id = companies.id 
    AND user_roles.role = 'company_admin'
  LIMIT 1
)
WHERE owner_user_id IS NULL;