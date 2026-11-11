create table if not exists public.portfolio_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 2 and 100),
  email text not null check (
    char_length(email) <= 254
    and email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  ),
  subject text not null check (char_length(btrim(subject)) between 2 and 150),
  message text not null check (char_length(btrim(message)) between 10 and 5000),
  is_read boolean not null default false,
  is_archived boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.portfolio_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.portfolio_messages enable row level security;
alter table public.portfolio_admins enable row level security;
revoke all on table public.portfolio_messages from anon, authenticated;
revoke all on table public.portfolio_admins from anon, authenticated;
grant insert on table public.portfolio_messages to anon, authenticated;
grant select, update on table public.portfolio_messages to authenticated;

create or replace function public.is_portfolio_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.portfolio_admins
    where user_id = auth.uid()
  );
$$;

revoke all on function public.is_portfolio_admin() from public, anon;
grant execute on function public.is_portfolio_admin() to authenticated;

drop policy if exists "Public can submit contact messages" on public.portfolio_messages;
create policy "Public can submit contact messages"
  on public.portfolio_messages
  for insert
  to anon, authenticated
  with check (
    is_read = false
    and is_archived = false
    and created_at >= now() - interval '2 minutes'
    and created_at <= now() + interval '1 minute'
  );

drop policy if exists "Portfolio admins can read contact messages" on public.portfolio_messages;
create policy "Portfolio admins can read contact messages"
  on public.portfolio_messages
  for select
  to authenticated
  using (public.is_portfolio_admin());

drop policy if exists "Portfolio admins can update contact messages" on public.portfolio_messages;
create policy "Portfolio admins can update contact messages"
  on public.portfolio_messages
  for update
  to authenticated
  using (public.is_portfolio_admin())
  with check (public.is_portfolio_admin());

-- After creating the owner in Supabase Authentication > Users, add that user's UUID:
-- insert into public.portfolio_admins (user_id)
-- values ('PASTE-OWNER-AUTH-USER-UUID-HERE');
