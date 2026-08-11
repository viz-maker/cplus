import { toNum } from '../lib/format';
import { IVA } from './types';
import type {
  Ambiente,
  Artigo,
  DataState,
  Grupo,
  Id,
  Marcacao,
  Orcamento,
  SubGrupo,
} from './types';

export const byId = <T extends { id: Id }>(list: T[], id: Id | null | undefined): T | null =>
  list.find((x) => x.id === id) ?? null;

/**
 * The catalogue only stores a category; group and subgroup are derived from the
 * first association at each level of the tree, matching how the tree is edited.
 */
export const grupoOfCategoria = (data: DataState, categoriaId: Id): Grupo | null => {
  const c = byId(data.categorias, categoriaId);
  return c?.grupoIds[0] ? byId(data.grupos, c.grupoIds[0]) : null;
};

export const subgrupoOfCategoria = (data: DataState, categoriaId: Id): SubGrupo | null => {
  const g = grupoOfCategoria(data, categoriaId);
  return g?.subgrupoIds[0] ? byId(data.subgrupos, g.subgrupoIds[0]) : null;
};

export const categoriaOfGrupo = (data: DataState, grupoId: Id) =>
  data.categorias.find((c) => c.grupoIds.includes(grupoId)) ?? null;

export const grupoOfSubgrupo = (data: DataState, subgrupoId: Id) =>
  data.grupos.find((g) => g.subgrupoIds.includes(subgrupoId)) ?? null;

export const lineTotal = (qtd: unknown, preco: unknown): number =>
  toNum(qtd as never) * toNum(preco as never);

export const ambienteTotal = (a: Ambiente): number =>
  a.linhas.reduce((t, l) => t + lineTotal(l.qtd, l.preco), 0);

/** Quote total excluding IVA. */
export const quoteNet = (o: Orcamento): number =>
  o.ambientes.reduce((s, a) => s + ambienteTotal(a), 0);

export const quoteVat = (o: Orcamento): number => quoteNet(o) * IVA;

export const quoteGross = (o: Orcamento): number => quoteNet(o) * (1 + IVA);

export const quoteLineCount = (o: Orcamento): number =>
  o.ambientes.reduce((s, a) => s + a.linhas.length, 0);

export const isLowStock = (a: Artigo | null): boolean =>
  !!a && toNum(a.stock) < toNum(a.stockMin);

/** Marcações starting on a given ISO date, ordered by start time. */
export const eventsOn = (agenda: Marcacao[], date: string): Marcacao[] =>
  agenda
    .filter((a) => a.inicioData === date)
    .sort((a, b) => a.inicioHora.localeCompare(b.inicioHora));
