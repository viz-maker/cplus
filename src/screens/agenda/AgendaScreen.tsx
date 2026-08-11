import { useMemo, useState } from 'react';
import { Button, Card, Tabs } from '@constructpluseu/react';
import { eventsOn } from '../../domain/selectors';
import { varsOf } from '../../domain/status';
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

/**
 * The design system has no calendar component, so the grids stay hand-built.
 * They are styled entirely with design-system tokens, so they follow both
 * themes; only the shell around them (Card, Tabs, Button) comes from the DS.
 */
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

  function viewFor(m: CalendarMode) {
    if (m === 'Dia' || m === 'Semana') {
      return (
        <TimeGrid
          days={daysForMode(cursor, m)}
          agenda={agenda}
          todayIso={todayIso}
          minWidth={m === 'Dia' ? '100%' : '860px'}
          onOpenEvent={onOpenEvent}
          onCreateAt={onCreateAt}
        />
      );
    }
    if (m === 'Mês') {
      return (
        <MonthGrid
          cursor={cursor}
          agenda={agenda}
          todayIso={todayIso}
          onOpenEvent={onOpenEvent}
          onCreateAt={onCreateAt}
        />
      );
    }
    return (
      <YearGrid
        year={cursor.getFullYear()}
        agenda={agenda}
        onOpenMonth={(month) => {
          setCursor(new Date(cursor.getFullYear(), month, 1));
          setMode('Mês');
        }}
      />
    );
  }

  return (
    <Card>
      <div className="cp-cal-toolbar">
        <Button
          variant="secondary"
          size="sm"
          aria-label="Período anterior"
          onClick={() => setCursor((c) => shiftCursor(c, mode, -1))}
        >
          ‹
        </Button>
        <Button
          variant="secondary"
          size="sm"
          aria-label="Período seguinte"
          onClick={() => setCursor((c) => shiftCursor(c, mode, 1))}
        >
          ›
        </Button>
        <Button variant="secondary" size="sm" onClick={() => setCursor(today)}>
          Hoje
        </Button>
        <p className="cp-cal-range">{label}</p>
      </div>

      <Tabs
        aria-label="Vista do calendário"
        value={mode}
        onValueChange={(id) => setMode(id as CalendarMode)}
        items={CALENDAR_MODES.map((m) => ({
          id: m,
          label: m,
          content: mode === m ? viewFor(m) : null,
        }))}
      />
    </Card>
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
        <div className="cp-cal-head" style={{ gridTemplateColumns: template }}>
          <div />
          {days.map((d) => (
            <div key={iso(d)} className="cp-cal-head__cell">
              <p className="cp-cal-dow">{DOWS[dowIndex(d)]}</p>
              <p className={iso(d) === todayIso ? 'cp-cal-daynum is-today' : 'cp-cal-daynum'}>
                {d.getDate()}
              </p>
            </div>
          ))}
        </div>

        {HOURS.map((hour) => (
          <div key={hour} className="cp-cal-row" style={{ gridTemplateColumns: template }}>
            <div className="cp-cal-hour">{pad(hour)}:00</div>
            {days.map((d) => {
              const date = iso(d);
              const slotEvents = eventsOn(agenda, date).filter(
                (e) => Number(e.inicioHora.slice(0, 2)) === hour,
              );
              return (
                <div
                  key={date}
                  className={date === todayIso ? 'cp-cal-cell is-today' : 'cp-cal-cell'}
                  title="Criar marcação"
                  onClick={() => onCreateAt(date, `${pad(hour)}:00`)}
                >
                  {slotEvents.map((e) => {
                    const tone = varsOf(e.estado);
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
                        <span className="cp-event__title" style={{ color: tone.fg }}>
                          {e.descricao}
                        </span>
                        <span className="cp-event__time">
                          {e.inicioHora}–{e.fimHora || '?'}
                        </span>
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
        <div className="cp-cal-monthhead">
          {DOWS.map((d) => (
            <div key={d} className="cp-cal-dow">
              {d}
            </div>
          ))}
        </div>

        {weeks.map((week, wi) => (
          <div key={wi} className="cp-cal-week">
            {week.map((d) => {
              const date = iso(d);
              const dayEvents = eventsOn(agenda, date);
              const outside = d.getMonth() !== cursor.getMonth();
              const isToday = date === todayIso;
              const hidden = dayEvents.length - MONTH_CELL_LIMIT;

              return (
                <div
                  key={date}
                  className={outside ? 'cp-cal-day is-outside' : 'cp-cal-day'}
                  onClick={() => onCreateAt(date, '09:00')}
                >
                  <span className={isToday ? 'cp-cal-daypill is-today' : 'cp-cal-daypill'}>
                    {d.getDate()}
                  </span>

                  {dayEvents.slice(0, MONTH_CELL_LIMIT).map((e) => {
                    const tone = varsOf(e.estado);
                    return (
                      <button
                        key={e.id}
                        type="button"
                        className="cp-event cp-event--compact"
                        style={{ background: tone.bg }}
                        onClick={(ev) => {
                          ev.stopPropagation();
                          onOpenEvent(e);
                        }}
                      >
                        <span className="cp-event__title" style={{ color: tone.fg }}>
                          {e.inicioHora} {e.descricao}
                        </span>
                      </button>
                    );
                  })}

                  {hidden > 0 && <p className="cp-cal-more">+{hidden} marcações</p>}
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
    <div className="cp-cal-year">
      {months.map((m) => {
        const count = agenda.filter((a) => {
          const d = fromIso(a.inicioData);
          return d.getFullYear() === year && d.getMonth() === m.month;
        }).length;

        return (
          <button
            key={m.month}
            type="button"
            className="cp-cal-minimonth"
            onClick={() => onOpenMonth(m.month)}
          >
            <span className="cp-cal-minimonth__head">
              <span className="cp-cal-minimonth__name">{m.name}</span>
              {count > 0 && <span className="cp-cal-minimonth__count">{count} marc.</span>}
            </span>

            <span className="cp-cal-minimonth__grid">
              {m.cells.map((d, i) => {
                const busy = d ? eventsOn(agenda, iso(d)).length > 0 : false;
                return (
                  <span
                    key={i}
                    className={busy ? 'cp-cal-minicell is-busy' : 'cp-cal-minicell'}
                  >
                    {d ? d.getDate() : ''}
                  </span>
                );
              })}
            </span>
          </button>
        );
      })}
    </div>
  );
}
