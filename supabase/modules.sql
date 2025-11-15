-- Generic setup for stores + module feature toggles
create extension if not exists "pgcrypto";

create table if not exists stores (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  owner_name text,
  contact_phone text,
  contact_email text,
  store_plan text not null default 'Free' check (store_plan in ('Free','Premium')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function set_stores_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists trg_stores_updated on stores;
create trigger trg_stores_updated
before update on stores
for each row execute procedure set_stores_updated_at();

create table if not exists store_modules (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references stores(id) on delete cascade,
  module_name text not null,
  is_enabled boolean not null default false,
  unique (store_id, module_name)
);

create or replace function plan_default_enabled(p_plan text, p_module text)
returns boolean language sql immutable as $$
  select case
    when p_plan = 'Free' then (p_module in ('pos','inventory','reports','staff'))
    when p_plan = 'Premium' then (p_module in (
      'pos','inventory','reports','staff',
      'appointments','commissions','clients',
      'tips','multi_branch','export','reminders','loyalty'
    ))
    else false
  end
$$;

create or replace function seed_modules_for_store(p_store_id uuid)
returns void language plpgsql as $$
declare
  v_plan text;
  v_modules text[] := array[
    'pos','inventory','reports','staff',
    'appointments','commissions','clients',
    'tips','multi_branch','export','reminders','loyalty'
  ];
  v_mod text;
  v_default boolean;
begin
  select store_plan into v_plan from stores where id = p_store_id;
  foreach v_mod in array v_modules loop
    v_default := plan_default_enabled(v_plan, v_mod);
    insert into store_modules (store_id, module_name, is_enabled)
    values (p_store_id, v_mod, v_default)
    on conflict (store_id, module_name) do update
      set is_enabled = excluded.is_enabled;
  end loop;
end;
$$;

create or replace function trigger_seed_modules_for_store()
returns trigger language plpgsql as $$
begin
  perform seed_modules_for_store(NEW.id);
  return NEW;
end;
$$;

drop trigger if exists trg_seed_modules_on_insert on stores;
create trigger trg_seed_modules_on_insert
after insert on stores
for each row execute procedure trigger_seed_modules_for_store();

drop trigger if exists trg_seed_modules_on_plan_change on stores;
create trigger trg_seed_modules_on_plan_change
after update of store_plan on stores
for each row when (old.store_plan is distinct from new.store_plan)
execute procedure trigger_seed_modules_for_store();

-- seed a demo store that matches the front-end expectations
with inserted as (
  insert into stores (code, name, owner_name, contact_phone, contact_email, store_plan)
  values ('DEMO_STORE', 'myPOS Demo Store', 'Karlo Angelo Alamares', '09171234567', 'owner@mypos.local', 'Premium')
  on conflict (code) do update
    set name = excluded.name,
        owner_name = excluded.owner_name,
        contact_phone = excluded.contact_phone,
        contact_email = excluded.contact_email,
        store_plan = excluded.store_plan,
        updated_at = now()
  returning id
)
select seed_modules_for_store(id) from inserted;
