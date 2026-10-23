import { useEffect, useRef, useState } from 'react';
import { Chessground } from 'chessground';
import type { Api } from 'chessground/api';
import type { Key } from 'chessground/types';
import type { DrawShape } from 'chessground/draw';
import { Chess, SQUARES } from 'chess.js';
import { ClassIcon } from './ui';
import type { Classification } from '../coach';
import { getPieceSet } from '../lib/appearance';

interface Props {
  fen: string;
  orientation: 'white' | 'black';
  /** Welche Farbe der Nutzer ziehen darf (null = gesperrt) */
  movable: 'white' | 'black' | 'both' | null;
  lastMove?: [string, string];
  shapes?: DrawShape[];
  onMove: (from: string, to: string) => void;
  /** Bewertungs-Plakette auf dem Zielfeld (wie bei chess.com) */
  badge?: { square: string; c: Classification };
  viewOnly?: boolean;
  /** Vorzüge (Premoves) für diese Farbe erlauben, während der Gegner am Zug ist */
  premoveColor?: 'white' | 'black' | null;
  /** Überschreibt `movable` (z. B. 'both' im Erkunden-Modus) */
  movableOverride?: 'white' | 'black' | 'both';
}

function dests(fen: string) {
  const c = new Chess(fen);
  const map = new Map<Key, Key[]>();
  for (const s of SQUARES) {
    const ms = c.moves({ square: s, verbose: true });
    if (ms.length) map.set(s as Key, ms.map((m) => m.to as Key));
  }
  return map;
}

export function Board({ fen, orientation, movable: movableProp, lastMove, shapes, onMove, badge, viewOnly, premoveColor, movableOverride }: Props) {
  const movable = movableOverride ?? movableProp;
  const el = useRef<HTMLDivElement>(null);
  const cg = useRef<Api | null>(null);
  const onMoveRef = useRef(onMove);
  onMoveRef.current = onMove;
  /** Vorgemerkter Zug – wird wie bei chess.com als halbtransparente Figur auf dem Zielfeld gezeigt */
  const [premove, setPremove] = useState<{ orig: string; dest: string; piece: string } | null>(null);

  useEffect(() => {
    cg.current = Chessground(el.current!, {
      animation: { duration: 180 },
      viewOnly,
      coordinates: true,
      highlight: { lastMove: true, check: true },
      premovable: {
        enabled: false,
        events: {
          set: (orig, dest) => {
            const p = cg.current?.state.pieces.get(orig);
            setPremove(p ? { orig, dest, piece: (p.color === 'white' ? 'w' : 'b') + (p.role === 'knight' ? 'N' : p.role[0].toUpperCase()) } : null);
          },
          unset: () => setPremove(null),
        },
      },
      drawable: { enabled: true },
      movable: { free: false, showDests: true, events: { after: (o, d) => onMoveRef.current(o, d) } },
    });
    return () => cg.current?.destroy();
  }, []);

  useEffect(() => {
    const c = new Chess(fen);
    const turn = c.turn() === 'w' ? 'white' : 'black';
    cg.current?.set({
      fen,
      orientation,
      turnColor: turn,
      check: c.inCheck() ? turn : false,
      lastMove: lastMove as Key[] | undefined,
      movable: {
        // Für Premoves muss die eigene Farbe auch dann beweglich sein, wenn der Gegner gerade zieht
        color: movable ?? (premoveColor && premoveColor !== turn ? premoveColor : undefined),
        dests: movable === turn || movable === 'both' ? dests(fen) : new Map(),
      },
      premovable: { enabled: !!premoveColor },
    });
    if (!premoveColor) {
      cg.current?.cancelPremove();
      setPremove(null);
    }
    // Vorgemerkten Zug sofort ausführen, sobald man am Zug ist
    else if (movable === turn) cg.current?.playPremove();
  }, [fen, orientation, movable, lastMove, premoveColor]);

  useEffect(() => {
    cg.current?.setAutoShapes(shapes ?? []);
  }, [shapes]);

  let badgeEl = null;
  if (badge) {
    const f = badge.square.charCodeAt(0) - 97;
    const r = Number(badge.square[1]);
    const col = orientation === 'white' ? f : 7 - f;
    const row = orientation === 'white' ? 8 - r : r - 1;
    badgeEl = (
      <div key={badge.square + badge.c} className="board-badge" style={{ left: `${(col + 1) * 12.5}%`, top: `${row * 12.5}%` }}>
        <ClassIcon c={badge.c} size={30} />
      </div>
    );
  }

  let ghostEl = null;
  if (premove) {
    const f = premove.dest.charCodeAt(0) - 97;
    const r = Number(premove.dest[1]);
    const col = orientation === 'white' ? f : 7 - f;
    const row = orientation === 'white' ? 8 - r : r - 1;
    ghostEl = (
      <div className="premove-ghost" style={{ left: `${col * 12.5}%`, top: `${row * 12.5}%` }}>
        <img src={`/pieces/${getPieceSet()}/${premove.piece}.svg`} alt="" />
      </div>
    );
  }

  return (
    <>
      <div ref={el} className="cg-wrap-outer" />
      {ghostEl}
      {badgeEl}
    </>
  );
}
