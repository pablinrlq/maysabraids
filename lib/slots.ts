export const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
export const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

/** Valida e normaliza uma data AAAA-MM-DD (rejeita datas inexistentes como 2026-02-31). */
export function isValidDate(value: unknown): value is string {
  if (typeof value !== "string" || !DATE_RE.test(value)) return false;
  const parsed = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().startsWith(value);
}

export function isValidTime(value: unknown): value is string {
  return typeof value === "string" && TIME_RE.test(value);
}

/** Dia da semana (0 = domingo) de uma data AAAA-MM-DD, sem depender do fuso do servidor. */
export function weekdayOf(date: string) {
  return new Date(`${date}T12:00:00Z`).getUTCDay();
}

export function addDays(date: string, days: number) {
  const next = new Date(`${date}T12:00:00Z`);
  next.setUTCDate(next.getUTCDate() + days);
  return next.toISOString().slice(0, 10);
}

export function daysBetween(from: string, to: string) {
  return Math.round((new Date(`${to}T12:00:00Z`).valueOf() - new Date(`${from}T12:00:00Z`).valueOf()) / 86_400_000);
}

export function sortTimes(times: string[]) {
  return [...new Set(times)].sort();
}
