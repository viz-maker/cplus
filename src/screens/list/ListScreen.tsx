import { useMemo, useState } from 'react';
import { Button, Card, DataTable, Search, Tag } from '@constructpluseu/react';
import { ACTIONS_KEY } from './types';
import { plural } from '../../lib/format';
import type { DataTableColumn, SortDirection } from '@constructpluseu/react';
import type { Cell, ListModel, ListRow } from './types';

interface ListScreenProps {
  model: ListModel;
  search: string;
  searchPlaceholder: string;
  onSearch: (value: string) => void;
}

export function ListScreen({ model, search, searchPlaceholder, onSearch }: ListScreenProps) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const columns: DataTableColumn[] = [
    ...model.columns,
    { key: ACTIONS_KEY, header: 'Ações', align: 'end' },
  ];

  const rows = useMemo(() => {
    if (!sortKey || !sortDirection) return model.rows;
    const factor = sortDirection === 'asc' ? 1 : -1;
    return [...model.rows].sort(
      (a, b) =>
        factor *
        (a.cells[sortKey]?.text ?? '').localeCompare(b.cells[sortKey]?.text ?? '', 'pt', {
          numeric: true,
          sensitivity: 'base',
        }),
    );
  }, [model.rows, sortKey, sortDirection]);

  return (
    <Card>
      <div className="cp-list-toolbar">
        <Search
          label={searchPlaceholder}
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          onClear={() => onSearch('')}
          placeholder={searchPlaceholder}
        />
        <p className="cp-body cp-muted" aria-live="polite">
          {plural(model.rows.length, 'registo', 'registos')}
        </p>
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(row) => (row as ListRow).id}
        sortKey={sortKey}
        sortDirection={sortDirection}
        onSortChange={(key, direction) => {
          setSortKey(direction ? key : null);
          setSortDirection(direction);
        }}
        emptyMessage="Sem resultados. Ajuste a pesquisa ou crie um novo registo."
        renderCell={(row, column) => renderCell(row as ListRow, column)}
      />
    </Card>
  );
}

function renderCell(row: ListRow, column: DataTableColumn) {
  if (column.key === ACTIONS_KEY) {
    return (
      <div className="cp-row-actions">
        <Button variant="secondary" size="sm" onClick={row.onView}>
          Detalhes
        </Button>
        <Button variant="primary" size="sm" onClick={row.onEdit}>
          Editar
        </Button>
      </div>
    );
  }

  const cell = row.cells[column.key];
  if (!cell) return null;
  return <CellContent cell={cell} align={column.align} />;
}

function CellContent({ cell, align }: { cell: Cell; align?: DataTableColumn['align'] }) {
  const badges = cell.badges ?? [];
  const tone = cell.warn ? 'cp-text-warning' : cell.muted ? 'cp-muted' : undefined;

  return (
    <>
      {cell.text && (
        <p className={[cell.strong ? 'cp-strong' : undefined, tone].filter(Boolean).join(' ')}>
          {cell.text}
        </p>
      )}
      {cell.sub && <p className="cp-cell-sub">{cell.sub}</p>}
      {badges.length > 0 && (
        <div className={align === 'end' ? 'cp-badge-row cp-badge-row--end' : 'cp-badge-row'}>
          {badges.map((b, i) => (
            <Tag key={i} status={b.status} className={b.className}>
              {b.text}
            </Tag>
          ))}
        </div>
      )}
    </>
  );
}
