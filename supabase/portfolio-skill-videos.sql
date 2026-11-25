create table if not exists public.portfolio_skill_videos (
  id text primary key check (id ~ '^[a-z0-9][a-z0-9-]{1,79}$'),
  content jsonb not null check (jsonb_typeof(content) = 'object'),
  is_published boolean not null default true,
  sort_order integer not null default 0 check (sort_order between 0 and 10000),
  updated_at timestamptz not null default now()
);

alter table public.portfolio_skill_videos enable row level security;
revoke all on table public.portfolio_skill_videos from anon, authenticated;
grant select on public.portfolio_skill_videos to anon, authenticated;
grant insert, update, delete on public.portfolio_skill_videos to authenticated;

drop policy if exists "Public can read published skill videos" on public.portfolio_skill_videos;
create policy "Public can read published skill videos"
  on public.portfolio_skill_videos for select to anon, authenticated
  using (is_published);

drop policy if exists "Portfolio admins can manage skill videos" on public.portfolio_skill_videos;
create policy "Portfolio admins can manage skill videos"
  on public.portfolio_skill_videos for all to authenticated
  using (public.is_portfolio_admin())
  with check (public.is_portfolio_admin());
