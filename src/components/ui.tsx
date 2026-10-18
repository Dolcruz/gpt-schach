import { createElement, type ReactNode } from 'react';
import type { Move } from 'chess.js';
import { BookOpen, Check, Star, ThumbsUp, User } from 'lucide-react';
import { avatarFor } from '../avatars';
import { CLASS_INFO, type Classification } from '../coach';

export function Avatar({ id, size = 40, className = '' }: { id: string | 'you'; size?: number; className?: string }) {
  if (id === 'you')
    return (
      <div className={`avatar you ${className}`} style={{ width: size, height: size }}>
        <User size={size * 0.62} strokeWidth={2.2} />
      </div>
    );
  return <img className={`avatar ${className}`} src={avatarFor(id)} width={size} height={size} alt="" draggable={false} />;
}

/** Runde Bewertungs-Plakette wie bei chess.com */
export function ClassIcon({ c, size = 20 }: { c: Classification; size?: number }) {
  const info = CLASS_INFO[c];
  const glyph = size * 0.6;
  const content =
    c === 'best' ? <Star size={glyph} fill="currentColor" strokeWidth={0} /> :
    c === 'excellent' ? <ThumbsUp size={glyph * 0.92} fill="currentColor" strokeWidth={1.5} /> :
    c === 'good' ? <Check size={glyph} strokeWidth={3.5} /> :
    c === 'book' ? <BookOpen size={glyph} strokeWidth={2.6} /> :
    <span style={{ fontSize: size * (info.icon.length > 1 ? 0.5 : 0.62) }}>{info.icon}</span>;
  return (
    <span className="class-icon" style={{ width: size, height: size, background: info.color }} title={info.label}>
      {content}
    </span>
  );
}

const VALUE: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9 };
const NAME: Record<string, string> = { p: 'pawn', n: 'knight', b: 'bishop', r: 'rook', q: 'queen', k: 'king' };
const ORDER = ['p', 'n', 'b', 'r', 'q'];

/** Kleine Figur im cburnett-Stil (nutzt die Chessground-Grafiken) */
export function Piece({ type, color, size = 18 }: { type: string; color: 'w' | 'b'; size?: number }) {
  return (
    <span className="cg-wrap piece-icon" style={{ width: size, height: size }}>
      {createElement('piece', { className: `${NAME[type]} ${color === 'w' ? 'white' : 'black'}` })}
    </span>
  );
}

/** Von `side` geschlagene Figuren + Materialvorteil */
export function Captured({ moves, side }: { moves: Move[]; side: 'w' | 'b' }) {
  const taken: string[] = [];
  let diff = 0;
  for (const m of moves) {
    if (!m.captured) continue;
    if (m.color === side) taken.push(m.captured);
    diff += (m.color === side ? 1 : -1) * VALUE[m.captured];
  }
  for (const m of moves) if (m.promotion) diff += (m.color === side ? 1 : -1) * (VALUE[m.promotion] - 1);
  taken.sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b));
  const enemy = side === 'w' ? 'b' : 'w';
  return (
    <div className="captured">
      {taken.map((t, i) => (
        <span key={i} className={i > 0 && taken[i - 1] === t ? 'stack' : ''}>
          <Piece type={t} color={enemy} size={17} />
        </span>
      ))}
      {diff > 0 && <span className="diff">+{diff}</span>}
    </div>
  );
}

/** Spielerzeile über/unter dem Brett */
export function PlayerBar({ avatar, name, rating, children, active, right }: { avatar: string; name: string; rating?: number; children?: ReactNode; active?: boolean; right?: ReactNode }) {
  return (
    <div className={`player-bar ${active ? 'active' : ''}`}>
      <Avatar id={avatar} size={40} />
      <div className="player-info">
        <div className="player-name">
          <b>{name}</b>
          {rating !== undefined && <span className="rating">({rating})</span>}
        </div>
        {children}
      </div>
      {right}
    </div>
  );
}

/** Minimales Markdown: **fett**, *kursiv*, `code`, Überschriften und Aufzählungen */
export function Markdown({ text }: { text: string }) {
  const inline = (line: string) =>
    line.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g).map((part, i) =>
      part.startsWith('**') ? <b key={i}>{part.slice(2, -2)}</b> : part.startsWith('`') ? <code key={i}>{part.slice(1, -1)}</code> : part.startsWith('*') && part.length > 2 ? <i key={i}>{part.slice(1, -1)}</i> : part,
    );
  return (
    <>
      {text.split(/\r?\n/).map((line, i) => {
        const h = line.match(/^#{1,4}\s+(.*)/);
        if (h) return <div key={i} className="h">{inline(h[1])}</div>;
        const li = line.match(/^\s*(?:[-•*]|\d+[.)])\s+(.*)/);
        return li ? <div key={i} className="li">{inline(li[1])}</div> : <div key={i}>{line ? inline(line) : ' '}</div>;
      })}
    </>
  );
}
