# 📁 Projektstruktur

## Översikt
Detta projekt följer en modern och skalbar mappstruktur för en React/TypeScript-applikation.

```
coupon-creator-space-experiments/
│
├── 📄 Konfigurationsfiler (root)
│   ├── vite.config.ts          # Vite build-konfiguration
│   ├── vitest.config.ts        # Vitest test-konfiguration
│   ├── tailwind.config.ts      # Tailwind CSS-konfiguration
│   ├── tsconfig.json           # TypeScript-konfiguration
│   ├── eslint.config.js        # ESLint-konfiguration
│   ├── postcss.config.js       # PostCSS-konfiguration
│   ├── package.json            # NPM dependencies
│   └── vercel.json            # Vercel deployment-konfiguration
│
├── 🔧 .github/
│   └── workflows/             # GitHub Actions CI/CD
│       ├── ci.yml             # Continuous Integration
│       └── deploy.yml         # Production deployment
│
├── 📚 docs/                   # Projektdokumentation
│   ├── PROJECT_STRUCTURE.md  # Denna fil
│   ├── ENVIRONMENT_SETUP.md  # Miljöinställningar
│   └── CODE_QUALITY_IMPROVEMENTS.md
│
├── 🗄️ scripts/
│   └── sql/                   # Databas-scripts
│       └── *.sql             # SQL migrations och debug-scripts
│
├── 🌐 public/                # Statiska filer
│   ├── favicon.ico
│   └── robots.txt
│
├── 🏗️ supabase/              # Supabase backend
│   ├── migrations/           # Databas-migrations
│   ├── functions/           # Edge Functions
│   └── config.toml         # Supabase-konfiguration
│
└── 🎨 src/                   # Källkod
    ├── 📱 App.tsx            # Huvudapplikation
    ├── 🎯 main.tsx          # Entry point
    │
    ├── 🧩 components/        # React-komponenter
    │   ├── admin/           # Admin-specifika komponenter
    │   ├── auth/           # Autentiseringskomponenter
    │   ├── common/         # Återanvändbara komponenter
    │   ├── dashboard/      # Dashboard-komponenter
    │   ├── gallery/        # Bildgalleri-komponenter
    │   ├── layout/         # Layout-komponenter (header, sidebar)
    │   ├── ui/            # shadcn/ui komponenter
    │   └── __tests__/     # Komponenttester
    │
    ├── 🏢 domains/          # Domain-driven design
    │   ├── auth/          # Autentiseringsdomän
    │   └── companies/     # Företagsdomän
    │
    ├── 📄 pages/           # Sidor/routes
    │   └── components/    # Sidspecifika komponenter
    │
    ├── 🪝 hooks/           # Custom React hooks
    │
    ├── 📚 lib/             # Utility-funktioner
    │   ├── __tests__/     # Lib-tester
    │   └── *.ts          # Utilities, validering, etc.
    │
    ├── 🔌 integrations/    # Externa integrationer
    │   └── supabase/     # Supabase client & typer
    │
    ├── 📝 types/          # TypeScript type definitions
    │
    ├── 🎨 styles/         # CSS/styling
    │
    ├── 🧪 test/           # Test utilities
    │
    └── ⚙️ config/         # App-konfiguration
        └── constants.ts
```

## Mappbeskrivningar

### `/src/components/`
Organiserade React-komponenter:
- **admin/** - Administratörsverktyg (UserManagementTable, etc.)
- **auth/** - Inloggning och autentisering
- **common/** - Återanvändbara komponenter (QRCodeGenerator, CompanySelector)
- **dashboard/** - Dashboard-specifika komponenter
- **gallery/** - Bildhantering och galleri
- **layout/** - Applikationslayout (Header, Sidebar)
- **ui/** - Grundläggande UI-komponenter från shadcn/ui

### `/src/domains/`
Domain-driven design implementation:
- **auth/** - Allt relaterat till autentisering
- **companies/** - Företagshantering

### `/src/hooks/`
Custom React hooks för:
- Data-hämtning
- State management
- Supabase-integrationer

### `/src/lib/`
Hjälpfunktioner:
- Felhantering
- Validering
- Query-konfiguration
- Allmänna utilities

### `/src/pages/`
Applikationens sidor/routes:
- Varje fil motsvarar en route
- Sidspecifika komponenter i `components/`

### `/supabase/`
Backend-konfiguration:
- **migrations/** - Databasschema
- **functions/** - Serverless funktioner
- **config.toml** - Projektinställningar

## Best Practices

1. **Komponenter**: Gruppera efter funktion, inte filtyp
2. **Imports**: Använd absoluta imports med `@/` alias
3. **Tester**: Placera nära källkoden i `__tests__` mappar
4. **Typer**: Centralisera i `/types` när de delas mellan moduler
5. **Dokumentation**: Håll uppdaterad i `/docs`

## Namnkonventioner

- **Komponenter**: PascalCase (ex: `UserProfile.tsx`)
- **Hooks**: camelCase med `use` prefix (ex: `useAuth.ts`)
- **Utilities**: camelCase (ex: `errorHandler.ts`)
- **Typer**: PascalCase för interfaces/types
- **Konstanter**: SCREAMING_SNAKE_CASE
