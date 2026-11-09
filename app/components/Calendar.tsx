"use client";

import type { ReactNode } from "react";

export type DayState = {
  disabled?: boolean;
  selected?: boolean;
  /** Texto curto abaixo do número (ex.: "3 livres"). */
  marker?: ReactNode;
  /** Classe extra para estilizar estados (ex.: dia aberto/fechado). */
  className?: string;
};

type CalendarProps = {
  year: number;
  /** 0 = janeiro */
  month: number;
  today: string;
  canPrev: boolean;
  canNext: boolean;
  onMonthChange: (delta: -1 | 1) => void;
  getDay: (date: string) => DayState;
  onSelect: (date: string) => void;
};

const weekdays = ["D", "S", "T", "Q", "Q", "S", "S"];
const pad = (value: number) => String(value).padStart(2, "0");

export const toDateString = (year: number, month: number, day: number) => `${year}-${pad(month + 1)}-${pad(day)}`;

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

const monthTitle = (year: number, month: number) =>
  capitalize(new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(year, month, 1))));

const longDate = (date: string) =>
  new Intl.DateTimeFormat("pt-BR", { dateStyle: "full", timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`));

export default function Calendar({ year, month, today, canPrev, canNext, onMonthChange, getDay, onSelect }: CalendarProps) {
  const firstWeekday = new Date(Date.UTC(year, month, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const cells = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];

  return (
    <div className="calendar">
      <div className="calendar-head">
        <button type="button" onClick={() => onMonthChange(-1)} disabled={!canPrev} aria-label="Mês anterior">‹</button>
        <strong aria-live="polite">{monthTitle(year, month)}</strong>
        <button type="button" onClick={() => onMonthChange(1)} disabled={!canNext} aria-label="Próximo mês">›</button>
      </div>
      <div className="calendar-grid" role="grid">
        {weekdays.map((weekday, index) => <span className="calendar-weekday" key={`w${index}`} aria-hidden="true">{weekday}</span>)}
        {cells.map((day, index) => {
          if (day === null) return <span key={`b${index}`} />;
          const date = toDateString(year, month, day);
          const state = getDay(date);
          const classes = ["calendar-day", state.className, state.selected ? "selected" : "", date === today ? "today" : ""].filter(Boolean).join(" ");
          return (
            <button
              type="button"
              className={classes}
              disabled={state.disabled}
              aria-pressed={state.selected}
              aria-label={longDate(date)}
              onClick={() => onSelect(date)}
              key={date}
            >
              <b>{day}</b>
              {state.marker && <small>{state.marker}</small>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
