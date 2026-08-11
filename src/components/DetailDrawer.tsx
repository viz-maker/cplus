import { Button, Modal } from '@constructpluseu/react';

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

/**
 * Read-only view of a record.
 *
 * Was a right-hand drawer before the design system migration; the DS has no
 * drawer among its components, so it now uses `Modal` rather than keeping a
 * one-off surface outside the system.
 */
export function DetailDrawer({ detail, onClose, onEdit }: DetailDrawerProps) {
  return (
    <Modal
      open
      onClose={onClose}
      title={detail.title}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Fechar
          </Button>
          <Button variant="primary" onClick={onEdit}>
            Editar
          </Button>
        </>
      }
    >
      <p className="cp-eyebrow">{detail.kind}</p>
      <dl className="cp-detail-list">
        {detail.rows.map((row) => (
          <div key={row.label} className="cp-detail-list__row">
            <dt>{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>
    </Modal>
  );
}
