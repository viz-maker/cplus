import { useState } from 'react';
import { Button, DatePicker, InlineNotification, Select, TextInput } from '@constructpluseu/react';
import { Modal } from '../components/Modal';
import { RichTextField } from '../components/RichTextField';
import { ESTADOS } from '../domain/status';
import type { Estado, Marcacao } from '../domain/types';

const ESTADO_OPTIONS = ESTADOS.map((e) => ({ value: e, label: e }));

interface AgendaModalProps {
  /** `null` for a new marcação. */
  record: Marcacao | null;
  /** Slot pre-filled when the user clicks an empty cell in the calendar. */
  prefill?: Pick<Marcacao, 'inicioData' | 'inicioHora'>;
  onClose: () => void;
  /** Resolves once the record is stored; the caller closes the modal on success. */
  onSave: (record: Marcacao) => Promise<void>;
  onDelete: (record: Marcacao) => void;
}

const blank = (prefill?: AgendaModalProps['prefill']): Marcacao => ({
  id: '',
  descricao: '',
  estado: 'Em espera',
  inicioData: prefill?.inicioData ?? '',
  inicioHora: prefill?.inicioHora ?? '09:00',
  fimData: '',
  fimHora: '',
  detalhes: '',
});

export function AgendaModal({ record, prefill, onClose, onSave, onDelete }: AgendaModalProps) {
  const [draft, setDraft] = useState<Marcacao>(() => record ?? blank(prefill));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const patch = (p: Partial<Marcacao>) => {
    setDraft((d) => ({ ...d, ...p }));
    setError('');
  };

  const descInvalid = !!error && !draft.descricao.trim();
  const fimInvalid = !!error && (!draft.fimData || !draft.fimHora);

  async function save() {
    if (!draft.descricao.trim()) {
      setError('Indique uma descrição para a marcação.');
      return;
    }
    if (!draft.fimData || !draft.fimHora) {
      setError('A data e a hora de fim são obrigatórias.');
      return;
    }
    if (draft.fimData + draft.fimHora < draft.inicioData + draft.inicioHora) {
      setError('O fim não pode ser anterior ao início. Corrija a data ou a hora de fim.');
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
      title={record ? 'Editar marcação' : 'Nova marcação'}
      subtitle="Campos com * são obrigatórios."
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
            Fechar
          </Button>
          <Button variant="accent" onClick={save} loading={saving}>
            Guardar marcação
          </Button>
        </>
      }
    >
      <TextInput
        label="Descrição *"
        value={draft.descricao}
        onChange={(e) => patch({ descricao: e.target.value })}
        placeholder="Ex.: Vistoria de estrutura — Rua do Carmo"
        errorText={descInvalid ? 'Obrigatório' : undefined}
      />

      <Select
        label="Estado"
        options={ESTADO_OPTIONS}
        value={draft.estado}
        onChange={(e) => patch({ estado: e.target.value as Estado })}
      />

      <div className="cp-field-grid">
        <DatePicker
          label="Data de início *"
          value={draft.inicioData || null}
          onChange={(v) => patch({ inicioData: v ?? '' })}
        />
        <TextInput
          label="Hora de início *"
          type="time"
          value={draft.inicioHora}
          onChange={(e) => patch({ inicioHora: e.target.value })}
        />
        <DatePicker
          label="Data de fim *"
          value={draft.fimData || null}
          onChange={(v) => patch({ fimData: v ?? '' })}
          errorText={fimInvalid ? 'Obrigatório' : undefined}
        />
        <TextInput
          label="Hora de fim *"
          type="time"
          value={draft.fimHora}
          onChange={(e) => patch({ fimHora: e.target.value })}
          errorText={fimInvalid ? 'Obrigatório' : undefined}
        />
      </div>

      {error && <InlineNotification status="danger" title={error} />}

      <RichTextField
        label="Detalhes e notas"
        value={draft.detalhes}
        onChange={(detalhes) => setDraft((d) => ({ ...d, detalhes }))}
      />
    </Modal>
  );
}
