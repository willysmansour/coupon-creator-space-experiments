README – UGC Plattform

🌟 Översikt

Detta är en UGC‑plattform (User Generated Content) där företag kan skapa kampanjer som belönar sina kunder med rabatter eller kuponger i utbyte mot att kunderna laddar upp bilder, videos och korta recensioner.

Målet är att företag ska få autentiskt marknadsföringsmaterial från riktiga kunder, samtidigt som kunderna får en belöning för sitt engagemang.

Roller i systemet:
- Företag: restauranger, butiker, gym, frisörer m.fl.
- Kunder: slutanvändare som deltar via QR‑koder eller delade länkar.
- Superadmin: plattformens ägare med full kontroll över alla företag och data.

⚙️ Funktionalitet

Företagsdashboard
- Skapa kampanjer: titel, villkor (rabatt %, belöning), giltighetstid.
- Dela QR‑kod eller länk för kundflödet.
- Hantera uppladdningar: se inkomna bilder/videos + kundens text, godkänn/avvisa (i nuläget manuell granskning som standard).
- Kuponghantering: skapade kuponger, status, samt inlösta kuponger (markeras som “✅ redan använd”).
- Statistik: antal uppladdningar, utdelade kuponger, inlösta kuponger.
- Recensioner: kunden kan lämna kort recension; företaget kan spara dessa för sociala medier/hemsidan.

Kundflöde (ingen inloggning krävs)
1) Kunden skannar en QR‑kod eller öppnar en länk i butik/restaurang.
2) Laddar upp bild/video och kan skriva en kort recension.
3) Efter godkännande (eller auto‑approval i framtiden) skickas en kupong via e‑post.
4) Kupongen visas i mobilen och löses in på plats – kan bara användas en gång.

Superadmin
- Se alla företag, kampanjer, uppladdningar, kunder och kuponger.
- Hantera användare och företagskonton.
- Underlag för prissättning/abonnemang (t.ex. 999 NOK/månad).
- Överblick av global statistik.

🔐 Roller och säkerhet
- Superadmin: globalt konto för plattformens ägare.
- Företag: användare kopplas till ett företag (auth → company i databasen).
- Kund: inga konton, endast engångsinteraktion via QR‑länk.

📲 Flöde (end‑to‑end)
1. Företag: registrerar konto → företagsprofil skapas automatiskt. Skapar kampanj → QR‑kod genereras.
2. Kund: skannar QR‑kod → laddar upp bild/video + text → systemet väntar på granskning (standard) → kupong skickas via e‑post när godkänd.
3. Företag: ser uppladdningen i dashboard, kan ladda ner media och använda i marknadsföring. Statistik uppdateras.
4. Inlösen: kunden visar kupongen i kassan → personalen trycker “Lös in nu” → kupongen markeras som förbrukad.

💰 Affärsmodell (exempel)
- Företag betalar månadsavgift (t.ex. 999 NOK/månad).
- Premiumfunktioner: AI‑moderering, avancerad statistik (ROI/segmentering), publicering till sociala medier.

📊 Fördelar
För företag
- Gratis/organiskt marknadsföringsmaterial från riktiga kunder.
- Ökad försäljning via kuponger och (framtida) klippkort/lojalitet.
- Autentiska recensioner/testimonials.
- Lägre kostnad än traditionell annonsering.
- Enkelt att använda (QR‑kod och tydlig dashboard).

För kunder
- Får rabatt/belöning för något de redan gör (t.ex. ta en bild).
- Enkel process utan konto.
- Mer engagerande än klassiska kuponger.

🛠️ Teknikstack
- Frontend: React + Vite + TypeScript + Tailwind + shadcn‑ui.
- State: @tanstack/react‑query.
- Backend: Supabase (Auth, Database, Storage).
- Edge Functions (Deno): säker uppladdning, kupong‑mail, inlösen, m.m.
- Test: Vitest + Testing Library.

Viktiga rutter
- Företagsflöde (kund): `/company/:companyId` → `/company/:companyId/upload` → `/thank-you/:uploadId` → ev. `/coupon/:couponId`.
- Företagsdashboard: flera sidor under huvudappen (t.ex. `/uploads`, `/coupons`, `/analytics`).
- Superadmin: `/admin` (skyddad).

Snabbstart
1) Krav: Node.js och npm (rekommenderat via nvm).
2) Installera beroenden:
```bash
npm i
```
3) Miljövariabler:
```bash
cp env.example .env
# Fyll i VITE_SUPABASE_URL och VITE_SUPABASE_ANON_KEY
```
4) Starta utvecklingsserver:
```bash
npm run dev
```

Deploy av Edge Functions
- Lokalt (kräver Supabase CLI och länkning):
```bash
# engångs: supabase login && supabase link --project-ref <PROJECT_REF>
SUPABASE_PROJECT_REF=<PROJECT_REF> npm run deploy:functions
```
- GitHub Actions: Lägg in följande repository‑secrets och kör workflow “Deploy Supabase Functions”:
  - `SUPABASE_ACCESS_TOKEN` – personlig access token från Supabase
  - `SUPABASE_PROJECT_REF` – projektets ref (Settings → General)

Miljövariabler
- `VITE_SUPABASE_URL` – projektets URL från Supabase.
- `VITE_SUPABASE_ANON_KEY` – public anon‑nyckel (använd aldrig service_role i frontend).
 - Edge Functions (i Supabase → Project Settings → Functions → Secrets):
   - `APP_ALLOWED_ORIGINS` – exempel: `http://localhost:5173,https://din-domän.se`
   - `APP_BASE_URL` – exempel: `http://localhost:5173` (används i mejllänkar)
   - `RESEND_API_KEY` – om e‑post ska skickas via Resend

Arkitekturöversikt (kort)
- React‑app för dashboard och kundflöde.
- Supabase tabeller: företag, kampanjer, uploads, coupons, user_roles m.fl.
- Edge Functions:
  - `secure-upload`: tar emot FormData (fil + metadata), laddar upp till Storage och skapar upload‑post.
  - `send-coupon-email`: skapar/levererar kupong till kund.
  - `redeem-coupon`: markerar kupong som använd.
  - `bootstrap-admin`: ser till att admin‑roll sätts upp för nyckelanvändare.

Nuvarande moderering
- Nyligen uppladdat innehåll får status `pending` och granskas i dashboarden på sidan “Uploads”.
- När en upload godkänns skickas kupong per e‑post om kundens uppgifter finns.

Support / vidareutveckling
- Auto‑approval per kampanj, klippkort/lojalitet, AI‑moderering och fler kanaler (SMS) kan läggas till efter behov.
