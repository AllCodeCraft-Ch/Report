begin;

drop policy if exists personal_finance_owner_access on public.personal_finance;
drop policy if exists personal_finance_owner_aal2_guard on public.personal_finance;
drop policy if exists personal_finance_owner_guard on public.personal_finance;

create policy personal_finance_owner_access
  on public.personal_finance
  as permissive
  for all
  to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy personal_finance_owner_guard
  on public.personal_finance
  as restrictive
  for all
  to public
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

commit;
