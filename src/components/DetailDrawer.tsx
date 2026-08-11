import { useId } from 'react';
import { useBodyScrollLock, useEscapeKey } from '../hooks/useDismissable';

export interface DetailRow {
  label: string;
  value: string;
}

export interface DetailView {
  /** Entity name shown above the title, e.g. "Artigo do catálogo". */
  kind: string;
  title: string;
  rows: DetailRow[];
  /** Opens the matching edit modal for this record. */
  onEdit: () => void;
}

interface DetailDrawerProps {
  detail: DetailView;
  onClose: () => void;
  onEdit: () => void;
}

export function DetailDrawer({ detail, onClose, onEdit }: DetailDrawerProps) {
  const titleId = useId();
  useEscapeKey(onClose);
  useBodyScrollLock();

  return (
    <div
      className="cp-anim-fade-in"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 65,
        background: 'var(--cp-scrim)',
        display: 'flex',
        justifyContent: 'flex-end',
      }}
    >
      <div
        className="cp-anim-slide-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 460,
          height: '100%',
          background: 'var(--cp-surface)',
          boxShadow: 'var(--cp-shadow-overlay)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 16,
            padding: 24,
            borderBottom: '1px solid var(--cp-border)',
          }}
        >
          <div>
            <p className="cp-eyebrow" style={{ marginBottom: 6 }}>
              {detail.kind}
            </p>
            <h2
              id={titleId}
              style={{ fontSize: 20, lineHeight: 1.25, fontWeight: 700, color: 'var(--cp-navy)' }}
            >
              {detail.title}
            </h2>
          </div>
          <button
            type="button"
            className="cp-btn cp-btn--subtle cp-btn--icon"
            onClick={onClose}
            aria-label="Fechar"
          >
            ×
          </button>
        </div>

        <dl style={{ flex: 1, overflowY: 'auto', padding: '8px 24px 24px', margin: 0 }}>
          {detail.rows.map((row) => (
            <div
              key={row.label}
              style={{
                display: 'flex',
                gap: 16,
                justifyContent: 'space-between',
                padding: '14px 0',
                borderBottom: '1px solid var(--cp-border-subtle)',
              }}
            >
              <dt style={{ fontSize: 13, color: 'var(--cp-text-muted)', flex: 'none', maxWidth: '45%' }}>
                {row.label}
              </dt>
              <dd
                style={{
                  margin: 0,
                  fontSize: 13,
                  fontWeight: 500,
                  color: 'var(--cp-navy)',
                  textAlign: 'right',
                }}
              >
                {row.value}
              </dd>
            </div>
          ))}
        </dl>

        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--cp-border)',
            background: 'var(--cp-canvas)',
            display: 'flex',
            gap: 12,
            justifyContent: 'flex-end',
          }}
        >
          <button type="button" className="cp-btn cp-btn--outline" onClick={onClose}>
            Fechar
          </button>
          <button type="button" className="cp-btn cp-btn--navy" onClick={onEdit}>
            Editar
          </button>
        </div>
      </div>
    </div>
  );
}
