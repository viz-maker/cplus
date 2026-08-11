import { MONTHS, addDays, capitalise, startOfWeek } from '../../lib/date';
import type { CalendarMode } from '../../domain/types';

/** The day and week grids show a working day of 07:00–19:00. */
export const HOURS: number[] = Array.from({ length: 13 }, (_, i) => 7 + i);

/** Columns shown by the time grid: one day, or Monday–Sunday. */
export function daysForMode(cursor: Date, mode: CalendarMode): Date[] {
  if (mode === 'Dia') return [cursor];
  const start = startOfWeek(cursor);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

/** Six Monday-first weeks covering the cursor's month, including spill-over days. */
export function monthWeeks(cursor: Date): Date[][] {
  const start = startOfWeek(new Date(cursor.getFullYear(), cursor.getMonth(), 1));
  return Array.from({ length: 6 }, (_, w) =>
    Array.from({ length: 7 }, (_, i) => addDays(start, w * 7 + i)),
  );
}

export interface MiniMonth {
  month: number;
  name: string;
  /** 42 slots; `null` where the week spills outside the month. */
  cells: (Date | null)[];
}

export function yearGrid(year: number): MiniMonth[] {
  return MONTHS.map((name, month) => {
    const start = startOfWeek(new Date(year, month, 1));
    const cells = Array.from({ length: 42 }, (_, i) => {
      const d = addDays(start, i);
      return d.getMonth() === month ? d : null;
    });
    return { month, name, cells };
  });
}

export function rangeLabel(cursor: Date, mode: CalendarMode): string {
  switch (mode) {
    case 'Dia':
      return capitalise(
        `${cursor.getDate()} de ${MONTHS[cursor.getMonth()]} de ${cursor.getFullYear()}`,
      );
    case 'Semana': {
      const s = startOfWeek(cursor);
      const e = addDays(s, 6);
      return capitalise(
        `${s.getDate()} ${MONTHS[s.getMonth()].slice(0, 3)} – ${e.getDate()} ${MONTHS[
          e.getMonth()
        ].slice(0, 3)} ${e.getFullYear()}`,
      );
    }
    case 'Mês':
      return capitalise(`${MONTHS[cursor.getMonth()]} de ${cursor.getFullYear()}`);
    case 'Ano':
      return String(cursor.getFullYear());
  }
}

/** Step the cursor by one unit of the active mode. */
export function shiftCursor(cursor: Date, mode: CalendarMode, dir: 1 | -1): Date {
  const next = new Date(cursor);
  switch (mode) {
    case 'Dia':
      next.setDate(next.getDate() + dir);
      break;
    case 'Semana':
      next.setDate(next.getDate() + 7 * dir);
      break;
    case 'Mês':
      next.setMonth(next.getMonth() + dir);
      break;
    case 'Ano':
      next.setFullYear(next.getFullYear() + dir);
      break;
  }
  return next;
}
