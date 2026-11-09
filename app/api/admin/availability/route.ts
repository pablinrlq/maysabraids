import { getSql } from "../../../../db";
import { isAdminRequest, isSameOrigin } from "../../../../lib/admin-auth";
import { todayInSaoPaulo } from "../../../../lib/availability";
import { addDays, daysBetween, isValidDate, isValidTime, sortTimes, weekdayOf } from "../../../../lib/slots";

export const dynamic = "force-dynamic";

const MAX_TIMES = 24;
const MAX_RANGE_DAYS = 180;

const unauthorized = () => Response.json({ error: "Não autorizado." }, { status: 401 });

function parseTimes(value: unknown) {
  if (!Array.isArray(value)) return null;
  const times = sortTimes(value.filter(isValidTime));
  if (times.length === 0 || times.length > MAX_TIMES || times.length !== new Set(value).size) return null;
  return times;
}

// Horários publicados num período, marcando os que já têm cliente.
export async function GET(request: Request) {
  try {
    if (!(await isAdminRequest(request))) return unauthorized();
    const params = new URL(request.url).searchParams;
    const from = params.get("from") ?? "";
    const to = params.get("to") ?? "";
    if (!isValidDate(from) || !isValidDate(to) || daysBetween(from, to) < 0 || daysBetween(from, to) > 400) {
      return Response.json({ error: "Período inválido." }, { status: 400 });
    }
    const sql = getSql();
    const rows = await sql`
      select to_char(s.date, 'YYYY-MM-DD') as date, s.time,
             b.id::int as "bookingId", b.name as "clientName", b.service_title as "serviceTitle", b.status
      from availability_slots s
      left join bookings b on b.date = s.date and b.time = s.time and b.status <> 'cancelled'
      where s.date between ${from}::date and ${to}::date
      order by s.date, s.time
    `;
    return Response.json({ slots: rows, today: todayInSaoPaulo() });
  } catch (error) {
    console.error("Unable to list availability", error);
    return Response.json({ error: "Não foi possível carregar a agenda." }, { status: 500 });
  }
}

async function insertSlots(dates: string[], times: string[]) {
  if (dates.length === 0) return 0;
  const sql = getSql();
  const rows = await sql`
    insert into availability_slots (date, time)
    select d, t from unnest(${dates}::date[]) as d cross join unnest(${times}::text[]) as t
    on conflict do nothing
    returning time
  `;
  return rows.length;
}

// action "add": adiciona horários a um dia. action "bulk": abre vários dias de uma vez.
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return Response.json({ error: "Origem inválida." }, { status: 403 });
  try {
    if (!(await isAdminRequest(request))) return unauthorized();
    const body = (await request.json()) as {
      action?: string;
      date?: string;
      from?: string;
      to?: string;
      weekdays?: number[];
      times?: unknown;
    };
    const times = parseTimes(body.times);
    if (!times) return Response.json({ error: "Informe de 1 a 24 horários válidos (HH:MM)." }, { status: 400 });
    const today = todayInSaoPaulo();

    if (body.action === "add") {
      if (!isValidDate(body.date)) return Response.json({ error: "Data inválida." }, { status: 400 });
      if (body.date < today) return Response.json({ error: "Não é possível abrir horários em dias passados." }, { status: 400 });
      const added = await insertSlots([body.date], times);
      return Response.json({ added });
    }

    if (body.action === "bulk") {
      const { from, to } = body;
      const weekdays = Array.isArray(body.weekdays) ? body.weekdays.filter((day) => Number.isInteger(day) && day >= 0 && day <= 6) : [];
      if (!isValidDate(from) || !isValidDate(to) || daysBetween(from, to) < 0) {
        return Response.json({ error: "Período inválido." }, { status: 400 });
      }
      if (daysBetween(from, to) > MAX_RANGE_DAYS) {
        return Response.json({ error: `Escolha um período de até ${MAX_RANGE_DAYS} dias.` }, { status: 400 });
      }
      if (weekdays.length === 0) return Response.json({ error: "Escolha ao menos um dia da semana." }, { status: 400 });

      const dates: string[] = [];
      for (let date = from < today ? today : from; date <= to; date = addDays(date, 1)) {
        if (weekdays.includes(weekdayOf(date))) dates.push(date);
      }
      const added = await insertSlots(dates, times);
      return Response.json({ added, days: dates.length });
    }

    return Response.json({ error: "Ação inválida." }, { status: 400 });
  } catch (error) {
    console.error("Unable to save availability", error);
    return Response.json({ error: "Não foi possível salvar a agenda." }, { status: 500 });
  }
}

// Remove um horário (com "time") ou todos os horários livres de um dia (sem "time").
// Horários que já têm cliente nunca são removidos: cancele o agendamento antes.
export async function DELETE(request: Request) {
  if (!isSameOrigin(request)) return Response.json({ error: "Origem inválida." }, { status: 403 });
  try {
    if (!(await isAdminRequest(request))) return unauthorized();
    const { date, time } = (await request.json()) as { date?: string; time?: string };
    if (!isValidDate(date)) return Response.json({ error: "Data inválida." }, { status: 400 });
    if (time !== undefined && !isValidTime(time)) return Response.json({ error: "Horário inválido." }, { status: 400 });

    const sql = getSql();
    const rows = time
      ? await sql`
          delete from availability_slots s
          where s.date = ${date}::date and s.time = ${time}::text
            and not exists (select 1 from bookings b where b.date = s.date and b.time = s.time and b.status <> 'cancelled')
          returning s.time
        `
      : await sql`
          delete from availability_slots s
          where s.date = ${date}::date
            and not exists (select 1 from bookings b where b.date = s.date and b.time = s.time and b.status <> 'cancelled')
          returning s.time
        `;

    if (time && rows.length === 0) {
      return Response.json({ error: "Este horário já tem uma cliente. Cancele o agendamento para liberá-lo." }, { status: 409 });
    }
    return Response.json({ removed: rows.length });
  } catch (error) {
    console.error("Unable to remove availability", error);
    return Response.json({ error: "Não foi possível remover o horário." }, { status: 500 });
  }
}
