import { L } from '../i18n';
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
  const side = color === 'w' ? L('Weiß', 'White') : L('Schwarz', 'Black');
  const ratingText = delta !== null && delta !== undefined ? `${L('Puzzle-Rating', 'Puzzle rating')} ${delta >= 0 ? '+' : ''}${delta}` : null;

  if (status === 'loading') return <div className="status-box">{error ? <span className="err-text">{error}</span> : L('Lade Aufgabe …', 'Loading puzzle …')}</div>;
  if (status === 'solved')
    return (
      <div className="status-box good">
        <span className="status-icon">
          <Check size={22} strokeWidth={3} />
        </span>
        <div>
          <b>{failed ? L('Gelöst – im zweiten Anlauf', 'Solved – on the second try') : L('Gelöst!', 'Solved!')}</b>
          <span>{ratingText ?? L('Weiter so.', 'Keep it up.')}</span>
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
          <b>{L('Lösung angezeigt', 'Solution shown')}</b>
          <span>{ratingText ?? L('Schau dir die Idee in Ruhe an.', 'Take your time to study the idea.')}</span>
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
          <b>{L('Das ist nicht der Zug', "That's not the move")}</b>
          <span>{L('Versuch es nochmal.', 'Try again.')}</span>
        </div>
      </div>
    );
  return (
    <div className={`status-box ${status === 'correct' ? 'good' : ''}`}>
      <span className="status-icon piece">
        <Piece type="k" color={color} size={30} />
      </span>
      <div>
        <b>{status === 'correct' ? L('Richtig! Weiter …', 'Correct! Keep going …') : L(`${side} am Zug`, `${side} to move`)}</b>
        <span>{status === 'correct' ? L('Finde den nächsten Zug.', 'Find the next move.') : L(`Finde den besten Zug für ${side}.`, `Find the best move for ${side}.`)}</span>
      </div>
    </div>
  );
}
