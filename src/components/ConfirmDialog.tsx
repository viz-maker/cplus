import { Button, InlineNotification, Modal } from '@constructpluseu/react';

interface ConfirmDialogProps {
  title: string;
  text: string;
  confirmLabel: string;
  /** Request in flight — locks both buttons. */
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
  return (
    <Modal
      open
      onClose={onCancel}
      title={title}
      size="sm"
      // A destructive confirmation should not be dismissable by a stray click.
      dismissOnBackdropClick={false}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel} disabled={busy}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={busy}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="cp-form-stack">
        <p className="cp-body">{text}</p>
        <InlineNotification status="danger" title="Esta ação é irreversível." />
      </div>
    </Modal>
  );
}
