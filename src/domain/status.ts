import { ESTADOS } from './schemas';
import type { Estado, TipoParceiro } from './types';

export { ESTADOS };

export interface Tone {
  bg: string;
  fg: string;
  border: string;
}

/** Status palette shared by agenda events, quote badges and the status chips. */
export const STATUS: Record<Estado, Tone> = {
  'Em espera': { bg: 'rgba(148,163,184,0.20)', fg: '#475569', border: '#CBD5E1' },
  Adiado: { bg: 'rgba(245,158,11,0.14)', fg: '#B45309', border: '#FBBF24' },
  'Em revisão': { bg: 'rgba(37,99,235,0.12)', fg: '#1D4ED8', border: '#60A5FA' },
  'Em curso': { bg: 'rgba(44,74,110,0.14)', fg: '#2C4A6E', border: '#2C4A6E' },
  Concluído: { bg: 'rgba(62,201,142,0.14)', fg: '#2BAA74', border: '#5DDBA2' },
  Cancelado: { bg: 'rgba(220,38,38,0.12)', fg: '#B91C1C', border: '#F87171' },
};

export const toneOf = (estado: Estado): Tone => STATUS[estado] ?? STATUS['Em espera'];

export const PARTNER_TONE: Record<TipoParceiro, Tone> = {
  Cliente: { bg: 'rgba(37,99,235,0.12)', fg: '#1D4ED8', border: '#60A5FA' },
  Fornecedor: { bg: 'rgba(62,201,142,0.14)', fg: '#2BAA74', border: '#5DDBA2' },
};

export const NEUTRAL_TONE: Tone = { bg: '#F0F4F8', fg: '#475569', border: '#E2E8F0' };
