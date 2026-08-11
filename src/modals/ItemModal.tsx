import { useState, type CSSProperties } from 'react';
import { FieldGroup, Modal } from '../components/Modal';
import { byId, grupoOfCategoria, subgrupoOfCategoria } from '../domain/selectors';
import { UNIDADES } from '../domain/types';
import type { Artigo, DataState, Parceiro, Unidade } from '../domain/types';

interface ItemModalProps {
  /** `null` for a new article. */
  record: Artigo | null;
  data: DataState;
  onClose: () => void;
  /** Resolves once the record is stored; the caller closes the modal on success. */
  onSave: (record: Artigo) => Promise<void>;
  onDelete: (record: Artigo) => void;
  /** Creates a supplier inline and returns it, so it can be selected immediately. */
  onCreateSupplier: (nome: string) => Promise<Parceiro>;
}

const blank = (categoriaId: string): Artigo => ({
  id: '',
  nome: '',
  categoriaId,
  sku: '',
  codigoBarras: '',
  ncm: '',
  unidade: 'un',
  stock: 0,
  stockMin: 0,
  precoUnit: 0,
  markup: 0,
  custoMedio: 0,
  fornecedorId: '',
  ativo: true,
  descricao: '',
  notas: '',
  imagem: '',
});

export function ItemModal({
  record,
  data,
  onClose,
  onSave,
  onDelete,
  onCreateSupplier,
}: ItemModalProps) {
  const [draft, setDraft] = useState<Artigo>(
    () => record ?? blank(data.categorias[0]?.id ?? ''),
  );
  const [error, setError] = useState('');
  const [supplierQuery, setSupplierQuery] = useState(
    () => byId(data.parceiros, record?.fornecedorId ?? null)?.nome ?? '',
  );
  const [supplierOpen, setSupplierOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const patch = (p: Partial<Artigo>) => {
    setDraft((d) => ({ ...d, ...p }));
    setError('');
  };

  const grupo = grupoOfCategoria(data, draft.categoriaId);
  const subgrupo = subgrupoOfCategoria(data, draft.categoriaId);
  const fornecedor = byId(data.parceiros, draft.fornecedorId || null);

  const q = supplierQuery.trim().toLowerCase();
  const supplierMatches = data.parceiros.filter(
    (p) => p.tipos.includes('Fornecedor') && p.nome.toLowerCase().includes(q),
  );

  async function save() {
    if (!draft.nome.trim()) {
      setError('O nome do artigo é obrigatório.');
      return;
    }
    setSaving(true);
    try {
      await onSave(draft);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title={record ? 'Editar artigo' : 'Adicionar artigo'}
      subtitle="Grupo e SubGrupo são preenchidos automaticamente a partir da categoria."
      maxWidth={880}
      onClose={onClose}
      destructive={
        record && (
          <button
            type="button"
            className="cp-btn cp-btn--danger-outline"
            onClick={() => onDelete(record)}
          >
            Eliminar
          </button>
        )
      }
      actions={
        <>
          <button
            type="button"
            className="cp-btn cp-btn--outline"
            onClick={onClose}
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="cp-btn cp-btn--accent"
            onClick={save}
            disabled={saving}
          >
            {saving ? 'A guardar…' : 'Guardar artigo'}
          </button>
        </>
      }
    >
      <FieldGroup title="Identificação">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16,
          }}
        >
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="cp-label" htmlFor="it-nome">
              Nome do artigo *
            </label>
            <input
              id="it-nome"
              className={error ? 'cp-input cp-input--invalid' : 'cp-input'}
              type="text"
              value={draft.nome}
              onChange={(e) => patch({ nome: e.target.value })}
              placeholder="Ex.: Cimento Portland CEM II 42,5R 25 kg"
              aria-invalid={!!error}
            />
            {error && (
              <p
                style={{ fontSize: 12, fontWeight: 500, color: 'var(--cp-danger)', marginTop: 6 }}
              >
                {error}
              </p>
            )}
          </div>

          <div>
            <label className="cp-label" htmlFor="it-cat">
              Categoria *
            </label>
            <select
              id="it-cat"
              className="cp-select"
              value={draft.categoriaId}
              onChange={(e) => patch({ categoriaId: e.target.value })}
            >
              {data.categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="cp-label" htmlFor="it-grupo">
              Grupo (automático)
            </label>
            <input id="it-grupo" className="cp-input" readOnly value={grupo?.nome ?? '—'} />
          </div>

          <div>
            <label className="cp-label" htmlFor="it-sub">
              SubGrupo (automático)
            </label>
            <input id="it-sub" className="cp-input" readOnly value={subgrupo?.nome ?? '—'} />
          </div>

          <div>
            <label className="cp-label" htmlFor="it-sku">
              SKU
            </label>
            <input
              id="it-sku"
              className="cp-input"
              type="text"
              value={draft.sku}
              onChange={(e) => patch({ sku: e.target.value })}
            />
          </div>

          <div>
            <label className="cp-label" htmlFor="it-barras">
              Código de barras
            </label>
            <input
              id="it-barras"
              className="cp-input"
              type="text"
              inputMode="numeric"
              value={draft.codigoBarras}
              onChange={(e) => patch({ codigoBarras: e.target.value })}
            />
          </div>

          <div>
            <label className="cp-label" htmlFor="it-ncm">
              NCM
            </label>
            <input
              id="it-ncm"
              className="cp-input"
              type="text"
              value={draft.ncm}
              onChange={(e) => patch({ ncm: e.target.value })}
            />
          </div>

          <div>
            <label className="cp-label" htmlFor="it-unidade">
              Unidade
            </label>
            <select
              id="it-unidade"
              className="cp-select"
              value={draft.unidade}
              onChange={(e) => patch({ unidade: e.target.value as Unidade })}
            >
              {UNIDADES.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        </div>
      </FieldGroup>

      <FieldGroup title="Stock e preços">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 16,
          }}
        >
          <div>
            <label className="cp-label" htmlFor="it-stock">
              Stock atual
            </label>
            <input
              id="it-stock"
              className="cp-input"
              type="number"
              step="0.01"
              value={draft.stock}
              onChange={(e) => patch({ stock: e.target.value })}
            />
          </div>
          <div>
            <label className="cp-label" htmlFor="it-stockmin">
              Stock mínimo
            </label>
            <input
              id="it-stockmin"
              className="cp-input"
              type="number"
              step="0.01"
              value={draft.stockMin}
              onChange={(e) => patch({ stockMin: e.target.value })}
            />
            <p className="cp-help">Abaixo deste valor o artigo é assinalado nos orçamentos.</p>
          </div>
          <div>
            <label className="cp-label" htmlFor="it-preco">
              Preço unitário (€)
            </label>
            <input
              id="it-preco"
              className="cp-input"
              type="number"
              step="0.01"
              value={draft.precoUnit}
              onChange={(e) => patch({ precoUnit: e.target.value })}
            />
          </div>
          <div>
            <label className="cp-label" htmlFor="it-markup">
              Markup (%)
            </label>
            <input
              id="it-markup"
              className="cp-input"
              type="number"
              step="0.1"
              value={draft.markup}
              onChange={(e) => patch({ markup: e.target.value })}
            />
          </div>
          <div>
            <label className="cp-label" htmlFor="it-custo">
              Custo médio (€)
            </label>
            <input
              id="it-custo"
              className="cp-input"
              type="number"
              step="0.01"
              value={draft.custoMedio}
              onChange={(e) => patch({ custoMedio: e.target.value })}
            />
          </div>
        </div>
      </FieldGroup>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 24,
        }}
      >
        <FieldGroup title="Fornecedor preferencial">
          <div
            style={{ position: 'relative' }}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
                setSupplierOpen(false);
              }
            }}
          >
            <input
              className="cp-input"
              type="text"
              role="combobox"
              aria-expanded={supplierOpen}
              aria-label="Procurar fornecedor"
              value={supplierQuery}
              onChange={(e) => {
                setSupplierQuery(e.target.value);
                setSupplierOpen(true);
              }}
              onFocus={() => setSupplierOpen(true)}
              placeholder="Procurar fornecedor…"
            />

            {supplierOpen && (
              <div
                role="listbox"
                style={{
                  position: 'absolute',
                  top: 52,
                  left: 0,
                  right: 0,
                  zIndex: 5,
                  border: '1px solid var(--cp-border)',
                  borderRadius: 'var(--cp-radius)',
                  boxShadow: 'var(--cp-shadow-overlay)',
                  background: 'var(--cp-surface)',
                  maxHeight: 220,
                  overflowY: 'auto',
                }}
              >
                {supplierMatches.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    role="option"
                    aria-selected={draft.fornecedorId === p.id}
                    onClick={() => {
                      patch({ fornecedorId: p.id });
                      setSupplierQuery(p.nome);
                      setSupplierOpen(false);
                    }}
                    style={optionStyle}
                  >
                    {p.nome}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={async () => {
                    setSupplierOpen(false);
                    const created = await onCreateSupplier(
                      supplierQuery.trim() || 'Novo fornecedor',
                    );
                    patch({ fornecedorId: created.id });
                    setSupplierQuery(created.nome);
                  }}
                  style={{
                    ...optionStyle,
                    borderTop: '1px solid var(--cp-border)',
                    fontWeight: 600,
                    color: 'var(--cp-accent-active)',
                  }}
                >
                  + Adicionar novo fornecedor
                </button>
              </div>
            )}
          </div>

          {fornecedor && (
            <span className="cp-chip" style={{ marginTop: 10 }}>
              {fornecedor.nome}
              <button
                type="button"
                className="cp-chip__remove"
                aria-label="Remover fornecedor"
                onClick={() => {
                  patch({ fornecedorId: '' });
                  setSupplierQuery('');
                }}
              >
                ×
              </button>
            </span>
          )}
        </FieldGroup>

        <FieldGroup title="Estado">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              padding: '12px 16px',
              border: '1px solid var(--cp-border)',
              borderRadius: 'var(--cp-radius)',
            }}
          >
            <div>
              <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--cp-navy)' }}>
                {draft.ativo ? 'Artigo ativo' : 'Artigo inativo'}
              </p>
              <p style={{ fontSize: 12, color: 'var(--cp-text-muted)', marginTop: 3 }}>
                Artigos inativos não aparecem em orçamentos.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={draft.ativo}
              aria-label="Artigo ativo"
              onClick={() => patch({ ativo: !draft.ativo })}
              style={{
                width: 48,
                height: 28,
                flex: 'none',
                borderRadius: 'var(--cp-radius)',
                border: 'none',
                cursor: 'pointer',
                padding: 3,
                display: 'flex',
                justifyContent: draft.ativo ? 'flex-end' : 'flex-start',
                background: draft.ativo ? 'var(--cp-accent)' : 'var(--cp-border-strong)',
                transition: 'background .15s ease',
              }}
            >
              <span
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: '#fff',
                  boxShadow: '0 1px 3px rgba(13,33,55,0.3)',
                }}
              />
            </button>
          </div>
        </FieldGroup>
      </div>

      <FieldGroup title="Imagem do artigo">
        <label className="cp-dropzone">
          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) patch({ imagem: file.name });
            }}
          />
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--cp-navy)' }}>
            {draft.imagem
              ? `Imagem selecionada: ${draft.imagem}`
              : 'Arraste uma imagem ou clique para selecionar'}
          </p>
          <p style={{ fontSize: 12, color: 'var(--cp-text-faint)' }}>
            PNG ou JPG · mínimo 512×512 píxeis
          </p>
        </label>
      </FieldGroup>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 16,
        }}
      >
        <div>
          <label className="cp-label" htmlFor="it-desc">
            Descrição detalhada
          </label>
          <textarea
            id="it-desc"
            className="cp-textarea"
            rows={4}
            value={draft.descricao}
            onChange={(e) => patch({ descricao: e.target.value })}
            placeholder="Composição, aplicação, normas aplicáveis…"
          />
        </div>
        <div>
          <label className="cp-label" htmlFor="it-notas">
            Notas internas
          </label>
          <textarea
            id="it-notas"
            className="cp-textarea"
            rows={4}
            value={draft.notas}
            onChange={(e) => patch({ notas: e.target.value })}
            placeholder="Visível apenas para a equipa interna."
          />
        </div>
      </div>
    </Modal>
  );
}

const optionStyle: CSSProperties = {
  display: 'block',
  width: '100%',
  padding: '10px 14px',
  border: 'none',
  borderRadius: 'var(--cp-radius)',
  background: 'var(--cp-surface)',
  cursor: 'pointer',
  textAlign: 'left',
  fontSize: 14,
  color: 'var(--cp-navy)',
};
