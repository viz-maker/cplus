import { useState } from 'react';
import { Button, Combobox, TextInput } from '@constructpluseu/react';
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

export function EntityModal({ kind, record, data, onClose, onSave, onDelete }: EntityModalProps) {
  const copy = COPY[kind];
  const assoc = associationsOf(kind, data);

  const [nome, setNome] = useState(record?.nome ?? '');
  const [selected, setSelected] = useState<Id[]>(() => {
    if (!assoc || !record) return [];
    return ((record as Categoria & Grupo)[assoc.key] as Id[] | undefined) ?? [];
  });
  const [error, setError] = useState('');
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
      size="sm"
      onClose={onClose}
      destructive={
        record && (
          <Button variant="danger" onClick={() => onDelete(kind, record)} disabled={saving}>
            Eliminar
          </Button>
        )
      }
      actions={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button variant="accent" onClick={save} loading={saving}>
            Guardar
          </Button>
        </>
      }
    >
      <TextInput
        label="Nome *"
        value={nome}
        onChange={(e) => {
          setNome(e.target.value);
          setError('');
        }}
        placeholder={copy.placeholder}
        errorText={error || undefined}
      />

      {assoc && (
        <Combobox
          label={copy.multiLabel}
          multiple
          options={assoc.options.map((o) => ({ value: o.id, label: o.nome }))}
          value={selected}
          onChange={setSelected}
          placeholder="Procurar para associar…"
        />
      )}
    </Modal>
  );
}
