"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Calendar from "./components/Calendar";
import { brl, serviceById, services } from "../lib/services";
import { site, whatsappLink } from "../lib/site";

const groups = [
  { id: "simples", title: "Sem jumbo" },
  { id: "jumbo", title: "Com jumbo" },
] as const;

const MONTHS_AHEAD = 4;

function localToday() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

type FreeDay = { date: string; free: number };

async function fetchFreeDays() {
  const response = await fetch("/api/availability", { cache: "no-store" });
  if (!response.ok) throw new Error("availability");
  return ((await response.json()) as { days: FreeDay[] }).days;
}

export default function BookingForm({ initialServiceId }: { initialServiceId?: string }) {
  const [serviceId, setServiceId] = useState(initialServiceId && serviceById.has(initialServiceId) ? initialServiceId : "box");
  const [today, setToday] = useState("");
  const [cursor, setCursor] = useState({ year: 0, month: 0 });
  const [freeByDay, setFreeByDay] = useState<Record<string, number>>({});
  const [daysState, setDaysState] = useState<"loading" | "ready" | "error">("loading");
  const [date, setDate] = useState("");
  const [times, setTimes] = useState<string[]>([]);
  const [timesLoading, setTimesLoading] = useState(false);
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [submitState, setSubmitState] = useState<"idle" | "sending" | "error">("idle");
  const [submitError, setSubmitError] = useState("");
  const timesRequest = useRef(0);

  const applyDays = useCallback((days: FreeDay[], focusFirst: boolean) => {
    const now = localToday();
    setToday(now);
    setFreeByDay(Object.fromEntries(days.map((day) => [day.date, day.free])));
    setDaysState("ready");
    if (focusFirst) {
      const [year, month] = (days[0]?.date ?? now).split("-").map(Number);
      setCursor({ year, month: month - 1 });
    }
  }, []);

  const reloadDays = useCallback((focusFirst: boolean) => {
    setDaysState("loading");
    fetchFreeDays().then((days) => applyDays(days, focusFirst)).catch(() => setDaysState("error"));
  }, [applyDays]);

  useEffect(() => {
    let active = true;
    fetchFreeDays()
      .then((days) => { if (active) applyDays(days, true); })
      .catch(() => { if (active) setDaysState("error"); });
    return () => { active = false; };
  }, [applyDays]);

  async function fetchTimes(day: string) {
    const response = await fetch(`/api/bookings?date=${encodeURIComponent(day)}`, { cache: "no-store" });
    if (!response.ok) throw new Error("times");
    return ((await response.json()) as { times: string[] }).times;
  }

  async function selectDay(day: string) {
    const request = ++timesRequest.current;
    setDate(day);
    setTime("");
    setTimes([]);
    setTimesLoading(true);
    setSubmitError("");
    try {
      const free = await fetchTimes(day);
      if (request === timesRequest.current) setTimes(free);
    } catch {
      if (request === timesRequest.current) setSubmitError("Não foi possível consultar os horários. Tente novamente.");
    } finally {
      if (request === timesRequest.current) setTimesLoading(false);
    }
  }

  const selectedService = services.find((service) => service.id === serviceId) ?? services[0];
  const ready = Boolean(date && time && name.trim());
  const todayMonth = today ? Number(today.slice(0, 4)) * 12 + Number(today.slice(5, 7)) - 1 : 0;
  const cursorMonth = cursor.year * 12 + cursor.month;
  const hasAnyDay = Object.keys(freeByDay).length > 0;

  const formattedDate = useMemo(
    () => (date ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`)) : ""),
    [date],
  );
  const weekday = useMemo(
    () => (date ? new Intl.DateTimeFormat("pt-BR", { weekday: "long", timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`)) : ""),
    [date],
  );

  async function sendRequest() {
    if (!ready) return;
    const message = [
      `Olá, ${site.owner}! ✨ Gostaria de agendar um horário.`,
      "",
      `Nome: ${name.trim()}`,
      `Trança: ${selectedService.title} (${selectedService.detail.toLowerCase()}) — ${brl(selectedService.price)}`,
      `Data: ${formattedDate} (${weekday})`,
      `Horário: ${time}`,
      note.trim() ? `Observação: ${note.trim()}` : "",
      "",
      "Pode confirmar para mim?",
    ].filter(Boolean).join("\n");

    setSubmitState("sending");
    setSubmitError("");
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), serviceId, date, time, note: note.trim() }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        if (response.status === 409) {
          // Alguém reservou antes: atualiza o calendário e os horários do dia.
          setTime("");
          await fetchFreeDays().then((days) => applyDays(days, false)).catch(() => undefined);
          setTimes(await fetchTimes(date).catch(() => []));
        }
        throw new Error(result.error ?? "Não foi possível salvar o pedido.");
      }
      window.location.assign(whatsappLink(message));
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Não foi possível salvar o pedido.");
      setSubmitState("error");
    }
  }

  return (
    <div className="booking-shell">
      <div className="booking-form">
        <div className="booking-step">
          <div className="step-heading"><span>01</span><div><small>TRANÇA</small><h3>Qual trança vamos fazer?</h3></div></div>
          {groups.map((group) => (
            <div className="service-group" key={group.id} role="radiogroup" aria-label={group.title}>
              <p className="service-group-title">{group.title}</p>
              <div className="service-picker">
                {services.filter((service) => service.group === group.id).map((service) => (
                  <button
                    className={service.id === serviceId ? "service-option selected" : "service-option"}
                    type="button"
                    role="radio"
                    aria-checked={service.id === serviceId}
                    key={service.id}
                    onClick={() => setServiceId(service.id)}
                  >
                    <strong>{service.title}</strong>
                    <em>{brl(service.price)}</em>
                  </button>
                ))}
              </div>
            </div>
          ))}
          <p className="service-hint">Não achou o modelo que você quer? <a href={whatsappLink("Olá, Maysa! Quero fazer uma trança diferente da tabela. Segue a foto de referência:")} target="_blank" rel="noreferrer">Mande uma foto no WhatsApp</a> que a Maysa te passa o valor.</p>
        </div>

        <div className="booking-step">
          <div className="step-heading"><span>02</span><div><small>DIA & HORÁRIO</small><h3>Quando fica melhor?</h3></div></div>
          {daysState === "loading" && <p className="availability-message">Consultando a agenda da Maysa...</p>}
          {daysState === "error" && <p className="availability-message unavailable">Não foi possível carregar a agenda. <button type="button" className="link-button" onClick={() => reloadDays(true)}>Tentar novamente</button></p>}
          {daysState === "ready" && !hasAnyDay && (
            <p className="availability-message unavailable">A agenda está fechada no momento. <a href={whatsappLink("Olá, Maysa! Quando você abre novos horários?")} target="_blank" rel="noreferrer">Fale com a Maysa no WhatsApp</a> para saber quando abrem novos dias.</p>
          )}
          {daysState === "ready" && hasAnyDay && today && (
            <>
              <Calendar
                year={cursor.year}
                month={cursor.month}
                today={today}
                canPrev={cursorMonth > todayMonth}
                canNext={cursorMonth < todayMonth + MONTHS_AHEAD}
                onMonthChange={(delta) => setCursor(({ year, month }) => {
                  const next = year * 12 + month + delta;
                  return { year: Math.floor(next / 12), month: next % 12 };
                })}
                getDay={(day) => {
                  const free = freeByDay[day] ?? 0;
                  return {
                    disabled: free === 0,
                    selected: day === date,
                    className: free > 0 ? "has-slots" : "",
                    marker: free > 0 ? `${free} ${free === 1 ? "livre" : "livres"}` : undefined,
                  };
                }}
                onSelect={(day) => void selectDay(day)}
              />
              <p className="calendar-legend"><i aria-hidden="true" /> Dias em destaque têm horários livres. Os demais estão fechados ou lotados.</p>
              <fieldset className="time-picker" id="horarios">
                <legend>{date ? `Horários em ${formattedDate}` : "Horários disponíveis"}</legend>
                {!date && <p className="availability-message">Escolha um dia no calendário para ver os horários livres.</p>}
                {date && timesLoading && <p className="availability-message">Consultando horários...</p>}
                {date && !timesLoading && times.map((slot) => (
                  <button type="button" className={time === slot ? "time selected" : "time"} aria-pressed={time === slot} key={slot} onClick={() => setTime(slot)}>{slot}</button>
                ))}
                {date && !timesLoading && times.length === 0 && (
                  <p className="availability-message unavailable">Os horários deste dia acabaram de ser preenchidos. Escolha outro dia.</p>
                )}
              </fieldset>
            </>
          )}
        </div>

        <div className="booking-step">
          <div className="step-heading"><span>03</span><div><small>SEUS DADOS</small><h3>Como podemos te chamar?</h3></div></div>
          <label className="text-field"><span>Seu nome</span><input type="text" placeholder="Digite seu nome" value={name} onChange={(event) => setName(event.target.value)} maxLength={80} autoComplete="name" /></label>
          <label className="text-field"><span>Alguma observação? <i>opcional</i></span><textarea placeholder="Ex.: tamanho, cor do jumbo, referência de foto..." rows={3} value={note} onChange={(event) => setNote(event.target.value)} maxLength={500} /></label>
        </div>
      </div>

      <aside className="booking-summary" aria-label="Resumo do agendamento">
        <p className="summary-kicker">SEU AGENDAMENTO</p>
        <h3>Quase tudo pronto,<br /><em>{name.trim() || "linda"}.</em></h3>
        <div className="summary-list">
          <div><span>Trança</span><strong>{selectedService.title}</strong></div>
          <div><span>Valor</span><strong>{brl(selectedService.price)}</strong></div>
          <div><span>Dia</span><strong>{date ? new Date(`${date}T12:00:00`).toLocaleDateString("pt-BR") : "Escolha um dia"}</strong></div>
          <div><span>Horário</span><strong>{time || "Escolha um horário"}</strong></div>
        </div>
        <button className="whatsapp-button" type="button" disabled={!ready || submitState === "sending"} onClick={sendRequest}>
          <span aria-hidden="true">↗</span> {submitState === "sending" ? "Reservando seu horário..." : "Reservar e continuar no WhatsApp"}
        </button>
        {submitError && <p className="booking-error" role="alert">{submitError}</p>}
        <p className="confirmation-note"><span aria-hidden="true">✓</span> Seu horário fica reservado e a Maysa confirma tudo pelo WhatsApp.</p>
        <p className="privacy-note">Seus dados são usados somente para organizar este atendimento.</p>
      </aside>
    </div>
  );
}
