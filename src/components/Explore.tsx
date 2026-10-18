import { L } from '../i18n';
import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight, Compass, X } from 'lucide-react';
import { CLASS_INFO, pvToSan } from '../coach';
import { formatScore, type EngineLine } from '../engine';
import { moveLabel, sanToWords } from '../lib/variation';
import type { ExploreView } from '../lib/explore';
import type { CachedEval, classifyByEval } from '../lib/useLiveEval';
import { ClassIcon } from './ui';

type LastClass = (ReturnType<typeof classifyByEval> & { before: CachedEval; after: CachedEval }) | null;

/** Leiste über dem Brett, solange erkundet wird */
export function ExploreBar({ ex, onClose }: { ex: ExploreView; onClose: () => void }) {
  if (!ex.active || !ex.startFen) return null;
  const n = ex.sans.length;
  const cur = ex.current;
  return (
    <div className="var-bar explore-bar">
      <span className="var-icon">
        <Compass size={18} />
      </span>
      <div className="var-info">
        <b>{L('Erkunden – beide Seiten frei', 'Explore – move both sides')}</b>
        <span>{cur ? `${moveLabel(ex.startFen, ex.idx - 1, true)} ${cur.san} – ${cur.color === 'w' ? L('Weiß', 'White') : L('Schwarz', 'Black')}: ${sanToWords(cur.san)}` : L('Ausgangsstellung – zieh einfach eine Figur', 'Starting position – just move a piece')}</span>
      </div>
      <div className="var-nav">
        <button onClick={() => ex.go(0)} disabled={ex.idx === 0} title={L('Zur Ausgangsstellung', 'To the starting position')}>
          <ChevronFirst size={17} />
        </button>
        <button onClick={() => ex.go(ex.idx - 1)} disabled={ex.idx === 0} title={L('Zurück (←)', 'Back (←)')}>
          <ChevronLeft size={17} />
        </button>
        <span className="var-count">
          {ex.idx}/{n}
        </span>
        <button onClick={() => ex.go(ex.idx + 1)} disabled={ex.idx >= n} title={L('Vor (→)', 'Forward (→)')}>
          <ChevronRight size={17} />
        </button>
        <button onClick={() => ex.go(n)} disabled={ex.idx >= n} title={L('Ende', 'End')}>
          <ChevronLast size={17} />
        </button>
      </div>
      <button className="var-close" onClick={onClose} title={L('Erkunden beenden', 'Stop exploring')}>
        <X size={15} /> {L('Zur Partie', 'Back to game')}
      </button>
    </div>
  );
}

/** Bewertung, beste Fortsetzungen und erkundete Züge im Seitenpanel */
export function ExplorePanel({ ex, lines, top, lastClass }: { ex: ExploreView; lines: EngineLine[]; top: { cp: number; mate: number | null; depth?: number } | null; lastClass: LastClass }) {
  if (!ex.active || !ex.fen || !ex.startFen) return null;
  const fen = ex.fen;
  const sign = fen.split(' ')[1] === 'w' ? 1 : -1;
  const evalText = top ? (top.mate !== null ? (top.mate === 0 ? 'Matt' : `#${top.mate}`) : `${top.cp > 0 ? '+' : ''}${(top.cp / 100).toFixed(2)}`) : '…';

  /** Fortsetzung übernehmen: Züge ans Ende der Erkundung hängen und den ersten zeigen */
  const takeLine = (pv: string[]) => {
    const sans = pvToSan(fen, pv, 10);
    if (!sans.length) return;
    ex.open(ex.startFen!, [...ex.sans.slice(0, ex.idx), ...sans], ex.idx + 1);
  };

  return (
    <div className="explore-panel">
      <div className="xp-head">
        <span className="xp-eval">{evalText}</span>
        <div className="xp-sub">
          <b>{L('Stockfish-Bewertung', 'Stockfish evaluation')}</b>
          <span>{lines[0] ? L(`Tiefe ${lines[0].depth} · Sicht Weiß`, `Depth ${lines[0].depth} · White's view`) : L('rechnet …', 'thinking …')}</span>
        </div>
      </div>
      {lastClass && ex.current && (
        <div className="xp-last">
          <ClassIcon c={lastClass.c} size={20} />
          <span>
            <b>{ex.current.san}</b> <span style={{ color: CLASS_INFO[lastClass.c].color }}>{CLASS_INFO[lastClass.c].label}</span>
          </span>
          <span className="eval-change">
            {formatScore(lastClass.before.cp, lastClass.before.mate)} → {formatScore(lastClass.after.cp, lastClass.after.mate)}
          </span>
        </div>
      )}
      {ex.current && !lastClass && (
        <div className="xp-last muted-text">
          <span className="dot-wait" /> {ex.current.san} {L('wird bewertet …', 'is being evaluated …')}
        </div>
      )}
      <div className="xp-lines">
        {lines.map((l, i) => {
          const sc = l.mate !== null ? `#${l.mate * sign}` : `${l.score * sign > 0 ? '+' : ''}${((l.score * sign) / 100).toFixed(2)}`;
          return (
            <div key={i} className="engine-line">
              <button className={`pill ${l.score * sign >= 0 ? 'w' : 'b'}`} onClick={() => takeLine(l.pv.slice(0, 1))} title={L('Diesen Zug spielen', 'Play this move')}>
                {sc}
              </button>
              <button className="pv" onClick={() => takeLine(l.pv)} title={L('Fortsetzung übernehmen und mit ▶ durchgehen', 'Take this line and step through it with ▶')}>
                {pvToSan(fen, l.pv, 8).join(' ')}
              </button>
            </div>
          );
        })}
      </div>
      <div className="xp-moves">
        <span className="xp-label">{L('Erkundet:', 'Explored:')}</span>
        {ex.sans.length === 0 && <span className="muted-text">{L('noch keine Züge – zieh für beide Seiten', 'no moves yet – move for both sides')}</span>}
        {ex.sans.map((san, i) => (
          <button key={i} className={`xp-move ${i === ex.idx - 1 ? 'on' : ''}`} onClick={() => ex.go(i + 1)} title={sanToWords(san)}>
            {moveLabel(ex.startFen!, i) && <i>{moveLabel(ex.startFen!, i)}</i>}
            {san}
          </button>
        ))}
      </div>
    </div>
  );
}
