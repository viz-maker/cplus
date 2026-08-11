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
import { PARTNER_TAG, toneOf } from '../../domain/status';
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
import type { Cell, CellBadge, ListModel } from './types';

/** Everything the rows need to be able to open. */
export interface ListHandlers {
  openEntity: (kind: EntityKind, record: Categoria | Grupo | SubGrupo) => void;
  openItem: (record: Artigo) => void;
  openPartner: (record: Parceiro) => void;
  openQuote: (record: Orcamento) => void;
  showDetail: (view: DetailView) => void;
}

const cell = (text: string, extra: Partial<Cell> = {}): Cell => ({ text, ...extra });

const neutral = (text: string): CellBadge => ({ text, status: 'neutral' });

const dash = (v: string | undefined | null) => (v && v.trim() ? v : '—');

/**
 * Build the `DataTable` model for a searchable route. `query` is matched
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
      { key: 'nome', header: 'Nome', sortable: true },
      { key: 'grupos', header: 'Grupos associados' },
      { key: 'artigos', header: 'Artigos', align: 'end', sortable: true },
    ],
    rows: data.categorias
      .filter((c) => c.nome.toLowerCase().includes(q))
      .map((c) => {
        const artigos = data.catalogo.filter((i) => i.categoriaId === c.id).length;
        const grupos = c.grupoIds.map((id) => byId(data.grupos, id)?.nome ?? '—');
        return {
          id: c.id,
          cells: {
            nome: cell(c.nome, { strong: true }),
            grupos: { badges: grupos.map(neutral) },
            artigos: cell(String(artigos)),
          },
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
      { key: 'nome', header: 'Nome', sortable: true },
      { key: 'subgrupos', header: 'SubGrupos associados' },
      { key: 'categoria', header: 'Categoria', sortable: true },
    ],
    rows: data.grupos
      .filter((g) => g.nome.toLowerCase().includes(q))
      .map((g) => {
        const categoria = categoriaOfGrupo(data, g.id);
        const subgrupos = g.subgrupoIds.map((id) => byId(data.subgrupos, id)?.nome ?? '—');
        return {
          id: g.id,
          cells: {
            nome: cell(g.nome, { strong: true }),
            subgrupos: { badges: subgrupos.map(neutral) },
            categoria: cell(categoria?.nome ?? '—', { muted: true }),
          },
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
      { key: 'nome', header: 'Nome', sortable: true },
      { key: 'grupo', header: 'Grupo', sortable: true },
    ],
    rows: data.subgrupos
      .filter((s) => s.nome.toLowerCase().includes(q))
      .map((s) => {
        const grupo = grupoOfSubgrupo(data, s.id);
        return {
          id: s.id,
          cells: {
            nome: cell(s.nome, { strong: true }),
            grupo: cell(grupo?.nome ?? '—', { muted: true }),
          },
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
      { key: 'artigo', header: 'Artigo', sortable: true },
      { key: 'categoria', header: 'Categoria', sortable: true },
      { key: 'stock', header: 'Stock', align: 'end', sortable: true },
      { key: 'preco', header: 'Preço unit.', align: 'end', sortable: true },
      { key: 'estado', header: 'Estado', align: 'end' },
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
          cells: {
            artigo: cell(i.nome, { strong: true, sub: `${i.sku} · ${i.unidade}` }),
            categoria: cell(categoria?.nome ?? '—', { muted: true, sub: grupo?.nome ?? '' }),
            stock: cell(num(i.stock), {
              warn: low,
              sub: low ? 'abaixo do mínimo' : `mín. ${num(i.stockMin)}`,
            }),
            preco: cell(eur(i.precoUnit), { strong: true, sub: `markup ${num(i.markup)}%` }),
            estado: {
              badges: [
                i.ativo
                  ? { text: 'Ativo', status: 'success' as const }
                  : { text: 'Inativo', status: 'neutral' as const },
              ],
            },
          },
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
      { key: 'nome', header: 'Nome', sortable: true },
      { key: 'tipo', header: 'Tipo' },
      { key: 'contacto', header: 'Contacto', sortable: true },
      { key: 'nif', header: 'NIF', align: 'end' },
    ],
    rows: data.parceiros
      .filter((p) => p.nome.toLowerCase().includes(q))
      .map((p) => ({
        id: p.id,
        cells: {
          nome: cell(p.nome, { strong: true, sub: p.localidade }),
          tipo: { badges: p.tipos.map((t) => ({ text: t, status: PARTNER_TAG[t] })) },
          contacto: cell(p.email, { muted: true, sub: p.telefone }),
          nif: cell(p.nif, { muted: true }),
        },
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
      { key: 'ref', header: 'Referência', sortable: true },
      { key: 'cliente', header: 'Cliente', sortable: true },
      { key: 'validade', header: 'Validade', sortable: true },
      { key: 'estado', header: 'Estado' },
      { key: 'total', header: 'Total c/ IVA', align: 'end', sortable: true },
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
          cells: {
            ref: cell(o.ref, { strong: true, sub: o.obra }),
            cliente: cell(cliente?.nome ?? '—', { muted: true }),
            validade: cell(ptDate(o.dataValidade), {
              muted: true,
              sub: `emitido ${ptDate(o.dataEmissao)}`,
            }),
            estado: {
              badges: [{ text: o.estado, status: tone.status, className: tone.className }],
            },
            total: cell(eur(quoteGross(o)), {
              strong: true,
              sub: `${eur(quoteNet(o))} s/ IVA`,
            }),
          },
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
