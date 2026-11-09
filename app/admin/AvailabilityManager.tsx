"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Calendar, { toDateString } from "../components/Calendar";
import { addDays, sortTimes } from "../../lib/slots";
import { UnauthorizedError, adminFetch } from "./api";

type Slot = {
  date: string;
  time: string;
  bookingId: number | null;
  clientName: string | null;
  serviceTitle: string | null;
  status: string | null;
};

const presetTimes = ["07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];
const weekdayLabels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const longDate = (date: string) => {
  const text = new Intl.DateTimeFormat("pt-BR", { dateStyle: "full", timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`));
  return text.charAt(0).toUpperCase() + text.slice(1);
};

function monthRange(year: number, month: number) {
  return {
    from: toDateString(year, month, 1),
    to: toDateString(year, month, new Date(Date.UTC(year, month + 1, 0)).getUTCDate()),
  };
}

async function fetchSlots(year: number, month: number) {
  const { from, to } = monthRange(year, month);
  return adminFetch<{ slots: Slot[]; today: string }>(`/api/admin/availability?from=${from}&to=${to}`);
}

export default function AvailabilityManager({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [today, setToday] = useState("");
  // Este componente só monta no navegador (depois do login), então ler a data aqui é seguro.
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [customTime, setCustomTime] = useState("");

  // Abrir vários dias
  const [bulkFrom, setBulkFrom] = useState("");
  const [bulkTo, setBulkTo] = useState("");
  const [bulkWeekdays, setBulkWeekdays] = useState<number[]>([1, 2, 3, 4, 5, 6]);
  const [bulkTimes, setBulkTimes] = useState<string[]>(["09:00", "13:00"]);
  const [bulkCustom, setBulkCustom] = useState("");

  const handleError = useCallback((cause: unknown) => {
    if (cause instanceof UnauthorizedError) {
      onUnauthorized();
      return;
    }
    setError(cause instanceof Error ? cause.message : "Algo deu errado. Tente novamente.");
  }, [onUnauthorized]);

  const load = useCallback(async (year: number, month: number) => {
    try {
      const data = await fetchSlots(year, month);
      setSlots(data.slots);
      setToday(data.today);
    } catch (cause) {
      handleError(cause);
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // Primeira carga: descobre "hoje" (fuso de Brasília), seleciona o dia e preenche o período padrão.
  useEffect(() => {
    let active = true;
    const now = new Date();
    fetchSlots(now.getFullYear(), now.getMonth())
      .then((data) => {
        if (!active) return;
        setSlots(data.slots);
        setToday(data.today);
        setSelected(data.today);
        setBulkFrom(data.today);
        setBulkTo(addDays(data.today, 28));
      })
      .catch((cause) => { if (active) handleError(cause); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [handleError]);

  const slotsByDate = useMemo(() => {
    const map = new Map<string, Slot[]>();
    for (const slot of slots) map.set(slot.date, [...(map.get(slot.date) ?? []), slot]);
    return map;
  }, [slots]);

  const daySlots = slotsByDate.get(selected) ?? [];
  const isPast = Boolean(today && selected && selected < today);
  const freeCount = daySlots.filter((slot) => !slot.bookingId).length;
  const taken = new Set(daySlots.map((slot) => slot.time));

  function changeMonth(delta: -1 | 1) {
    const next = cursor.year * 12 + cursor.month + delta;
    const target = { year: Math.floor(next / 12), month: next % 12 };
    setCursor(target);
    setError("");
    setNotice("");
    setLoading(true);
    void load(target.year, target.month);
  }

  async function run(action: () => Promise<string | void>) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const message = await action();
      if (message) setNotice(message);
      setLoading(true);
      await load(cursor.year, cursor.month);
    } catch (cause) {
      handleError(cause);
    } finally {
      setBusy(false);
    }
  }

  const addTimes = (times: string[]) => run(async () => {
    const result = await adminFetch<{ added: number }>("/api/admin/availability", {
      method: "POST",
      body: JSON.stringify({ action: "add", date: selected, times }),
    });
    return result.added === 0 ? "Esses horários já estavam abertos." : `${result.added} ${result.added === 1 ? "horário aberto" : "horários abertos"} para ${longDate(selected)}.`;
  });

  const removeTime = (time: string) => run(async () => {
    await adminFetch("/api/admin/availability", { method: "DELETE", body: JSON.stringify({ date: selected, time }) });
    return `Horário das ${time} removido.`;
  });

  const closeDay = () => {
    if (freeCount === 0) return;
    if (!window.confirm(`Fechar ${longDate(selected)}? Os ${freeCount} horários livres deste dia serão removidos (horários já reservados continuam).`)) return;
    void run(async () => {
      await adminFetch("/api/admin/availability", { method: "DELETE", body: JSON.stringify({ date: selected }) });
      return "Dia fechado: os horários livres foram removidos.";
    });
  };

  function submitCustom(event: React.FormEvent) {
    event.preventDefault();
    if (!customTime) return;
    if (taken.has(customTime)) {
      setNotice("");
      setError("Esse horário já está na lista deste dia.");
      return;
    }
    void addTimes([customTime]).then(() => setCustomTime(""));
  }

  function toggleBulkTime(time: string) {
    setBulkTimes((current) => (current.includes(time) ? current.filter((item) => item !== time) : sortTimes([...current, time])));
  }

  function addBulkCustom() {
    if (!bulkCustom) return;
    setBulkTimes((current) => sortTimes([...current, bulkCustom]));
    setBulkCustom("");
  }

  function submitBulk(event: React.FormEvent) {
    event.preventDefault();
    void run(async () => {
      const result = await adminFetch<{ added: number; days: number }>("/api/admin/availability", {
        method: "POST",
        body: JSON.stringify({ action: "bulk", from: bulkFrom, to: bulkTo, weekdays: bulkWeekdays, times: bulkTimes }),
      });
      return `${result.added} ${result.added === 1 ? "horário novo aberto" : "horários novos abertos"} em ${result.days} ${result.days === 1 ? "dia" : "dias"}.`;
    });
  }

  const todayMonth = today ? Number(today.slice(0, 4)) * 12 + Number(today.slice(5, 7)) - 1 : 0;
  const cursorMonth = cursor.year * 12 + cursor.month;

  return (
    <div className="availability">
      <div className="availability-layout">
        <section className="panel" aria-labelledby="agenda-title">
          <div className="panel-head"><div><p className="panel-kicker">CALENDÁRIO</p><h2 id="agenda-title">Dias e horários livres</h2></div></div>
          {today && (
            <Calendar
              year={cursor.year}
              month={cursor.month}
              today={today}
              canPrev={cursorMonth > todayMonth - 1}
              canNext={cursorMonth < todayMonth + 12}
              onMonthChange={changeMonth}
              getDay={(date) => {
                const list = slotsByDate.get(date) ?? [];
                const free = list.filter((slot) => !slot.bookingId).length;
                const booked = list.length - free;
                return {
                  selected: date === selected,
                  className: [list.length === 0 ? "closed" : free > 0 ? "has-slots" : "full", date < today ? "past" : ""].filter(Boolean).join(" "),
                  marker: list.length === 0 ? undefined : free > 0 ? `${free} ${free === 1 ? "livre" : "livres"}` : `${booked} res.`,
                };
              }}
              onSelect={(date) => { setSelected(date); setError(""); setNotice(""); }}
            />
          )}
          <p className="calendar-legend"><i aria-hidden="true" /> Dias em destaque têm horários livres. “res.” = todos os horários do dia já foram reservados. Dias sem marca estão fechados para as clientes.</p>
          {loading && <p className="admin-hint">Atualizando agenda...</p>}
        </section>

        <section className="panel day-panel" aria-labelledby="day-title" aria-live="polite">
          {selected ? (
            <>
              <div className="panel-head">
                <div><p className="panel-kicker">DIA SELECIONADO</p><h2 id="day-title" className="day-title">{longDate(selected)}</h2></div>
                {!isPast && freeCount > 0 && <button type="button" className="ghost-button danger" onClick={closeDay} disabled={busy}>Fechar dia</button>}
              </div>

              {isPast && <p className="admin-hint">Este dia já passou. Você só pode consultar os horários.</p>}

              {daySlots.length === 0 ? (
                <p className="day-empty">{isPast ? "Nenhum horário foi aberto neste dia." : "Dia fechado. As clientes não conseguem agendar neste dia. Adicione horários abaixo para abri-lo."}</p>
              ) : (
                <ul className="slot-list">
                  {daySlots.map((slot) => (
                    <li className={slot.bookingId ? "slot booked" : "slot free"} key={slot.time}>
                      <strong>{slot.time}</strong>
                      {slot.bookingId ? (
                        <span>Reservado · {slot.clientName}<small>{slot.serviceTitle}</small></span>
                      ) : (
                        <span>Livre</span>
                      )}
                      {!slot.bookingId && !isPast && (
                        <button type="button" onClick={() => removeTime(slot.time)} disabled={busy} aria-label={`Remover horário das ${slot.time}`}>×</button>
                      )}
                    </li>
                  ))}
                </ul>
              )}

              {!isPast && (
                <div className="add-times">
                  <p className="panel-kicker">ADICIONAR HORÁRIOS</p>
                  <div className="preset-times">
                    {presetTimes.map((time) => (
                      <button type="button" key={time} disabled={busy || taken.has(time)} onClick={() => addTimes([time])}>{time}</button>
                    ))}
                  </div>
                  <form className="custom-time" onSubmit={submitCustom}>
                    <label><span>Outro horário</span><input type="time" value={customTime} onChange={(event) => setCustomTime(event.target.value)} required /></label>
                    <button type="submit" className="ghost-button" disabled={busy || !customTime}>Adicionar</button>
                  </form>
                </div>
              )}
            </>
          ) : (
            <p className="day-empty">Escolha um dia no calendário.</p>
          )}
          {error && <div className="admin-error" role="alert">{error}</div>}
          {notice && <div className="admin-success" role="status">{notice}</div>}
        </section>
      </div>

      <details className="panel bulk-panel">
        <summary><span><b>Abrir vários dias de uma vez</b><small>Defina um período, os dias da semana e os horários.</small></span><i aria-hidden="true">+</i></summary>
        <form onSubmit={submitBulk}>
          <div className="bulk-dates">
            <label><span>De</span><input type="date" value={bulkFrom} min={today} onChange={(event) => setBulkFrom(event.target.value)} required /></label>
            <label><span>Até</span><input type="date" value={bulkTo} min={bulkFrom || today} onChange={(event) => setBulkTo(event.target.value)} required /></label>
          </div>
          <fieldset className="bulk-weekdays">
            <legend>Dias da semana</legend>
            {weekdayLabels.map((label, index) => (
              <button
                type="button"
                key={label}
                className={bulkWeekdays.includes(index) ? "active" : ""}
                aria-pressed={bulkWeekdays.includes(index)}
                onClick={() => setBulkWeekdays((current) => (current.includes(index) ? current.filter((day) => day !== index) : [...current, index].sort()))}
              >{label}</button>
            ))}
          </fieldset>
          <fieldset className="bulk-times">
            <legend>Horários</legend>
            <div className="preset-times">
              {sortTimes([...presetTimes, ...bulkTimes]).map((time) => (
                <button type="button" key={time} className={bulkTimes.includes(time) ? "active" : ""} aria-pressed={bulkTimes.includes(time)} onClick={() => toggleBulkTime(time)}>{time}</button>
              ))}
            </div>
            <div className="custom-time">
              <label><span>Outro horário</span><input type="time" value={bulkCustom} onChange={(event) => setBulkCustom(event.target.value)} /></label>
              <button type="button" className="ghost-button" onClick={addBulkCustom} disabled={!bulkCustom}>Incluir</button>
            </div>
          </fieldset>
          <button type="submit" className="solid-button" disabled={busy || bulkTimes.length === 0 || bulkWeekdays.length === 0}>Abrir horários neste período</button>
          <p className="admin-hint">Horários que já existem são mantidos e nenhum horário reservado é alterado. Dias passados são ignorados.</p>
        </form>
      </details>
    </div>
  );
}
