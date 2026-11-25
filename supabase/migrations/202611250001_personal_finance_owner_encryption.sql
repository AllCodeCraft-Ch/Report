begin;

create table if not exists public.personal_finance (
  id uuid primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  encrypted_payload text not null,
  constraint personal_finance_payload_size check (char_length(encrypted_payload) between 24 and 16384)
);

comment on table public.personal_finance is
  'Owner-scoped, client-side encrypted transaction records. Plaintext financial values are never stored.';
comment on column public.personal_finance.encrypted_payload is
  'AES-GCM encrypted JSON containing only integer satang, transaction date, time, and user-entered details.';

alter table public.personal_finance enable row level security;
alter table public.personal_finance force row level security;

revoke all privileges on table public.personal_finance from public, anon;
grant select, insert, update, delete on table public.personal_finance to authenticated;

drop policy if exists personal_finance_owner_access on public.personal_finance;
drop policy if exists personal_finance_owner_aal2_guard on public.personal_finance;

create policy personal_finance_owner_access
  on public.personal_finance
  as permissive
  for all
  to authenticated
  using (
    owner_id = (select auth.uid())
    and (select auth.jwt() ->> 'aal') = 'aal2'
  )
  with check (
    owner_id = (select auth.uid())
    and (select auth.jwt() ->> 'aal') = 'aal2'
  );

create policy personal_finance_owner_aal2_guard
  on public.personal_finance
  as restrictive
  for all
  to public
  using (
    owner_id = (select auth.uid())
    and (select auth.jwt() ->> 'aal') = 'aal2'
  )
  with check (
    owner_id = (select auth.uid())
    and (select auth.jwt() ->> 'aal') = 'aal2'
  );

commit;
