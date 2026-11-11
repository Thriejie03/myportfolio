create table if not exists public.portfolio_visit_counter (
  id smallint primary key default 1 check (id = 1),
  total bigint not null default 0 check (total >= 0)
);

insert into public.portfolio_visit_counter (id, total)
values (1, 0)
on conflict (id) do nothing;

alter table public.portfolio_visit_counter enable row level security;
revoke all on table public.portfolio_visit_counter from anon, authenticated;

create or replace function public.increment_portfolio_visits()
returns bigint
language sql
security definer
set search_path = ''
as $$
  update public.portfolio_visit_counter
  set total = total + 1
  where id = 1
  returning total;
$$;

revoke all on function public.increment_portfolio_visits() from public, anon, authenticated;
grant execute on function public.increment_portfolio_visits() to anon, authenticated;
