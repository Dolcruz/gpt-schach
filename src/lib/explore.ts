// Erkunden: von einer Stellung aus frei für beide Seiten ziehen, ohne die Partie zu verändern
import { useCallback, useMemo, useState } from 'react';
import { Chess, type Move } from 'chess.js';

interface ExploreState {
  startFen: string;
  sans: string[];
  idx: number;
}

export function useExplore() {
  const [st, setSt] = useState<ExploreState | null>(null);

  const moves = useMemo<Move[]>(() => {
    if (!st) return [];
    const c = new Chess(st.startFen);
    return st.sans.map((s) => c.move(s));
  }, [st?.startFen, st?.sans]);

  const idx = st?.idx ?? 0;
  const current = idx > 0 ? moves[idx - 1] : undefined;
  const fen = st ? (current ? current.after : st.startFen) : null;

  const open = useCallback((startFen: string, sans: string[] = [], at = sans.length) => setSt({ startFen, sans, idx: Math.max(0, Math.min(at, sans.length)) }), []);
  const close = useCallback(() => setSt(null), []);
  const go = useCallback((i: number) => setSt((s) => (s ? { ...s, idx: Math.max(0, Math.min(i, s.sans.length)) } : s)), []);

  /** Zug auf dem Erkundungsbrett; gleicher Zug wie in der Linie = vorwärts, sonst neue Abzweigung */
  const play = useCallback(
    (from: string, to: string, promotion = 'q') => {
      if (!st || !fen) return null;
      const c = new Chess(fen);
      let m: Move;
      try {
        m = c.move({ from, to, promotion });
      } catch {
        return null;
      }
      const sans = st.sans[st.idx] === m.san ? st.sans : [...st.sans.slice(0, st.idx), m.san];
      setSt({ ...st, sans, idx: st.idx + 1 });
      return m;
    },
    [st, fen],
  );

  return {
    active: !!st,
    startFen: st?.startFen ?? null,
    sans: st?.sans ?? [],
    idx,
    moves,
    current,
    fen,
    prevFen: st ? (idx > 1 ? moves[idx - 2].after : idx === 1 ? st.startFen : null) : null,
    lastMove: current ? ([current.from, current.to] as [string, string]) : undefined,
    open,
    close,
    go,
    play,
  };
}

export type ExploreView = ReturnType<typeof useExplore>;
