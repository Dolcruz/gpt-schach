import { ChevronFirst, ChevronLeft, ChevronRight, ChevronLast, Compass, Eye, X } from 'lucide-react';
import { moveLabel, sanToWords, type Variation, type VariationView } from '../lib/variation';

/** Zugfolge als klickbare Chips (z. B. in einer Coach-Nachricht) */
export function VariationLine({ v, onOpen, active, activeIdx }: { v: Variation; onOpen: (v: Variation, idx: number) => void; active?: boolean; activeIdx?: number }) {
  return (
    <div className={`var-line ${active ? 'active' : ''}`}>
      <button className="var-open" onClick={() => onOpen(v, 1)} title="Auf dem Brett durchklicken">
        <Eye size={14} /> {v.title ?? 'Variante'}
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
export function VariationBar({ vv, backLabel = 'Zurück', onExplore }: { vv: VariationView; backLabel?: string; onExplore?: () => void }) {
  if (!vv.active || !vv.variation) return null;
  const n = vv.variation.sans.length;
  const cur = vv.current;
  return (
    <div className="var-bar">
      <span className="var-icon">
        <Eye size={18} />
      </span>
      <div className="var-info">
        <b>{vv.variation.title ?? 'Variante'}</b>
        <span>{cur ? `${moveLabel(vv.variation.startFen, vv.idx - 1, true)} ${cur.san} – ${cur.color === 'w' ? 'Weiß' : 'Schwarz'}: ${sanToWords(cur.san)}` : 'Ausgangsstellung – klick auf ▶'}</span>
      </div>
      <div className="var-nav">
        <button onClick={() => vv.go(0)} disabled={vv.idx === 0} title="Anfang">
          <ChevronFirst size={17} />
        </button>
        <button onClick={() => vv.go(vv.idx - 1)} disabled={vv.idx === 0} title="Zurück (←)">
          <ChevronLeft size={17} />
        </button>
        <span className="var-count">
          {vv.idx}/{n}
        </span>
        <button onClick={() => vv.go(vv.idx + 1)} disabled={vv.idx >= n} title="Weiter (→)">
          <ChevronRight size={17} />
        </button>
        <button onClick={() => vv.go(n)} disabled={vv.idx >= n} title="Ende">
          <ChevronLast size={17} />
        </button>
      </div>
      {onExplore && (
        <button className="var-close" onClick={onExplore} title="Ab dieser Stellung frei weiterziehen">
          <Compass size={15} /> Erkunden
        </button>
      )}
      <button className="var-close" onClick={vv.close} title="Variante schließen">
        <X size={15} /> {backLabel}
      </button>
    </div>
  );
}
