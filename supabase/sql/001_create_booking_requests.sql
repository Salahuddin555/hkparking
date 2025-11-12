-- Enables UUID generation for primary keys.
create extension if not exists "pgcrypto";

create table if not exists public.booking_requests (
  id uuid primary key default gen_random_uuid(),
  space_id text not null,
  full_name text not null,
  email text not null,
  phone text not null,
  vehicle_plate text not null,
  arrival_at timestamptz not null,
  departure_at timestamptz not null,
  notes text not null default '',
  requires_ev boolean not null default false,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'declined', 'cancelled')),
  host_response_at timestamptz,
  host_notes text not null default '',
  submitted_at timestamptz not null default timezone('utc', now()),
  constraint booking_requests_time_window check (departure_at > arrival_at),
  constraint booking_requests_email check (email like '%@%'),
  constraint booking_requests_vehicle_plate check (char_length(vehicle_plate) between 3 and 20)
);

create index if not exists booking_requests_space_id_idx on public.booking_requests (space_id);
create index if not exists booking_requests_arrival_idx on public.booking_requests (arrival_at);
create index if not exists booking_requests_status_idx on public.booking_requests (status);
