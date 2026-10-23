import { L } from '../i18n';
import { ChevronDown } from 'lucide-react';
import { OPENINGS, familyLabel, type Opening } from '../lib/openings';

const FAMILIES = [...new Set(OPENINGS.map((o) => o.family))] as Opening['family'][];

/** Auswahl, welche Eröffnung der Bot spielen soll */
export function OpeningSelect({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const o = OPENINGS.find((x) => x.id === value);
  return (
    <div className="opening-select">
      <div className="foot-row">
        <span className="foot-label">{L('Eröffnung', 'Opening')}</span>
        <div className="select-box">
          <select value={o ? value : ''} onChange={(e) => onChange(e.target.value)}>
            <option value="">{L('Frei – Bot entscheidet', 'Free – bot decides')}</option>
            {FAMILIES.map((f) => (
              <optgroup key={f} label={familyLabel(f)}>
                {OPENINGS.filter((x) => x.family === f).map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <ChevronDown size={14} />
        </div>
      </div>
      {o && (
        <p className="opening-hint">
          {o.moves.slice(0, 8).map((m, i) => (i % 2 === 0 ? `${i / 2 + 1}.${m}` : m)).join(' ')}
          {o.moves.length > 8 ? ' …' : ''}
          <span>{L('Der Bot spielt seine Züge aus dieser Linie, solange du ihr folgst.', 'The bot plays its moves from this line as long as you follow it.')}</span>
        </p>
      )}
    </div>
  );
}
