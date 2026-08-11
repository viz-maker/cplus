import { useState } from 'react';
import { Button, Checkbox, InlineNotification, TextInput } from '@constructpluseu/react';
import { Modal } from '../components/Modal';
import { TIPOS_PARCEIRO } from '../domain/types';
import type { Parceiro, TipoParceiro } from '../domain/types';

interface PartnerModalProps {
  /** `null` for a new partner. */
  record: Parceiro | null;
  onClose: () => void;
  /** Resolves once the record is stored; the caller closes the modal on success. */
  onSave: (record: Parceiro) => Promise<void>;
  onDelete: (record: Parceiro) => void;
}

const blank = (): Parceiro => ({
  id: '',
  nome: '',
  tipos: ['Cliente'],
  nif: '',
  email: '',
  telefone: '',
  localidade: '',
});

export function PartnerModal({ record, onClose, onSave, onDelete }: PartnerModalProps) {
  const [draft, setDraft] = useState<Parceiro>(() => record ?? blank());
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const patch = (p: Partial<Parceiro>) => {
    setDraft((d) => ({ ...d, ...p }));
    setError('');
  };

  function toggleTipo(t: TipoParceiro) {
    patch({
      tipos: draft.tipos.includes(t) ? draft.tipos.filter((v) => v !== t) : [...draft.tipos, t],
    });
  }

  async function save() {
    if (!draft.nome.trim()) {
      setError('O nome do parceiro é obrigatório.');
      return;
    }
    if (draft.tipos.length === 0) {
      setError('Selecione pelo menos um tipo de parceiro.');
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
      title={record ? 'Editar parceiro' : 'Adicionar parceiro'}
      size="md"
      onClose={onClose}
      destructive={
        record && (
          <Button variant="danger" onClick={() => onDelete(record)} disabled={saving}>
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
            Guardar parceiro
          </Button>
        </>
      }
    >
      <TextInput
        label="Nome do parceiro *"
        value={draft.nome}
        onChange={(e) => patch({ nome: e.target.value })}
        placeholder="Ex.: Almeida & Filhos, Lda"
        errorText={error && !draft.nome.trim() ? error : undefined}
      />

      <fieldset className="cp-fieldset">
        <legend className="cp-field-label">Tipo de parceiro</legend>
        <div className="cp-checkbox-row">
          {TIPOS_PARCEIRO.map((t) => (
            <Checkbox
              key={t}
              label={t}
              checked={draft.tipos.includes(t)}
              onChange={() => toggleTipo(t)}
            />
          ))}
        </div>
        <p className="cp-help">Um parceiro pode ser cliente e fornecedor em simultâneo.</p>
      </fieldset>

      {error && draft.nome.trim() && <InlineNotification status="danger" title={error} />}

      <div className="cp-field-grid">
        <TextInput
          label="NIF"
          inputMode="numeric"
          value={draft.nif}
          onChange={(e) => patch({ nif: e.target.value })}
        />
        <TextInput
          label="Email"
          type="email"
          value={draft.email}
          onChange={(e) => patch({ email: e.target.value })}
        />
        <TextInput
          label="Telefone"
          type="tel"
          value={draft.telefone}
          onChange={(e) => patch({ telefone: e.target.value })}
        />
        <TextInput
          label="Localidade"
          value={draft.localidade}
          onChange={(e) => patch({ localidade: e.target.value })}
        />
      </div>
    </Modal>
  );
}
