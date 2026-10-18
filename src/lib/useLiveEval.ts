// Live-Bewertung einer Stellung mit eigener Engine (für den Erkunden-Modus)
import { useEffect, useRef, useState } from 'react';
import { Chess } from 'chess.js';
import { Engine, LiveAnalyzer, winPercent, type EngineLine } from '../engine';
import { whiteCp } from './review';
import type { Classification } from '../coach';

export interface CachedEval {
  /** Sicht Weiß, Centipawns (Matt ≈ ±10000) */
  cp: number;
  mate: number | null;
  best: string;
  depth: number;
}

/** Zug einstufen anhand der Bewertung davor/danach (aus Sicht des Ziehenden) */
export function classifyByEval(before: CachedEval, after: CachedEval, mover: 'w' | 'b', uci: string): { c: Classification; loss: number } {
  const s = mover === 'w' ? 1 : -1;
  const loss = Math.max(0, winPercent(before.cp * s) - winPercent(after.cp * s));
  if (uci === before.best) return { c: 'best', loss };
  return { c: loss < 2 ? 'excellent' : loss < 5 ? 'good' : loss < 10 ? 'inaccuracy' : loss < 20 ? 'mistake' : 'blunder', loss };
}

const MIN_DEPTH = 12;

export function useLiveEval(fen: string | null, prevFen: string | null, lastUci: string | null, depth = 20) {
  const eng = useRef<{ engine: Engine; live: LiveAnalyzer } | null>(null);
  const evals = useRef(new Map<string, CachedEval>());
  const [live, setLive] = useState<{ fen: string; lines: EngineLine[] } | null>(null);
  const [, bump] = useState(0);

  const store = (f: string, lines: EngineLine[]) => {
    if (!lines[0] || lines[0].depth < MIN_DEPTH) return;
    const cur = evals.current.get(f);
    if (cur && cur.depth > lines[0].depth) return;
    const w = whiteCp(f, lines);
    evals.current.set(f, { cp: w.cp, mate: w.mate, best: lines[0].pv[0], depth: lines[0].depth });
    bump((x) => x + 1);
  };

  // Engine erst anlegen, wenn sie gebraucht wird; beim Verlassen aufräumen
  useEffect(
    () => () => {
      eng.current?.live.cancel();
      eng.current?.engine.destroy();
      eng.current = null;
    },
    [],
  );

  useEffect(() => {
    if (!fen) {
      eng.current?.live.cancel();
      return;
    }
    if (!eng.current) {
      const engine = new Engine();
      eng.current = { engine, live: new LiveAnalyzer(engine) };
    }
    const c = new Chess(fen);
    if (c.isGameOver()) {
      eng.current.live.cancel();
      setLive({ fen, lines: [] });
      if (c.isCheckmate()) evals.current.set(fen, { cp: c.turn() === 'w' ? -10000 : 10000, mate: 0, best: '', depth: 99 });
      else evals.current.set(fen, { cp: 0, mate: null, best: '', depth: 99 });
      bump((x) => x + 1);
      return;
    }
    eng.current.live.analyze(fen, {
      depth,
      multipv: 3,
      onUpdate: (lines) => {
        setLive({ fen, lines });
        store(fen, lines);
      },
    });
    // Für die Einstufung des letzten Zuges auch die Stellung davor bewerten (z. B. nach einem Sprung)
    if (prevFen && !(evals.current.get(prevFen)?.depth ?? 0)) {
      const p = prevFen;
      eng.current.engine.analyze(p, { depth: 16, movetime: 1500, multipv: 1 }).then((l) => store(p, l));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fen, prevFen, depth]);

  /** Bewertungen von außen übernehmen (z. B. die schon gerechnete Partiestellung) */
  const seed = (f: string, lines: EngineLine[]) => store(f, lines);

  const lines = live && live.fen === fen ? live.lines : [];
  const top = fen ? (evals.current.get(fen) ?? (lines[0] ? { ...whiteCp(fen, lines), best: lines[0].pv[0], depth: lines[0].depth } : null)) : null;
  const before = prevFen ? evals.current.get(prevFen) : undefined;
  const after = fen ? evals.current.get(fen) : undefined;
  const mover: 'w' | 'b' | null = fen ? (fen.split(' ')[1] === 'w' ? 'b' : 'w') : null;
  const lastClass = before && after && lastUci && mover ? { ...classifyByEval(before, after, mover, lastUci), before, after } : null;

  return { lines, top, lastClass, seed };
}
