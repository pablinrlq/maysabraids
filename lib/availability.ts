import { getSql } from "../db";
import { site } from "./site";
import { addDays } from "./slots";

/** Data de hoje (AAAA-MM-DD) no fuso da Maysa, independente do fuso do servidor. */
export function todayInSaoPaulo() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: site.timezone, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

/** Horários livres (publicados, ainda no futuro e sem agendamento ativo) de um dia. */
export async function freeTimes(date: string) {
  const sql = getSql();
  const rows = await sql`
    select s.time
    from availability_slots s
    where s.date = ${date}::date
      and (s.date + s.time::time) > (now() at time zone 'America/Sao_Paulo')
      and not exists (
        select 1 from bookings b
        where b.date = s.date and b.time = s.time and b.status <> 'cancelled'
      )
    order by s.time
  `;
  return rows.map((row) => String(row.time));
}

/** Quantidade de horários livres por dia dentro do intervalo. */
export async function freeDays(from: string, to: string) {
  const sql = getSql();
  const rows = await sql`
    select to_char(s.date, 'YYYY-MM-DD') as date, count(*)::int as free
    from availability_slots s
    where s.date between ${from}::date and ${to}::date
      and (s.date + s.time::time) > (now() at time zone 'America/Sao_Paulo')
      and not exists (
        select 1 from bookings b
        where b.date = s.date and b.time = s.time and b.status <> 'cancelled'
      )
    group by s.date
    order by s.date
  `;
  return rows.map((row) => ({ date: String(row.date), free: Number(row.free) }));
}

export function defaultRange() {
  const from = todayInSaoPaulo();
  return { from, to: addDays(from, 120) };
}
