# Einkaufsliste – Projektspezifikation

> Briefing für Claude Code. Baue die App Schritt für Schritt nach den Phasen unten. Nach jeder Phase: App muss lauffähig sein (`npm run dev`), `npm run build` und `npm run lint` müssen fehlerfrei durchlaufen. Frag nach, bevor du von dieser Spec abweichst.

---

## 1. Ziel

Eine **geteilte Einkaufslisten-App** für Haushalt/Partner/Freunde:

- Mobile-first, als **PWA installierbar** (Homescreen-Icon, Fullscreen)
- **Mehrere Listen** (z.B. Billa, Hofer, Baumarkt)
- Liste per **Einladungscode/-link** teilen
- **Live-Sync**: Änderungen erscheinen sofort bei allen Mitgliedern
- **Offline nutzbar** (Supermarkt ohne Netz), Sync sobald wieder online
- **Kategorien, Mengen & Einheiten, Preise & Gesamtsumme**
- **Dark Mode**, **Swipe-Gesten** zum Abhaken
- **Komplett kostenlos** im Betrieb (Free Tiers only)

Sprache der UI: **Deutsch (Österreich)**. Währung: **EUR**, Formatierung `de-AT`.

---

## 2. Tech-Stack

| Bereich | Wahl |
|---|---|
| Framework | React 18 + **TypeScript** |
| Build | **Vite** |
| Styling | **Tailwind CSS** (mit `dark:` Variante, `class`-Strategie) |
| Routing | `react-router-dom` v6 |
| Server-State / Cache | **TanStack Query v5** + `@tanstack/query-async-storage-persister` + `idb-keyval` (IndexedDB) |
| Backend | **Supabase** (Postgres, Auth, Realtime) – Free Tier |
| PWA | `vite-plugin-pwa` (Workbox, `registerType: 'autoUpdate'`) |
| Gesten | `@use-gesture/react` + `@react-spring/web` (oder `framer-motion`) |
| Icons | `lucide-react` |
| Formulare/Validierung | `zod` (+ einfache kontrollierte Inputs, kein react-hook-form nötig) |
| Hosting | **Cloudflare Pages** (Free, Deploy aus GitHub-Repo) |

Keine eigene Backend-Server-Logik. Alles läuft über Supabase (RLS + RPC-Funktionen).

---

## 3. Projektstruktur

```
einkaufsliste/
├─ public/
│  └─ icons/               # PWA-Icons 192, 512, maskable, apple-touch-icon
├─ supabase/
│  └─ migrations/
│     └─ 0001_init.sql     # komplettes Schema (siehe Abschnitt 5)
├─ src/
│  ├─ main.tsx
│  ├─ App.tsx
│  ├─ lib/
│  │  ├─ supabase.ts       # Client
│  │  ├─ queryClient.ts    # QueryClient + Persister + Offline-Config
│  │  ├─ format.ts         # Währung, Mengen
│  │  └─ constants.ts      # Einheiten, Default-Kategorien
│  ├─ types/
│  │  └─ db.ts             # Typen für Tabellen
│  ├─ hooks/
│  │  ├─ useAuth.ts
│  │  ├─ useLists.ts
│  │  ├─ useItems.ts       # Queries + Mutations (optimistic)
│  │  ├─ useCategories.ts
│  │  ├─ useRealtime.ts    # Supabase Realtime -> Query-Cache
│  │  ├─ useOnlineStatus.ts
│  │  └─ useTheme.ts
│  ├─ components/
│  │  ├─ layout/           # AppShell, Header, BottomNav
│  │  ├─ lists/            # ListCard, ListForm, ShareDialog, JoinDialog
│  │  ├─ items/            # ItemRow (Swipe), ItemForm, CategorySection, TotalBar
│  │  └─ ui/               # Button, Input, Sheet/Modal, Toast, Badge, EmptyState
│  └─ pages/
│     ├─ ListsPage.tsx     # Übersicht aller Listen
│     ├─ ListPage.tsx      # Detailansicht einer Liste
│     ├─ JoinPage.tsx      # /join/:code
│     └─ SettingsPage.tsx
├─ .env.example
├─ vite.config.ts
└─ README.md
```

---

## 4. Auth-Konzept

Login mit **Username + Passwort**. Supabase kennt nur E-Mail/Telefon, deshalb der Standard-Trick:

1. Die App baut intern aus dem Username eine **Fake-E-Mail**: `<username-lowercase>@einkaufsliste.app` (Domain muss nicht existieren, es wird nie eine Mail verschickt).
2. **Registrieren:** `supabase.auth.signUp({ email: fakeEmail, password, options: { data: { username } } })`
3. **Login:** `supabase.auth.signInWithPassword({ email: fakeEmail, password })`
4. Username-Regeln: 3–20 Zeichen, nur `a-z`, `0-9`, `_`, `-` (Validierung mit zod, vor dem Bauen der Fake-E-Mail lowercase). Passwort mind. 8 Zeichen.
5. Eindeutigkeit der Usernames ergibt sich automatisch aus der eindeutigen E-Mail; Fehler „User already registered" → Meldung „Username ist schon vergeben".
6. Session wird von supabase-js persistiert (localStorage) und automatisch refreshed. Nicht eingeloggt → Redirect auf `/login` (merke das Ziel, z.B. `/join/:code`, und leite danach dorthin weiter).
7. **Kein „Passwort vergessen"** (keine echte Mail). Passwort ändern geht nur eingeloggt (`supabase.auth.updateUser({ password })`). Bei vergessenem Passwort setzt der Admin es im Supabase-Dashboard zurück. Hinweis auf der Registrierungsseite: „Merk dir dein Passwort gut, es gibt keine Wiederherstellung."
8. Supabase-Einstellung nötig: **„Confirm email" ausschalten**, sonst bleiben neue Accounts unbestätigt.

---

## 5. Datenbank (Supabase / Postgres)

Alles in `supabase/migrations/0001_init.sql`.

```sql
-- Extensions
create extension if not exists "pgcrypto";

-- Profile ------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  display_name text,
  created_at timestamptz not null default now()
);

-- Profil automatisch bei neuem User anlegen
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'username'
  );
  return new;
end; $$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Listen -------------------------------------------------------------
create table public.lists (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 60),
  emoji text not null default '🛒',
  invite_code text not null unique
    default upper(substr(encode(gen_random_bytes(6), 'hex'), 1, 8)),
  owner_id uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now()
);

-- Mitglieder ---------------------------------------------------------
create table public.list_members (
  list_id uuid not null references public.lists(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner','member')),
  joined_at timestamptz not null default now(),
  primary key (list_id, user_id)
);

-- Kategorien (pro Liste) --------------------------------------------
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references public.lists(id) on delete cascade,
  name text not null,
  emoji text,
  sort_order int not null default 0
);

-- Artikel -------------------------------------------------------------
create table public.items (
  id uuid primary key default gen_random_uuid(),   -- Client darf eigene UUID mitgeben (Offline!)
  list_id uuid not null references public.lists(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  name text not null check (char_length(name) between 1 and 120),
  quantity numeric(10,3) not null default 1 check (quantity > 0),
  unit text,                                        -- 'Stk','kg','g','l','ml','Pkg','Bund',...
  price numeric(10,2) check (price >= 0),           -- Preis PRO EINHEIT in EUR
  checked boolean not null default false,
  checked_by uuid references auth.users(id),
  checked_at timestamptz,
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index items_list_idx on public.items(list_id);
create index categories_list_idx on public.categories(list_id);
create index members_user_idx on public.list_members(user_id);

-- updated_at Trigger
create function public.set_updated_at() returns trigger
language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger items_updated_at before update on public.items
for each row execute function public.set_updated_at();

-- Helper: ist der aktuelle User Mitglied? (security definer => keine RLS-Rekursion)
create function public.is_list_member(_list_id uuid) returns boolean
language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.list_members
    where list_id = _list_id and user_id = auth.uid()
  );
$$;

-- Beim Anlegen einer Liste: Owner als Mitglied + Default-Kategorien
create function public.handle_new_list() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.list_members (list_id, user_id, role)
  values (new.id, new.owner_id, 'owner');

  insert into public.categories (list_id, name, emoji, sort_order) values
    (new.id, 'Obst & Gemüse', '🥦', 10),
    (new.id, 'Brot & Gebäck', '🥖', 20),
    (new.id, 'Milch & Eier', '🥛', 30),
    (new.id, 'Fleisch & Fisch', '🥩', 40),
    (new.id, 'Tiefkühl', '🧊', 50),
    (new.id, 'Getränke', '🥤', 60),
    (new.id, 'Snacks & Süßes', '🍫', 70),
    (new.id, 'Haushalt & Drogerie', '🧴', 80),
    (new.id, 'Sonstiges', '📦', 999);
  return new;
end; $$;

create trigger on_list_created after insert on public.lists
for each row execute function public.handle_new_list();

-- Beitreten per Code (RPC) -------------------------------------------
create function public.join_list_by_code(_code text) returns uuid
language plpgsql security definer set search_path = public as $$
declare _list_id uuid;
begin
  select id into _list_id from public.lists where invite_code = upper(trim(_code));
  if _list_id is null then
    raise exception 'INVALID_CODE';
  end if;
  insert into public.list_members (list_id, user_id)
  values (_list_id, auth.uid())
  on conflict do nothing;
  return _list_id;
end; $$;

-- Code neu generieren (nur Owner) -------------------------------------
create function public.regenerate_invite_code(_list_id uuid) returns text
language plpgsql security definer set search_path = public as $$
declare _new text;
begin
  if not exists (select 1 from public.lists where id = _list_id and owner_id = auth.uid()) then
    raise exception 'FORBIDDEN';
  end if;
  _new := upper(substr(encode(gen_random_bytes(6), 'hex'), 1, 8));
  update public.lists set invite_code = _new where id = _list_id;
  return _new;
end; $$;

-- RLS ---------------------------------------------------------------
alter table public.profiles     enable row level security;
alter table public.lists        enable row level security;
alter table public.list_members enable row level security;
alter table public.categories   enable row level security;
alter table public.items        enable row level security;

-- profiles: jeder sieht Profile von Leuten, mit denen er eine Liste teilt; eigenes editierbar
create policy "profiles_select" on public.profiles for select using (
  id = auth.uid() or exists (
    select 1 from public.list_members a
    join public.list_members b on a.list_id = b.list_id
    where a.user_id = auth.uid() and b.user_id = profiles.id
  )
);
create policy "profiles_update_own" on public.profiles for update using (id = auth.uid());

-- lists
create policy "lists_select_member" on public.lists for select using (public.is_list_member(id));
create policy "lists_insert_self"   on public.lists for insert with check (owner_id = auth.uid());
create policy "lists_update_owner"  on public.lists for update using (owner_id = auth.uid());
create policy "lists_delete_owner"  on public.lists for delete using (owner_id = auth.uid());

-- list_members
create policy "members_select" on public.list_members for select using (public.is_list_member(list_id));
create policy "members_delete_self_or_owner" on public.list_members for delete using (
  user_id = auth.uid()
  or exists (select 1 from public.lists l where l.id = list_id and l.owner_id = auth.uid())
);
-- INSERT nur über join_list_by_code / Trigger (security definer)

-- categories + items: Vollzugriff für Mitglieder
create policy "categories_all_member" on public.categories for all
  using (public.is_list_member(list_id)) with check (public.is_list_member(list_id));
create policy "items_all_member" on public.items for all
  using (public.is_list_member(list_id)) with check (public.is_list_member(list_id));

-- Realtime ---------------------------------------------------------
alter publication supabase_realtime add table public.items;
alter publication supabase_realtime add table public.categories;
alter publication supabase_realtime add table public.list_members;
alter table public.items replica identity full;   -- damit DELETE-Events die list_id enthalten
```

**Wichtig:** Preis ist **Preis pro Einheit**. Zeilensumme = `quantity * price`. Gesamtsumme = Summe aller Zeilensummen.

---

## 6. Features im Detail

### 6.1 Listen-Übersicht (`/`)
- Karten mit Emoji, Name, Anzahl offener Artikel (`x / y erledigt`), Mitgliederanzahl
- FAB „+ Neue Liste" → Sheet mit Name + Emoji-Picker (einfache Auswahl von ~20 Emojis reicht)
- Button „Liste beitreten" → Dialog für Code-Eingabe
- Long-Press/Menü pro Liste: Umbenennen, Löschen (nur Owner, mit Bestätigung), Verlassen (Member)
- Empty State mit freundlichem Text

### 6.2 Listen-Detail (`/list/:id`)
- Header: Zurück, Listenname, Teilen-Button, Menü (⋮)
- **Artikel gruppiert nach Kategorie** (Reihenfolge nach `sort_order`), Kategorie einklappbar, zeigt Anzahl offen
- Innerhalb Kategorie: offene Artikel oben, abgehakte unten (ausgegraut, durchgestrichen)
- Abgehakte Artikel gesammelt in Abschnitt „Erledigt" am Ende (einklappbar) – **Toggle in Settings**: „Erledigte separat anzeigen" (Default: an)
- **Schnelleingabe** (sticky unten über der Tastatur): Textfeld, Enter → fügt Artikel hinzu
  - Parser: `2 kg Äpfel` → quantity 2, unit kg, name Äpfel; `Milch` → quantity 1; `3 Joghurt` → 3 Stk
  - Autocomplete aus bisherigen Artikeln dieser Liste (Name → übernimmt letzte Kategorie, Einheit, Preis)
- Artikel antippen → **Bearbeiten-Sheet**: Name, Menge, Einheit (Dropdown), Preis/Einheit, Kategorie
- **Mengen-Stepper** (+/−) direkt in der Zeile
- **TotalBar** (sticky unten): `Gesamt: 23,40 €` · `Noch offen: 12,10 €` · Hinweis „X Artikel ohne Preis"
- Menü: „Erledigte löschen", „Alle zurücksetzen (abhaken rückgängig)", „Kategorien verwalten", „Mitglieder anzeigen"

### 6.3 Swipe-Gesten (ItemRow)
- **Swipe nach rechts** → abhaken/zurücknehmen (grüner Hintergrund mit Check-Icon)
- **Swipe nach links** → löschen (roter Hintergrund, Mülleimer) mit **Undo-Toast** (5 s)
- Schwellwert ca. 35 % der Zeilenbreite, sonst federt Zeile zurück
- Haptisches Feedback via `navigator.vibrate(10)` wo verfügbar
- Zusätzlich Checkbox-Tap als Fallback (Accessibility)

### 6.4 Kategorien verwalten
- Pro Liste: hinzufügen, umbenennen, Emoji ändern, Reihenfolge ändern (Up/Down-Buttons reichen, Drag&Drop optional), löschen (Artikel → „Ohne Kategorie")
- Artikel ohne Kategorie werden unter „Ohne Kategorie" ganz unten angezeigt

### 6.5 Einheiten
Konstante Liste in `constants.ts`: `Stk`, `kg`, `g`, `l`, `ml`, `Pkg`, `Dose`, `Fl.`, `Bund`, `Netz`. Auch „keine Einheit" erlaubt. Mengen mit bis zu 3 Nachkommastellen, Anzeige ohne unnötige Nullen (`1,5 kg`, `2 Stk`).

### 6.6 Teilen & Beitreten
- Teilen-Dialog zeigt **Code** (z.B. `A3F9C21B`) groß + **Link** `https://<domain>/join/A3F9C21B`
- Buttons: „Link kopieren", „Teilen" (Web Share API wenn verfügbar, sonst Copy), optional QR-Code (`qrcode.react`)
- Owner kann Code **neu generieren** (alter Code wird ungültig)
- `/join/:code`: Wenn nicht eingeloggt → Redirect auf `/login` (bzw. Registrierung), Ziel `/join/:code` merken → nach Login RPC `join_list_by_code` → Redirect auf Liste. Bei ungültigem Code: Fehlerseite mit Hinweis
- Mitgliederliste im Dialog (Anzeigename, Fallback Username), Owner kann Mitglieder entfernen

### 6.7 Live-Sync (Realtime)
- `useRealtime(listId)` abonniert `postgres_changes` für `items` und `categories` (Filter `list_id=eq.<id>`) und `list_members`
- Events werden direkt in den TanStack-Query-Cache geschrieben (`setQueryData`) statt Refetch
- Eigene Änderungen nicht doppelt anwenden (nach `id` + `updated_at` deduplizieren)
- Bei Reconnect/Fokus/Online-Event: einmaliger Refetch der Liste zur Sicherheit
- Dezente Anzeige „Zuletzt abgehakt von Anna" (via `checked_by` → Profil)

### 6.8 Offline-Modus
- **Lesen:** TanStack Query Cache wird per `persistQueryClient` in IndexedDB gespeichert (`gcTime` ≥ 7 Tage). App startet offline mit letztem Stand
- **Schreiben:** Mutations mit `networkMode: 'offlineFirst'`, **optimistic updates**, Client generiert UUIDs (`crypto.randomUUID()`) für neue Artikel
- Pausierte Mutations werden persistiert und beim Wiederverbinden mit `queryClient.resumePausedMutations()` abgearbeitet
- **Konfliktstrategie:** Last-Write-Wins (Server `updated_at`). Kein Merge nötig
- UI: kleines Banner „Offline – Änderungen werden synchronisiert, sobald du wieder online bist" + Badge „n ausstehend"
- Service Worker cached App-Shell (Precache) → App lädt ohne Netz
- Supabase-API-Calls **nicht** im Service Worker cachen (Cache übernimmt TanStack Query)

### 6.9 Dark Mode
- Optionen: **System / Hell / Dunkel** (Default: System)
- Tailwind `darkMode: 'class'`, Klasse am `<html>`, Persistenz in `localStorage`
- `theme-color` Meta-Tag passt sich an
- Kontraste nach WCAG AA

### 6.10 PWA
- `manifest`: Name „Einkaufsliste", short_name „Einkauf", `display: standalone`, `orientation: portrait`, Theme-/Background-Color, Icons 192/512 + maskable, `lang: de-AT`
- Install-Prompt: eigener „App installieren"-Button in Settings (via `beforeinstallprompt`), auf iOS Hinweistext „Teilen → Zum Home-Bildschirm"
- Update-Toast: „Neue Version verfügbar – Neu laden"
- `apple-touch-icon`, `apple-mobile-web-app-capable` Meta-Tags

### 6.11 Settings (`/settings`)
Anzeigename · Passwort ändern · Theme · Erledigte separat anzeigen · App installieren · Logout · Version · „Lokale Daten löschen"

---

## 7. UI/UX-Richtlinien

- **Mobile-first**, Basis-Viewport 375 px, ab `md` zentrierte Spalte (max 640 px) – Desktop soll funktionieren, muss aber nicht schön ausgebaut sein
- Touch-Targets mindestens 44×44 px
- Sticky Bottom-Bereich (Schnelleingabe + TotalBar) berücksichtigt `env(safe-area-inset-bottom)` und Tastatur (`visualViewport`)
- Skeleton-Loader statt Spinner bei Erstladung
- Toasts für Fehler/Undo, **keine** `alert()`
- Deutsche Texte, kurz und direkt, du-Form
- Primärfarbe: Grün (z.B. Tailwind `emerald-600`), neutrale Grautöne
- Animationen dezent (150–200 ms), `prefers-reduced-motion` respektieren

---

## 8. Umgebungsvariablen

`.env.example`:
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```
`.env` nie committen. Der Anon-Key ist öffentlich vorgesehen – die Sicherheit kommt ausschließlich durch **RLS**.

---

## 9. Setup-Schritte (manuell, vor Phase 2)

1. Kostenloses Projekt auf supabase.com anlegen (Region EU, z.B. Frankfurt)
2. **Authentication → Sign In / Providers → Email: „Confirm email" deaktivieren** (Anonymous Sign-Ins bleiben aus)
3. SQL aus `0001_init.sql` im SQL Editor ausführen
4. Unter **Database → Replication** prüfen, dass `items`, `categories`, `list_members` in der Realtime-Publikation sind
5. URL + Anon-Key in `.env` eintragen
6. Nach dem Deployment: Authentication → URL Configuration → Site URL auf die Cloudflare-Pages-Domain setzen

---

## 10. Umsetzungsphasen

### Phase 1 – Grundgerüst
- Vite + React + TS + Tailwind + Router aufsetzen, ESLint/Prettier
- AppShell, Routing, Dark-Mode-Hook, UI-Basiskomponenten
- **Fertig wenn:** App startet, Navigation + Theme-Wechsel funktioniert

### Phase 2 – Supabase & Auth
- Client, Registrierung/Login/Logout mit Username+Passwort (Fake-E-Mail-Trick), `useAuth`, Route-Guard, Profil laden/ändern
- Typen für Tabellen (`supabase gen types` oder manuell)
- **Fertig wenn:** Registrieren, Ausloggen, Einloggen funktioniert; Profil mit Username existiert, Anzeigename änderbar

### Phase 3 – Listen & Artikel (online)
- Listen CRUD, Artikel CRUD, Kategorien, Gruppierung, Schnelleingabe-Parser, Bearbeiten-Sheet, Mengen-Stepper
- TotalBar mit korrekter Summenberechnung
- **Fertig wenn:** Komplette Einkaufsliste lässt sich online bedienen

### Phase 4 – Teilen & Live-Sync
- Share-Dialog, Join-Flow (`/join/:code`), Mitgliederliste, Code regenerieren
- Realtime-Subscriptions → Cache
- **Fertig wenn:** Zwei Browser (normal + Inkognito) sehen Änderungen gegenseitig innerhalb ~1 s

### Phase 5 – Swipe & UX-Politur
- Swipe-Gesten, Undo-Toast, Skeletons, Empty States, Haptik, Safe-Areas
- **Fertig wenn:** Abhaken/Löschen per Swipe fühlt sich auf echtem Handy flüssig an

### Phase 6 – Offline & PWA
- Query-Persistenz (IndexedDB), Offline-Mutations, Offline-Banner, Pending-Badge
- `vite-plugin-pwa`, Manifest, Icons, Install-Button, Update-Toast
- **Fertig wenn:** Flugmodus an → Artikel hinzufügen/abhaken → Flugmodus aus → Änderungen landen in Supabase und beim zweiten Gerät

### Phase 7 – Deployment & Feinschliff
- Deploy auf Cloudflare Pages (GitHub-Repo verbinden, Build `npm run build`, Output `dist`, Env-Vars `VITE_SUPABASE_URL` und `VITE_SUPABASE_ANON_KEY` setzen). SPA-Routing: keine `404.html` anlegen, dann liefert Pages automatisch `index.html` für alle Routen
- Lighthouse (PWA-Check, Performance > 90 mobil)
- README mit Setup-Anleitung

### Phase 8 – Nice-to-have (nur auf Nachfrage)
- Drag & Drop Sortierung
- Vorschläge „oft gekaufte Artikel"
- Listen-Vorlagen / „Liste duplizieren"
- Barcode-Scanner
- Push-Benachrichtigungen („Anna hat 3 Artikel hinzugefügt")
- Preisverlauf pro Artikel

---

## 11. Akzeptanzkriterien (Gesamt)

- [ ] Zwei Nutzer sehen dieselbe Liste und Änderungen live
- [ ] Beitritt nur mit gültigem Code; fremde Listen sind per API nicht lesbar (RLS getestet)
- [ ] Ohne Netz: Liste lesbar, Artikel hinzufügbar/abhakbar; Sync nach Reconnect
- [ ] Gesamtsumme = Σ(Menge × Preis), Artikel ohne Preis werden ignoriert und gekennzeichnet
- [ ] Swipe rechts = abhaken, Swipe links = löschen mit Undo
- [ ] Dark Mode folgt System, manuell überschreibbar
- [ ] App ist auf Android (Chrome) und iOS (Safari) installierbar
- [ ] Keine laufenden Kosten (Supabase Free + Cloudflare Pages Free)
- [ ] `npm run build` ohne Fehler und Warnungen, keine `any` ohne Begründung

---

## 12. Hinweise für Claude Code

- Arbeite **phasenweise** und committe nach jeder Phase mit klarer Message
- Halte Komponenten klein, Logik in Hooks, kein Prop-Drilling über mehr als 2 Ebenen
- Fehlerbehandlung überall wo Supabase aufgerufen wird (Toast + Konsole), nie stilles Scheitern
- Keine Secrets im Repo
- Bei Unklarheiten oder Free-Tier-Limits (Supabase: 500 MB DB, 200 gleichzeitige Realtime-Verbindungen, Projekt pausiert nach 1 Woche Inaktivität) kurz rückfragen bzw. im README dokumentieren