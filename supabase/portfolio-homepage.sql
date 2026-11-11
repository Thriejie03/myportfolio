create table if not exists public.portfolio_homepage (
  id text primary key check (id = 'main'),
  content jsonb not null check (jsonb_typeof(content) = 'object'),
  updated_at timestamptz not null default now()
);

alter table public.portfolio_homepage enable row level security;

revoke all on table public.portfolio_homepage from anon, authenticated;
grant select on table public.portfolio_homepage to anon, authenticated;
grant insert, update on table public.portfolio_homepage to authenticated;

drop policy if exists "Public can read homepage content" on public.portfolio_homepage;
create policy "Public can read homepage content"
  on public.portfolio_homepage
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Portfolio admins can manage homepage content" on public.portfolio_homepage;
create policy "Portfolio admins can manage homepage content"
  on public.portfolio_homepage
  for all
  to authenticated
  using (public.is_portfolio_admin())
  with check (public.is_portfolio_admin());
