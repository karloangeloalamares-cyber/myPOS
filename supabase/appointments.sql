-- Appointments table for POS scheduling
create table if not exists appointments (
  id uuid not null default gen_random_uuid(),
  client_name text,
  client_phone text,
  staff_id uuid,
  service_id uuid,
  starts_at timestamptz not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (id)
);

create or replace function set_appointments_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists trg_appointments_updated on appointments;
create trigger trg_appointments_updated
before update on appointments
for each row execute function set_appointments_updated_at();

insert into appointments (client_name, client_phone, staff_id, service_id, starts_at, status)
values
  ('Test Client', '09171234567', null, null, now() + interval '1 hour', 'pending')
on conflict (id) do nothing;
