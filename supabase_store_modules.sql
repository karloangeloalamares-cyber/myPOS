-- 1) Add store_plan to stores (Free|Premium)
alter table stores
  add column if not exists store_plan text
  check (store_plan in ('Free','Premium'))
  default 'Free';

-- 2) Feature toggles table
create table if not exists store_modules (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references stores(id) on delete cascade,
  module_name text not null,
  is_enabled boolean not null default false,
  unique (store_id, module_name)
);

-- 3) Helper: plan defaults
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

-- 4) Seeder: ensure rows exist for all known modules; set defaults for the plan
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
      set is_enabled = excluded.is_enabled;  -- align with plan on seed
  end loop;
end;
$$;

-- 5) Trigger on new store: seed rows
drop trigger if exists trg_seed_modules_on_insert on stores;
create trigger trg_seed_modules_on_insert
after insert on stores
for each row execute procedure seed_modules_for_store(new.id);

-- 6) Trigger on plan change: reseed rows
drop trigger if exists trg_seed_modules_on_plan_change on stores;
create trigger trg_seed_modules_on_plan_change
after update of store_plan on stores
for each row when (old.store_plan is distinct from new.store_plan)
execute procedure seed_modules_for_store(new.id);
