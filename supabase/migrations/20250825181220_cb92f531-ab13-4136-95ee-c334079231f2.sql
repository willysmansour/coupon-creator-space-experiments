-- Insert a default active campaign for ACME Corp
INSERT INTO campaigns (
  company_id,
  title,
  description,
  discount,
  status,
  valid_from,
  valid_to
) VALUES (
  '123e4567-e89b-12d3-a456-426614174000',
  'Ladda upp bild → få 20% rabatt',
  'Dela din bild och få rabatt på ditt nästa köp',
  '20%',
  'active',
  NOW(),
  NOW() + INTERVAL '3 months'
);