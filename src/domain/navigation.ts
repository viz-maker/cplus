import type { Route } from './types';

export interface NavItem {
  id: Exclude<Route, 'orcamento-edit'>;
  label: string;
  abbr: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAV: NavGroup[] = [
  { label: '', items: [{ id: 'agenda', label: 'Agenda', abbr: 'AG' }] },
  {
    label: 'Operacional',
    items: [
      { id: 'categorias', label: 'Categorias', abbr: 'CT' },
      { id: 'grupos', label: 'Grupos', abbr: 'GR' },
      { id: 'subgrupos', label: 'SubGrupos', abbr: 'SG' },
      { id: 'catalogo', label: 'Catálogo', abbr: 'CA' },
    ],
  },
  {
    label: 'Comercial',
    items: [
      { id: 'parceiros', label: 'Parceiros', abbr: 'PA' },
      { id: 'orcamentos', label: 'Orçamentos', abbr: 'OR' },
    ],
  },
];

export interface PageMeta {
  crumb: string;
  title: string;
  sub: string;
  action: string;
  /** Present only on routes rendered as a searchable table. */
  search?: string;
}

export const PAGES: Record<Exclude<Route, 'orcamento-edit'>, PageMeta> = {
  agenda: {
    crumb: 'Operacional',
    title: 'Agenda',
    sub: 'Marcações de obra, vistorias e reuniões da equipa.',
    action: '+ Nova agenda',
  },
  categorias: {
    crumb: 'Operacional · Aprovisionamento',
    title: 'Categorias',
    sub: 'Primeiro nível da árvore de aprovisionamento. Cada categoria agrega um ou mais grupos.',
    action: '+ Adicionar categoria',
    search: 'Procurar por nome…',
  },
  grupos: {
    crumb: 'Operacional · Aprovisionamento',
    title: 'Grupos',
    sub: 'Segundo nível. Cada grupo agrega os subgrupos que descrevem o material.',
    action: '+ Adicionar grupo',
    search: 'Procurar por nome…',
  },
  subgrupos: {
    crumb: 'Operacional · Aprovisionamento',
    title: 'SubGrupos',
    sub: 'Terceiro nível da árvore, usado para classificar artigos do catálogo.',
    action: '+ Adicionar subgrupo',
    search: 'Procurar por nome…',
  },
  catalogo: {
    crumb: 'Operacional · Aprovisionamento',
    title: 'Catálogo',
    sub: 'Artigos disponíveis para orçamentação, com stock, preços e fornecedor preferencial.',
    action: '+ Adicionar artigo',
    search: 'Procurar artigo por nome…',
  },
  parceiros: {
    crumb: 'Comercial',
    title: 'Parceiros',
    sub: 'Clientes e fornecedores num único registo. Um parceiro pode ter ambos os papéis.',
    action: '+ Adicionar parceiro',
    search: 'Procurar por nome…',
  },
  orcamentos: {
    crumb: 'Comercial',
    title: 'Orçamentos',
    sub: 'Propostas por ambiente, com cálculo automático a partir do catálogo.',
    action: '+ Novo orçamento',
    search: 'Procurar por referência ou cliente…',
  },
};
