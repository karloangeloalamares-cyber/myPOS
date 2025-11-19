-- Tickets table for multi-service queueing
create extension if not exists "pgcrypto";

create table if not exists tickets (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references stores(id) on delete cascade,
  customer_id uuid references clients(id) on delete set null,
  ticket_number text not null,
  ticket_type text not null,
  status text not null default 'waiting',
  priority int not null default 0,
  checkin_at timestamptz not null default now(),
  promised_at timestamptz null,
  completed_at timestamptz null,
  staff_id uuid null,
  total_amount numeric(12,2) null,
  notes text null,
  created_at timestamptz not null default now()
);

create index if not exists idx_tickets_store_status on tickets(store_id, status);
create index if not exists idx_tickets_store_checkin on tickets(store_id, checkin_at desc);

alter table tickets enable row level security;

-- helper to map the current store context, expects app.current_store_id to be set
create or replace function current_store_id()
returns uuid language sql stable as $$
  select nullif(current_setting('app.current_store_id', true), '')::uuid;
$$;

create policy "tickets select own store" on tickets
  for select using (store_id = current_store_id());

create policy "tickets insert own store" on tickets
  for insert with check (store_id = current_store_id());

create policy "tickets update own store" on tickets
  for update using (store_id = current_store_id()) with check (store_id = current_store_id());

create policy "tickets delete own store" on tickets
  for delete using (store_id = current_store_id());
