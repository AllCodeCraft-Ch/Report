begin;

drop policy if exists scheduled_notifications_owner_admin_access
  on public.scheduled_notifications;
drop policy if exists scheduled_notifications_owner_access
  on public.scheduled_notifications;

create policy scheduled_notifications_owner_access
  on public.scheduled_notifications
  as permissive
  for all
  to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

commit;
