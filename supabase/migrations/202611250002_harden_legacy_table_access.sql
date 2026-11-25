begin;

-- These legacy tables are not referenced by the current client code and have
-- no application rows. Remove their anonymous API grants while preserving
-- authenticated CRUD grants for compatibility with future admin tooling.
revoke all privileges on table
  public.daily_notes,
  public.checklist_tasks,
  public.daily_checklist_sections,
  public.daily_checklist_tasks,
  public.media_files
from public, anon;

-- Remove the permissive policy that bypassed daily_notes ownership.
drop policy if exists daily_notes_all on public.daily_notes;
drop policy if exists "Users can manage their daily notes" on public.daily_notes;
create policy daily_notes_owner_access
  on public.daily_notes
  as permissive
  for all
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "Users can manage their checklist tasks" on public.checklist_tasks;
create policy checklist_tasks_owner_access
  on public.checklist_tasks
  as permissive
  for all
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Shared checklist definitions are administered only by the trusted admin.
drop policy if exists daily_checklist_sections_all on public.daily_checklist_sections;
drop policy if exists daily_checklist_tasks_all on public.daily_checklist_tasks;
drop policy if exists daily_checklist_sections_admin_access on public.daily_checklist_sections;
drop policy if exists daily_checklist_sections_admin_guard on public.daily_checklist_sections;
drop policy if exists daily_checklist_tasks_admin_access on public.daily_checklist_tasks;
drop policy if exists daily_checklist_tasks_admin_guard on public.daily_checklist_tasks;

create policy daily_checklist_sections_admin_access
  on public.daily_checklist_sections
  as permissive
  for all
  to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy daily_checklist_sections_admin_guard
  on public.daily_checklist_sections
  as restrictive
  for all
  to anon, authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy daily_checklist_tasks_admin_access
  on public.daily_checklist_tasks
  as permissive
  for all
  to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy daily_checklist_tasks_admin_guard
  on public.daily_checklist_tasks
  as restrictive
  for all
  to anon, authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Media metadata is admin-managed. Storage bucket/object policies are separate
-- and are intentionally unchanged by this migration.
drop policy if exists "Allow all select/insert media_files" on public.media_files;
drop policy if exists media_files_admin_access on public.media_files;
drop policy if exists media_files_admin_guard on public.media_files;
create policy media_files_admin_access
  on public.media_files
  as permissive
  for all
  to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy media_files_admin_guard
  on public.media_files
  as restrictive
  for all
  to anon, authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Identity sequences only need USAGE for inserts; no anonymous sequence access.
revoke all privileges on sequence
  public.daily_notes_id_seq,
  public.checklist_tasks_id_seq,
  public.daily_checklist_sections_id_seq,
  public.daily_checklist_tasks_id_seq
from public, anon, authenticated;
grant usage on sequence
  public.daily_notes_id_seq,
  public.checklist_tasks_id_seq,
  public.daily_checklist_sections_id_seq,
  public.daily_checklist_tasks_id_seq
to authenticated;

-- Browser clients only need row-level CRUD. These DDL-level privileges bypass
-- RLS or permit schema-level operations and are not used by the client.
revoke truncate, references, trigger on table
  public.daily_reports,
  public.media_files,
  public.calendar_notes,
  public.daily_notes,
  public.checklist_tasks,
  public.daily_checklist_sections,
  public.daily_checklist_tasks,
  public.provincial_trips,
  public.provincial_trip_cutoffs,
  public.personal_finance
from authenticated;

commit;
