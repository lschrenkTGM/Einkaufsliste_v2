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
