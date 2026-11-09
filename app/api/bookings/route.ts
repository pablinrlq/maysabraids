import { after } from "next/server";
import { getSql } from "../../../db";
import { isSameOrigin } from "../../../lib/admin-auth";
import { freeTimes } from "../../../lib/availability";
import { newBookingMessage, ownerNotifyConfigured, sendOwnerWhatsApp } from "../../../lib/notify";
import { normalizeBrPhone } from "../../../lib/phone";
import { priceLabel, serviceById } from "../../../lib/services";
import { isValidDate, isValidTime } from "../../../lib/slots";

export const dynamic = "force-dynamic";

// Público: horários livres de um dia.
export async function GET(request: Request) {
  const date = new URL(request.url).searchParams.get("date") ?? "";
  if (!isValidDate(date)) return Response.json({ error: "Data inválida." }, { status: 400 });
  try {
    return Response.json({ times: await freeTimes(date) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Unable to load availability", error);
    return Response.json({ error: "Não foi possível consultar os horários." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return Response.json({ error: "Origem inválida." }, { status: 403 });

  try {
    const payload = (await request.json()) as { name?: string; phone?: string; serviceId?: string; date?: string; time?: string; note?: string };
    const name = payload.name?.trim() ?? "";
    const phone = normalizeBrPhone(payload.phone ?? "");
    const service = serviceById.get(payload.serviceId ?? "");
    const date = payload.date ?? "";
    const time = payload.time ?? "";
    const note = payload.note?.trim() ?? "";

    if (name.length < 2 || name.length > 80) return Response.json({ error: "Informe um nome válido." }, { status: 400 });
    if (!phone) return Response.json({ error: "Informe um WhatsApp válido, com DDD." }, { status: 400 });
    if (!service) return Response.json({ error: "Trança inválida." }, { status: 400 });
    if (!isValidDate(date)) return Response.json({ error: "Data inválida." }, { status: 400 });
    if (!isValidTime(time)) return Response.json({ error: "Horário inválido." }, { status: 400 });
    if (note.length > 500) return Response.json({ error: "A observação está muito longa." }, { status: 400 });

    // Só reserva se o horário foi realmente disponibilizado pela Maysa e ainda não passou.
    // O índice único (date, time) impede reservas duplicadas mesmo em requisições simultâneas.
    const sql = getSql();
    const rows = await sql`
      insert into bookings (name, phone, service_id, service_title, date, time, note)
      select ${name}::text, ${phone}::text, ${service.id}::text, ${service.title}::text, ${date}::date, ${time}::text, ${note}::text
      where exists (
        select 1 from availability_slots s
        where s.date = ${date}::date and s.time = ${time}::text
          and (s.date + s.time::time) > (now() at time zone 'America/Sao_Paulo')
      )
      returning id::int as id
    `;

    if (rows.length === 0) {
      return Response.json({ error: "Este horário não está mais disponível. Escolha outro." }, { status: 409 });
    }

    // Avisa a Maysa no WhatsApp depois de responder à cliente (não atrasa nem derruba a reserva).
    const autoNotify = ownerNotifyConfigured();
    if (autoNotify) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
      const text = newBookingMessage({ name, phone, serviceTitle: service.title, priceText: priceLabel(service), date, time, note, siteUrl });
      after(() => sendOwnerWhatsApp(text).catch((error) => console.error("Aviso no WhatsApp da Maysa falhou:", error)));
    }

    return Response.json({ id: rows[0].id, autoNotify }, { status: 201 });
  } catch (error) {
    console.error("Unable to create booking", error);
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("23505") || message.includes("idx_bookings_date_time_unique") || message.includes("duplicate key")) {
      return Response.json({ error: "Este horário acabou de ser reservado. Escolha outro." }, { status: 409 });
    }
    return Response.json({ error: "Não foi possível salvar o pedido agora." }, { status: 500 });
  }
}
