import type { Numeric } from '../domain/types';

/** Coerce a possibly-partial numeric input to a number; anything unparseable is 0. */
export const toNum = (v: Numeric | undefined | null): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

export const eur = (v: Numeric): string =>
  toNum(v).toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' });

export const num = (v: Numeric): string =>
  toNum(v).toLocaleString('pt-PT', { maximumFractionDigits: 2 });

export const plural = (n: number, one: string, many: string): string =>
  `${n} ${n === 1 ? one : many}`;
