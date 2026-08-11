import { z } from 'zod';

/**
 * Runtime shapes for every entity. These are the single source of truth: the
 * TypeScript types in `types.ts` are inferred from them, and the route handlers
 * validate request bodies against them, so the API can never write a record the
 * UI could not have produced.
 */

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const HHMM = /^\d{2}:\d{2}$/;

const isoDate = z.string().regex(ISO_DATE, 'Data deve estar no formato AAAA-MM-DD');
const hhmm = z.string().regex(HHMM, 'Hora deve estar no formato HH:MM');

/**
 * Quantities and prices arrive from free-text numeric inputs, so a partial
 * string ("12.", "") is a legitimate in-flight value. Read them with `toNum`.
 */
export const NumericSchema = z.union([z.number(), z.string()]);

export const UNIDADES = ['un', 'saco', 'balde', 'm', 'm²', 'm³', 'kg', 'L', 'caixa'] as const;
export const UnidadeSchema = z.enum(UNIDADES);

export const ESTADOS = [
  'Em espera',
  'Adiado',
  'Em revisão',
  'Em curso',
  'Concluído',
  'Cancelado',
] as const;
export const EstadoSchema = z.enum(ESTADOS);

export const TIPOS_PARCEIRO = ['Cliente', 'Fornecedor'] as const;
export const TipoParceiroSchema = z.enum(TIPOS_PARCEIRO);

export const SubGrupoSchema = z.object({
  id: z.string(),
  nome: z.string().min(1),
});

export const GrupoSchema = z.object({
  id: z.string(),
  nome: z.string().min(1),
  subgrupoIds: z.array(z.string()),
});

export const CategoriaSchema = z.object({
  id: z.string(),
  nome: z.string().min(1),
  grupoIds: z.array(z.string()),
});

export const ParceiroSchema = z.object({
  id: z.string(),
  nome: z.string().min(1),
  tipos: z.array(TipoParceiroSchema).min(1, 'Selecione pelo menos um tipo de parceiro.'),
  nif: z.string(),
  email: z.string(),
  telefone: z.string(),
  localidade: z.string(),
});

export const ArtigoSchema = z.object({
  id: z.string(),
  nome: z.string().min(1),
  categoriaId: z.string(),
  sku: z.string(),
  codigoBarras: z.string(),
  ncm: z.string(),
  unidade: UnidadeSchema,
  stock: NumericSchema,
  stockMin: NumericSchema,
  precoUnit: NumericSchema,
  markup: NumericSchema,
  custoMedio: NumericSchema,
  /** Empty string when no preferred supplier is set. */
  fornecedorId: z.string(),
  ativo: z.boolean(),
  descricao: z.string(),
  notas: z.string(),
  imagem: z.string(),
});

export const MarcacaoSchema = z.object({
  id: z.string(),
  descricao: z.string().min(1, 'Indique uma descrição para a marcação.'),
  estado: EstadoSchema,
  inicioData: isoDate,
  inicioHora: hhmm,
  fimData: isoDate,
  fimHora: hhmm,
  /** Rich-text HTML produced by the notes editor. */
  detalhes: z.string(),
});

export const LinhaOrcamentoSchema = z.object({
  id: z.string(),
  itemId: z.string(),
  qtd: NumericSchema,
  preco: NumericSchema,
  nota: z.string(),
});

export const AmbienteSchema = z.object({
  id: z.string(),
  nome: z.string(),
  linhas: z.array(LinhaOrcamentoSchema),
});

export const OrcamentoSchema = z.object({
  id: z.string(),
  ref: z.string().min(1),
  clienteId: z.string(),
  obra: z.string(),
  dataEmissao: isoDate,
  dataValidade: isoDate,
  estado: EstadoSchema,
  ambientes: z.array(AmbienteSchema),
});

/**
 * The seven collections, keyed exactly as they appear in the API path
 * (`/api/<collection>`) and in `DataState`.
 */
export const COLLECTION_SCHEMAS = {
  subgrupos: SubGrupoSchema,
  grupos: GrupoSchema,
  categorias: CategoriaSchema,
  parceiros: ParceiroSchema,
  catalogo: ArtigoSchema,
  agenda: MarcacaoSchema,
  orcamentos: OrcamentoSchema,
} as const;

export type CollectionKey = keyof typeof COLLECTION_SCHEMAS;

export const COLLECTION_KEYS = Object.keys(COLLECTION_SCHEMAS) as CollectionKey[];

export const isCollectionKey = (value: string): value is CollectionKey =>
  Object.prototype.hasOwnProperty.call(COLLECTION_SCHEMAS, value);

export const DataStateSchema = z.object({
  subgrupos: z.array(SubGrupoSchema),
  grupos: z.array(GrupoSchema),
  categorias: z.array(CategoriaSchema),
  parceiros: z.array(ParceiroSchema),
  catalogo: z.array(ArtigoSchema),
  agenda: z.array(MarcacaoSchema),
  orcamentos: z.array(OrcamentoSchema),
});

/**
 * Write payloads carry no id — the repository assigns it on create, and on
 * update the URL is the authority. Derived eagerly per collection because
 * `.omit()` cannot be called on the union `COLLECTION_SCHEMAS[key]`.
 */
export const WRITE_SCHEMAS = {
  subgrupos: SubGrupoSchema.omit({ id: true }),
  grupos: GrupoSchema.omit({ id: true }),
  categorias: CategoriaSchema.omit({ id: true }),
  parceiros: ParceiroSchema.omit({ id: true }),
  catalogo: ArtigoSchema.omit({ id: true }),
  agenda: MarcacaoSchema.omit({ id: true }),
  orcamentos: OrcamentoSchema.omit({ id: true }),
} as const satisfies Record<CollectionKey, z.ZodType<unknown>>;
