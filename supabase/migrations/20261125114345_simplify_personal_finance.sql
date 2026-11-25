begin;

-- Keep the existing encrypted column nullable so the currently deployed app
-- remains compatible until the simplified frontend is published.
alter table public.personal_finance
  alter column encrypted_payload drop not null,
  add column if not exists amount_satang bigint,
  add column if not exists transaction_at timestamptz not null default now(),
  add column if not exists detail text;

alter table public.personal_finance
  drop constraint if exists personal_finance_plain_amount_positive,
  add constraint personal_finance_plain_amount_positive
    check (amount_satang is null or amount_satang > 0),
  drop constraint if exists personal_finance_plain_detail_valid,
  add constraint personal_finance_plain_detail_valid
    check (detail is null or char_length(btrim(detail)) between 1 and 2000),
  drop constraint if exists personal_finance_record_shape,
  add constraint personal_finance_record_shape
    check (
      (encrypted_payload is not null and amount_satang is null and detail is null)
      or (encrypted_payload is null and amount_satang is not null and detail is not null)
    );

comment on table public.personal_finance is
  'Owner-scoped finance entries. New entries store amount in satang, transaction timestamp, and user-entered details.';
comment on column public.personal_finance.amount_satang is
  'Transaction amount as integer satang.';
comment on column public.personal_finance.transaction_at is
  'Transaction creation timestamp; displayed and summarized using Asia/Bangkok.';
comment on column public.personal_finance.detail is
  'User-entered transaction details.';

create index if not exists personal_finance_owner_transaction_at_idx
  on public.personal_finance (owner_id, transaction_at desc);

commit;
