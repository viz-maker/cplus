import { useState } from 'react';
import { Modal } from '../components/Modal';
import { PARTNER_TONE } from '../domain/status';
import type { Parceiro, TipoParceiro } from '../domain/types';

const TIPOS: TipoParceiro[] = ['Cliente', 'Fornecedor'];

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
      maxWidth={560}
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
            {saving ? 'A guardar…' : 'Guardar parceiro'}
          </button>
        </>
      }
    >
      <div>
        <label className="cp-label" htmlFor="pa-nome">
          Nome do parceiro *
        </label>
        <input
          id="pa-nome"
          className={error ? 'cp-input cp-input--invalid' : 'cp-input'}
          type="text"
          value={draft.nome}
          onChange={(e) => patch({ nome: e.target.value })}
          placeholder="Ex.: Almeida & Filhos, Lda"
          aria-invalid={!!error}
        />
        {error && (
          <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--cp-danger)', marginTop: 6 }}>
            {error}
          </p>
        )}
      </div>

      <div>
        <span className="cp-label">Tipo de parceiro</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }} role="group">
          {TIPOS.map((t) => {
            const on = draft.tipos.includes(t);
            const tone = PARTNER_TONE[t];
            return (
              <button
                key={t}
                type="button"
                className="cp-toggle-chip cp-toggle-chip--lg"
                aria-pressed={on}
                onClick={() => toggleTipo(t)}
                style={
                  on ? { background: tone.bg, color: tone.fg, borderColor: tone.border } : undefined
                }
              >
                {t}
              </button>
            );
          })}
        </div>
        <p className="cp-help" style={{ marginTop: 8, fontSize: 12 }}>
          Um parceiro pode ser cliente e fornecedor em simultâneo.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 16,
        }}
      >
        <div>
          <label className="cp-label" htmlFor="pa-nif">
            NIF
          </label>
          <input
            id="pa-nif"
            className="cp-input"
            type="text"
            inputMode="numeric"
            value={draft.nif}
            onChange={(e) => patch({ nif: e.target.value })}
          />
        </div>
        <div>
          <label className="cp-label" htmlFor="pa-email">
            Email
          </label>
          <input
            id="pa-email"
            className="cp-input"
            type="email"
            value={draft.email}
            onChange={(e) => patch({ email: e.target.value })}
          />
        </div>
        <div>
          <label className="cp-label" htmlFor="pa-tel">
            Telefone
          </label>
          <input
            id="pa-tel"
            className="cp-input"
            type="tel"
            value={draft.telefone}
            onChange={(e) => patch({ telefone: e.target.value })}
          />
        </div>
        <div>
          <label className="cp-label" htmlFor="pa-loc">
            Localidade
          </label>
          <input
            id="pa-loc"
            className="cp-input"
            type="text"
            value={draft.localidade}
            onChange={(e) => patch({ localidade: e.target.value })}
          />
        </div>
      </div>
    </Modal>
  );
}
