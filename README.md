# Einkaufsliste

Geteilte Einkaufslisten-PWA für Haushalt, Partner und Freunde. Mobile-first, offline-fähig, Live-Sync über Supabase Realtime. Komplett kostenlos im Betrieb (Free Tiers).

## Tech-Stack

React 18 + TypeScript · Vite · Tailwind CSS · React Router v6 · TanStack Query v5 (mit Offline-Persistenz) · Supabase (Postgres, Auth, Realtime) · vite-plugin-pwa · @use-gesture/react + @react-spring/web

## Setup

### 1. Abhängigkeiten installieren

```bash
npm install
```

### 2. Supabase-Projekt

1. Kostenloses Projekt auf [supabase.com](https://supabase.com) anlegen (Region EU empfohlen).
2. **Authentication → Sign In / Providers → Email**:
   - Hauptschalter **„Enable Email provider"** aktivieren (sonst schlägt jede Registrierung mit `Email signups are disabled` fehl).
   - **„Confirm email"** deaktivieren (die App nutzt einen Fake-E-Mail-Trick ohne echten Mailversand — mit aktivierter Bestätigung bekommt niemand nach der Registrierung eine Session).
3. SQL aus `supabase/migrations/0001_init.sql` im SQL Editor ausführen (Tabellen, RLS-Policies, Trigger, RPC-Funktionen).
4. **Database → Replication** prüfen: `items`, `categories`, `list_members` müssen in der Realtime-Publikation sein (die Migration fügt sie automatisch hinzu).
5. **Project Settings → API**: `Project URL` und `anon`/`publishable` Key kopieren.

### 3. Umgebungsvariablen

`.env` im Projektroot (siehe `.env.example`):

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
```

`.env` nie committen — der Key ist zwar öffentlich vorgesehen, aber die Sicherheit kommt ausschließlich durch Row Level Security (RLS), nicht durch Geheimhaltung des Keys.

> Hinweis: Neuere Supabase-Projekte verwenden den Variablennamen `VITE_SUPABASE_PUBLISHABLE_KEY` (statt des älteren `anon key`). Beide sind funktional identisch (öffentlicher Client-Key, abgesichert durch RLS).

### 4. Entwicklung

```bash
npm run dev
```

### 5. Build & Lint

```bash
npm run build   # tsc + vite build, erzeugt dist/ inkl. Service Worker
npm run lint    # ESLint
```

## Deployment (Cloudflare Pages)

1. Repo mit GitHub verbinden, in Cloudflare Pages ein neues Projekt aus dem Repo anlegen.
2. Build-Einstellungen:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
3. **Environment variables** in den Pages-Projekteinstellungen setzen:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
4. **SPA-Routing:** Keine `404.html` anlegen — Cloudflare Pages liefert bei fehlenden Routen automatisch `index.html` aus, React Router übernimmt das Routing clientseitig.
5. Nach dem ersten Deployment: In Supabase unter **Authentication → URL Configuration** die **Site URL** auf die Cloudflare-Pages-Domain setzen (wichtig für Auth-Redirects).

## PWA-Icons

Die Icons in `public/icons/` sind generierte Platzhalter (einfaches emerald-farbenes Icon). Erzeugt mit:

```bash
node scripts/generate-icons.mjs
```

Für ein eigenes Logo einfach `icon-192.png`, `icon-512.png`, `icon-512-maskable.png` und `apple-touch-icon.png` in `public/icons/` ersetzen (gleiche Dateinamen/Größen beibehalten).

## Offline-Verhalten

- **Lesen:** Der TanStack-Query-Cache wird in IndexedDB persistiert (`gcTime` 7 Tage). Die App startet offline mit dem letzten bekannten Stand.
- **Schreiben:** Mutations laufen mit `networkMode: 'offlineFirst'` und werden bei fehlender Verbindung pausiert, optimistisch im UI übernommen und beim nächsten Online-Event automatisch nachgeholt (`resumePausedMutations`).
- **Konfliktstrategie:** Last-Write-Wins anhand `updated_at` (Server-Zeitstempel), kein manuelles Merging.
- Supabase-API-Calls werden bewusst **nicht** vom Service Worker gecacht — das übernimmt ausschließlich TanStack Query.

## Free-Tier-Grenzen (Supabase)

- 500 MB Datenbankspeicher
- 200 gleichzeitige Realtime-Verbindungen
- Projekt pausiert automatisch nach 7 Tagen Inaktivität (einfach im Dashboard wieder aufwecken)

Für den privaten/kleinen Haushaltsgebrauch dieser App sind diese Grenzen in der Praxis nicht relevant.

## Lighthouse-Check (manuell)

```bash
npm run build
npm run preview
```

Danach die Vorschau-URL (Standard: `http://localhost:4173`) in Chrome DevTools → Lighthouse (Mobile, Kategorien: Performance, PWA, Accessibility, Best Practices) prüfen.

## Projektstruktur

```
src/
├─ components/   # layout, lists, items, auth, ui – je nach Domäne
├─ hooks/        # Auth, Daten-Queries/Mutations, Realtime, Theme, Online-Status, …
├─ lib/          # Supabase-Client, QueryClient, Formatierung, Validierung, Konstanten
├─ pages/        # Routen-Komponenten
└─ types/        # DB-Typen (Database-Typ für den typisierten Supabase-Client)
supabase/
└─ migrations/   # 0001_init.sql – komplettes Schema, RLS, RPCs
```
