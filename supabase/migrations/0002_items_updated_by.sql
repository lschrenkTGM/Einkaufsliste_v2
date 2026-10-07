-- Fügt updated_by hinzu, um anzuzeigen wer einen Artikel zuletzt geändert hat
-- (zusätzlich zu checked_by, das nur das Abhaken trackt).

alter table public.items
  add column if not exists updated_by uuid references public.profiles(id) on delete set null;
