create table if not exists public.portfolio_hobbies (
  id text primary key check (id ~ '^[a-z0-9][a-z0-9-]{1,79}$'),
  content jsonb not null check (jsonb_typeof(content) = 'object'),
  is_published boolean not null default true,
  is_featured boolean not null default false,
  sort_order integer not null default 0 check (sort_order between 0 and 10000),
  updated_at timestamptz not null default now()
);

alter table public.portfolio_hobbies enable row level security;
revoke all on table public.portfolio_hobbies from anon, authenticated;
grant select on public.portfolio_hobbies to anon, authenticated;
grant insert, update, delete on public.portfolio_hobbies to authenticated;

drop policy if exists "Public can read published hobbies" on public.portfolio_hobbies;
create policy "Public can read published hobbies"
  on public.portfolio_hobbies for select to anon, authenticated
  using (is_published);

drop policy if exists "Portfolio admins can manage hobbies" on public.portfolio_hobbies;
create policy "Portfolio admins can manage hobbies"
  on public.portfolio_hobbies for all to authenticated
  using (public.is_portfolio_admin())
  with check (public.is_portfolio_admin());
