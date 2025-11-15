-- Client table for CRM + CRM helper data
create extension if not exists "pgcrypto";

create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  store_id uuid references stores(id) on delete set null,
  name text not null,
  phone text,
  email text,
  tags text[] default array[]::text[],
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function set_clients_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists trg_clients_updated on clients;
create trigger trg_clients_updated
before update on clients
for each row execute procedure set_clients_updated_at();

create unique index if not exists clients_store_name_unique on clients(store_id, lower(name));

do $$
declare
  demo_store uuid;
begin
  select id into demo_store from stores where code = 'DEMO_STORE' limit 1;
  if demo_store is null then
    return;
  end if;

  insert into clients (store_id, name, phone, email, tags, notes)
  values
    (demo_store, 'Maria Santos', '09171234567', 'maria@example.com', array['VIP'], 'Booked regular haircuts weekly.'),
    (demo_store, 'Jared Reyes', '09171239876', 'jared@example.com', array['subscription'], 'Prefers evening slots.'),
    (demo_store, 'Kyla Navarro', '09171230001', 'kyla@example.com', array['referral','spa'], 'Recent spa treatment referral.')
  on conflict (store_id, lower(name)) do update
    set phone = excluded.phone,
        email = excluded.email,
        tags = excluded.tags,
        notes = excluded.notes,
        updated_at = now();
end;
$$;
