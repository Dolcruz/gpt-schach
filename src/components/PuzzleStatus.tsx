import { Check, Eye, X } from 'lucide-react';
import { Piece } from './ui';
import type { PuzzleStatus as Status } from '../lib/usePuzzle';

interface Props {
  status: Status | 'loading';
  color: 'w' | 'b';
  failed?: boolean;
  delta?: number | null;
  error?: string;
}

export function PuzzleStatus({ status, color, failed, delta, error }: Props) {
  const side = color === 'w' ? 'Weiß' : 'Schwarz';
  const ratingText = delta !== null && delta !== undefined ? `Puzzle-Rating ${delta >= 0 ? '+' : ''}${delta}` : null;

  if (status === 'loading') return <div className="status-box">{error ? <span className="err-text">{error}</span> : 'Lade Aufgabe …'}</div>;
  if (status === 'solved')
    return (
      <div className="status-box good">
        <span className="status-icon">
          <Check size={22} strokeWidth={3} />
        </span>
        <div>
          <b>{failed ? 'Gelöst – im zweiten Anlauf' : 'Gelöst!'}</b>
          <span>{ratingText ?? 'Weiter so.'}</span>
        </div>
      </div>
    );
  if (status === 'shown')
    return (
      <div className="status-box neutral">
        <span className="status-icon">
          <Eye size={20} />
        </span>
        <div>
          <b>Lösung angezeigt</b>
          <span>{ratingText ?? 'Schau dir die Idee in Ruhe an.'}</span>
        </div>
      </div>
    );
  if (status === 'wrong')
    return (
      <div className="status-box bad">
        <span className="status-icon">
          <X size={22} strokeWidth={3} />
        </span>
        <div>
          <b>Das ist nicht der Zug</b>
          <span>Versuch es nochmal.</span>
        </div>
      </div>
    );
  return (
    <div className={`status-box ${status === 'correct' ? 'good' : ''}`}>
      <span className="status-icon piece">
        <Piece type="k" color={color} size={30} />
      </span>
      <div>
        <b>{status === 'correct' ? 'Richtig! Weiter …' : `${side} am Zug`}</b>
        <span>{status === 'correct' ? 'Finde den nächsten Zug.' : `Finde den besten Zug für ${side}.`}</span>
      </div>
    </div>
  );
}
