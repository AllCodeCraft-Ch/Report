create table if not exists public.provincial_trip_cutoffs (
  id uuid primary key default gen_random_uuid(),
  date_from date not null,
  date_to date not null,
  note text,
  created_at timestamptz not null default now(),
  constraint provincial_trip_cutoffs_valid_range check (date_to >= date_from)
);

create index if not exists provincial_trip_cutoffs_range_idx
  on public.provincial_trip_cutoffs (date_from, date_to, created_at desc);

alter table public.provincial_trip_cutoffs enable row level security;

grant select, insert, delete on public.provincial_trip_cutoffs to anon, authenticated;

create policy "Allow app clients to read trip cutoffs"
  on public.provincial_trip_cutoffs for select
  to public
  using (true);

create policy "Allow app clients to add trip cutoffs"
  on public.provincial_trip_cutoffs for insert
  to public
  with check (true);

create policy "Allow app clients to delete trip cutoffs"
  on public.provincial_trip_cutoffs for delete
  to public
  using (true);
