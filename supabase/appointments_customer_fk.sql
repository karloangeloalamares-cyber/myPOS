-- Migration: link appointments to CRM clients via customer_id
alter table appointments
  add column if not exists customer_id uuid;

do $$
begin
  if not exists (
    select 1
    from information_schema.table_constraints c
    where c.table_name = 'appointments'
      and c.constraint_type = 'FOREIGN KEY'
      and c.constraint_name = 'appointments_customer_id_fkey'
  ) then
    alter table appointments
      add constraint appointments_customer_id_fkey
      foreign key (customer_id)
      references clients (id)
      on delete set null;
  end if;
end;
$$;
