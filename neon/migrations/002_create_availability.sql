-- Horários que a trancista (admin) disponibiliza para agendamento.
-- Um dia sem nenhum horário cadastrado é considerado "dia fechado".
create table if not exists availability_slots (
  date date not null,
  time text not null check (time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  created_at bigint not null default (extract(epoch from now()) * 1000)::bigint,
  primary key (date, time)
);

create index if not exists idx_availability_slots_date on availability_slots (date);
