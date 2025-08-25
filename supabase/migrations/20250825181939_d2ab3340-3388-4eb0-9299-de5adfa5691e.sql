-- Remove all hardcoded test data from companies table
DELETE FROM public.companies WHERE name = 'ACME Corp' OR id = '123e4567-e89b-12d3-a456-426614174000';