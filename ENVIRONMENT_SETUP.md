# Miljövariabler Setup

## Varför miljövariabler?

För säkerhets skull har alla känsliga konfigurationer flyttats till miljövariabler. Detta innebär att API-nycklar och databas-URLs inte längre är hårdkodade i koden.

## Setup för utveckling

1. Kopiera exempel-filen:
```bash
cp env.example .env
```

2. Redigera `.env` filen med dina riktiga Supabase-uppgifter:
```env
VITE_SUPABASE_URL=din_supabase_url_här
VITE_SUPABASE_ANON_KEY=din_supabase_anon_key_här
```

## Var hittar jag mina Supabase-uppgifter?

1. Gå till [Supabase Dashboard](https://app.supabase.com)
2. Välj ditt projekt
3. Gå till Settings > API
4. Kopiera:
   - `URL` (Project URL)
   - `anon public` key

## Produktion

För produktionsmiljö, ställ in dessa miljövariabler i din hosting-plattform:

### Vercel
```bash
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
```

### Netlify
Gå till Site settings > Environment variables och lägg till:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Railway/Heroku
```bash
# Railway
railway variables set VITE_SUPABASE_URL=din_url
railway variables set VITE_SUPABASE_ANON_KEY=din_key

# Heroku
heroku config:set VITE_SUPABASE_URL=din_url
heroku config:set VITE_SUPABASE_ANON_KEY=din_key
```

## Säkerhet

⚠️ **VIKTIGT**: 
- Lägg ALDRIG till `.env` filen till git
- Använd endast `anon` nyckeln, ALDRIG `service_role` nyckeln i frontend
- Kontrollera att `.env` är listad i `.gitignore`

## Felsökning

Om du ser felet "Missing Supabase environment variables":
1. Kontrollera att `.env` filen existerar
2. Kontrollera att variabelnamnen är korrekta (inklusive `VITE_` prefixet)
3. Starta om utvecklingsservern efter att ha ändrat `.env`
