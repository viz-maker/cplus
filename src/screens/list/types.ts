import type { DataTableColumn, TagStatus } from '@constructpluseu/react';

export interface CellBadge {
  text: string;
  status: TagStatus;
  /** Extra class for the one estado the DS palette cannot express — see domain/status.ts. */
  className?: string;
}

export interface Cell {
  text?: string;
  /** Secondary line under the main text. */
  sub?: string;
  badges?: CellBadge[];
  strong?: boolean;
  muted?: boolean;
  /** Renders the value in the warning tone (used for stock below the minimum). */
  warn?: boolean;
}

/** Column key reserved for the row's Detalhes/Editar buttons. */
export const ACTIONS_KEY = '__acoes';

/**
 * A `DataTable` row. The design system passes the whole row object to
 * `renderCell`, so the cells travel inside it keyed by column.
 */
export interface ListRow {
  id: string;
  cells: Record<string, Cell>;
  onView: () => void;
  onEdit: () => void;
  [key: string]: unknown;
}

export interface ListModel {
  columns: DataTableColumn[];
  rows: ListRow[];
}

export const EMPTY_LIST: ListModel = { columns: [], rows: [] };
