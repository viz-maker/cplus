import {
  byId,
  categoriaOfGrupo,
  grupoOfCategoria,
  grupoOfSubgrupo,
  isLowStock,
  quoteGross,
  quoteLineCount,
  quoteNet,
  quoteVat,
  subgrupoOfCategoria,
} from '../../domain/selectors';
import { NEUTRAL_TONE, PARTNER_TONE, toneOf } from '../../domain/status';
import { ptDate } from '../../lib/date';
import { eur, num } from '../../lib/format';
import { EMPTY_LIST } from './types';
import type { DetailView } from '../../components/DetailDrawer';
import type {
  Artigo,
  Categoria,
  DataState,
  EntityKind,
  Grupo,
  Orcamento,
  Parceiro,
  Route,
  SubGrupo,
} from '../../domain/types';
import type { Cell, ListModel } from './types';

/** Everything the rows need to be able to open. */
export interface ListHandlers {
  openEntity: (kind: EntityKind, record: Categoria | Grupo | SubGrupo) => void;
  openItem: (record: Artigo) => void;
  openPartner: (record: Parceiro) => void;
  openQuote: (record: Orcamento) => void;
  showDetail: (view: DetailView) => void;
}

const cell = (text: string, extra: Partial<Cell> = {}): Cell => ({
  text,
  align: 'left',
  weight: 400,
  color: 'var(--cp-navy)',
  ...extra,
});

const dash = (v: string | undefined | null) => (v && v.trim() ? v : '—');

/**
 * Build the table model for a searchable route. `query` is matched
 * case-insensitively against the record's name (plus reference/client/site for
 * quotes).
 */
export function buildList(
  route: Route,
  data: DataState,
  query: string,
  h: ListHandlers,
): ListModel {
  const q = query.trim().toLowerCase();

  switch (route) {
    case 'categorias':
      return buildCategorias(data, q, h);
    case 'grupos':
      return buildGrupos(data, q, h);
    case 'subgrupos':
      return buildSubgrupos(data, q, h);
    case 'catalogo':
      return buildCatalogo(data, q, h);
    case 'parceiros':
      return buildParceiros(data, q, h);
    case 'orcamentos':
      return buildOrcamentos(data, q, h);
    default:
      return EMPTY_LIST;
  }
}

/* ------------------------------------------------------------------ categorias */

function buildCategorias(data: DataState, q: string, h: ListHandlers): ListModel {
  return {
    columns: [
      { label: 'Nome', align: 'left' },
      { label: 'Grupos associados', align: 'left' },
      { label: 'Artigos', align: 'right' },
    ],
    rows: data.categorias
      .filter((c) => c.nome.toLowerCase().includes(q))
      .map((c) => {
        const artigos = data.catalogo.filter((i) => i.categoriaId === c.id).length;
        const grupos = c.grupoIds.map((id) => byId(data.grupos, id)?.nome ?? '—');
        return {
          id: c.id,
          cells: [
            cell(c.nome, { weight: 600 }),
            cell('', {
              badges: grupos.map((nome) => ({
                text: nome,
                bg: NEUTRAL_TONE.bg,
                fg: NEUTRAL_TONE.fg,
              })),
            }),
            cell(String(artigos), { align: 'right' }),
          ],
          onEdit: () => h.openEntity('categorias', c),
          onView: () =>
            h.showDetail({
              kind: 'Categoria',
              title: c.nome,
              onEdit: () => h.openEntity('categorias', c),
              rows: [
                { label: 'Nome', value: c.nome },
                { label: 'Grupos associados', value: dash(grupos.join(', ')) },
                { label: 'Artigos no catálogo', value: String(artigos) },
              ],
            }),
        };
      }),
  };
}

/* ---------------------------------------------------------------------- grupos */

function buildGrupos(data: DataState, q: string, h: ListHandlers): ListModel {
  return {
    columns: [
      { label: 'Nome', align: 'left' },
      { label: 'SubGrupos associados', align: 'left' },
      { label: 'Categoria', align: 'left' },
    ],
    rows: data.grupos
      .filter((g) => g.nome.toLowerCase().includes(q))
      .map((g) => {
        const categoria = categoriaOfGrupo(data, g.id);
        const subgrupos = g.subgrupoIds.map((id) => byId(data.subgrupos, id)?.nome ?? '—');
        return {
          id: g.id,
          cells: [
            cell(g.nome, { weight: 600 }),
            cell('', {
              badges: subgrupos.map((nome) => ({
                text: nome,
                bg: NEUTRAL_TONE.bg,
                fg: NEUTRAL_TONE.fg,
              })),
            }),
            cell(categoria?.nome ?? '—', { color: 'var(--cp-text-muted)' }),
          ],
          onEdit: () => h.openEntity('grupos', g),
          onView: () =>
            h.showDetail({
              kind: 'Grupo',
              title: g.nome,
              onEdit: () => h.openEntity('grupos', g),
              rows: [
                { label: 'Nome', value: g.nome },
                { label: 'Categoria', value: categoria?.nome ?? '—' },
                { label: 'SubGrupos', value: dash(subgrupos.join(', ')) },
              ],
            }),
        };
      }),
  };
}

/* ------------------------------------------------------------------- subgrupos */

function buildSubgrupos(data: DataState, q: string, h: ListHandlers): ListModel {
  return {
    columns: [
      { label: 'Nome', align: 'left' },
      { label: 'Grupo', align: 'left' },
    ],
    rows: data.subgrupos
      .filter((s) => s.nome.toLowerCase().includes(q))
      .map((s) => {
        const grupo = grupoOfSubgrupo(data, s.id);
        return {
          id: s.id,
          cells: [
            cell(s.nome, { weight: 600 }),
            cell(grupo?.nome ?? '—', { color: 'var(--cp-text-muted)' }),
          ],
          onEdit: () => h.openEntity('subgrupos', s),
          onView: () =>
            h.showDetail({
              kind: 'SubGrupo',
              title: s.nome,
              onEdit: () => h.openEntity('subgrupos', s),
              rows: [
                { label: 'Nome', value: s.nome },
                { label: 'Grupo', value: grupo?.nome ?? '—' },
              ],
            }),
        };
      }),
  };
}

/* -------------------------------------------------------------------- catálogo */

function buildCatalogo(data: DataState, q: string, h: ListHandlers): ListModel {
  return {
    columns: [
      { label: 'Artigo', align: 'left' },
      { label: 'Categoria', align: 'left' },
      { label: 'Stock', align: 'right' },
      { label: 'Preço unit.', align: 'right' },
      { label: 'Estado', align: 'right' },
    ],
    rows: data.catalogo
      .filter((i) => i.nome.toLowerCase().includes(q))
      .map((i) => {
        const categoria = byId(data.categorias, i.categoriaId);
        const grupo = grupoOfCategoria(data, i.categoriaId);
        const subgrupo = subgrupoOfCategoria(data, i.categoriaId);
        const low = isLowStock(i);
        const fornecedor = byId(data.parceiros, i.fornecedorId || null);

        return {
          id: i.id,
          cells: [
            cell(i.nome, { weight: 600, sub: `${i.sku} · ${i.unidade}` }),
            cell(categoria?.nome ?? '—', {
              color: 'var(--cp-text-muted)',
              sub: grupo?.nome ?? '',
            }),
            cell(num(i.stock), {
              align: 'right',
              color: low ? 'var(--cp-warning)' : 'var(--cp-navy)',
              sub: low ? 'abaixo do mínimo' : `mín. ${num(i.stockMin)}`,
            }),
            cell(eur(i.precoUnit), {
              align: 'right',
              weight: 600,
              sub: `markup ${num(i.markup)}%`,
            }),
            cell('', {
              align: 'right',
              badges: [
                i.ativo
                  ? { text: 'Ativo', bg: 'rgba(62,201,142,0.14)', fg: 'var(--cp-accent-active)' }
                  : { text: 'Inativo', bg: NEUTRAL_TONE.bg, fg: NEUTRAL_TONE.fg },
              ],
            }),
          ],
          onEdit: () => h.openItem(i),
          onView: () =>
            h.showDetail({
              kind: 'Artigo do catálogo',
              title: i.nome,
              onEdit: () => h.openItem(i),
              rows: [
                { label: 'SKU', value: dash(i.sku) },
                { label: 'Código de barras', value: dash(i.codigoBarras) },
                { label: 'NCM', value: dash(i.ncm) },
                { label: 'Categoria', value: categoria?.nome ?? '—' },
                { label: 'Grupo', value: grupo?.nome ?? '—' },
                { label: 'SubGrupo', value: subgrupo?.nome ?? '—' },
                { label: 'Unidade', value: i.unidade },
                { label: 'Stock atual', value: num(i.stock) },
                { label: 'Stock mínimo', value: num(i.stockMin) },
                { label: 'Preço unitário', value: eur(i.precoUnit) },
                { label: 'Markup', value: `${num(i.markup)}%` },
                { label: 'Custo médio', value: eur(i.custoMedio) },
                { label: 'Fornecedor preferencial', value: fornecedor?.nome ?? '—' },
                { label: 'Estado', value: i.ativo ? 'Ativo' : 'Inativo' },
                { label: 'Descrição', value: dash(i.descricao) },
                { label: 'Notas internas', value: dash(i.notas) },
              ],
            }),
        };
      }),
  };
}

/* ------------------------------------------------------------------- parceiros */

function buildParceiros(data: DataState, q: string, h: ListHandlers): ListModel {
  return {
    columns: [
      { label: 'Nome', align: 'left' },
      { label: 'Tipo', align: 'left' },
      { label: 'Contacto', align: 'left' },
      { label: 'NIF', align: 'right' },
    ],
    rows: data.parceiros
      .filter((p) => p.nome.toLowerCase().includes(q))
      .map((p) => ({
        id: p.id,
        cells: [
          cell(p.nome, { weight: 600, sub: p.localidade }),
          cell('', {
            badges: p.tipos.map((t) => ({
              text: t,
              bg: PARTNER_TONE[t].bg,
              fg: PARTNER_TONE[t].fg,
            })),
          }),
          cell(p.email, { color: 'var(--cp-text-muted)', sub: p.telefone }),
          cell(p.nif, { align: 'right', color: 'var(--cp-text-muted)' }),
        ],
        onEdit: () => h.openPartner(p),
        onView: () =>
          h.showDetail({
            kind: 'Parceiro',
            title: p.nome,
            onEdit: () => h.openPartner(p),
            rows: [
              { label: 'Tipo', value: p.tipos.join(' e ') },
              { label: 'NIF', value: dash(p.nif) },
              { label: 'Email', value: dash(p.email) },
              { label: 'Telefone', value: dash(p.telefone) },
              { label: 'Localidade', value: dash(p.localidade) },
              {
                label: 'Orçamentos',
                value: String(data.orcamentos.filter((o) => o.clienteId === p.id).length),
              },
              {
                label: 'Artigos fornecidos',
                value: String(data.catalogo.filter((i) => i.fornecedorId === p.id).length),
              },
            ],
          }),
      })),
  };
}

/* ------------------------------------------------------------------ orçamentos */

function buildOrcamentos(data: DataState, q: string, h: ListHandlers): ListModel {
  return {
    columns: [
      { label: 'Referência', align: 'left' },
      { label: 'Cliente', align: 'left' },
      { label: 'Validade', align: 'left' },
      { label: 'Estado', align: 'left' },
      { label: 'Total c/ IVA', align: 'right' },
    ],
    rows: data.orcamentos
      .filter((o) => {
        const cliente = byId(data.parceiros, o.clienteId)?.nome ?? '';
        return (
          o.ref.toLowerCase().includes(q) ||
          cliente.toLowerCase().includes(q) ||
          o.obra.toLowerCase().includes(q)
        );
      })
      .map((o) => {
        const cliente = byId(data.parceiros, o.clienteId);
        const tone = toneOf(o.estado);
        return {
          id: o.id,
          cells: [
            cell(o.ref, { weight: 600, sub: o.obra }),
            cell(cliente?.nome ?? '—', { color: 'var(--cp-text-muted)' }),
            cell(ptDate(o.dataValidade), {
              color: 'var(--cp-text-muted)',
              sub: `emitido ${ptDate(o.dataEmissao)}`,
            }),
            cell('', { badges: [{ text: o.estado, bg: tone.bg, fg: tone.fg }] }),
            cell(eur(quoteGross(o)), {
              align: 'right',
              weight: 600,
              sub: `${eur(quoteNet(o))} s/ IVA`,
            }),
          ],
          onEdit: () => h.openQuote(o),
          onView: () =>
            h.showDetail({
              kind: 'Orçamento',
              title: o.ref,
              onEdit: () => h.openQuote(o),
              rows: [
                { label: 'Cliente', value: cliente?.nome ?? '—' },
                { label: 'Obra', value: dash(o.obra) },
                { label: 'Data de emissão', value: ptDate(o.dataEmissao) },
                { label: 'Data de validade', value: ptDate(o.dataValidade) },
                { label: 'Estado', value: o.estado },
                { label: 'Ambientes', value: dash(o.ambientes.map((a) => a.nome).join(', ')) },
                { label: 'Artigos', value: String(quoteLineCount(o)) },
                { label: 'Subtotal', value: eur(quoteNet(o)) },
                { label: 'IVA (23%)', value: eur(quoteVat(o)) },
                { label: 'Total', value: eur(quoteGross(o)) },
              ],
            }),
        };
      }),
  };
}
