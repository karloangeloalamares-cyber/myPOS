-- Appointments table for POS scheduling
create table if not exists appointments (
  id uuid not null default gen_random_uuid(),
  client_name text,
  client_phone text,
  staff_id uuid,
  customer_id uuid references clients(id) on delete set null,
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

insert into appointments (id, customer_id, client_name, client_phone, staff_id, service_id, starts_at, status)
values
  ('f9a1c4a1-6d3f-4d1a-9801-4d6f7a9c5a2b', 'b5b7f4d1-1359-4d92-9c72-23a59d4c579a', 'Maria Santos', '09171234567', null, null, now() + interval '1 hour', 'pending'),
  ('d3c9b8a2-5af2-4c2f-a2a1-6c0d7c3b4e1f', 'a8f9d9ab-0cde-4d6a-8a8f-b85d6b4d271d', 'Jared Reyes', '09171239876', null, null, now() + interval '2 hours', 'pending')
on conflict (id) do nothing;
