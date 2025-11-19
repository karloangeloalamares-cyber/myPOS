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
  maria uuid := 'b5b7f4d1-1359-4d92-9c72-23a59d4c579a';
  jared uuid := 'a8f9d9ab-0cde-4d6a-8a8f-b85d6b4d271d';
  kyla uuid := 'c9da8d2d-7e38-41f4-87f4-9b0a3d2bd1f4';
begin
  select id into demo_store from stores where code = 'DEMO_STORE' limit 1;
  if demo_store is null then
    return;
  end if;

  insert into clients (id, store_id, name, phone, email, tags, notes)
  values
    (maria, demo_store, 'Maria Santos', '09171234567', 'maria@example.com', array['VIP'], 'Booked regular haircuts weekly.'),
    (jared, demo_store, 'Jared Reyes', '09171239876', 'jared@example.com', array['subscription'], 'Prefers evening slots.'),
    (kyla, demo_store, 'Kyla Navarro', '09171230001', 'kyla@example.com', array['referral','spa'], 'Recent spa treatment referral.')
  on conflict (store_id, lower(name)) do update
    set phone = excluded.phone,
        email = excluded.email,
        tags = excluded.tags,
        notes = excluded.notes,
        updated_at = now();
end;
$$;
