import { L } from '../i18n';
import { ChevronFirst, ChevronLeft, ChevronRight, ChevronLast, Compass, Eye, X } from 'lucide-react';
import { moveLabel, sanToWords, type Variation, type VariationView } from '../lib/variation';

/** Zugfolge als klickbare Chips (z. B. in einer Coach-Nachricht) */
export function VariationLine({ v, onOpen, active, activeIdx }: { v: Variation; onOpen: (v: Variation, idx: number) => void; active?: boolean; activeIdx?: number }) {
  return (
    <div className={`var-line ${active ? 'active' : ''}`}>
      <button className="var-open" onClick={() => onOpen(v, 1)} title={L('Auf dem Brett durchklicken', 'Step through it on the board')}>
        <Eye size={14} /> {v.title ?? L('Variante', 'Variation')}
      </button>
      <span className="var-moves">
        {v.sans.map((san, i) => (
          <button key={i} className={`var-move ${active && activeIdx === i + 1 ? 'on' : ''}`} onClick={() => onOpen(v, i + 1)} title={sanToWords(san)}>
            {moveLabel(v.startFen, i) && <i>{moveLabel(v.startFen, i)}</i>}
            {san}
          </button>
        ))}
      </span>
    </div>
  );
}

/** Kompakte Leiste anstelle der oberen Spielerzeile, solange eine Variante angezeigt wird */
export function VariationBar({ vv, backLabel = L('Zurück', 'Back'), onExplore }: { vv: VariationView; backLabel?: string; onExplore?: () => void }) {
  if (!vv.active || !vv.variation) return null;
  const n = vv.variation.sans.length;
  const cur = vv.current;
  return (
    <div className="var-bar">
      <span className="var-icon">
        <Eye size={18} />
      </span>
      <div className="var-info">
        <b>{vv.variation.title ?? L('Variante', 'Variation')}</b>
        <span>{cur ? `${moveLabel(vv.variation.startFen, vv.idx - 1, true)} ${cur.san} – ${cur.color === 'w' ? L('Weiß', 'White') : L('Schwarz', 'Black')}: ${sanToWords(cur.san)}` : L('Ausgangsstellung – klick auf ▶', 'Starting position – click ▶')}</span>
      </div>
      <div className="var-nav">
        <button onClick={() => vv.go(0)} disabled={vv.idx === 0} title={L('Anfang', 'Start')}>
          <ChevronFirst size={17} />
        </button>
        <button onClick={() => vv.go(vv.idx - 1)} disabled={vv.idx === 0} title={L('Zurück (←)', 'Back (←)')}>
          <ChevronLeft size={17} />
        </button>
        <span className="var-count">
          {vv.idx}/{n}
        </span>
        <button onClick={() => vv.go(vv.idx + 1)} disabled={vv.idx >= n} title={L('Weiter (→)', 'Forward (→)')}>
          <ChevronRight size={17} />
        </button>
        <button onClick={() => vv.go(n)} disabled={vv.idx >= n} title={L('Ende', 'End')}>
          <ChevronLast size={17} />
        </button>
      </div>
      {onExplore && (
        <button className="var-close" onClick={onExplore} title={L('Ab dieser Stellung frei weiterziehen', 'Play on freely from this position')}>
          <Compass size={15} /> {L('Erkunden', 'Explore')}
        </button>
      )}
      <button className="var-close" onClick={vv.close} title={L('Variante schließen', 'Close variation')}>
        <X size={15} /> {backLabel}
      </button>
    </div>
  );
}
