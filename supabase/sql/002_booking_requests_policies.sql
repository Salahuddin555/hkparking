alter table public.booking_requests enable row level security;

drop policy if exists "allow_insert_from_public" on public.booking_requests;
drop policy if exists "service_role_reads" on public.booking_requests;
drop policy if exists "service_role_updates" on public.booking_requests;

-- Allow drivers (anon/authenticated) to create booking requests.
create policy "allow_insert_from_public"
  on public.booking_requests
  for insert
  with check (true);

-- Restrict reads to service key usage only.
create policy "service_role_reads"
  on public.booking_requests
  for select
  using (auth.role() = 'service_role');

-- Allow service role to update statuses if needed.
create policy "service_role_updates"
  on public.booking_requests
  for update
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
