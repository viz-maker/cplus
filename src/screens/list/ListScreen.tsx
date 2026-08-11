import { plural } from '../../lib/format';
import type { Cell, ListModel } from './types';

interface ListScreenProps {
  model: ListModel;
  search: string;
  searchPlaceholder: string;
  onSearch: (value: string) => void;
}

export function ListScreen({ model, search, searchPlaceholder, onSearch }: ListScreenProps) {
  const { columns, rows } = model;

  return (
    <section className="cp-card cp-card--clip" aria-label="Listagem">
      <div className="cp-card__header">
        <div style={{ position: 'relative', flex: 1, minWidth: 220, maxWidth: 380 }}>
          <span
            aria-hidden
            style={{
              position: 'absolute',
              left: 14,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 12,
              height: 12,
              border: '2px solid var(--cp-text-faint)',
              borderRadius: '50%',
              pointerEvents: 'none',
            }}
          />
          <input
            className="cp-input"
            type="search"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            style={{ padding: '10px 16px 10px 38px' }}
          />
        </div>
        <p style={{ fontSize: 13, color: 'var(--cp-text-muted)' }} aria-live="polite">
          {plural(rows.length, 'registo', 'registos')}
        </p>
      </div>

      {rows.length > 0 ? (
        <div className="cp-scroll-x">
          <table className="cp-table" style={{ minWidth: 640 }}>
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col.label} scope="col" style={{ textAlign: col.align }}>
                    {col.label}
                  </th>
                ))}
                <th scope="col" style={{ textAlign: 'right' }}>
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  {row.cells.map((c, i) => (
                    <td key={i} style={{ textAlign: c.align ?? 'left' }}>
                      <CellContent cell={c} />
                    </td>
                  ))}
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'inline-flex', gap: 8 }}>
                      <button
                        type="button"
                        className="cp-btn cp-btn--subtle cp-btn--sm"
                        onClick={row.onView}
                      >
                        Detalhes
                      </button>
                      <button
                        type="button"
                        className="cp-btn cp-btn--navy cp-btn--sm"
                        onClick={row.onEdit}
                      >
                        Editar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ padding: '48px 24px', textAlign: 'center' }}>
          <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--cp-navy)', marginBottom: 6 }}>
            Sem resultados
          </p>
          <p style={{ fontSize: 14, color: 'var(--cp-text-muted)' }}>
            Ajuste a pesquisa ou crie um novo registo.
          </p>
        </div>
      )}
    </section>
  );
}

function CellContent({ cell }: { cell: Cell }) {
  const badges = cell.badges ?? [];
  return (
    <>
      {cell.text && (
        <p style={{ fontSize: 14, fontWeight: cell.weight ?? 400, color: cell.color }}>
          {cell.text}
        </p>
      )}
      {cell.sub && (
        <p style={{ fontSize: 12, color: 'var(--cp-text-faint)', marginTop: 3 }}>{cell.sub}</p>
      )}
      {badges.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 6,
            justifyContent: cell.align === 'right' ? 'flex-end' : 'flex-start',
          }}
        >
          {badges.map((b, i) => (
            <span key={i} className="cp-badge" style={{ background: b.bg, color: b.fg }}>
              {b.text}
            </span>
          ))}
        </div>
      )}
    </>
  );
}
