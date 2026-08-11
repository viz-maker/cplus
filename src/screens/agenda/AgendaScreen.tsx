import { useMemo, useState } from 'react';
import { eventsOn } from '../../domain/selectors';
import { toneOf } from '../../domain/status';
import { CALENDAR_MODES } from '../../domain/types';
import { DOWS, dowIndex, fromIso, iso, pad } from '../../lib/date';
import { HOURS, daysForMode, monthWeeks, rangeLabel, shiftCursor, yearGrid } from './calendar';
import type { CalendarMode, Marcacao } from '../../domain/types';

interface AgendaScreenProps {
  agenda: Marcacao[];
  today: Date;
  initialMode: CalendarMode;
  /** Open the editor for an existing marcação. */
  onOpenEvent: (event: Marcacao) => void;
  /** Open a blank editor pre-filled with the slot that was clicked. */
  onCreateAt: (date: string, hora: string) => void;
}

export function AgendaScreen({
  agenda,
  today,
  initialMode,
  onOpenEvent,
  onCreateAt,
}: AgendaScreenProps) {
  const [mode, setMode] = useState<CalendarMode>(initialMode);
  const [cursor, setCursor] = useState<Date>(today);

  const todayIso = iso(today);
  const label = useMemo(() => rangeLabel(cursor, mode), [cursor, mode]);

  return (
    <section className="cp-card cp-card--clip" aria-label="Agenda">
      <div className="cp-card__header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <button
            type="button"
            className="cp-btn cp-btn--subtle cp-btn--icon-lg"
            aria-label="Período anterior"
            onClick={() => setCursor((c) => shiftCursor(c, mode, -1))}
          >
            ‹
          </button>
          <button
            type="button"
            className="cp-btn cp-btn--subtle cp-btn--icon-lg"
            aria-label="Período seguinte"
            onClick={() => setCursor((c) => shiftCursor(c, mode, 1))}
          >
            ›
          </button>
          <button
            type="button"
            className="cp-btn cp-btn--subtle"
            style={{ padding: '8px 16px', fontSize: 13 }}
            onClick={() => setCursor(today)}
          >
            Hoje
          </button>
          <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--cp-navy)', marginLeft: 8 }}>
            {label}
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Vista do calendário"
          style={{
            display: 'flex',
            gap: 4,
            padding: 4,
            background: 'var(--cp-surface-alt)',
            borderRadius: 'var(--cp-radius)',
          }}
        >
          {CALENDAR_MODES.map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              className={mode === m ? 'cp-cal-mode is-active' : 'cp-cal-mode'}
              onClick={() => setMode(m)}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {(mode === 'Dia' || mode === 'Semana') && (
        <TimeGrid
          days={daysForMode(cursor, mode)}
          agenda={agenda}
          todayIso={todayIso}
          minWidth={mode === 'Dia' ? '100%' : '860px'}
          onOpenEvent={onOpenEvent}
          onCreateAt={onCreateAt}
        />
      )}

      {mode === 'Mês' && (
        <MonthGrid
          cursor={cursor}
          agenda={agenda}
          todayIso={todayIso}
          onOpenEvent={onOpenEvent}
          onCreateAt={onCreateAt}
        />
      )}

      {mode === 'Ano' && (
        <YearGrid
          year={cursor.getFullYear()}
          agenda={agenda}
          onOpenMonth={(month) => {
            setCursor(new Date(cursor.getFullYear(), month, 1));
            setMode('Mês');
          }}
        />
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ day / week */

interface TimeGridProps {
  days: Date[];
  agenda: Marcacao[];
  todayIso: string;
  minWidth: string;
  onOpenEvent: (e: Marcacao) => void;
  onCreateAt: (date: string, hora: string) => void;
}

function TimeGrid({ days, agenda, todayIso, minWidth, onOpenEvent, onCreateAt }: TimeGridProps) {
  const template = `64px repeat(${days.length}, minmax(0, 1fr))`;

  return (
    <div className="cp-scroll-x">
      <div style={{ minWidth }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: template,
            borderBottom: '1px solid var(--cp-border)',
            position: 'sticky',
            top: 0,
            background: 'var(--cp-surface)',
            zIndex: 2,
          }}
        >
          <div />
          {days.map((d) => (
            <div
              key={iso(d)}
              style={{
                padding: '12px 8px',
                textAlign: 'center',
                borderLeft: '1px solid var(--cp-border-subtle)',
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  color: 'var(--cp-text-faint)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                {DOWS[dowIndex(d)]}
              </p>
              <p
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  marginTop: 4,
                  color: iso(d) === todayIso ? 'var(--cp-accent-active)' : 'var(--cp-navy)',
                }}
              >
                {d.getDate()}
              </p>
            </div>
          ))}
        </div>

        {HOURS.map((hour) => (
          <div
            key={hour}
            style={{
              display: 'grid',
              gridTemplateColumns: template,
              borderBottom: '1px solid var(--cp-border-subtle)',
            }}
          >
            <div
              style={{
                padding: 8,
                textAlign: 'right',
                fontSize: 11,
                color: 'var(--cp-text-faint)',
              }}
            >
              {pad(hour)}:00
            </div>
            {days.map((d) => {
              const date = iso(d);
              const slotEvents = eventsOn(agenda, date).filter(
                (e) => Number(e.inicioHora.slice(0, 2)) === hour,
              );
              return (
                <div
                  key={date}
                  className="cp-cal-cell"
                  title="Criar marcação"
                  onClick={() => onCreateAt(date, `${pad(hour)}:00`)}
                  style={{
                    minHeight: 56,
                    borderLeft: '1px solid var(--cp-border-subtle)',
                    padding: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3,
                    background: date === todayIso ? '#FBFDFE' : 'var(--cp-surface)',
                  }}
                >
                  {slotEvents.map((e) => {
                    const tone = toneOf(e.estado);
                    return (
                      <button
                        key={e.id}
                        type="button"
                        className="cp-event"
                        style={{ background: tone.bg, borderLeftColor: tone.fg }}
                        onClick={(ev) => {
                          ev.stopPropagation();
                          onOpenEvent(e);
                        }}
                      >
                        <p
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: tone.fg,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {e.descricao}
                        </p>
                        <p style={{ fontSize: 10, color: 'var(--cp-text-muted)', marginTop: 2 }}>
                          {e.inicioHora}–{e.fimHora || '?'}
                        </p>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------- month */

interface MonthGridProps {
  cursor: Date;
  agenda: Marcacao[];
  todayIso: string;
  onOpenEvent: (e: Marcacao) => void;
  onCreateAt: (date: string, hora: string) => void;
}

/** Events shown inline in a month cell before collapsing into a "+N" line. */
const MONTH_CELL_LIMIT = 3;

function MonthGrid({ cursor, agenda, todayIso, onOpenEvent, onCreateAt }: MonthGridProps) {
  const weeks = useMemo(() => monthWeeks(cursor), [cursor]);

  return (
    <div className="cp-scroll-x">
      <div style={{ minWidth: 700 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
            borderBottom: '1px solid var(--cp-border)',
          }}
        >
          {DOWS.map((d) => (
            <div
              key={d}
              style={{
                padding: 10,
                textAlign: 'center',
                fontSize: 11,
                fontWeight: 500,
                color: 'var(--cp-text-faint)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              {d}
            </div>
          ))}
        </div>

        {weeks.map((week, wi) => (
          <div
            key={wi}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))' }}
          >
            {week.map((d) => {
              const date = iso(d);
              const dayEvents = eventsOn(agenda, date);
              const outside = d.getMonth() !== cursor.getMonth();
              const isToday = date === todayIso;
              const hidden = dayEvents.length - MONTH_CELL_LIMIT;

              return (
                <div
                  key={date}
                  className="cp-cal-cell"
                  onClick={() => onCreateAt(date, '09:00')}
                  style={{
                    minHeight: 112,
                    borderTop: '1px solid var(--cp-border-subtle)',
                    borderLeft: '1px solid var(--cp-border-subtle)',
                    padding: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                    background: outside ? '#FBFCFE' : 'var(--cp-surface)',
                  }}
                >
                  <span
                    style={{
                      alignSelf: 'flex-start',
                      padding: '2px 7px',
                      borderRadius: 'var(--cp-radius-pill)',
                      fontSize: 13,
                      fontWeight: 600,
                      background: isToday ? 'var(--cp-accent)' : 'transparent',
                      color: isToday
                        ? '#fff'
                        : outside
                          ? 'var(--cp-text-faint)'
                          : 'var(--cp-navy)',
                    }}
                  >
                    {d.getDate()}
                  </span>

                  {dayEvents.slice(0, MONTH_CELL_LIMIT).map((e) => {
                    const tone = toneOf(e.estado);
                    return (
                      <button
                        key={e.id}
                        type="button"
                        className="cp-event"
                        style={{
                          background: tone.bg,
                          borderLeft: 'none',
                          padding: '3px 7px',
                        }}
                        onClick={(ev) => {
                          ev.stopPropagation();
                          onOpenEvent(e);
                        }}
                      >
                        <p
                          style={{
                            fontSize: 11,
                            fontWeight: 500,
                            color: tone.fg,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {e.inicioHora} {e.descricao}
                        </p>
                      </button>
                    );
                  })}

                  {hidden > 0 && (
                    <p style={{ fontSize: 10, fontWeight: 500, color: 'var(--cp-text-faint)' }}>
                      +{hidden} marcações
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------ year */

interface YearGridProps {
  year: number;
  agenda: Marcacao[];
  onOpenMonth: (month: number) => void;
}

function YearGrid({ year, agenda, onOpenMonth }: YearGridProps) {
  const months = useMemo(() => yearGrid(year), [year]);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
        gap: 16,
        padding: 20,
      }}
    >
      {months.map((m) => {
        const count = agenda.filter((a) => {
          const d = fromIso(a.inicioData);
          return d.getFullYear() === year && d.getMonth() === m.month;
        }).length;

        return (
          <button
            key={m.month}
            type="button"
            className="cp-cal-cell"
            onClick={() => onOpenMonth(m.month)}
            style={{
              border: '1px solid var(--cp-border)',
              borderRadius: 'var(--cp-radius)',
              padding: 12,
              background: 'var(--cp-surface)',
              textAlign: 'left',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginBottom: 8,
              }}
            >
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--cp-navy)',
                  textTransform: 'capitalize',
                }}
              >
                {m.name}
              </p>
              {count > 0 && (
                <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--cp-accent-active)' }}>
                  {count} marc.
                </span>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
              {m.cells.map((d, i) => {
                const busy = d ? eventsOn(agenda, iso(d)).length > 0 : false;
                return (
                  <div
                    key={i}
                    style={{
                      aspectRatio: '1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 10,
                      borderRadius: 'var(--cp-radius)',
                      background: busy ? 'rgba(62,201,142,0.18)' : 'transparent',
                      color: busy
                        ? 'var(--cp-accent-active)'
                        : d
                          ? 'var(--cp-text-muted)'
                          : 'var(--cp-border-strong)',
                    }}
                  >
                    {d ? d.getDate() : ''}
                  </div>
                );
              })}
            </div>
          </button>
        );
      })}
    </div>
  );
}
