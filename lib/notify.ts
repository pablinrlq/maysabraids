import { formatBrPhone } from "./phone";
import { site } from "./site";

/**
 * Aviso automático no WhatsApp da Maysa a cada novo agendamento, via CallMeBot
 * (serviço gratuito para mandar mensagens para o PRÓPRIO número).
 *
 * Ativação (feita uma vez, no celular da Maysa): salvar o contato do CallMeBot
 * e mandar "I allow callmebot to send me messages". Ele responde com a APIKEY,
 * que vai na variável de ambiente CALLMEBOT_APIKEY. Veja o README.
 */
export const ownerNotifyConfigured = () => Boolean(process.env.CALLMEBOT_APIKEY);

export async function sendOwnerWhatsApp(text: string) {
  const apikey = process.env.CALLMEBOT_APIKEY;
  if (!apikey) return false;
  const phone = process.env.CALLMEBOT_PHONE || `+${site.whatsappNumber}`;
  const endpoint = process.env.CALLMEBOT_ENDPOINT || "https://api.callmebot.com/whatsapp.php";

  const response = await fetch(`${endpoint}?${new URLSearchParams({ phone, text, apikey })}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
  // A resposta é um HTML curto; guardamos só o texto (sem a chave) para o log.
  const body = (await response.text()).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 200);
  if (!response.ok || /invalid|error|wrong|not allowed/i.test(body)) {
    console.error("Aviso no WhatsApp da Maysa falhou:", response.status, body);
    return false;
  }
  console.info("Aviso no WhatsApp da Maysa enviado:", response.status, body.slice(0, 80));
  return true;
}

type NewBooking = {
  name: string;
  phone: string;
  serviceTitle: string;
  priceText: string;
  date: string;
  time: string;
  note: string;
  siteUrl: string;
};

export function newBookingMessage(booking: NewBooking) {
  const day = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(
    new Date(`${booking.date}T12:00:00Z`),
  );
  return [
    "*✨ Novo agendamento pelo site*",
    "",
    `👤 *Cliente:* ${booking.name}`,
    `📱 *WhatsApp:* ${formatBrPhone(booking.phone)}`,
    `👉 https://wa.me/${booking.phone}`,
    `💇 *Trança:* ${booking.serviceTitle} — ${booking.priceText}`,
    `📅 *Dia:* ${day}`,
    `⏰ *Horário:* ${booking.time}`,
    booking.note ? `📝 *Obs.:* ${booking.note}` : "",
    "",
    `Painel: ${booking.siteUrl}/admin`,
  ].filter((line, index, lines) => line !== "" || lines[index - 1] !== "").join("\n");
}
