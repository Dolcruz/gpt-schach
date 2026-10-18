import { L } from '../i18n';
import { useState } from 'react';
import type { Classification } from '../coach';
import { CLASS_INFO } from '../coach';

interface Props {
  /** Bedenkzeit je Halbzug (ms) */
  times: number[];
  /** Restzeit des Ziehenden nach jedem Halbzug (ms) */
  clocks?: number[];
  sans: string[];
  /** Nur die Züge dieser Farbe zeigen */
  side: 'w' | 'b';
  startsWhite: boolean;
  classes?: (Classification | null)[];
  cursor: number;
  onSelect: (ply: number) => void;
}

const fmt = (ms: number) => (ms < 10_000 ? (ms / 1000).toFixed(1) : Math.round(ms / 1000).toString()) + ' s';
const clockFmt = (ms: number) => `${Math.floor(ms / 60000)}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, '0')}`;

/** Zeitverbrauch pro eigenem Zug – Fehler/Patzer farbig markiert */
export function TimeBars({ times, clocks, sans, side, startsWhite, classes, cursor, onSelect }: Props) {
  const [hover, setHover] = useState<number | null>(null);
  const own = times.map((t, i) => ({ t, i })).filter(({ i }) => ((startsWhite ? i % 2 === 0 : i % 2 === 1) ? 'w' : 'b') === side);
  if (!own.length) return null;
  const max = Math.max(...own.map((o) => o.t), 1000);
  const total = own.reduce((a, o) => a + o.t, 0);
  const slowest = own.reduce((a, o) => (o.t > a.t ? o : a), own[0]);
  const h = hover !== null ? own.find((o) => o.i === hover) : null;

  return (
    <div className="time-bars">
      <div className="tb-head">
        <b>{L('Deine Bedenkzeit', 'Your thinking time')}</b>
        <span>
          Ø {fmt(total / own.length)} · {L('längster Zug', 'longest move')} {Math.floor(slowest.i / 2) + 1}. {sans[slowest.i]} ({fmt(slowest.t)})
        </span>
      </div>
      <div className="tb-plot" onMouseLeave={() => setHover(null)}>
        {own.map(({ t, i }) => {
          const c = classes?.[i];
          const bad = c === 'mistake' || c === 'blunder';
          return (
            <button
              key={i}
              className={`tb-bar ${i === cursor - 1 ? 'cur' : ''}`}
              style={{ height: `${Math.max(4, (t / max) * 100)}%`, background: bad ? CLASS_INFO[c!].color : c === 'inaccuracy' ? CLASS_INFO.inaccuracy.color : undefined }}
              onMouseEnter={() => setHover(i)}
              onClick={() => onSelect(i + 1)}
              aria-label={`${L('Zug', 'Move')} ${Math.floor(i / 2) + 1}: ${fmt(t)}`}
            />
          );
        })}
        {h && (
          <div className="tooltip tb-tip" style={{ left: `${((own.indexOf(h) + 0.5) / own.length) * 100}%` }}>
            <b>
              {Math.floor(h.i / 2) + 1}. {sans[h.i]} · {fmt(h.t)}
            </b>
            <span>
              {clocks?.[h.i] !== undefined ? `${L('Restzeit', 'Time left')} ${clockFmt(clocks[h.i])}` : ''}
              {classes?.[h.i] ? ` · ${CLASS_INFO[classes[h.i]!].label}` : ''}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
