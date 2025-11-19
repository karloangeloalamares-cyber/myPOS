-- Tips & gratuity tables
create extension if not exists "pgcrypto";

create table if not exists tips (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references stores(id) on delete cascade,
  sale_id uuid not null,
  total_tip numeric(12,2) not null,
  method text not null check (method in ('cash','card','gcash','other')),
  status text not null default 'unsettled',
  settled_at timestamptz null,
  created_at timestamptz not null default now()
);

create table if not exists tip_shares (
  id uuid primary key default gen_random_uuid(),
  tip_id uuid not null references tips(id) on delete cascade,
  staff_id uuid not null,
  amount numeric(12,2) not null,
  created_at timestamptz not null default now()
);

do $$
begin
  alter table tips
    add constraint tips_store_fk foreign key (store_id) references stores(id) on delete cascade;
exception when duplicate_object then null;
end$$;

-- NOTE: sales table is not defined here; keep sale_id for external reference without FK.

create index if not exists idx_tips_store_status on tips(store_id, status);
create index if not exists idx_tip_shares_staff on tip_shares(staff_id);

alter table tips enable row level security;
alter table tip_shares enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policy
    where polname = 'tips select own store'
      and polrelid = 'tips'::regclass
  ) then
    create policy "tips select own store" on tips
      for select using (store_id = current_store_id());
  end if;
  if not exists (
    select 1
    from pg_policy
    where polname = 'tips insert own store'
      and polrelid = 'tips'::regclass
  ) then
    create policy "tips insert own store" on tips
      for insert with check (store_id = current_store_id());
  end if;
  if not exists (
    select 1
    from pg_policy
    where polname = 'tips update own store'
      and polrelid = 'tips'::regclass
  ) then
    create policy "tips update own store" on tips
      for update using (store_id = current_store_id()) with check (store_id = current_store_id());
  end if;
  if not exists (
    select 1
    from pg_policy
    where polname = 'tips delete own store'
      and polrelid = 'tips'::regclass
  ) then
    create policy "tips delete own store" on tips
      for delete using (store_id = current_store_id());
  end if;
end$$;

do $$
begin
  if not exists (
    select 1
    from pg_policy
    where polname = 'tip shares select own store'
      and polrelid = 'tip_shares'::regclass
  ) then
    create policy "tip shares select own store" on tip_shares
      for select using (exists (
        select 1 from tips t where t.id = tip_shares.tip_id and t.store_id = current_store_id()
      ));
  end if;
  if not exists (
    select 1
    from pg_policy
    where polname = 'tip shares insert own store'
      and polrelid = 'tip_shares'::regclass
  ) then
    create policy "tip shares insert own store" on tip_shares
      for insert with check (exists (
        select 1 from tips t where t.id = tip_shares.tip_id and t.store_id = current_store_id()
      ));
  end if;
  if not exists (
    select 1
    from pg_policy
    where polname = 'tip shares update own store'
      and polrelid = 'tip_shares'::regclass
  ) then
    create policy "tip shares update own store" on tip_shares
      for update using (exists (
        select 1 from tips t where t.id = tip_shares.tip_id and t.store_id = current_store_id()
      )) with check (exists (
        select 1 from tips t where t.id = tip_shares.tip_id and t.store_id = current_store_id()
      ));
  end if;
  if not exists (
    select 1
    from pg_policy
    where polname = 'tip shares delete own store'
      and polrelid = 'tip_shares'::regclass
  ) then
    create policy "tip shares delete own store" on tip_shares
      for delete using (exists (
        select 1 from tips t where t.id = tip_shares.tip_id and t.store_id = current_store_id()
      ));
  end if;
end$$;

create or replace function current_store_id()
returns uuid language sql stable as $$
  select nullif(current_setting('app.current_store_id', true), '')::uuid;
$$;

create or replace function set_current_store_context(p_store_id uuid)
returns void language sql volatile as $$
  select set_config('app.current_store_id', coalesce(p_store_id::text, ''), true);
$$;

create or replace function set_current_store_context(p_store_id text)
returns void language sql volatile as $$
  select set_current_store_context(nullif(p_store_id, '')::uuid);
$$;
