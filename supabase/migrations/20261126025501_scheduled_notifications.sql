begin;

create table public.scheduled_notifications (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 120),
  repeat_type text not null check (repeat_type in ('daily', 'yearly')),
  remind_at time without time zone not null,
  remind_month smallint,
  remind_day smallint,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  constraint scheduled_notifications_repeat_fields check (
    (repeat_type = 'daily' and remind_month is null and remind_day is null)
    or
    (repeat_type = 'yearly'
      and remind_month is not null
      and remind_day is not null
      and remind_month between 1 and 12
      and remind_day between 1 and case remind_month
        when 2 then 29
        when 4 then 30
        when 6 then 30
        when 9 then 30
        when 11 then 30
        else 31
      end)
  )
);

create index scheduled_notifications_owner_enabled_idx
  on public.scheduled_notifications (owner_id)
  where enabled;

alter table public.scheduled_notifications enable row level security;
revoke all privileges on table public.scheduled_notifications from public, anon;
grant select, insert, update, delete on table public.scheduled_notifications to authenticated;

create policy scheduled_notifications_owner_access
  on public.scheduled_notifications
  as permissive
  for all
  to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

commit;
