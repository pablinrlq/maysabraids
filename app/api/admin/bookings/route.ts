import { getSql } from "../../../../db";
import { isAdminRequest, isSameOrigin } from "../../../../lib/admin-auth";

export const dynamic = "force-dynamic";

const allowedStatuses = new Set(["pending", "confirmed", "completed", "cancelled"]);

export async function GET(request: Request) {
  try {
    if (!(await isAdminRequest(request))) return Response.json({ error: "Não autorizado." }, { status: 401 });
    const sql = getSql();
    const rows = await sql`
      select id::int as id, name, phone, service_id as "serviceId", service_title as "serviceTitle",
             to_char(date, 'YYYY-MM-DD') as date, time, note, status
      from bookings
      order by date desc, time desc
      limit 250
    `;
    return Response.json({ bookings: rows });
  } catch (error) {
    console.error("Unable to list bookings", error);
    return Response.json({ error: "Não foi possível carregar os agendamentos." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!isSameOrigin(request)) return Response.json({ error: "Origem inválida." }, { status: 403 });
  try {
    if (!(await isAdminRequest(request))) return Response.json({ error: "Não autorizado." }, { status: 401 });
    const { id, status } = (await request.json()) as { id?: number; status?: string };
    if (!Number.isInteger(id) || !status || !allowedStatuses.has(status)) {
      return Response.json({ error: "Atualização inválida." }, { status: 400 });
    }
    const sql = getSql();
    const rows = await sql`update bookings set status = ${status}::text where id = ${id!}::bigint returning id::int as id, status`;
    if (rows.length === 0) return Response.json({ error: "Agendamento não encontrado." }, { status: 404 });
    return Response.json({ booking: rows[0] });
  } catch (error) {
    console.error("Unable to update booking", error);
    const message = error instanceof Error ? error.message : String(error);
    // Reativar um pedido cancelado cujo horário já foi reservado por outra cliente.
    if (message.includes("23505") || message.includes("duplicate key")) {
      return Response.json({ error: "Esse horário já foi reservado por outra cliente." }, { status: 409 });
    }
    return Response.json({ error: "Não foi possível atualizar o agendamento." }, { status: 500 });
  }
}
