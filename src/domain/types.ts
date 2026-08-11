import type { z } from 'zod';
import type {
  AmbienteSchema,
  ArtigoSchema,
  CategoriaSchema,
  DataStateSchema,
  EstadoSchema,
  GrupoSchema,
  LinhaOrcamentoSchema,
  MarcacaoSchema,
  NumericSchema,
  OrcamentoSchema,
  ParceiroSchema,
  SubGrupoSchema,
  TipoParceiroSchema,
  UnidadeSchema,
} from './schemas';

import type { CollectionKey as CollectionKeyType } from './schemas';

export { COLLECTION_KEYS, ESTADOS, TIPOS_PARCEIRO, UNIDADES, isCollectionKey } from './schemas';
export type { CollectionKey } from './schemas';

/** Every entity is keyed by an opaque string id. */
export type Id = string;

/**
 * Quantities and prices may be partial strings while being typed.
 * Always read them through `toNum` from `lib/format`.
 */
export type Numeric = z.infer<typeof NumericSchema>;

export type SubGrupo = z.infer<typeof SubGrupoSchema>;
export type Grupo = z.infer<typeof GrupoSchema>;
export type Categoria = z.infer<typeof CategoriaSchema>;

export type TipoParceiro = z.infer<typeof TipoParceiroSchema>;
export type Parceiro = z.infer<typeof ParceiroSchema>;

export type Unidade = z.infer<typeof UnidadeSchema>;
export type Artigo = z.infer<typeof ArtigoSchema>;

export type Estado = z.infer<typeof EstadoSchema>;
export type Marcacao = z.infer<typeof MarcacaoSchema>;

export type LinhaOrcamento = z.infer<typeof LinhaOrcamentoSchema>;
export type Ambiente = z.infer<typeof AmbienteSchema>;
export type Orcamento = z.infer<typeof OrcamentoSchema>;

/** The seven collections that make up the application data. */
export type DataState = z.infer<typeof DataStateSchema>;

/** The record type stored in a given collection. */
export type RecordOf<K extends CollectionKeyType> = DataState[K][number];

/** Entity kinds that share the simple name + associations modal. */
export type EntityKind = 'categorias' | 'grupos' | 'subgrupos';

export type Route =
  | 'agenda'
  | 'categorias'
  | 'grupos'
  | 'subgrupos'
  | 'catalogo'
  | 'parceiros'
  | 'orcamentos'
  | 'orcamento-edit';

export type Screen = 'login' | 'recover' | 'app';

export type CalendarMode = 'Dia' | 'Semana' | 'Mês' | 'Ano';

export const CALENDAR_MODES: CalendarMode[] = ['Dia', 'Semana', 'Mês', 'Ano'];

/** IVA rate applied to every quote total. */
export const IVA = 0.23;
