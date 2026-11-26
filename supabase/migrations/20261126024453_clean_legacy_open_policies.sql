begin;

-- Remove historical public permissive policies. Admin-only permissive policies
-- and restrictive admin guards continue to provide the intended app access.
drop policy if exists "Enable delete for all users" on public.calendar_notes;
drop policy if exists "Enable insert for all users" on public.calendar_notes;
drop policy if exists "Enable read for all users" on public.calendar_notes;

drop policy if exists "Allow app clients to read provincial trips" on public.provincial_trips;
drop policy if exists "Allow app clients to add provincial trips" on public.provincial_trips;
drop policy if exists "Allow app clients to delete provincial trips" on public.provincial_trips;

drop policy if exists "Allow app clients to read trip cutoffs" on public.provincial_trip_cutoffs;
drop policy if exists "Allow app clients to add trip cutoffs" on public.provincial_trip_cutoffs;
drop policy if exists "Allow app clients to delete trip cutoffs" on public.provincial_trip_cutoffs;

commit;
