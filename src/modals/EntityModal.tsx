import { useState } from 'react';
import { Modal } from '../components/Modal';
import type { Categoria, DataState, EntityKind, Grupo, Id, SubGrupo } from '../domain/types';

export type EntityRecord = Categoria | Grupo | SubGrupo;

interface EntityModalProps {
  kind: EntityKind;
  /** `null` for a new record. */
  record: EntityRecord | null;
  data: DataState;
  onClose: () => void;
  /** Resolves once the record is stored; the caller closes the modal on success. */
  onSave: (kind: EntityKind, record: EntityRecord) => Promise<void>;
  onDelete: (kind: EntityKind, record: EntityRecord) => void;
}

const COPY: Record<EntityKind, { noun: string; placeholder: string; multiLabel?: string }> = {
  categorias: {
    noun: 'categoria',
    placeholder: 'Ex.: Acabamentos',
    multiLabel: 'Grupos associados (opcional)',
  },
  grupos: {
    noun: 'grupo',
    placeholder: 'Ex.: Pinturas',
    multiLabel: 'SubGrupos associados (opcional)',
  },
  subgrupos: { noun: 'subgrupo', placeholder: 'Ex.: Tinta interior' },
};

interface Association {
  key: 'grupoIds' | 'subgrupoIds';
  options: Array<{ id: Id; nome: string }>;
}

/** Categories associate groups; groups associate subgroups; subgroups are leaves. */
function associationsOf(kind: EntityKind, data: DataState): Association | null {
  if (kind === 'categorias') return { key: 'grupoIds', options: data.grupos };
  if (kind === 'grupos') return { key: 'subgrupoIds', options: data.subgrupos };
  return null;
}

export function EntityModal({
  kind,
  record,
  data,
  onClose,
  onSave,
  onDelete,
}: EntityModalProps) {
  const copy = COPY[kind];
  const assoc = associationsOf(kind, data);

  const [nome, setNome] = useState(record?.nome ?? '');
  const [selected, setSelected] = useState<Id[]>(() => {
    if (!assoc || !record) return [];
    return ((record as Categoria & Grupo)[assoc.key] as Id[] | undefined) ?? [];
  });
  const [error, setError] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!nome.trim()) {
      setError('O nome é obrigatório.');
      return;
    }
    const id = record?.id ?? '';
    const next: EntityRecord =
      kind === 'categorias'
        ? ({ id, nome, grupoIds: selected } satisfies Categoria)
        : kind === 'grupos'
          ? ({ id, nome, subgrupoIds: selected } satisfies Grupo)
          : ({ id, nome } satisfies SubGrupo);
    setSaving(true);
    try {
      await onSave(kind, next);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title={`${record ? 'Editar' : 'Adicionar'} ${copy.noun}`}
      maxWidth={520}
      onClose={onClose}
      destructive={
        record && (
          <button
            type="button"
            className="cp-btn cp-btn--danger-outline"
            onClick={() => onDelete(kind, record)}
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
            {saving ? 'A guardar…' : 'Guardar'}
          </button>
        </>
      }
    >
      <div>
        <label className="cp-label" htmlFor="ent-nome">
          Nome *
        </label>
        <input
          id="ent-nome"
          className={error ? 'cp-input cp-input--invalid' : 'cp-input'}
          type="text"
          value={nome}
          onChange={(e) => {
            setNome(e.target.value);
            setError('');
          }}
          placeholder={copy.placeholder}
          aria-invalid={!!error}
        />
        {error && (
          <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--cp-danger)', marginTop: 6 }}>
            {error}
          </p>
        )}
      </div>

      {assoc && (
        <div>
          <span className="cp-label">{copy.multiLabel}</span>
          <div
            style={{
              border: '1px solid var(--cp-border)',
              borderRadius: 'var(--cp-radius)',
              padding: '10px 12px',
              background: 'var(--cp-surface)',
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8,
              minHeight: 46,
              alignItems: 'center',
            }}
          >
            {selected.map((id) => {
              const option = assoc.options.find((o) => o.id === id);
              return (
                <span key={id} className="cp-chip">
                  {option?.nome ?? '—'}
                  <button
                    type="button"
                    className="cp-chip__remove"
                    aria-label={`Remover ${option?.nome ?? 'associação'}`}
                    onClick={() => setSelected((cur) => cur.filter((v) => v !== id))}
                  >
                    ×
                  </button>
                </span>
              );
            })}
            <button
              type="button"
              className="cp-btn cp-btn--dashed"
              style={{ padding: '5px 12px', fontSize: 13, fontWeight: 500 }}
              aria-expanded={pickerOpen}
              onClick={() => setPickerOpen((o) => !o)}
            >
              + Associar
            </button>
          </div>

          {pickerOpen && (
            <div
              style={{
                marginTop: 8,
                border: '1px solid var(--cp-border)',
                borderRadius: 'var(--cp-radius)',
                boxShadow: 'var(--cp-shadow-overlay)',
                maxHeight: 200,
                overflowY: 'auto',
                background: 'var(--cp-surface)',
              }}
            >
              {assoc.options.map((option) => {
                const on = selected.includes(option.id);
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="checkbox"
                    aria-checked={on}
                    onClick={() =>
                      setSelected((cur) =>
                        on ? cur.filter((v) => v !== option.id) : [...cur, option.id],
                      )
                    }
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      width: '100%',
                      padding: '10px 14px',
                      border: 'none',
                      borderRadius: 'var(--cp-radius)',
                      background: on ? 'var(--cp-accent-softer)' : 'var(--cp-surface)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: 14,
                      color: 'var(--cp-navy)',
                    }}
                  >
                    <span
                      aria-hidden
                      style={{
                        width: 16,
                        height: 16,
                        flex: 'none',
                        borderRadius: 'var(--cp-radius)',
                        border: `1px solid ${on ? 'var(--cp-accent)' : 'var(--cp-border-strong)'}`,
                        background: on ? 'var(--cp-accent)' : 'var(--cp-surface)',
                      }}
                    />
                    {option.nome}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
