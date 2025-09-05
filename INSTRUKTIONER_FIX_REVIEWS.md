# 🔧 FIX FÖR "UPLOADED CONTENT" PROBLEMET

## Problemet
Du ser "Uploaded content" istället för riktiga recensioner eller tomt fält.

## Lösning - Följ dessa steg:

### 1. Öppna Supabase Dashboard
1. Gå till: https://supabase.com/dashboard/project/mbpghmizndwixvuqrvmu
2. Klicka på "SQL Editor" i vänstermenyn

### 2. Kör detta SQL-kommando
Kopiera och klistra in detta i SQL Editor:

```sql
-- Ta bort alla "Uploaded content" meddelanden
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
```

### 3. Klicka på "Run" (grön knapp)

### 4. Ladda om din app
Gå tillbaka till din app och ladda om sidan - nu ska "Uploaded content" vara borta!

## Vad händer nu?
- ✅ Gamla uploads utan riktig review → Visar ingenting
- ✅ Nya uploads med review → Visar recensionen
- ✅ Nya uploads utan review → Visar ingenting

## Test
1. Ladda upp en ny bild MED en review → Den ska visas
2. Ladda upp en ny bild UTAN review → Inget ska visas under "Customer Review"
