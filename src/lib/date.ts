export const MONTHS = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
] as const;

/** Week starts on Monday, as it does in Portugal. */
export const DOWS = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom'] as const;

export const pad = (n: number): string => String(n).padStart(2, '0');

/** Local-time ISO date, `YYYY-MM-DD`. Avoids the UTC shift of `toISOString`. */
export const iso = (d: Date): string =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** Parse a `YYYY-MM-DD` string as local midnight. */
export const fromIso = (s: string): Date => new Date(`${s}T00:00:00`);

export const addDays = (d: Date, n: number): Date => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

/** Monday of the week containing `d`, at local midnight. */
export const startOfWeek = (d: Date): Date => {
  const x = new Date(d);
  const w = (x.getDay() + 6) % 7;
  x.setDate(x.getDate() - w);
  x.setHours(0, 0, 0, 0);
  return x;
};

export const startOfToday = (): Date => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

/** Monday-first day-of-week index, 0–6. */
export const dowIndex = (d: Date): number => (d.getDay() + 6) % 7;

/** `2026-03-14` → `14/03/2026`. */
export const ptDate = (isoDate: string): string =>
  isoDate ? isoDate.split('-').reverse().join('/') : '—';

export const capitalise = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);
