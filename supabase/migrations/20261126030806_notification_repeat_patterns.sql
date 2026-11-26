begin;

alter table public.scheduled_notifications
  add column if not exists remind_weekdays smallint[];

alter table public.scheduled_notifications
  drop constraint if exists scheduled_notifications_repeat_fields,
  drop constraint if exists scheduled_notifications_repeat_type_check;

alter table public.scheduled_notifications
  add constraint scheduled_notifications_repeat_type_check
    check (repeat_type in ('daily', 'weekly', 'monthly', 'yearly')),
  add constraint scheduled_notifications_repeat_fields check (
    (repeat_type = 'daily'
      and remind_weekdays is null and remind_month is null and remind_day is null)
    or
    (repeat_type = 'weekly'
      and remind_weekdays is not null
      and cardinality(remind_weekdays) between 1 and 7
      and array_position(remind_weekdays, null) is null
      and 1 <= all (remind_weekdays)
      and 7 >= all (remind_weekdays)
      and remind_month is null and remind_day is null)
    or
    (repeat_type = 'monthly'
      and remind_weekdays is null
      and remind_month is null
      and remind_day between 1 and 31)
    or
    (repeat_type = 'yearly'
      and remind_weekdays is null
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
  );

commit;
