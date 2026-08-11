import { Modal as DsModal } from '@constructpluseu/react';
import type { ReactNode } from 'react';

interface ModalProps {
  title: string;
  /** Optional line under the title — the design system's Modal has no subtitle slot. */
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg';
  onClose: () => void;
  children: ReactNode;
  /** Destructive action, pinned to the left of the footer. */
  destructive?: ReactNode;
  /** Confirm/cancel actions, pinned to the right. */
  actions: ReactNode;
}

/**
 * Thin wrapper over the design system's `Modal`.
 *
 * It exists for two things the DS component does not provide: a subtitle, and a
 * footer split into a destructive zone and an actions zone. Escape handling,
 * focus trapping and body scroll locking all come from the DS.
 *
 * Callers render this conditionally, so `open` is always true.
 */
export function Modal({
  title,
  subtitle,
  size = 'md',
  onClose,
  children,
  destructive,
  actions,
}: ModalProps) {
  return (
    <DsModal
      open
      onClose={onClose}
      title={title}
      size={size}
      footer={
        <div className="cp-modal-footer">
          <div className="cp-modal-footer__destructive">{destructive}</div>
          <div className="cp-modal-footer__actions">{actions}</div>
        </div>
      }
    >
      {subtitle && <p className="cp-modal-subtitle">{subtitle}</p>}
      <div className="cp-form-stack">{children}</div>
    </DsModal>
  );
}

/** Small uppercase heading that groups fields inside a long modal. */
export function FieldGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <p className="cp-eyebrow">{title}</p>
      {children}
    </section>
  );
}
