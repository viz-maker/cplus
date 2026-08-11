import { useId, type ReactNode } from 'react';
import { useBodyScrollLock, useEscapeKey } from '../hooks/useDismissable';

interface ModalProps {
  title: string;
  /** Optional line under the title, e.g. which fields are required. */
  subtitle?: string;
  maxWidth: number;
  onClose: () => void;
  children: ReactNode;
  /** Destructive action rendered on the left of the footer. */
  destructive?: ReactNode;
  /** Confirm/cancel actions rendered on the right of the footer. */
  actions: ReactNode;
}

export function Modal({
  title,
  subtitle,
  maxWidth,
  onClose,
  children,
  destructive,
  actions,
}: ModalProps) {
  const titleId = useId();
  useEscapeKey(onClose);
  useBodyScrollLock();

  return (
    <div className="cp-overlay" onClick={onClose}>
      <div
        className="cp-modal"
        style={{ maxWidth }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="cp-modal__header">
          <div>
            <h2 id={titleId} style={{ fontSize: 20, fontWeight: 700, color: 'var(--cp-navy)' }}>
              {title}
            </h2>
            {subtitle && (
              <p style={{ fontSize: 13, color: 'var(--cp-text-muted)', marginTop: 6 }}>
                {subtitle}
              </p>
            )}
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

        <div className="cp-modal__body">{children}</div>

        <div className="cp-modal__footer">
          {destructive}
          <div className="cp-modal__footer-actions">{actions}</div>
        </div>
      </div>
    </div>
  );
}

/** Inline error banner used inside modal bodies and the login form. */
export function ErrorNote({ children }: { children: ReactNode }) {
  return (
    <div
      role="alert"
      style={{
        display: 'flex',
        gap: 10,
        alignItems: 'flex-start',
        padding: '12px 14px',
        borderRadius: 'var(--cp-radius)',
        background: 'var(--cp-danger-bg)',
        border: '1px solid var(--cp-danger-border)',
      }}
    >
      <span
        aria-hidden
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: 'var(--cp-danger)',
          marginTop: 6,
          flex: 'none',
        }}
      />
      <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.4, color: 'var(--cp-danger)' }}>
        {children}
      </div>
    </div>
  );
}

/** Small uppercase heading that groups fields inside a long modal. */
export function FieldGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <p className="cp-eyebrow" style={{ marginBottom: 12 }}>
        {title}
      </p>
      {children}
    </div>
  );
}
