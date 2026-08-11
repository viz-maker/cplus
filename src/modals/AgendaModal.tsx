import { useState } from 'react';
import { ErrorNote, Modal } from '../components/Modal';
import { RichTextField } from '../components/RichTextField';
import { ESTADOS, toneOf } from '../domain/status';
import type { Estado, Marcacao } from '../domain/types';

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
      maxWidth={640}
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
            Fechar
          </button>
          <button
            type="button"
            className="cp-btn cp-btn--accent"
            onClick={save}
            disabled={saving}
          >
            {saving ? 'A guardar…' : 'Guardar marcação'}
          </button>
        </>
      }
    >
      <div>
        <label className="cp-label" htmlFor="ag-desc">
          Descrição *
        </label>
        <input
          id="ag-desc"
          className={descInvalid ? 'cp-input cp-input--invalid' : 'cp-input'}
          type="text"
          value={draft.descricao}
          onChange={(e) => patch({ descricao: e.target.value })}
          placeholder="Ex.: Vistoria de estrutura — Rua do Carmo"
          aria-invalid={descInvalid}
        />
      </div>

      <div>
        <span className="cp-label">Estado</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }} role="group">
          {ESTADOS.map((estado: Estado) => {
            const on = draft.estado === estado;
            const tone = toneOf(estado);
            return (
              <button
                key={estado}
                type="button"
                className="cp-toggle-chip"
                aria-pressed={on}
                onClick={() => patch({ estado })}
                style={
                  on
                    ? { background: tone.bg, color: tone.fg, borderColor: tone.border }
                    : undefined
                }
              >
                {estado}
              </button>
            );
          })}
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 16,
        }}
      >
        <div>
          <label className="cp-label" htmlFor="ag-ini-d">
            Data de início *
          </label>
          <input
            id="ag-ini-d"
            className="cp-input"
            type="date"
            value={draft.inicioData}
            onChange={(e) => patch({ inicioData: e.target.value })}
          />
        </div>
        <div>
          <label className="cp-label" htmlFor="ag-ini-h">
            Hora de início *
          </label>
          <input
            id="ag-ini-h"
            className="cp-input"
            type="time"
            value={draft.inicioHora}
            onChange={(e) => patch({ inicioHora: e.target.value })}
          />
        </div>
        <div>
          <label className="cp-label" htmlFor="ag-fim-d">
            Data de fim *
          </label>
          <input
            id="ag-fim-d"
            className={fimInvalid ? 'cp-input cp-input--invalid' : 'cp-input'}
            type="date"
            value={draft.fimData}
            onChange={(e) => patch({ fimData: e.target.value })}
            aria-invalid={fimInvalid}
          />
        </div>
        <div>
          <label className="cp-label" htmlFor="ag-fim-h">
            Hora de fim *
          </label>
          <input
            id="ag-fim-h"
            className={fimInvalid ? 'cp-input cp-input--invalid' : 'cp-input'}
            type="time"
            value={draft.fimHora}
            onChange={(e) => patch({ fimHora: e.target.value })}
            aria-invalid={fimInvalid}
          />
        </div>
      </div>

      {error && <ErrorNote>{error}</ErrorNote>}

      <RichTextField
        label="Detalhes e notas"
        value={draft.detalhes}
        onChange={(detalhes) => setDraft((d) => ({ ...d, detalhes }))}
      />
    </Modal>
  );
}
