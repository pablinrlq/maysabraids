import { defaultRange, freeDays } from "../../../lib/availability";
import { daysBetween, isValidDate } from "../../../lib/slots";

export const dynamic = "force-dynamic";

// Público: dias com pelo menos um horário livre.
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const fallback = defaultRange();
  const from = params.get("from") ?? fallback.from;
  const to = params.get("to") ?? fallback.to;

  if (!isValidDate(from) || !isValidDate(to) || daysBetween(from, to) < 0 || daysBetween(from, to) > 200) {
    return Response.json({ error: "Período inválido." }, { status: 400 });
  }

  try {
    return Response.json({ days: await freeDays(from, to) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Unable to load availability", error);
    return Response.json({ error: "Não foi possível consultar a agenda." }, { status: 500 });
  }
}
