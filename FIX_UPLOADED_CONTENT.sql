-- KOPIA DETTA OCH KÖR I SUPABASE SQL EDITOR
-- Detta tar bort alla "Uploaded content" meddelanden

UPDATE uploads 
SET message = NULL
WHERE message = 'Uploaded content';

-- Visa resultat
SELECT 
  id,
  customer_name,
  message,
  created_at
FROM uploads
ORDER BY created_at DESC;
