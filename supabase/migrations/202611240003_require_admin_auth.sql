-- Require a trusted Supabase Auth user with app_metadata.role = 'admin'
-- for all application data. app_metadata must be assigned by a project admin,
-- never by a client through user_metadata.

do $$
declare
  table_name text;
  admin_policy text;
  guard_policy text;
begin
  foreach table_name in array array[
    'daily_reports',
    'calendar_notes',
    'provincial_trips',
    'provincial_trip_cutoffs'
  ] loop
    if to_regclass(format('public.%I', table_name)) is not null then
      execute format('alter table public.%I enable row level security', table_name);
      execute format('revoke all privileges on table public.%I from public, anon', table_name);
      execute format('grant select, insert, update, delete on table public.%I to authenticated', table_name);

      admin_policy := table_name || '_admin_access';
      guard_policy := table_name || '_admin_only_guard';
      execute format('drop policy if exists %I on public.%I', admin_policy, table_name);
      execute format('drop policy if exists %I on public.%I', guard_policy, table_name);
      execute format(
        'create policy %I on public.%I as permissive for all to authenticated using ((select auth.jwt() -> ''app_metadata'' ->> ''role'') = ''admin'') with check ((select auth.jwt() -> ''app_metadata'' ->> ''role'') = ''admin'')',
        admin_policy,
        table_name
      );
      -- Restrictive guard also neutralizes any older permissive policies left
      -- on these tables, including policies that previously targeted PUBLIC.
      execute format(
        'create policy %I on public.%I as restrictive for all to anon, authenticated using ((select auth.jwt() -> ''app_metadata'' ->> ''role'') = ''admin'') with check ((select auth.jwt() -> ''app_metadata'' ->> ''role'') = ''admin'')',
        guard_policy,
        table_name
      );
    end if;
  end loop;
end
$$;

-- Keep other Storage buckets unchanged. Make only this app's media bucket
-- private and enforce the same admin role for every object operation.
update storage.buckets
set public = false
where id = 'media';

grant select, insert, update, delete on storage.objects to authenticated;

drop policy if exists "daily_report_media_admin_access" on storage.objects;
drop policy if exists "daily_report_media_admin_only_guard" on storage.objects;

create policy "daily_report_media_admin_access"
  on storage.objects as permissive
  for all to authenticated
  using (bucket_id = 'media' and (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check (bucket_id = 'media' and (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "daily_report_media_admin_only_guard"
  on storage.objects as restrictive
  for all to public
  using (bucket_id <> 'media' or (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check (bucket_id <> 'media' or (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
