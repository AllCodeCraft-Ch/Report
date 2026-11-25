create table if not exists public.provincial_trips (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  details text not null,
  departure_time time,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists provincial_trips_date_departure_idx
  on public.provincial_trips (date, departure_time, created_at);

alter table public.provincial_trips enable row level security;

grant select, insert, delete on public.provincial_trips to anon, authenticated;

create policy "Allow app clients to read provincial trips"
  on public.provincial_trips for select
  to public
  using (true);

create policy "Allow app clients to add provincial trips"
  on public.provincial_trips for insert
  to public
  with check (true);

create policy "Allow app clients to delete provincial trips"
  on public.provincial_trips for delete
  to public
  using (true);
