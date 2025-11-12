-- store_modules table and basic seeding helpers
create table if not exists store_modules (
  store_id uuid not null,
  module_name text not null,
  is_enabled boolean not null default false,
  inserted_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  primary key (store_id, module_name)
);

-- Optional trigger to update updated_at
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists trg_store_modules_updated on store_modules;
create trigger trg_store_modules_updated
before update on store_modules
for each row execute function set_updated_at();

-- Seed function: plan can be 'free' or 'premium'
create or replace function seed_store_modules(p_store_id uuid, p_plan text)
returns void language plpgsql as $$
begin
  -- core
  insert into store_modules(store_id,module_name,is_enabled) values
    (p_store_id,'pos',true),
    (p_store_id,'inventory',true),
    (p_store_id,'staff',true),
    (p_store_id,'reports',true)
  on conflict (store_id,module_name) do update set is_enabled=excluded.is_enabled;

  if lower(p_plan) = 'premium' then
    insert into store_modules(store_id,module_name,is_enabled) values
      (p_store_id,'appointments',true),
      (p_store_id,'commissions',true),
      (p_store_id,'clients',true),
      (p_store_id,'tips',true),
      (p_store_id,'multi_branch',true),
      (p_store_id,'export',true),
      (p_store_id,'reminders',true)
    on conflict (store_id,module_name) do update set is_enabled=excluded.is_enabled;
  else
    -- ensure premium modules are off on free plan
    insert into store_modules(store_id,module_name,is_enabled) values
      (p_store_id,'appointments',false),
      (p_store_id,'commissions',false),
      (p_store_id,'clients',false),
      (p_store_id,'tips',false),
      (p_store_id,'multi_branch',false),
      (p_store_id,'export',false),
      (p_store_id,'reminders',false)
    on conflict (store_id,module_name) do update set is_enabled=excluded.is_enabled;
  end if;
end; $$;

-- Example usage:
-- select seed_store_modules('00000000-0000-0000-0000-000000000000'::uuid, 'free');
-- select seed_store_modules('00000000-0000-0000-0000-000000000000'::uuid, 'premium');
