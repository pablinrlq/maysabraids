"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Calendar from "./components/Calendar";
import { braidPhotos } from "./components/braidPhotos";
import { formatBrPhone, maskBrPhone, normalizeBrPhone } from "../lib/phone";
import { jumboLabel, priceLabel, serviceById, services } from "../lib/services";
import { site, whatsappLink } from "../lib/site";

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

type Props = {
  initialServiceId?: string;
  /** true quando o aviso automático no WhatsApp da Maysa está configurado. */
  autoNotify: boolean;
};

export default function BookingForm({ initialServiceId, autoNotify }: Props) {
  const [serviceId, setServiceId] = useState(initialServiceId && serviceById.has(initialServiceId) ? initialServiceId : services[0].id);
  const [today, setToday] = useState("");
  const [cursor, setCursor] = useState({ year: 0, month: 0 });
  const [freeByDay, setFreeByDay] = useState<Record<string, number>>({});
  const [daysState, setDaysState] = useState<"loading" | "ready" | "error">("loading");
  const [date, setDate] = useState("");
  const [times, setTimes] = useState<string[]>([]);
  const [timesLoading, setTimesLoading] = useState(false);
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [note, setNote] = useState("");
  const [submitState, setSubmitState] = useState<"idle" | "sending" | "error">("idle");
  const [submitError, setSubmitError] = useState("");
  const [done, setDone] = useState(false);
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

  const selectedService = serviceById.get(serviceId) ?? services[0];
  const selectedJumbo = jumboLabel(selectedService);
  const phoneDigits = normalizeBrPhone(phone);
  const ready = Boolean(date && time && name.trim() && phoneDigits);
  const todayMonth = today ? Number(today.slice(0, 4)) * 12 + Number(today.slice(5, 7)) - 1 : 0;
  const cursorMonth = cursor.year * 12 + cursor.month;
  const hasAnyDay = Object.keys(freeByDay).length > 0;
  const firstName = name.trim().split(/\s+/)[0] || "linda";

  const formattedDate = useMemo(
    () => (date ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`)) : ""),
    [date],
  );
  const weekday = useMemo(
    () => (date ? new Intl.DateTimeFormat("pt-BR", { weekday: "long", timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`)) : ""),
    [date],
  );

  const clientMessage = [
    // Sem emojis: o WhatsApp para computador quebra alguns emojis vindos de links wa.me (aparece "�").
    `Olá, ${site.owner}! ${done ? "Acabei de agendar pelo site." : "Gostaria de agendar um horário."}`,
    "",
    `Nome: ${name.trim()}`,
    `Trança: ${selectedService.title}${selectedJumbo ? ` (${selectedJumbo.toLowerCase()})` : ""} — ${priceLabel(selectedService)}`,
    `Data: ${formattedDate} (${weekday})`,
    `Horário: ${time}`,
    note.trim() ? `Observação: ${note.trim()}` : null,
    "",
    done ? "Fico no aguardo da confirmação!" : "Pode confirmar para mim?",
  ].filter((line) => line !== null).join("\n");

  async function sendRequest() {
    if (!ready || !phoneDigits) return;
    setSubmitState("sending");
    setSubmitError("");
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), phone: phoneDigits, serviceId, date, time, note: note.trim() }),
      });
      const result = (await response.json()) as { error?: string; autoNotify?: boolean };
      if (!response.ok) {
        if (response.status === 409) {
          // Alguém reservou antes: atualiza o calendário e os horários do dia.
          setTime("");
          await fetchFreeDays().then((days) => applyDays(days, false)).catch(() => undefined);
          setTimes(await fetchTimes(date).catch(() => []));
        }
        throw new Error(result.error ?? "Não foi possível salvar o pedido.");
      }
      if (result.autoNotify) {
        // A Maysa já foi avisada automaticamente: mostra a confirmação aqui mesmo.
        setDone(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        // Sem aviso automático configurado, a cliente leva o pedido para o WhatsApp.
        window.location.assign(whatsappLink(clientMessage));
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Não foi possível salvar o pedido.");
      setSubmitState("error");
    }
  }

  const summary = (
    <div className="summary-list">
      <div><span>Trança</span><strong>{selectedService.title}</strong></div>
      <div><span>Valor</span><strong>{priceLabel(selectedService)}</strong></div>
      <div><span>Dia</span><strong>{date ? new Date(`${date}T12:00:00`).toLocaleDateString("pt-BR") : "Escolha um dia"}</strong></div>
      <div><span>Horário</span><strong>{time || "Escolha um horário"}</strong></div>
    </div>
  );

  if (done) {
    return (
      <div className="booking-done" role="status">
        <span className="done-icon" aria-hidden="true">✓</span>
        <p className="summary-kicker">PEDIDO ENVIADO</p>
        <h3>Tudo certo, <em>{firstName}!</em></h3>
        <p>Seu horário ficou reservado e a Maysa já recebeu o seu pedido no WhatsApp. Ela vai te chamar no <strong>{phoneDigits ? formatBrPhone(phoneDigits) : phone}</strong> para confirmar.</p>
        {summary}
        <div className="done-actions">
          <a className="whatsapp-button" href={whatsappLink(clientMessage)} target="_blank" rel="noreferrer"><span aria-hidden="true">↗</span> Falar com a Maysa no WhatsApp</a>
          <Link className="done-back" href="/">Voltar ao site</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-shell">
      <div className="booking-form">
        <div className="booking-step">
          <div className="step-heading"><span>01</span><div><small>TRANÇA</small><h3>Qual trança vamos fazer?</h3></div></div>
          <div className="service-picker" role="radiogroup" aria-label="Escolha a trança">
            {services.map((service) => {
              const jumbo = jumboLabel(service);
              return (
                <button
                  className={service.id === serviceId ? "service-option selected" : "service-option"}
                  type="button"
                  role="radio"
                  aria-checked={service.id === serviceId}
                  key={service.id}
                  onClick={() => setServiceId(service.id)}
                >
                  <Image className="service-thumb" src={braidPhotos[service.id].main} alt="" width={52} height={65} />
                  <span>
                    <strong>{service.title}</strong>
                    <em>{priceLabel(service)}</em>
                    {jumbo && <small>{jumbo}</small>}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="service-hint">Quer um modelo diferente? <a href={whatsappLink("Olá, Maysa! Quero fazer uma trança diferente. Segue a foto de referência:")} target="_blank" rel="noreferrer">Mande uma foto no WhatsApp</a> que a Maysa te passa o valor.</p>
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
          <div className="step-heading"><span>03</span><div><small>SEUS DADOS</small><h3>Como a Maysa fala com você?</h3></div></div>
          <label className="text-field"><span>Seu nome</span><input type="text" placeholder="Digite seu nome" value={name} onChange={(event) => setName(event.target.value)} maxLength={80} autoComplete="name" /></label>
          <label className="text-field">
            <span>Seu WhatsApp</span>
            <input
              type="tel"
              inputMode="numeric"
              placeholder="(31) 99999-9999"
              value={phone}
              onChange={(event) => setPhone(maskBrPhone(event.target.value))}
              onBlur={() => setPhoneTouched(true)}
              autoComplete="tel-national"
              aria-invalid={phoneTouched && phone !== "" && !phoneDigits}
            />
            {phoneTouched && phone !== "" && !phoneDigits && <em className="field-hint">Confira o número com DDD, ex.: (31) 99999-9999.</em>}
          </label>
          <label className="text-field"><span>Alguma observação? <i>opcional</i></span><textarea placeholder="Ex.: tamanho, cor do jumbo, referência de foto..." rows={3} value={note} onChange={(event) => setNote(event.target.value)} maxLength={500} /></label>
        </div>
      </div>

      <aside className="booking-summary" aria-label="Resumo do agendamento">
        <p className="summary-kicker">SEU AGENDAMENTO</p>
        <h3>Quase tudo pronto,<br /><em>{firstName}.</em></h3>
        {summary}
        <button className="whatsapp-button" type="button" disabled={!ready || submitState === "sending"} onClick={sendRequest}>
          <span aria-hidden="true">{autoNotify ? "✓" : "↗"}</span>{" "}
          {submitState === "sending" ? "Reservando seu horário..." : autoNotify ? "Reservar meu horário" : "Reservar e continuar no WhatsApp"}
        </button>
        {submitError && <p className="booking-error" role="alert">{submitError}</p>}
        <p className="confirmation-note">
          <span aria-hidden="true">✓</span>{" "}
          {autoNotify ? "A Maysa recebe seu pedido na hora pelo WhatsApp e te chama para confirmar." : "Seu horário fica reservado e a Maysa confirma tudo pelo WhatsApp."}
        </p>
        <p className="privacy-note">Seus dados são usados somente para organizar este atendimento.</p>
      </aside>
    </div>
  );
}
