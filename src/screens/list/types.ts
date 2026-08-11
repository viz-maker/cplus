export interface Badge {
  text: string;
  bg: string;
  fg: string;
}

export interface Cell {
  text?: string;
  /** Secondary line under the main text. */
  sub?: string;
  badges?: Badge[];
  align?: 'left' | 'right';
  weight?: 400 | 600;
  color?: string;
}

export interface Column {
  label: string;
  align: 'left' | 'right';
}

export interface ListRow {
  id: string;
  cells: Cell[];
  onView: () => void;
  onEdit: () => void;
}

export interface ListModel {
  columns: Column[];
  rows: ListRow[];
}

export const EMPTY_LIST: ListModel = { columns: [], rows: [] };
