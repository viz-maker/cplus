import { ESTADOS } from './schemas';
import type { TagStatus } from '@constructpluseu/react';
import type { Estado, TipoParceiro } from './types';

export { ESTADOS };

/**
 * The design system's `Tag` offers five statuses; the domain has six estados.
 * "Em curso" and "Em revisão" would both collapse onto `info`, so "Em curso"
 * carries an extra class that repaints it as a filled brand chip — see
 * `.cp-tone-brand` in global.css.
 *
 * The brand pair is used rather than the accent one because `bg-accent-subtle`
 * is the same value as `status-success-bg`, which would have made "Em curso"
 * indistinguishable from "Concluído". Filled-vs-subtle also separates it from
 * the other five at a glance.
 */
export interface Tone {
  status: TagStatus;
  className?: string;
}

export const STATUS: Record<Estado, Tone> = {
  'Em espera': { status: 'neutral' },
  Adiado: { status: 'warning' },
  'Em revisão': { status: 'info' },
  'Em curso': { status: 'info', className: 'cp-tone-brand' },
  Concluído: { status: 'success' },
  Cancelado: { status: 'danger' },
};

export const toneOf = (estado: Estado): Tone => STATUS[estado] ?? STATUS['Em espera'];

export interface ToneVars {
  bg: string;
  fg: string;
  border: string;
}

const vars = (name: string): ToneVars => ({
  bg: `var(--cp-color-semantic-status-${name}-bg)`,
  fg: `var(--cp-color-semantic-status-${name}-text)`,
  border: `var(--cp-color-semantic-status-${name}-border)`,
});

/**
 * Same palette expressed as CSS custom properties, for the surfaces that are
 * still hand-built (the agenda grids) and cannot use `Tag`.
 */
export const STATUS_VARS: Record<Estado, ToneVars> = {
  'Em espera': vars('neutral'),
  Adiado: vars('warning'),
  'Em revisão': vars('info'),
  'Em curso': {
    bg: 'var(--cp-color-semantic-bg-brand)',
    fg: 'var(--cp-color-semantic-text-on-brand)',
    border: 'var(--cp-color-semantic-bg-brand)',
  },
  Concluído: vars('success'),
  Cancelado: vars('danger'),
};

export const varsOf = (estado: Estado): ToneVars => STATUS_VARS[estado] ?? STATUS_VARS['Em espera'];

export const PARTNER_TAG: Record<TipoParceiro, TagStatus> = {
  Cliente: 'info',
  Fornecedor: 'success',
};
