create table if not exists public.portfolio_projects (
  id text primary key check (id ~ '^[a-z0-9][a-z0-9-]{1,79}$'),
  content jsonb not null check (jsonb_typeof(content) = 'object'),
  is_published boolean not null default true,
  is_featured boolean not null default false,
  sort_order integer not null default 0 check (sort_order between 0 and 10000),
  updated_at timestamptz not null default now()
);

create table if not exists public.portfolio_certificates (
  id text primary key check (id ~ '^[a-z0-9][a-z0-9-]{1,79}$'),
  content jsonb not null check (jsonb_typeof(content) = 'object'),
  is_published boolean not null default true,
  is_featured boolean not null default false,
  sort_order integer not null default 0 check (sort_order between 0 and 10000),
  updated_at timestamptz not null default now()
);

create table if not exists public.portfolio_chatbot_faq (
  id text primary key check (id ~ '^[a-z0-9][a-z0-9-]{1,79}$'),
  content jsonb not null check (jsonb_typeof(content) = 'object'),
  is_published boolean not null default true,
  sort_order integer not null default 0 check (sort_order between 0 and 10000),
  updated_at timestamptz not null default now()
);

alter table public.portfolio_projects enable row level security;
alter table public.portfolio_certificates enable row level security;
alter table public.portfolio_chatbot_faq enable row level security;

revoke all on table public.portfolio_projects, public.portfolio_certificates, public.portfolio_chatbot_faq from anon, authenticated;
grant select on table public.portfolio_projects, public.portfolio_certificates, public.portfolio_chatbot_faq to anon, authenticated;
grant insert, update, delete on table public.portfolio_projects, public.portfolio_certificates, public.portfolio_chatbot_faq to authenticated;

drop policy if exists "Public can read published portfolio projects" on public.portfolio_projects;
create policy "Public can read published portfolio projects"
  on public.portfolio_projects
  for select
  to anon, authenticated
  using (is_published);

drop policy if exists "Portfolio admins can manage projects" on public.portfolio_projects;
create policy "Portfolio admins can manage projects"
  on public.portfolio_projects
  for all
  to authenticated
  using (public.is_portfolio_admin())
  with check (public.is_portfolio_admin());

drop policy if exists "Public can read published portfolio certificates" on public.portfolio_certificates;
create policy "Public can read published portfolio certificates"
  on public.portfolio_certificates
  for select
  to anon, authenticated
  using (is_published);

drop policy if exists "Portfolio admins can manage certificates" on public.portfolio_certificates;
create policy "Portfolio admins can manage certificates"
  on public.portfolio_certificates
  for all
  to authenticated
  using (public.is_portfolio_admin())
  with check (public.is_portfolio_admin());

drop policy if exists "Public can read published chatbot faq" on public.portfolio_chatbot_faq;
create policy "Public can read published chatbot faq"
  on public.portfolio_chatbot_faq
  for select
  to anon, authenticated
  using (is_published);

drop policy if exists "Portfolio admins can manage chatbot faq" on public.portfolio_chatbot_faq;
create policy "Portfolio admins can manage chatbot faq"
  on public.portfolio_chatbot_faq
  for all
  to authenticated
  using (public.is_portfolio_admin())
  with check (public.is_portfolio_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'portfolio-media',
  'portfolio-media',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view portfolio media" on storage.objects;
create policy "Public can view portfolio media"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'portfolio-media');

drop policy if exists "Portfolio admins can upload portfolio media" on storage.objects;
create policy "Portfolio admins can upload portfolio media"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'portfolio-media'
    and public.is_portfolio_admin()
  );
