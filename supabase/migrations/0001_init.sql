-- Komplettes Schema für die Einkaufsliste-App.
--
-- Eigenes, einfaches Username+PIN-System statt Supabase Auth (bewusste
-- Entscheidung: kein E-Mail-Versand nötig, keine RLS-Komplexität). Volles
-- Vertrauen auf Anwendungsebene, RLS ist auf den App-Tabellen deaktiviert.
-- PINs werden serverseitig gehasht (pgcrypto/bcrypt), nie im Klartext
-- gespeichert oder an den Client zurückgegeben.

drop table if exists public.items cascade;
drop table if exists public.categories cascade;
drop table if exists public.list_members cascade;
drop table if exists public.lists cascade;
drop table if exists public.profiles cascade;

drop function if exists public.handle_new_user() cascade;
drop function if exists public.handle_new_list() cascade;
drop function if exists public.is_list_member(uuid) cascade;
drop function if exists public.join_list_by_code(text) cascade;
drop function if exists public.join_list_by_code(text, uuid) cascade;
drop function if exists public.regenerate_invite_code(uuid) cascade;
drop function if exists public.set_updated_at() cascade;
drop function if exists public.register_user(text, text) cascade;
drop function if exists public.login_user(text, text) cascade;
drop function if exists public.update_pin(uuid, text, text) cascade;

create extension if not exists "pgcrypto";

-- Nutzer (eigene Tabelle statt auth.users) ------------------------------
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  username text unique not null check (username ~ '^[a-z0-9_-]{3,20}$'),
  display_name text,
  pin_hash text not null,
  created_at timestamptz not null default now()
);

-- Listen -------------------------------------------------------------
create table public.lists (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 60),
  emoji text not null default '🛒',
  invite_code text not null unique
    default upper(substr(encode(gen_random_bytes(6), 'hex'), 1, 8)),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Mitglieder ---------------------------------------------------------
create table public.list_members (
  list_id uuid not null references public.lists(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
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
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references public.lists(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  name text not null check (char_length(name) between 1 and 120),
  quantity numeric(10,3) not null default 1 check (quantity > 0),
  unit text,
  price numeric(10,2) check (price >= 0),
  checked boolean not null default false,
  checked_by uuid references public.profiles(id) on delete set null,
  checked_at timestamptz,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index items_list_idx on public.items(list_id);
create index categories_list_idx on public.categories(list_id);
create index members_user_idx on public.list_members(user_id);

create function public.set_updated_at() returns trigger
language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger items_updated_at before update on public.items
for each row execute function public.set_updated_at();

-- Owner wird beim Anlegen einer Liste automatisch Mitglied + Default-Kategorien
create function public.handle_new_list() returns trigger
language plpgsql security definer set search_path = public, extensions as $$
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

-- Auth-RPCs -----------------------------------------------------------
create function public.register_user(_username text, _pin text, _display_name text default null)
returns public.profiles
language plpgsql security definer set search_path = public, extensions as $$
declare _row public.profiles;
begin
  if _username !~ '^[a-z0-9_-]{3,20}$' then
    raise exception 'INVALID_USERNAME';
  end if;
  if _pin !~ '^[0-9]{6}$' then
    raise exception 'INVALID_PIN';
  end if;
  if exists (select 1 from public.profiles where username = lower(_username)) then
    raise exception 'USERNAME_TAKEN';
  end if;

  insert into public.profiles (username, display_name, pin_hash)
  values (lower(_username), coalesce(_display_name, lower(_username)), crypt(_pin, gen_salt('bf')))
  returning * into _row;

  return _row;
end; $$;

create function public.login_user(_username text, _pin text)
returns public.profiles
language plpgsql security definer set search_path = public, extensions as $$
declare _row public.profiles;
begin
  select * into _row from public.profiles where username = lower(_username);
  if _row.id is null or _row.pin_hash <> crypt(_pin, _row.pin_hash) then
    raise exception 'INVALID_CREDENTIALS';
  end if;
  return _row;
end; $$;

create function public.update_pin(_user_id uuid, _old_pin text, _new_pin text)
returns void
language plpgsql security definer set search_path = public, extensions as $$
declare _row public.profiles;
begin
  select * into _row from public.profiles where id = _user_id;
  if _row.id is null or _row.pin_hash <> crypt(_old_pin, _row.pin_hash) then
    raise exception 'INVALID_CREDENTIALS';
  end if;
  if _new_pin !~ '^[0-9]{6}$' then
    raise exception 'INVALID_PIN';
  end if;
  update public.profiles set pin_hash = crypt(_new_pin, gen_salt('bf')) where id = _user_id;
end; $$;

-- Beitreten per Code ----------------------------------------------------
create function public.join_list_by_code(_code text, _user_id uuid) returns uuid
language plpgsql security definer set search_path = public, extensions as $$
declare _list_id uuid;
begin
  select id into _list_id from public.lists where invite_code = upper(trim(_code));
  if _list_id is null then
    raise exception 'INVALID_CODE';
  end if;
  insert into public.list_members (list_id, user_id)
  values (_list_id, _user_id)
  on conflict do nothing;
  return _list_id;
end; $$;

create function public.regenerate_invite_code(_list_id uuid, _user_id uuid) returns text
language plpgsql security definer set search_path = public, extensions as $$
declare _new text;
begin
  if not exists (select 1 from public.lists where id = _list_id and owner_id = _user_id) then
    raise exception 'FORBIDDEN';
  end if;
  _new := upper(substr(encode(gen_random_bytes(6), 'hex'), 1, 8));
  update public.lists set invite_code = _new where id = _list_id;
  return _new;
end; $$;

-- Keine RLS: volles Vertrauen auf Anwendungsebene (anon-Key reicht aus) --
alter table public.profiles     disable row level security;
alter table public.lists        disable row level security;
alter table public.list_members disable row level security;
alter table public.categories   disable row level security;
alter table public.items        disable row level security;

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.profiles, public.lists, public.list_members, public.categories, public.items to anon, authenticated;
grant execute on function public.register_user(text, text, text) to anon, authenticated;
grant execute on function public.login_user(text, text) to anon, authenticated;
grant execute on function public.update_pin(uuid, text, text) to anon, authenticated;
grant execute on function public.join_list_by_code(text, uuid) to anon, authenticated;
grant execute on function public.regenerate_invite_code(uuid, uuid) to anon, authenticated;

-- Realtime ---------------------------------------------------------
alter publication supabase_realtime add table public.items;
alter publication supabase_realtime add table public.categories;
alter publication supabase_realtime add table public.list_members;
alter table public.items replica identity full;
