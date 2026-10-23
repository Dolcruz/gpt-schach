import { L } from '../i18n';
import { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import { BOARDS, PIECE_SETS, applyAppearance, getBoard, getPieceSet } from '../lib/appearance';

const PREVIEW = ['wK', 'wQ', 'wN', 'bB', 'bR', 'bP'];

/** Auswahl von Figurensatz und Brettfarben */
export function AppearanceDialog({ onClose }: { onClose: () => void }) {
  const [set, setSet] = useState(getPieceSet);
  const [board, setBoard] = useState(getBoard);
  const b = BOARDS.find((x) => x.id === board) ?? BOARDS[0];

  useEffect(() => {
    applyAppearance(set, board);
  }, [set, board]);
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, [onClose]);

  return (
    <div className="appearance-overlay" onClick={onClose}>
      <div className="appearance" onClick={(e) => e.stopPropagation()}>
        <header>
          <h2>{L('Brett & Figuren', 'Board & pieces')}</h2>
          <button className="icon-btn" onClick={onClose} title={L('Schließen', 'Close')}>
            <X size={18} />
          </button>
        </header>
        <div className="field-label">{L('Figuren', 'Pieces')}</div>
        <div className="set-grid">
          {PIECE_SETS.map((s) => (
            <button key={s.id} className={`set-card ${set === s.id ? 'on' : ''}`} onClick={() => setSet(s.id)}>
              <span className="set-preview">
                {PREVIEW.map((p, i) => (
                  <i key={p} style={{ background: i % 2 ? b.dark : b.light }}>
                    <img src={`/pieces/${s.id}/${p}.svg`} alt="" draggable={false} />
                  </i>
                ))}
              </span>
              <span className="set-name">
                {set === s.id && <Check size={14} />} {s.name}
              </span>
            </button>
          ))}
        </div>
        <div className="field-label">{L('Brett', 'Board')}</div>
        <div className="board-grid">
          {BOARDS.map((x) => (
            <button key={x.id} className={`board-card ${board === x.id ? 'on' : ''}`} onClick={() => setBoard(x.id)} title={x.name}>
              <span style={{ background: `repeating-conic-gradient(${x.dark} 0 25%, ${x.light} 0 50%) 0 0 / 50% 50%` }} />
              <small>{x.name}</small>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
