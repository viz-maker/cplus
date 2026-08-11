import { useId } from 'react';
import { useBodyScrollLock, useEscapeKey } from '../hooks/useDismissable';

interface ConfirmDialogProps {
  title: string;
  text: string;
  confirmLabel: string;
  /** Request in flight — locks both buttons and Escape. */
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmDialog({
  title,
  text,
  confirmLabel,
  busy = false,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  const titleId = useId();
  useEscapeKey(onCancel, !busy);
  useBodyScrollLock();

  return (
    <div
      className="cp-anim-fade-in"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 70,
        background: 'var(--cp-scrim-strong)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        className="cp-anim-fade-up"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        style={{
          width: '100%',
          maxWidth: 440,
          background: 'var(--cp-surface)',
          borderRadius: 'var(--cp-radius-surface)',
          boxShadow: 'var(--cp-shadow-overlay)',
          padding: 28,
        }}
      >
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 16 }}>
          <div
            aria-hidden
            style={{
              width: 34,
              height: 34,
              flex: 'none',
              borderRadius: 'var(--cp-radius)',
              background: 'var(--cp-danger-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: 'var(--cp-danger)',
              }}
            />
          </div>
          <div>
            <h2 id={titleId} style={{ fontSize: 18, fontWeight: 700, color: 'var(--cp-navy)' }}>
              {title}
            </h2>
            <p
              style={{
                fontSize: 14,
                lineHeight: 1.5,
                color: 'var(--cp-text-muted)',
                marginTop: 8,
              }}
            >
              {text}
            </p>
          </div>
        </div>

        <div
          style={{
            padding: '12px 14px',
            borderRadius: 'var(--cp-radius)',
            background: 'var(--cp-danger-bg)',
            border: '1px solid var(--cp-danger-border)',
            marginBottom: 20,
          }}
        >
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--cp-danger)' }}>
            Esta ação é irreversível.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="cp-btn cp-btn--outline"
            onClick={onCancel}
            disabled={busy}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="cp-btn cp-btn--danger"
            onClick={onConfirm}
            disabled={busy}
            autoFocus
          >
            {busy ? 'A eliminar…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
